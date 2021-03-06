var dialog_model = require('./dialog');
var book = require('./book');
var comment = require('./comment');
var common = require('@sina/koa-common');

/**
 * 记录评论的会话处理
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
    console.log(dialog);
    let stru = dialog.structure;
    console.log(stru);
    let step = stru.step;
    console.log('++++++++++');
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

    // console.log(dialog);

    // 结束
    if (5 == result.step) {
        dialog.status = 2;
        let s = yield comment.insertComment({
            'open_id' : dialog.open_id,
            'book_id' : dialog.structure.book_id,
            'score'   : dialog.structure.score,
            'comment' : dialog.structure.comment
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
        'book_id' : 0,
        // 给确认书籍用的
        'tmp_book_list': [],
        'score'   : -1,
        'comment' : '',
        'list'    : [
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
                'comment' : '绘本评分',
                'handle'  : 'scoreBook'
            },
            {
                'comment' : '绘本评论',
                'handle'  : 'commentBook'
            }
        ]
    };
}

var askBookName = function * ( stru, content, msgtype ) {
    "use strict"
    return {
        'echo' : {
            'MsgType' : 'text',
            'Content' : '请输入一本书名，比如“我是霸王龙”（试试看语音也可以的哦~）'
        },
        'step' : 1
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
            'step' : 1
        };
    }
    else if ( 10 == book_list.length ) {
        result = {
            'echo' : {
                'MsgType' : 'text',
                'Content' : pre_content + '书名里有这个的实在是太多了，太多了！要不亲再准确点，缩小下范围？'
            },
            'step' : 1
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
            'step' : 2,
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
            'step' : 2,
            'tmp_book_list' : tmp_book_list
        };
    }
    
    return result;
}

var confirmBook = function * ( stru, content, msgtype ) {
    "use strict"
    if ( (stru.tmp_book_list.length == 1) && ( common.in_array(content, ['是', '1', 'yes', 'Y', 'y']))) {
        console.log(111111111111111);
        return {
            'echo' : {
                'MsgType' : 'text',
                'Content' : '给这本书评个分吧，1-100分（100分为满分）'
            },
            'step' : 3,
            'book_id' : stru.tmp_book_list[0]
        };
    }
    else if ( stru.tmp_book_list.length > 1) {
        console.log(22222222222222);
        let pos = Number.parseInt( content );
        if ( (pos > 0) && (pos <= stru.tmp_book_list.length)) {
            return {
                'echo' : {
                    'MsgType' : 'text',
                    'Content' : '给这本书评个分吧，1-100分（100分为满分）'
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
                // 'book_id' : stru.tmp_book_list[pos]
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
                // 'book_id' : stru.tmp_book_list[pos]
        };
    }
}

var scoreBook = function * ( stru, content, msgtype ) {
    "use strict"
    let score = Number.parseInt( content );
    if ( score > 0 && score <= 100) {
        let pre_content = '';
        if ( score > 80 ) {
            pre_content = '(*@ο@*) 哇～小主打出了高分耶~!来段原创评论好不好？';
        }
        else if ( score < 60 ) {
            pre_content = '( ⊙ o ⊙ )真的这么难看？如果黑请认真黑，回复条原创评论吧~';
        }
        else {
            pre_content = '来段原创评论好不好？';
        }
        return {
            'echo'  : {
                'MsgType' : 'text',
                'Content' : pre_content + '可以语音的哦~'
            },
            'step'  : 4,
            'score' : score
        };
    }
    else {
        return {
            'echo' : {
                'MsgType' : 'text',
                'Content' : '不好意思小翻太蠢了，没看懂，重输一下可以？数字的，1-100~'
            },
            'step' : 3
        };
    }
}

// 评论和追加评论
var commentBook = function * ( stru, content, msgtype ) {
    "use strict"
    if ( content == '完成' ) {
        return {
            'echo' : {
                'MsgType' : 'text',
                'Content' : '谢谢！'
            },
            'step' : 5,
            // 'comment' : content
        };    
    }
    else {
        return {
            'echo' : {
                'MsgType' : 'text',
                'Content' : '小主真是有才，小翻认真保存下来学习下，评论完成请回复“完成”，还想追加请回复其他'
            },
            'step' : 4,
            'comment' : stru.comment + "\n" + content
        };
    }
    // console.log('Get the comment: ' + content + '.');   
}