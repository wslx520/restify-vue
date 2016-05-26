'use strict';
// const express = require('express');
const restify = require('restify');
const fs = require('fs');

const Server = require('./staticServer');

// new Server({dir:'./static'}).start(3001);
var server = restify.createServer();

// server.get('/', restify.serveStatic())
// 用restify来实现静态文件路由
server.get(/\/|\.(js|html|css|jpg|jpeg|gif|png)/, restify.serveStatic({
  directory: './static'
}));

server.listen(3900, function() {
  console.log('%s listening at %s', server.name, server.url);
});