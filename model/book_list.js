// 对book_list表的操作
var book_list_db = require('../config/mysql')('book_list');

/**
 * 添加到书单表
 * @param  {Object}   obj   包括open_id, content,created_time等
 *                          content是json数组，每一个元素都有name/image/comment
 * @yield  {Boolean}        是否成功
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-14
 */
exports.insertBookList = function * ( obj ) {
    "use strict"
    obj.created_time = Math.floor(Date.now() / 1000);
    obj.status = 1;

    let succ = yield book_list_db.insert( obj );
    return succ;
}

/**
 * 获取某用户所有书单（暂时用不上）
 * @param  {[type]}   open_id       [description]
 * @yield  {[type]}   [description]
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-04-13
 */
exports.getListByOpenId = function * ( open_id ) {
    "use strict"
    let lists = yield book_list_db.select('id, open_id, content, created_time').where({
        'open_id' : open_id,
        'status'  : 1
    }).orderBy('created_time').all();
    return lists;
}

/**
 * 获取某个书单的内容
 * @param  {[type]}   id            [description]
 * @yield  {[type]}   [description]
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-04-13
 */
exports.getListById = function * ( id ) {
    "use strict"
    let list = yield book_list_db.select('id, open_id, title, content, created_time').where({
        'id'      : id,
        'status'  : 1
    }).one();
    return list;
}