function divEscapedContentElement(message){
    return $('<div></div>').text(message);
}

function divSystemContentElement(message){
    return $('<div></div>').html('<i>'+message+'</i>');
}

//处理原始的用户输入
function processUserInput(chatApp, socket){
    var message = $("#send-message").val();
    var systemMessage;
    if(message.charAt(0) == '/'){
        systemMessage = chatApp.processCommand(message);
        if(systemMessage){
            $('#messages').append(divSystemContentElement(systemMessage));
        }
    }else{
        chatApp.sendMessage($('#room').text(), message);
        $('#messages').append(divEscapedContentElement(message));
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    }
    $('#send-message').val('');
}

//客户端初始化逻辑
var socket = io.connect();

$(document).ready(function(){
    var chatApp = new Chat(socket);

    //显示更名尝试的结果
    socket.on('nameResult', function(result){
        var message;
        if(result.success){
            message = 'you are now known as ' + result.name;
        }else{
            message = result.message;
        }
        $("#messages").append(divSystemContentElement(message));
    });
    
    //显示房间变更结果
    socket.on('joinResult', function(result){
        $("#room").text(result.room);
        $("#messages").append(divSystemContentElement('room changed.'));
    });

    //显示接到的消息
    socket.on('messaage', function(message){
        var newElement = $('<div></div>').text(message.text);
        $("#messages").append(newElement);
    });

    //显示可用的房间列表
    socket.on('rooms', function(rooms){
        $("room-list").empty();
        for(var room in rooms){
            room = room.substring(1, room.length);
            if(room != ''){
                $('room-list').append(divEscapedContentElement(room));
            }
        }
        $("#room-list div").click(function(){
            chatApp.processCommand('/join' + $(this).text());
            $("#send-message").focus();
        });
    });
    
    //定期请求可用房间列表    
   /* setInterval(function(){
        socket.emit('rooms');
    }, 1000);*/
   
    //提交表单可以发送聊天信息
    $("#send-form").submit(function(){
        processUserInput(chatApp, socket);
        return false;
    });
   

});









