function divEscapedContentElement(message){
    return $('<div></div>').text(message);
}

function divSystemContentElement(message){
    return $('<div></div>').html('<i>'+message+'</i>');
}

//����ԭʼ���û�����
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

//�ͻ��˳�ʼ���߼�
var socket = io.connect();

$(document).ready(function(){
    var chatApp = new Chat(socket);

    //��ʾ�������ԵĽ��
    socket.on('nameResult', function(result){
        var message;
        if(result.success){
            message = 'you are now known as ' + result.name;
        }else{
            message = result.message;
        }
        $("#messages").append(divSystemContentElement(message));
    });
    
    //��ʾ���������
    socket.on('joinResult', function(result){
        $("#room").text(result.room);
        $("#messages").append(divSystemContentElement('room changed.'));
    });

    //��ʾ�ӵ�����Ϣ
    socket.on('messaage', function(message){
        var newElement = $('<div></div>').text(message.text);
        $("#messages").append(newElement);
    });

    //��ʾ���õķ����б�
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
    
    //����������÷����б�    
   /* setInterval(function(){
        socket.emit('rooms');
    }, 1000);*/
   
    //�ύ�����Է���������Ϣ
    $("#send-form").submit(function(){
        processUserInput(chatApp, socket);
        return false;
    });
   

});









