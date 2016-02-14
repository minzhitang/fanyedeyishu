var zc_activity = require('../config/mysql')('zc_activity');
var zc_yk_token = require('../config/mysql')('zc_yk_token', 1);
var common = require('@sina/koa-common');


exports.aa = function * (id){
    "use strict"
    var activityArr = yield zc_activity.select('title,short_title,id').where({is_del:0,id:{sign:'in',val:[1,2,3]}}).all();
    var num = yield zc_activity.getCountNum();
    return activityArr;
    // console.log(a);
    // console.log(num);

    // var obj1 = {access_token:'3',expires_in:1,refresh_token:'11',token_type:'aa',create_time:11 };
    // var id1 = yield zc_yk_token.insert(obj1);
    // console.log(id1);


    // var obj = {id:7};
    // var nums = yield zc_yk_token.delete(obj);
    // console.log(nums);
    // var updateObj = {access_token:2,expires_in:2};
    // var obj = {id:9};
    // var nums = yield zc_yk_token.update( updateObj, obj );


    // var nums = yield db.query('select TIMESTAMP(now())');

    // console.log(nums);
}