// h5的页面

// @TODO: render这个就是有问题啊，最后没办法，还是放在index.js里面了
// 
// 
// var render = require('../config/render');
var book = require('../model/book');

exports.book = function * ( next ) {
    "use strict"
    // console.log(id);
    // this.body = 'sfsf';
    let book_info = yield book.getBook(this.params.book_id);
    this.body = yield this.render('show_book', {'book':book_info});
}