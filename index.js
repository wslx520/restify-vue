'use strict';
// const express = require('express');
const restify = require('restify');
const fs = require('fs');

const sServer = require('./staticServer');
const xStatic = require('./xStatic');
// sServer({dir:'./static', maxAge:10000}).listen(3001,function () {
//     console.log('server start')
// });
var server = restify.createServer();

// 用restify来实现静态文件路由
// server.get(/.(js|html|css|jpg|jpeg|gif|png)/, restify.serveStatic({
//   directory: './static'
// }));

// 用restify+自已写的中间件来做静态文件路由
// server.use(function (req,res,next) {
//     console.log(req.url)
//     res.send(req.url)
//     next();
// });
let ss = xStatic('./static');
server.use(ss);
// console.log(restify.serveStatic({
//   directory: './static'
// }).toString())
server.get(/\.(js|css|html|htm)/, function (request, response) {
    // console.log('你请求的是静态文件',request.query())
    // response.send('你请求的是静态文件')
})
server.get('/', function (req,res,next) {
    // console.log('/////////////')
    next();
})
server.get('/user', function (req,res,next) {
    res.end(req.url);
    next();
})
server.listen(3900, function() {
  console.log('%s listening at %s', server.name, server.url);
});
