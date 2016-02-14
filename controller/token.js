// 定时刷token的脚本
var weixin = require('../model/weixin');
var variables = require('../model/variables');

exports.flush = function * () {
    "use strict"
    let token = yield weixin.getAccessToken();
    console.log(token);
    if (token) {
        let succ = yield variables.set('access_token', token);
        this.body = 'Access token has been saved!';
    }
    else {
        console.err('Failed to get access_token');
        this.body = 'Get access_token failed!';
    }

}