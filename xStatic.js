// 实现一个静态服务器
'use strict';
const fs = require('fs');
const path = require('path');
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
const oneday = 60 * 60 * 24;
// 指定这些后缀文件的缓存时间
const cacheFileTypes = {
    fileMatch: /^(htm|html|gif|png|jpg|jpeg|jpe|js|css)$/ig,
    maxAge: oneday * 365
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

let xStatic = function (dir, ops={
    gzip:true,
    cache:true,
    maxAge:cacheFileTypes.maxAge,
    defaultPage:'index.html',
    mimeTypes:mimeTypes
}) {
    let maxAge = ops.maxAge;
    return function (request, response, next) {
        console.log(request.url, next)
        let pathname = url.parse(request.url).pathname;
        pathname = path.normalize(pathname).replace('../','');
        let realPath = dir + pathname;
        if(path.extname(realPath) && !mimeTypes[path.extname(realPath)]) {
            return next();
        }
        fs.stat(realPath, function (err, stat) {
            if(err) {
                if(typeof next === 'function') return next();
                response.writeHead(404, err);
                response.end();
            } else {
            	if(stat.isDirectory()) {
            		realPath += ops.defaultPage;
            	}
        		let ext = path.extname(realPath).slice(1);
        		if(!ext) ext = 'unknown';
                // console.log(path.extname('ddd.js?a=1&b3'))
                cacheFileTypes.fileMatch.lastIndex = 0;
                let lastModified = stat.mtime.toUTCString();
                response.setHeader("Last-Modified", lastModified);
                if(ops.cache && cacheFileTypes.fileMatch.test(ext)) {
                    let expires = new Date();
                    // * 1000 是因为setTime是设置的毫秒
                    expires.setTime(expires.getTime() + maxAge * 1000);
                    response.setHeader('Expires', expires.toUTCString());
                    response.setHeader('Cache-Control', 'max-age=' + maxAge);
                
                    let ifModified = request.headers['if-modified-since'];
                    // console.log(lastModified, ifModified)
                    if(ifModified && ifModified == lastModified) {
                        response.writeHead(304,"Not Modified");
                        response.end();
                        return;
                    }
                }
                let contentType = mimeTypes[ext] || 'text/plain';
                response.setHeader('Content-Type', contentType);
                let fileStream = fs.createReadStream(realPath);
                // console.log(ext)
                gzipTypeReg.lastIndex = 0;
                if(ops.gzip && gzipTypeReg.test(ext)) {
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
        if(next) next()
    }
}


module.exports = xStatic;