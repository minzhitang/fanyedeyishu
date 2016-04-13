var dialog_model = require('./dialog');
var book = require('./book');
var book_list = require('./book_list');
var common = require('@sina/koa-common');

/**
 * 创建书单的会话处理
 * @param  {Object}   dialog        会话
 * @param  {String}   content       用户输入
 * @param  {String}   msgtype       输入类型
 * @yield  {Object}   返回给用户的消息obj
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-04-13
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

    // console.log(handleFunc);
    result = yield eval(handleFunc)( stru, content, msgtype );
    // console.log(result);

    for (let attr in result) {
        if ('echo' !== attr) {
            // 包括step, tmp_book_list, book_id等
            dialog.structure[attr] = result[attr];
        }
    }

    // console.log(dialog);

    // 结束
    if (6 == result.step) {
        dialog.status = 2;
        let s = yield book_list.insertBookList({
            'open_id' : dialog.open_id,
            // 'book_id' : dialog.structure.book_id,
            // 'score'   : dialog.structure.score,
            'title'   : dialog.structure.title,
            'content' : dialog.structure.content
        });
        // console.log('存下评论，本次评论结束');
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
        'title'    : '',
        'content' : [],
        // 确认书籍用的
        'tmp_book_list': [],
        // 现在评的是哪本书
        'book_id' : 0,
        // 'score'   : -1,
        // 'comment' : '',
        'list'    : [
            {
                'comment' : '书单标题',
                'handle'  : 'askBookListName',
            },
            {
                'comment' : '确认标题',
                'handle'  : 'confirmListName'
            },
            {
                'comment' : '输入书名',
                'handle'  : 'askBookName'
            },
            {
                'comment' : '绘本结果',
                'handle'  : 'checkBookName'
            },
            {
                'comment' : '确认绘本',
                'handle'  : 'confirmBook'
            },
            {
                'comment' : '绘本评论',
                'handle'  : 'commentBook'
            }
        ]
    };
}

var askBookListName = function * ( stru, content, msgtype ) {
    "use strict"
    return {
        'echo' : {
            'MsgType' : 'text',
            'Content' : '请输入书单标题，举个栗子：“汀小主的屎尿屁系列”',
        },
        'step' : 1
    };
}

var confirmListName = function * ( stru, content, msgtype ) {
    "use strict"
    let name = common.str_replace(['!','！','。'], '', content);
    return {
        'echo' : {
            'MsgType' : 'text',
            'Content' : '好嘞，书单名是：' + name + ', 接下来请输入书名，打字语音都可以'
        },
        'step' : 3,
        'title' : name
    };
}

var askBookName = function * ( stru, content, msgtype ) {
    "use strict"
    return {
        'echo' : {
            'MsgType' : 'text',
            'Content' : '请输入一本书名，比如“我是霸王龙”（试试看语音也可以的哦~）'
        },
        'step' : 3
    };
}

var checkBookName = function * ( stru, content, msgtype ) {
    "use strict"
    let searchName = common.str_replace(['!','！','。'], '', content);
    let book_list = yield book.searchName(searchName);
    // console.log(book_list);
    let pre_content = '';
    if ( 'voice' == msgtype ) {
        pre_content = '您说的是：' + content + '？';
    }
    let result = {};
    if ( !book_list || (0 == book_list.length) ) {
        result = {
            'echo' : {
                'MsgType' : 'text',
                'Content' : pre_content + '小翻很认真地找了下，但是木有找到，麻烦亲换一本吧，我先把这个记下来'
            },
            'step' : 3
        };
    }
    else if ( 10 == book_list.length ) {
        result = {
            'echo' : {
                'MsgType' : 'text',
                'Content' : pre_content + '书名里有这个的实在是太多了，太多了！要不亲再准确点，缩小下范围？'
            },
            'step' : 3
        };    
    }
    else if (book_list.length == 1) {
        result = {
            'echo' : {
                'MsgType'      : 'news',
                'ArticleCount' : 2,
                'Articles'     : {
                    'item' : [
                        {
                            'Title' : book_list[0].book_name,
                            'PicUrl': book_list[0].picture
                        },
                        {
                            'Title' : '确定是这本请回答“是”（文字或语音皆可）',
                            'PicUrl': ''
                        }
                    ]
                }
            },
            'step' : 5,
            'tmp_book_list' : [book_list[0].id]
        };
    }
    else {
        let items = [];
        let tmp_book_list = [];
        let pos = 1;
        for ( let b of book_list ) {
            let item = {
                'Title'       : 'NO.' + pos + ' ' + b.book_name,
                'PicUrl'      : b.picture,
            }
            items.push(item);
            tmp_book_list.push(b.id);
            pos++;
        }

        // 说明
        items.push({
            'Title'  : '请回复数字编号确认绘本',
            // 'PicUrl' : 'http://ww4.sinaimg.cn/mw1024/6a0b5ad3jw1f0t8dx2liwj2069069jr7.jpg',
        });
        result = {
            'echo' : {
                'MsgType'      : 'news',
                'ArticleCount' : book_list.length + 1,
                'Articles'     : {
                    'item' : items
                }
            },
            'step' : 4,
            'tmp_book_list' : tmp_book_list
        };
    }
    
    return result;
}

var confirmBook = function * ( stru, content, msgtype ) {
    "use strict"
    if ( (stru.tmp_book_list.length == 1) && ( common.in_array(content, ['是', '1', 'yes', 'Y', 'y']))) {
        // console.log(111111111111111);
        return {
            'echo' : {
                'MsgType' : 'text',
                'Content' : '请来段原创评论，可以语音哟~'
            },
            'step' : 3,
            'book_id' : stru.tmp_book_list[0]
        };
    }
    else if ( stru.tmp_book_list.length > 1) {
        let pos = Number.parseInt( content );
        if ( (pos > 0) && (pos <= stru.tmp_book_list.length)) {
            return {
                'echo' : {
                    'MsgType' : 'text',
                    'Content' : '请来段原创评论，可以语音哟~'
                },
                'step' : 3,
                'book_id' : stru.tmp_book_list[pos]
            };
        }
        else {
            return {
                'echo' : {
                    'MsgType' : 'text',
                    'Content' : '不好意思，小翻太蠢了，没看懂您的输入，请再指导一下~给编号数字就好'
                },
                'step' : 2
            };
        }
    }
    else {
        return {
                'echo' : {
                    'MsgType' : 'text',
                    'Content' : '不好意思，小翻太蠢了，没看懂您的输入，请再指导一下~给编号数字就好'
                },
                'step' : 2
        };
    }
}


// 评论
var commentBook = function * ( stru, content, msgtype ) {
    "use strict"
    if ( content == '完成' ) {
        return {
            'echo' : {
                'MsgType' : 'text',
                'Content' : '谢谢！'
            },
            'step' : 6,
            // 'comment' : content
        };    
    }
    else {
        let cont = stru.content;
        cont.push({
            'book_id' : stru.book_id,
            'comment' : content,
        });

        return {
            'echo' : {
                'MsgType' : 'text',
                'Content' : '书单创建完毕请回复“完成”，下一本书请回复其他'
            },
            'step' : 3,
            'content' : cont,
            // 清零
            'book_id' : 0
            'tmp_book_list' : [],
            // 'comment' : stru.comment + "\n" + content
        };
    }
    // console.log('Get the comment: ' + content + '.');   
}