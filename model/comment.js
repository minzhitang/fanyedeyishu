// 对comment表的操作
var comment_db = require('../config/mysql')('comment');

/**
 * 添加到评论表
 * @param  {Object}   obj   包括open_id, book_id, score, comment等
 * @yield  {Boolean}        是否成功
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-14
 */
exports.insertComment = function * ( obj ) {
    "use strict"
    obj.score = obj.score || -1;
    obj.created_time = Math.floor(Date.now() / 1000);
    obj.status = 1;

    let succ = yield comment_db.insert( obj );
    return succ;
}