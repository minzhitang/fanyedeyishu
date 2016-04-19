"use strict"

var koa       = require('koa');
var app       = koa();
var error     = require('koa-error');
var userAgent = require('koa-useragent');
var favicon   = require('koa-favicon');

// init static server
var staticServer = require('koa-static');

// init system
var init = require('./sys/sysInit');

// init log
var log = require('./config/log')();

// init router
var router = require('./config/router');

// init views
var views = require('co-views');

// init session
// var session = require('koa-session');

// var parse = require('co-body');

/**
 * error
 */
app.use(error());

/**
 * user-agent
 */
app.use(userAgent());

/**
 * favicon
 */
app.use(favicon(__dirname + '/static/favicon.ico'));



// catch error
app.on('error', function(err, ctx) {
    log.error(err);
});

// static middleware
// @TODO maxage
app.use(staticServer(init.config.staticDir));

// app.keys = ['fanyedeyishu'];
// app.use(session(app));

// init router/jsonp/json/404/500/view engine/app config
app.use(function * (next) {
    // this.render = views(init.config.templateDir, { map: { html: 'swig' }});
    // console.log(this.render);
    // var body = yield parse.text(this);
    // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    // console.log(body);
    // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');

    // koa 推荐用来保存那些通过中间件传递给试图的参数或数据的命名空间
    // this.state.v = init.config.staticVsersion;

    // init static server
    staticServer(init.config.staticDir);

    // init router
    let _router = router(this);
    yield _router.routes();

    // json/jsonp支持
    this.set('X-Content-Type-Options', 'nosniff');
    if ( this.query.callback ) {
        if (this.state.userAgent.isIE) {
            this.set('Content-Type', 'text/javascript; charset=UTF-8');
        }else{
            this.set('Content-Type', 'application/javascript; charset=UTF-8');
        }
    } else {
        // json 是自己控制了，url无法却分了。。。
        this.set('Content-Type', 'text/html; charset=utf-8');
    }


    // init 404 and 500
    // yield init.initHttpError(next, this);

    yield next;
});

// start
for (let port of init.config.appPort) {
    // 阿里云不能指定port，只能是80端口
    app.listen(port);
    console.log(init.config.appName + ' Listening on ' + port);
}

