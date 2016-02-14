var xmlParser = require('xml2js');

/**
 * xml 转json
 * @param  {String}   content       xml内容
 * @yield  {Object}   
 *
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-14
 */
exports.parse = function * (content) {
    return new Promise(function (resolve, reject) {
        xmlParser.parseString(content, {explicitArray : false}, function (err, result) {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}


/**
 * 将json对象转为xml String，如示例
 * @param  {Object}   obj     Json对象
 * @yield  {String}   xml内容
 * 
 * @author minzhi <tang626@gmail.com>
 * @date   2016-02-14
 */
// var obj = {name: "Super", Surname: "Man", age: 23};
// 
// <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
// <root>
//   <name>Super</name>
//   <Surname>Man</Surname>
//   <age>23</age>
// </root>
exports.build = function * (obj) {
    var builder = new xmlParser.Builder({
        rootName : "xml",
        cdata    : true,
        headless : true
    });
    return builder.buildObject(obj);
}