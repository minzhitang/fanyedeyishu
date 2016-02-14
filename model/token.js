// 统一取access_token
var variables = require('./variables');
var weixin = require('./weixin');

// 从数据库取，如果快过期，则从微信取
exports.get = function * () {
    "use strict"
    let row = yield variables.getAll('access_token');
    // 微信token有效时长为7200秒
    if (Date.now()/1000 - row.updated_time < 7000) {
        return row.value;
    }
    else {
        let token = yield weixin.getAccessToken();
        if (token) {
            variables.set('access_token', token);
            return token;
        }
        else {
            return false;
        }
    }
}