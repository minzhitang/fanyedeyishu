var common   = require('@sina/koa-common');
var activity = require('../model/activity');
var jsonp = require('@sina/koa-jsonp');
var xhttp = require('@sina/koa-xhttp');
var fs = require("fs");
var parse = require('co-body');
var render = require('../config/render');

exports.aa = function *(id, next) {
    "use strict"
    if (this.method == 'GET') {
        var activityArr = yield activity.aa( 1 );
        // console.log(activityArr);
    }else{
        let postData = yield parse(this);
        console.log(postData);
    }

    // post
    // let post = yield parse(this);
    // console.log(post);

    // http
    // let url = 'http://wangkun5.zhongce.sina.com.cn/activity/activity_lists/0/?page=1&format=json';
    // let header = {Referer: 'https://www.google.com.hk'};

    // let response = yield xhttp.get(url, header); //Yay, HTTP requests with no callbacks!
    // let a = yield xhttp.post( url, {a:1} );
    // let a = yield xhttp.upload( url, {a:1,file: fs.createReadStream('./static/images/arr.png')} );
    // let a = yield xhttp.download( 'http://sinastorage.com/storage.miaosha.sina.com.cn/products/201601/cc992ed4a8c8541f54642815169b8f60.jpg', 'a/b', '1.jpg' );
    // console.log(response.body);


    // jsonp
    // let activityArr = yield activity.aa( id );
    // console.log(activityArr);
    this.body = jsonp.succ('succ', activityArr, this.query.callback);
    // this.body = jsonp.error('error', '', this.query.callback);


    // this.body = yield render('activity_view', {
    //     v: this.state.v,
    //     isLogin: this.state.isLogin,
    //     s: 'activity',
    //     activityArr: activityArr
    // });
}