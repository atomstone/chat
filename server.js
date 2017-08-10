var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

//请求文件不存在时发送404错误
function send404(response){
    response.writeHead(404, {'Content-Type':'text/plain'});
    response.write('error 404: resource not found');
    response.end();
}

//发送文件内容
function sendFile(response, filePath, fileContents){
    response.writeHead(
        200,
        {'content-type': mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}

//第一次访问从硬盘读取并缓存到内存中,之后访问直接读取内容
function serveStatic(response, cache, absPath){
    if(cache[absPath]){ //检查文件是否缓存在内存中
        sendFile(response, absPath, cache[absPath]); //从内存中返回文件
    }else{
        fs.exists(absPath, function(exists){ //检查文件是否存在
            if(exists){ //从硬盘中读取文件
                fs.readFile(absPath, function(err, data){
                    if(err){
                        send404(response);
                    }else{
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            }else{
                send404(response);
            }
        });
    }
}

//创建HTTP服务器
var server = http.createServer(function(request, response){
    var filePath = false;
    if(request.url == '/'){
        filePath = 'public/index.html';
    }else{
        filePath = 'public' + request.url;    
    }
console.log('hello');
    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);
});

//启动http服务器
server.listen(8192, function(){
    console.log("Server listening on port 8192");
});


//设置socket.io服务器
var chatServer = require('./lib/chat_server');
chatServer.listen(server); //提供一个已经定义好的http服务器



