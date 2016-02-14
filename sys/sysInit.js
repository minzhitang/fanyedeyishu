"use strict"

var common = require('@sina/koa-common');
var appConfig  = require('../config/config');
var baseConfig = require('@sina/koa-config');

/**
 * init
 *
 * @author wangkun5 <wangkun5@staff.sina.com.cn>
 * @date   2015-12-31
 */
class Init{

    constructor() {
        this._initEnv();
        for( var p in appConfig ) {
            baseConfig[p] = appConfig[p];
        };
        this._checkConfig( baseConfig );

        baseConfig.log4jsConfig[process.env.NODE_ENV]['appenders'][1]['filename'] = appConfig.logDir;
        baseConfig.log4jsConfig[process.env.NODE_ENV]['appenders'][1]['pattern'] = appConfig.appName + '_info-yyyy-MM-dd.log';
        baseConfig.log4jsConfig[process.env.NODE_ENV]['appenders'][2]['filename'] = appConfig.logDir;
        baseConfig.log4jsConfig[process.env.NODE_ENV]['appenders'][2]['pattern'] = appConfig.appName + '_error-yyyy-MM-dd.log';

        this.config = baseConfig;
    }

    _initEnv(){
        let env = process.env.NODE_ENV || 'production';
        process.env.NODE_ENV = env.toLowerCase();
    }

    _checkConfig( config ){
        if ( !config.appName ) {
            var err = new Error('appNmae 不能为空');
            err.status = 500;
            err.errCode = 4;
            throw err;
        };

        let isArr = common.isArray( config.appPort );
        if ( !isArr || config.appPort.length == 0) {
            var err = new Error('app 监听的端口不能为空');
            err.status = 500;
            err.errCode = 4;
            throw err;
        };

        if ( typeof(config.templateDir) != 'string' || !config.templateDir ) {
            var err = new Error('templateDir不能为空');
            err.status = 500;
            err.errCode = 4;
            throw err;
        };

        if ( typeof(config.staticDir) != 'string' || !config.staticDir ) {
            var err = new Error('staticDir不能为空');
            err.status = 500;
            err.errCode = 4;
            throw err;
        };
    }
}

/**
 * 404 and 500
 * @param  Function next          next
 * @param  obj   obj           app
 *
 * @author wangkun5 <wangkun5@staff.sina.com.cn>
 * @date   2015-12-31
 */
Init.prototype.initHttpError = function * ( next, obj ){
    try {
        yield next;
        let status = obj.status || 404;
        if (status === 404) {
            obj.throw(404, 'NOT FOUND')
        }
    } catch (err) {
        err.status = err.status || 500;
        err.errCode = err.errCode || 90104;
        err.message = err.message ? err.message : 'Internal Server Error';

        obj.status = err.status;
        obj.body = {
            code: err.status,
            errCode : err.errCode,
            message: err.message
        };
        // @TODO show 500
        // @TODO show 404
        obj.app.emit('error', err, obj);
    }
}

/**
 * 请求检查referer，这个可能不能用，node是单线程，一关闭就全关了,同理还有dbpostonly
 * @param  obj   obj           请求
 *
 * @author wangkun5 <wangkun5@staff.sina.com.cn>
 * @date   2015-12-31
 */
Init.prototype.checkReferer = function * ( reqObj ){
    switch (reqObj.method){
        case 'GET':
            break;
        case 'POST':
            // @TODO
            // if (BaseModelSwitch::check('postRefererCheck') === true) {
            if (true) {
                let forbid = true;
                let isAllow = yield common.inArray( req.host, this.config.acceptReferer );
                if ( reqObj.header.referer.indexOf(req.host) > -1 && isAllow ) {
                    forbid = false;
                    break;
                }
                if ( forbid ) {
                    let err = new Error('请求源不允许90100[' + reqObj.header.referer + ']');
                    err.status = 500;
                    err.errCode = 90100;
                    throw err;
                }
            }
            break;
        case 'HEAD':
            break;
        default:
            let err = new Error('请求源不允许90100');
            err.status = 500;
            err.errCode = 90100;
            throw err;
    }
}

module.exports = new Init();