"use strict"

/**
 * 多app 需要实现多个路由
 * @type {[type]}
 */
var wwwRouter = require('koa-router')();
// var adminRouter = require('koa-router')();

/**
 * 引入控制器
 * @type {[type]}
 */
// var activity = require('../controller/activity');
var test = require('../controller/test');
var token = require('../controller/token');
var index = require('../controller/index');
var web = require('../controller/web');

/**
 * 前台路由
 */

wwwRouter.post('/index', index.rec);
wwwRouter.get('/token/flush', token.flush);
wwwRouter.get('/booklist/:list_id', web.booklist);
// wwwRouter.get('/web/pl_list', web.pl_list);
// wwwRouter.get('/test/menu', test.menu);
// wwwRouter.get('/test/check', test.check);
// wwwRouter.get('/test/aa', test.aa);
// wwwRouter.get('/test/cc', test.cc);

// wwwRouter.post('/test/login', test.login);
/**
 * 后台路由
 */
// adminRouter.get('/activity/aa/:id', test.aa);


module.exports = function ( obj ){
    let host = obj.request.host;
    // let _router = '';
    // 多app, 单app直接定义即可，不需要做这些判断
    // if ( host.indexOf('admin.zhongce') > -1 ) {
        // _router = adminRouter;
    // }else{
    let _router = wwwRouter;
    // }
    return _router;
}