// 实现一个静态服务器
'use strict';
const http = require('http');

const xStatic = require('./xStatic');

let extend = function (old, ...news) {
    news.forEach(function (obj) {
        for(var n in obj) {
            old[n] = obj[n];
        }       
    })
    return old;
}
let StaticServer = function (option = {}) {
    option = extend({},option);
    let {dir,gzip,cache,maxAge=cacheFileTypes.maxAge} = option;
    // console.log(maxAge)
    let server = http.createServer(xStatic(dir));
    return server;
}



module.exports = StaticServer;