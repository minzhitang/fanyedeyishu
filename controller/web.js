// h5的页面

var render = require('../config/render')();
var comment = require('../model/comment');
var parse = require('co-body');


var book = require('../model/book');
var book_list = require('../model/book_list');

/**
 * 根据open_id获取该用户的已读书籍列表
 * @yield  {[type]}   [description]
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-23
 */
exports.pl_list = function * ( ) {
    "use strict"

    let open_id = this.request.query['open_id'];
    if (open_id) {
        // this.body = open_id;
        let comment_list = yield comment.getListByOpenId(open_id);
        console.log(comment_list);
        let pl_list = [];

        if (comment_list) {
            for (let cm of comment_list) {
                cm['book_info'] = yield book.getBook(cm.book_id);
                pl_list.push(cm);
            } 
        }
        console.log(pl_list);
        if (pl_list.length > 0) {
            this.body = yield render('pl', {
                'pl_list' : pl_list,
                'open_id' : open_id
            });
        }
        else {
            this.body = '主人，你还没有说过哪本书的好话或坏话呢~!';
        }

    }
    else {
        this.body = '对不起，参数缺失，小人不知应该返回点什么';
    }
    // console.log(this.request.query);

    // var data = yield parse(this);
    // console.log(data);
    // console.log(id);
    // this.body = 'sfsf';
    // let book_info = yield book.getBook(this.params.book_id);
    // log.error(render);
    // var render = views(init.config.templateDir, {
        // map: {
            // html  : 'swig',
            // cache : false
        // }
    // });
    // this.body = yield render('show_book', {'book':book_info});
}

/**
 * 根据booklist_id获取书单
 * @yield  {[type]}   [description]
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-23
 */
exports.booklist = function * ( ) {
    "use strict"
    // let data = yield parse(this);
    // console.log(data);
    console.log(this.params);
    let list_info = yield book_list.getListById(this.params.list_id);
    console.log(list_info);
    let books = JSON.parse(list_info.content);

    let show_list = [];
    for (let b of books) {
        b['book_info'] = yield book.getBook(b.book_id);
        show_list.push(b);
    }
    if (show_list.length > 0) {
        this.body = yield render('book_list', {
            'book_list' : show_list,
            'title'     : list_info.title
        });
    }
}