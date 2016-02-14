// 对variables表的操作
var variables_db = require('../config/mysql')('variables');

/**
 * 取值
 * @param  string   name  变量的名称
 * @yield  string   变量的值
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-07
 */
exports.get = function * (name) {
    "use strict"
    let val = yield variables_db.select('value').where({'name' : name}).first();
    return val;
}

/**
 * 取包括value, created_time, updated_time在内的一行记录
 * @param  string   name  变量的名称
 * @yield  string   变量的值
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-07
 */
exports.getAll = function * (name) {
    "use strict"
    let row = yield variables_db.select('*').where({'name' : name}).one();
    return row;    
}

/**
 * 设置
 * @param  {String}   name          名称
 * @param  {String}   value         值
 * @param  {String}   comment       备注
 * @yield  {bool}     是否成功
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-07
 */
exports.set = function * (name, value) {
    "use strict"
    let row = yield variables_db.select('id').where({'name' : name}).one();
    let succ = false;
    // 更新
    if (row) {
        succ = yield variables_db.update({
            'value' : value, 
            'updated_time' : Math.floor(Date.now()/1000)},{'id' : row.id});
    }
    // 插入
    else {
        succ = yield variables_db.insert({
            'name' : name,
            'value' : value,
            'created_time' : Math.floor(Date.now()/1000),
            'updated_time' : Math.floor(Date.now()/1000)
        });
    }
    return succ;
}

/**
 * 值的删除
 * @param  {String}   name          值的名称
 * @yield  {Bool}     是否成功
 * }   
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-07
 */
exports.del = function * (name) {
    "use strict"
    let succ = yield variables_db.delete({'name' : name});
    return succ;
}


