"use strict"

var views = require('co-views');
var init = require('../sys/sysInit');

module.exports = function () {
    // console.log(init.config.templateDir);
    // console.log(config.templateDir);
    return views(init.config.templateDir, {
        map: {
            html  : 'swig',
            cache : false
        }
    });
};

/*module.exports = views(init.config.templateDir, {
    map: {
        html  : 'swig',
        cache : false
    }
});*/