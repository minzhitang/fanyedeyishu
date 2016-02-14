var mysql = require('@sina/koa-mysql');
var init  = require('../sys/sysInit');

module.exports = function ( tableName, tableId ){
    "use strict"
    let _config = init.config.dbConfig[process.env.NODE_ENV];
    let mysqlObj = new mysql( _config, tableName, tableId );
    return mysqlObj;
}