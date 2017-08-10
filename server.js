var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

//�����ļ�������ʱ����404����
function send404(response){
    response.writeHead(404, {'Content-Type':'text/plain'});
    response.write('error 404: resource not found');
    response.end();
}

//�����ļ�����
function sendFile(response, filePath, fileContents){
    response.writeHead(
        200,
        {'content-type': mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}

//��һ�η��ʴ�Ӳ�̶�ȡ�����浽�ڴ���,֮�����ֱ�Ӷ�ȡ����
function serveStatic(response, cache, absPath){
    if(cache[absPath]){ //����ļ��Ƿ񻺴����ڴ���
        sendFile(response, absPath, cache[absPath]); //���ڴ��з����ļ�
    }else{
        fs.exists(absPath, function(exists){ //����ļ��Ƿ����
            if(exists){ //��Ӳ���ж�ȡ�ļ�
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

//����HTTP������
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

//����http������
server.listen(8192, function(){
    console.log("Server listening on port 8192");
});


//����socket.io������
var chatServer = require('./lib/chat_server');
chatServer.listen(server); //�ṩһ���Ѿ�����õ�http������



