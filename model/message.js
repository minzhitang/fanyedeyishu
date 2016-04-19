

// 会话
var dialog_model = require('./dialog');
// 评论
var pl_process = require('./pl_process');
// 查找
var cz_process = require('./cz_process');
// 已读
var yd_process = require('./yd_process');
// 想读
var xd_process = require('./xd_process');
// 创建书单
var create_process = require('./create_process');


/**
 * 
 * 消息应对模块，负责将接收到的xml消息分发到各process处理，并返回消息回复
 * @param  {Object}   obj  已解为object的用户消息
 * @yield  {Object}        经过各process处理后回复给用户的消息对象
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-14
 */
exports.process = function * (obj) {
    "use strict"
    // if (obj.FromUserName != 'oYodawPXcELQ5LJTM0SdolzHJP_0') {
    //     return {
    //         'ToUserName'   : obj.FromUserName,
    //         'FromUserName' : obj.ToUserName,
    //         'MsgType'      : 'text',
    //         'Content'      : '我的主人在改bug，我先下班了，对于一个没有粉丝的服务号来说，就是这么任性！',
    //         'CreateTime'   : Math.floor(Date.now()/1000)
    //     }
    // }

    // 文本消息
    // console.log(obj);
    let rec = {};
    let pro = {};
    let echo = {};
    let stru = {};


    if ( 'text' == obj.MsgType || 'voice' == obj.MsgType ) {
        // 语音消息没有content字段，开启识别后有recognition字段，同化为content处理
        if ( 'voice' == obj.MsgType ) {
            obj.Content = obj.Recognition;
        }
        let dia = yield dialog_model.getDialogRecent( obj.FromUserName );
        if ( dia ) {
            switch ( dia.type ) {
                case 'pl':
                    echo = yield pl_process.process( dia, obj.Content, obj.MsgType );
                    break;
                case 'cz':
                    echo = yield cz_process.process( dia, obj.Content, obj.MsgType );
                    break;
                case 'yd':
                    echo = yield yd_process.process( dia, obj.Content, obj.MsgType );
                    break;
                case 'xd':
                    echo = yield xd_process.process( dia, obj.Content, obj.MsgType );
                    break;
                case 'create':
                    echo = yield create_process.process( dia, obj.Content, obj.MsgType );
                    break;
            }
            for ( let attr in echo ) {
                rec[attr] = echo[attr];
            }
        }
        else {
            rec.MsgType = 'text';
            rec.Content = '请点击窗口下方的菜单项';
        }
    }
    // 点菜单，开启会话
    else if ( 'event' == obj.MsgType ) {
        if ( 'CLICK' == obj.Event ) {
            // console.log('ccccccccccccc');
            // let dia = yield dialog_model.getDialogByType( obj.FromUserName, obj.EventKey );
            // let stru = dia.structure;
            let dia = {};
            if ( true ) {
                console.log('------------');
                // 新建一个会话
                // @todo: 还可以再优雅一点吧
                switch ( obj.EventKey ) {
                    case 'pl':
                        stru = yield pl_process.init_structure();
                        break;
                    case 'cz':
                        stru = yield cz_process.init_structure();
                        break;
                    case 'yd':
                        stru = yield yd_process.init_structure();
                        break;
                    case 'xd':
                        stru = yield xd_process.init_structure();
                        break;
                    case 'create':
                        stru = yield create_process.init_structure();
                        break;
                }
                dia = yield dialog_model.insertDialog({
                        'open_id'   : obj.FromUserName,
                        'type'      : obj.EventKey,
                        'structure' : stru,
                        'status'    : 1
                        });
            }
            switch ( dia.type ) {
                case 'pl':
                    echo = yield pl_process.process( dia, obj.Content );
                    break;
                case 'cz':
                    echo = yield cz_process.process( dia, obj.Content );
                    break;
                case 'yd':
                    echo = yield yd_process.process( dia, obj.Content );
                    break;
                case 'xd':
                    echo = yield xd_process.process( dia, obj.Content );
                    break;
                case 'create':
                    echo = yield create_process.process( dia, obj.Content );
                    break;
            }
            for ( let attr in echo ) {
                rec[attr] = echo[attr];
            }
        }
    }

    rec.ToUserName = obj.FromUserName;
    rec.FromUserName = obj.ToUserName;
    rec.CreateTime = Math.floor(Date.now()/1000);
    // console.dir(rec);
    return rec;
}