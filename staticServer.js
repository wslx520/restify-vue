// 实现一个静态服务器
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const zlib = require('zlib');

// 常用mimeType
const mimeTypes = {
    "css": "text/css",
    "gif": "image/gif",
    "html": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "text/javascript",
    "json": "application/json",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "txt": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "xml": "text/xml"
};
// 指定这些后缀文件的缓存时间
const cacheFileTypes = {
    fileMatch: /^(htm|html|gif|png|jpg|jpeg|jpe|js|css)$/ig,
    maxAge: 60 * 60 * 24 * 365
};
// 这些后缀会gzip
const gzipTypeReg = /js|css|html|htm|txt/ig;

const defautlOption = {
    dir:'./static',
    gzip:true,
    cache:true,
    mimeTypes:{},
    defaultPage:'index.html',
    port:3001
}

let extend = function (old, ...news) {
    news.forEach(function (obj) {
        for(var n in obj) {
            old[n] = obj[n];
        }       
    })
    return old;
}
let StaticServer = function (option = {}) {
    this.option = option = extend({},defautlOption,option);
    let {dir,gzip,cache} = option;
    let server = http.createServer(function (request, response) {
        let pathname = url.parse(request.url).pathname;
        pathname = path.normalize(pathname).replace('../','').replace('..\\','');
        let realPath = dir + pathname;
        let ext = path.extname(realPath).slice(1);
        if(!ext) ext = 'unknown';
        console.log(pathname, realPath, ext);
        fs.stat(realPath, function (err, stat) {
            if(err) {
                response.writeHead(404, err);
                response.end();
            } else {
                cacheFileTypes.fileMatch.lastIndex = 0;
                if(cacheFileTypes.fileMatch.test(ext)) {
                    let expires = new Date();
                    // * 1000 是因为setTime是设置的毫秒
                    expires.setTime(expires.getTime() + cacheFileTypes.maxAge * 1000);
                    response.setHeader('Expires', expires.toUTCString());
                    response.setHeader('Cache-Control', 'max-age=' + cacheFileTypes.maxAge);
                }
                
                let lastModified = stat.mtime.toUTCString();
                let ifModified = request.headers['if-modified-since'];
                // console.log(lastModified, ifModified)
                if(ifModified && ifModified == lastModified) {
                    response.writeHead(304,"Not Modified");
                    response.end();
                    return;
                }
                response.setHeader("Last-Modified", lastModified);
                let contentType = mimeTypes[ext] || 'text/plain';
                response.setHeader('Content-Type', contentType);
                let fileStream = fs.createReadStream(realPath);
                // console.log(ext)
                gzipTypeReg.lastIndex = 0;
                if(gzipTypeReg.test(ext)) {
                    let acceptHeader = request.headers['accept-encoding'];
                    if(/\bgzip\b/.test(acceptHeader)) {
                        
                        response.setHeader('Content-Encoding', 'gzip');
                        fileStream = fileStream.pipe(zlib.createGzip());
                        // console.log('be gzip')
                    } else if(/\bdeflate\b/.test(acceptHeader)) {
                        response.setHeader('Content-Encoding', 'deflate');
                        fileStream = fileStream.pipe(zlib.createDeflate());
                    }                    
                }
                // 用流自动分段发送文件内容，并自动end
                fileStream.pipe(response);
                // response.write(file, 'binary');
                // response.end();
            }
        })
    })
    this.server = server;
}

StaticServer.prototype.start = function (port, fn) {
    this.server.listen(port || this.option.port,fn || (() => {
        console.log(`Server running at port: ${port}.`);
    }));
}

module.exports = StaticServer;