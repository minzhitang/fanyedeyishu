// 微信发送的内容都转发到此处

var weixin = require('../model/weixin');
// 用于解析post内容
var bodyParser = require('co-body');
// 封装的xml解析类，包括parse和build两个方法
var xmlParser = require('../model/xml2json');

// 处理消息的业务函数
var message = require('../model/message');

exports.rec = function * () {
    "use strict"
    // console.log(this.request.query);
    /** 验证是否微信发送过来的请求 @TODO: 有时候还验证不match*/
    /*let signature = this.request.query.signature || '';
    let timestamp = this.request.query.timestamp || '';
    let nonce     = this.request.query.nonce || '';*/
    // let match = 1;
    // console.log('%s, %s, %s', signature, timestamp, nonce);
    // let match = yield weixin.checkSignature(signature, timestamp, nonce);
    
    /*if (match) {
        this.body = this.request.query.echostr;
        // this.body = 11;
    }
    else {
        this.body = 'not match';
    }*/
    /** 验证完毕 */
    var match = true;

    if (match) {
        // 消息信息，text/xml的内容
        let post = yield bodyParser.text(this, {textTypes : ['xml']});

        // 解成json obj
        let obj = yield xmlParser.parse(post);
        console.log(obj);

        // 消息应对
        let result = yield message.process(obj.xml);
        // console.log(result);

        // 返回xml
        this.body = yield xmlParser.build(result);

        console.log(this.body);
    }
    else {
        console.log('not weixin');
    }
    // this.body = 'succ';
}