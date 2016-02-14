var common   = require('@sina/koa-common');
// var activity = require('../model/activity');
var jsonp = require('@sina/koa-jsonp');
var xhttp = require('@sina/koa-xhttp');
var fs = require("fs");
var parse = require('co-body');
// var render = require('../config/render');
var weixin = require('../model/weixin');
var xmlParser = require('../model/xml2json');
var book = require('../model/book');

exports.check = function * () {
    "use strict"
    // console.log(common.sort);

    console.log(this.request.query);
    let signature = this.request.query.signature || '';
    let timestamp = this.request.query.timestamp || '';
    let nonce     = this.request.query.nonce || '';
    // let match = 1;
    console.log('%s, %s, %s', signature, timestamp, nonce);
    let match = yield weixin.checkSignature(signature, timestamp, nonce);
    console.log('Match:' + match);
    if (match) {
        this.body = this.request.query.echostr;
        // this.body = 11;
    }
    else {
        this.body = 'not match';
    }
}

exports.token = function * () {
    "use strict"
    let token = yield weixin.getAccessKey();
    this.body = token;
}

exports.menu = function * () {
    "use strict"
    let token = yield weixin.createMenus();
    this.body = '菜单创建成功';
}

exports.aa = function *() {
    "use strict"
    let books = yield book.searchName('巴巴爸爸zhao');
    console.dir(books);
    console.log(books[0].num);
    this.body = 'ddd';
    // exit;

    // let obj = {name: "Super", Surname: "Man", age: 23};
    // let re = yield xmlParser.build(obj);
    // let re = yield xmlParser.parse('<xml><id>123123</id></xml>');
    // console.log(re);
    // let rec = {}
    // rec.ArticleCount = books.length;
    // let items = [];
    // // rec.Articles = {};
    // // let articles = [];
    // for (let book of books) {
    //     let item = {
    //         'Title'       : book.book_name,
    //         'Description' : book.content_intro,
    //         'PicUrl'      : 'http:' + book.picture,
    //         'Url'         : book.book_url
    //     }
    //     items.push(item);
    // }
    // rec.Articles = {'item' : items};
    // console.dir(rec);

    // this.body = yield xmlParser.build(rec);
    // this.body = books;

    // if (this.method == 'GET') {
        // var activityArr = ['Welcome', ' to', ' the', ' nodejs', ' on', ' aliyun'];
        // var activityArr = yield activity.aa( 1 );
        // console.log(activityArr);
    // }else{
        // let postData = yield parse(this);
        // console.log(postData);
    // }

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
    // this.body = jsonp.succ('succ', activityArr, this.query.callback);
    // this.body = jsonp.error('error', '', this.query.callback);


    // this.body = yield render('activity_view', {
    //     v: this.state.v,
    //     isLogin: this.state.isLogin,
    //     s: 'activity',
    //     activityArr: activityArr
    // });
}

// 检查是不是登陆状态，否的话出登陆页、注册页
exports.cc = function * ( ) {
    "use strict"
    let funName = 'f';
    funName();
    /*if ( this.session.hasLogin != 1 ) {
        this.body = yield this.render('login');
    }
    else {
        this.body = 'Welcome! ' + this.session.nickname;
    }*/
}

var f = function () {
    console.log('fffffffffff');
}

exports.login = function * ( next ) {
    "use strict"
    let post = yield parse.text(this);
    console.log(post);
    this.body = post;

    // this.body = post.username + post.password;

    // console.log(this.session.v);
    // var n = this.session.v || 0;
    // this.session.v = ++n;
    // this.body = n + ' views';
    // this.body = yield this.render('login');
}