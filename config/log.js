var log = require('@sina/koa-log');
var init  = require('../sys/sysInit');

module.exports = function (){
    "use strict"
    let _config = init.config.log4jsConfig[process.env.NODE_ENV];
    let logObj = new log( _config );
    return logObj;
}