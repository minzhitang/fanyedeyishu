var common = require('@sina/koa-common');
var xhttp = require('@sina/koa-xhttp');

var appConfig  = require('../config/config');

/**
 * 微信接口，如check、授权等
 * 
 * @author minzhi <tang626@gmail.com>
 * @date   2016-01-19
 */
// var parse = require('co-body');

/**
 * @todo:这个接口有问题，没有经过充分测试，有时候就不对了
 * 
 * 
 * 微信检查接口，由token、time、nonce算出的签名应该与signature一致。
 * 
 * @param  string   signature     签名
 * @param  string   timestamp     时间戳
 * @param  string   nonce         
 * @yield  bool   
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-01-21
 */
exports.checkSignature = function * (signature, timestamp, nonce) {
    "use strict"

    let token = appConfig.weixinConfig.token;
    let tmpArr = [token, timestamp, nonce];
    console.log(tmpArr);

    // tmpArr = yield common.sort(tmpArr);
    tmpArr = common.sort(tmpArr, 'SORT_STRING');
    // console.log(tmpArr);
    let tmpStr = tmpArr.join('');
    console.log(tmpStr);
    tmpStr = common.sha1(tmpStr);

    console.log('tmpStr: ' + tmpStr);
    if (tmpStr == signature) {
        return true;
    }
    else {
        return false;
    }
}
/**
 * 获取有效时长为两小时的access token
 * https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
 * @yield  string   access_token串或者错误
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-04
 */
exports.getAccessToken = function * () {
    "use strict"
    let url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=';
    url += appConfig.weixinConfig.appid + '&secret=' + appConfig.weixinConfig.secret;
    let res = yield xhttp.get( url );
    console.log(res);
    let content = JSON.parse(res);
    // 有效期为7200秒
    if (content.access_token) {
        return content.access_token;
    }   
    else {
        console.err(content.errcode + ': ' + content.errmsg);
        return false;
    }
}


/**
 * 可废弃，自定义菜单频率很低，直接在公众号平台做就可以
 * 
 * 创建自定义菜单
 * https://api.weixin.qq.com/cgi-bin/menu/create?access_token=ACCESS_TOKEN
 * @yield  {[type]}   [description]
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-04
 */
exports.createMenus = function * () {
    "use strict"
    let menus = {
        "button": [
            {
                "name": "扫码", 
                "sub_button": [
                    {
                        "type": "scancode_waitmsg", 
                        "name": "扫码带提示", 
                        "key": "rselfmenu_0_0", 
                        "sub_button": [ ]
                    }, 
                    {
                        "type": "scancode_push", 
                        "name": "扫码推事件", 
                        "key": "rselfmenu_0_1", 
                        "sub_button": [ ]
                    }
                ]
            }, 
            {
                "name": "发图", 
                "sub_button": [
                    {
                        "type": "pic_sysphoto", 
                        "name": "系统拍照发图", 
                        "key": "rselfmenu_1_0", 
                        "sub_button": [ ]
                     }, 
                    {
                        "type": "pic_photo_or_album", 
                        "name": "拍照或者相册发图", 
                        "key": "rselfmenu_1_1", 
                        "sub_button": [ ]
                    }, 
                    {
                        "type": "pic_weixin", 
                        "name": "微信相册发图", 
                        "key": "rselfmenu_1_2", 
                        "sub_button": [ ]
                    }
                ]
            }, 
            {
                "name": "发送位置", 
                "type": "location_select", 
                "key": "rselfmenu_2_0"
            }
        ]
    };
    let url = 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' + 'cXrz5oUlAPtewZk44V6SXy2L_v9d_imHOcmMNzrttnAmgmT9cbRCVR8cqygj4pDkPGv2NF9EeEPgPYfgZIZqnLKaURL3-xwwIkjM5PTI1y5IoPazHx56a1skniWNnowILBLbAHAUKU';
    let res = yield xhttp.post( url, menus );
    console.log(res);   
}