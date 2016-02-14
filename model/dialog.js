// 会话的开启与完成

// 对dialog表的操作
var dialog_db = require('../config/mysql')('dialog');

/**
 * @todo:可以废弃，貌似并没有用到这个函数
 * 
 * 获取该用户某类型的未完成会话
 * @param  {String}   open_id       用户ID
 * @param  {String}   type          会话类型
 * @yield  {Object}   会话的Object
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-14
 */
exports.getDialogByType = function * ( open_id, type ) {
    "use strict"
    // console.log(type);
    // console.log(open_id);
    let dialog = yield dialog_db.select('*').where({
        'type'    : type,
        'open_id' : open_id,
        'status'  : 1
    }).one();
    // console.log(dialog);
    if ( dialog ) {
        dialog.structure = JSON.parse(dialog.structure);
        return dialog;
    }
    else {
        return false;
    }
}

/**
 * 
 * 获取用户半小时内的未完成会话
 * @param  {String}   open_id       用户ID
 * @yield  {Object}   会话的Object 或者false
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-14
 */
exports.getDialogRecent = function * ( open_id ) {
    "use strict"
    // console.log(type);
    // console.log(open_id);
    let dialog = yield dialog_db.select('*').where({
        'open_id' : open_id,
        'status'  : 1,
        'updated_time' : {'sign' : '>', 'val' : (Date.now()/1000 - 1800)}
    }).orderBy('updated_time').one();
    // 半小时内有效
    if (dialog) {
        dialog.structure = JSON.parse(dialog.structure);
        return dialog;
    }
    else {
        return false;
    }
}

/**
 * 更新保存会话
 * @param  {Object}   dialog        会话，包括open_id, structure等
 * @yield  {Bool}     是否成功
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-10
 */
exports.updateDialog = function * ( dialog ) {
    "use strict"
    let update_obj = {
        'structure'    : JSON.stringify( dialog.structure ),
        'updated_time' : Math.floor(Date.now() / 1000),
        'status'       : dialog.status || 1
    }
    let succ = yield dialog_db.update(update_obj, {'id' : dialog.id});
    return succ;
}

/**
 * 新增会话，返回会话obj
 * @param  {Object}   obj        包括open_id, type, structure等
 * @yield  {Object}   会话对象 或者 false
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-10
 */
exports.insertDialog = function * ( obj ) {
    "use strict"
    obj.created_time = obj.created_time || Math.floor(Date.now()/1000);
    obj.updated_time = obj.updated_time || Math.floor(Date.now()/1000);
    obj.status       = obj.status || 1;
    obj.structure    = JSON.stringify(obj.structure);

    let dialog_id = yield dialog_db.insert(obj);
    if (dialog_id) {
        return {
            'id'        : dialog_id,
            'open_id'   : obj.open_id,
            'type'      : obj.type,
            'structure' : JSON.parse(obj.structure),
            'status'    : obj.status
        };
    }
    else {
        return false;
    }
}