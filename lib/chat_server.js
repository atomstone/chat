var socketio = require('socket.io');

var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};


exports.listen = function(server){
    io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection', function(socket){
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
        joinRoom(socket, 'Lobbby');
        handleMessageBroadcasting(socket, nickNames);
        handleNameChangeAttempts(socket, nickNames, namesUsed);
        socket.on('rooms', function(){
            socket.emit('rooms', io.sockets.manager.rooms);
        });
        handleClientDisconnection(socket, nickNames, namesUsed);
    });
}

//�����û��ǳ�
function assignGuestName(socket, guestNumber, nickNames, namesUsed){
    var name = 'Guest' + guestNumber; //�������ǳ�
    nickNames[socket.id] = name;  //���û��ǳƸ��ͻ�������ID������
    socket.emit('nameResult', {success:true, name:name}); //���û�֪�����ǵ��ǳ�
    namesUsed.push(name); //����Ѿ���ռ�õ��ǳ�
    return guestNumber+1; //�������������ǳƵļ�����
}

//���뷿��
function joinRoom(socket, room){
    socket.join(room); //���û����뷿��
    currentRoom[socket.id] = room; //��¼�û��ĵ�ǰ����
    socket.emit('joinResult', {room:room}); //���û�֪�����ǽ������µķ���
    socket.broadcast.to(room).emit('message', {text:nickNames[socket.id]+'has joined'+room+'.'});//�÷�����������û�֪�������û����뷿��
    var usersInRoom = io.sockets.clients(room); //ȷ������Щ�û������������
    if(usersInRoom.length > 1){ //�����ֹһ���û����������������¶���˭
        var usersInRoomSummary = 'users currently in ' + room + '.';
        for(var index in usersInRoom){
            var userSocketId = usersInRoom[index].id;
            if(userSocketId != socket.id){
                if(index > 0){
                    usersInRoomSummary += ',';
                }
                usersInRoomSummary += nickNames[userSocketId];
            }
        }
        
    }
    usersInRoomSummary += '.';
    socket.emit('message', {text:usersInRoomSummary});//�������������û��Ļ��ܷ��͸�����û�
    
}

//����������Ϣ
function handleMessageBroadcasting(socket){
    socket.on('message', function(message){
        socket.broadcast.to(message.room).emit('message', {text:nickNames[socket.id]+':'+message.text});
    });
}


//��������
function handleRoomJoining(socket){
    socket.on('join', function(room){
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket, room.newRoom);
    });
}

//�����������߼�
function handleNameChangeAttempts(socket, nickNames, namesUsed){

}

//�û��Ͽ�����
function handleClientDisconnection(socket){
    socket.on('disconnect', function(){
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete nickNames[soket.id];
    });
}





