// 对userBook表的操作
var user_book = require('../config/mysql')('user_book');

/**
 * 保存记录
 * @param  {Object}   obj  包括book_id，open_id，relation(1为已读，2为想读)
 * @yield  {Boolean}  是否成功
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-14
 */
exports.saveRecord = function * ( obj ) {
    "use strict"
    obj.created_time = Math.floor(Date.now() / 1000);

    let succ = yield user_book.insert( obj );
    return succ;
}