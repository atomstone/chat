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

//分配用户昵称
function assignGuestName(socket, guestNumber, nickNames, namesUsed){
    var name = 'Guest' + guestNumber; //生成新昵称
    nickNames[socket.id] = name;  //把用户昵称跟客户端连接ID关联上
    socket.emit('nameResult', {success:true, name:name}); //让用户知道他们的昵称
    namesUsed.push(name); //存放已经被占用的昵称
    return guestNumber+1; //增加用来生成昵称的计数器
}

//进入房间
function joinRoom(socket, room){
    socket.join(room); //让用户进入房间
    currentRoom[socket.id] = room; //记录用户的当前房间
    socket.emit('joinResult', {room:room}); //让用户知道他们进入了新的房间
    socket.broadcast.to(room).emit('message', {text:nickNames[socket.id]+'has joined'+room+'.'});//让房间里的其他用户知道有新用户进入房间
    var usersInRoom = io.sockets.clients(room); //确定有哪些用户在这个房间里
    if(usersInRoom.length > 1){ //如果不止一个用户在这个房间里，汇总下都是谁
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
    socket.emit('message', {text:usersInRoomSummary});//将房间里其他用户的汇总发送给这个用户
    
}

//发送聊天消息
function handleMessageBroadcasting(socket){
    socket.on('message', function(message){
        socket.broadcast.to(message.room).emit('message', {text:nickNames[socket.id]+':'+message.text});
    });
}


//创建房间
function handleRoomJoining(socket){
    socket.on('join', function(room){
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket, room.newRoom);
    });
}

//更名请求处理逻辑
function handleNameChangeAttempts(socket, nickNames, namesUsed){

}

//用户断开连接
function handleClientDisconnection(socket){
    socket.on('disconnect', function(){
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete nickNames[soket.id];
    });
}





