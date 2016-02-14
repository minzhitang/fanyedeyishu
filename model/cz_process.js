// 查找绘本的处理

var dialog_model = require('./dialog');
var book = require('./book');
var common = require('@sina/koa-common');

/**
 * 查找绘本的会话处理
 * @param  {Object}   dialog        会话
 * @param  {String}   content       用户输入
 * @param  {String}   msgtype       输入类型
 * @yield  {Object}   返回给用户的消息obj
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-14
 */
exports.process = function * ( dialog, content, msgtype ) {
    "use strict"
    // console.log(dialog);
    let stru = dialog.structure;
    // console.log(stru);
    let step = stru.step;
    // console.log('++++++++++');
    // 每个result都有echo和step吐回来，step存起来即可，echo继续吐给message
    let result = {};
    // console.dir(stru.list);
    let handleFunc = stru.list[step].handle;

    console.log(handleFunc);
    result = yield eval(handleFunc)( stru, content, msgtype );
    console.log(result);

    for (let attr in result) {
        if ('echo' !== attr) {
            // 包括step, tmp_book_list, book_id等
            dialog.structure[attr] = result[attr];
        }
    }

    if ( 4 == result.step ) {
        dialog.status = 2;
    }

    // console.log(dialog);

    let succ = yield dialog_model.updateDialog( dialog );
    return result.echo;
}

/**
 * 初始化状态机结构体
 * @yield  {Object}   完成消息会话所需要的状态机
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-14
 */
exports.init_structure = function * () {
    "use strict"
    return {
        'step'    : 0,
        // 关键词
        // 'keyword' : '',
        // 搜索的标签
        'tag_id'     : 0,
        'tmp_tag_list' : [],
        // 目前展示的是第几页
        'page'     : 0,
        // 总共有多少条
        // 'count'   : 0,
        // 'book_id' : 0,
        // 给确认书籍用的
        // 'tmp_book_list': [],
        // 'score'   : -1,
        // 'comment' : '',
        'list'    : [
            {

                'comment' : '请输入关键词',
                'handle'  : 'askKeyword'
            },
            {
                'comment' : '查找标签',
                'handle'  : 'searchTag'
            },
            {
                'comment' : '查找结果',
                'handle'  : 'searchBook'
            },
            {
                'comment' : '查看更多（下一页）',
                'handle'  : 'viewMore'
            }
        ]
    };
}

var askKeyword = function * ( stru, content, msgtype ) {
    "use strict"
    return {
        'echo' : {
            'MsgType' : 'text',
            'Content' : '请输入关键字，比如宫西达也（作者），老虎来喝下午茶（书名），勇气（主题），兔子（内容），2岁（年龄），暖房子（绘本馆），接力（出版社）等（试试看语音也可以的哦~）'
        },
        'step' : 1
    };
}

var searchTag = function * ( stru, content, msgtype ) {
    "use strict"
    let pre_content = '';
    let keyword = content;
    if ( 'voice' == msgtype) {
        keyword = common.str_replace(['!','！','。'], '', content);
        pre_content = '您输入的是：“' + keyword + '”，';
    }
    let tag_list = yield book.searchTag( keyword );

    if (!tag_list || (0 == tag_list[0].num)) {
        return {
            'echo' : {
                'MsgType' : 'text',
                'Content' : pre_content + '我找不到呀，要不您换换？',
            },
            'step' : 1
        };
    }
    else if ( 1 == tag_list.length ) {
        let tag = tag_list[0];
        return {
            'echo' : {
                'MsgType' : 'text',
                'Content' : pre_content + '您想找的是' + tag.tag_type + '为' + tag.tag_value + '的绘本，对吧？回答“对”查看结果，“不对”换内容'
            },
            'step'          : 2,
            // 'keyword'       : keyword,
            'tmp_tag_list'  : [tag.id]
        };
    }
    else {
        let re = '您想找的是，请回复数字编号:' + "\n";
        let pos = 1;
        let tmp_tag_list = [];
        for (let tag of tag_list) {
            re += pos + '. ' + tag.tag_type + ':' + tag.tag_value + "\n";
            pos++;
            tmp_tag_list.push(tag.id);
        }
        return {
            'echo' : {
                'MsgType' : 'text',
                'Content' : re
            },
            'step' : 2,
            // 'keyword'       : keyword,
            'tmp_tag_list'  : tmp_tag_list
        }
    }
}

var searchBook = function * ( stru, content, msgtype ) {
    "use strict"
    let tag_id = 0;
    if ( stru.tmp_tag_list.length == 1) {
        if ( '对' == content || '是' == content ) {
            tag_id = stru.tmp_tag_list[0];
        }
        else {
            return {
                'echo' : {
                    'MsgType' : 'text',
                    'Content' : '不是啊，那您重输换一个关键词吧~',
                },
                'step' : 1,
                'tmp_tag_list' : [],
            }
        }
    }
    else if (stru.tmp_tag_list.length > 1) {
        let pos = Number.parseInt(content);
        if (( pos > 0 ) && ( pos <= stru.tmp_tag_list.length) ) {
            tag_id = stru.tmp_tag_list[pos-1];
        }
        else {
            return {
                'echo' : {
                    'MsgType' : 'text',
                    'Content' : '小翻太蠢，没看懂~请重新输入，数字编号就好',
                },
                'step' : 2,
                // 'tmp_tag_list' : [],
            };
        }
    }
    else {
        return {
                'echo' : {
                    'MsgType' : 'text',
                    'Content' : '小翻太蠢，没看懂~还是重头来吧',
                },
                'step' : 1,
                'tmp_tag_list' : [],
        };
    }
    // 根据标签id获取绘本
    let book_list = yield book.getBookByTag ( tag_id );
    // @todo 不处理book_list为空的情况，因为实际上有标签一定有绘本
    if ( book_list ) {
        let echo = {};
        // 回复图文混排
        echo.MsgType = 'news';
        echo.ArticleCount = book_list.length + 1;
        let items = [];
        for (let book of book_list) {
            let item = {
                'Title'       : book.book_name,
                // 并没有看到微信展示Description
                // 'Description' : book.content_introduction,
                'PicUrl'      : book.picture,
                'Url'         : book.jd_book_url
            }
            items.push(item);
        }

        let suf_content = '';
        // 如果没有下一页就直接完成了，否则跳到step=3，viewMore
        let step = 4;
        if (4 == book_list.length) {
            suf_content = '，回复任意内容查看下一页搜索结果';
            step = 3;
        }

        // 查看更多
        items.push({
            'Title'  : '直接点击您就可以看到京东的详情页' + suf_content,
        });

        echo.Articles = {'item' : items};
        return {
            'echo' : echo,
            'step' : step,
            'tag_id' : tag_id,
            // 'keyword' : keyword,
            'page' : 1
        }        
    }
}

var viewMore = function * ( stru, content, msgtype ) {
    "use strict"
    if ( 'voice' == msgtype ) {
        content = common.str_replace(['!','！','。'], '', content);
    }
    // if ( '下一页' == content ) {
    if ( true ) {
        let book_list = yield book.getBookByTag ( stru.tag_id, stru.page + 1 );
        if ( !book_list ) {
            return {
                'echo' : {
                    'MsgType' : 'text',
                    'Content' : '已全部显示完毕，没有下一页了，如需其他服务请点击窗口下方菜单项~'
                },
                'step' : 4
            }
        }
        else {
            let echo = {};
            // 回复图文混排
            echo.MsgType = 'news';
            echo.ArticleCount = book_list.length + 1;
            let items = [];
            for (let book of book_list) {
                let item = {
                    'Title'       : book.book_name,
                    // 并没有看到微信展示Description
                    // 'Description' : book.content_introduction,
                    'PicUrl'      : book.picture,
                    'Url'         : book.jd_book_url
                }
                items.push(item);
            }

            let suf_content = '';
            // 如果没有下一页就直接完成了，否则跳到step=3，viewMore
            let step = 4;
            if (4 == book_list.length) {
                suf_content = '，回复任意内容查看下一页搜索结果';
                step = 3;
            }

            // 查看更多
            items.push({
                'Title'  : '直接点击您就可以看到京东的详情页' + suf_content,
            });

            echo.Articles = {'item' : items};
            return {
                'echo' : echo,
                'step' : step,
                'page' : stru.page + 1
            } 
        }
    }
}
