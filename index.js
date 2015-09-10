var express = require('express');
var app = express();
var http = require('http').Server(app);

var io = require('socket.io')(http);

var fs = require("fs");
var file = "chatRoom.db";
var exists = fs.existsSync(file);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);
db.serialize(function() {
    var tableCreate = "CREATE TABLE MESSAGE\
    (\
        msg_id INTEGER PRIMARY KEY   AUTOINCREMENT,\
        msg TEXT NOT NULL,\
        userid TEXT NOT NULL,\
        time_id DATETIME DEFAULT CURRENT_TIMESTAMP\
    );"
    if (!exists) {
        db.run(tableCreate);
    }
    else {
        db.each("SELECT msg_id  AS id, msg, userid, datetime(time_id,'localtime') as time_stamp FROM MESSAGE", function(err, row) {
            console.log(row.id + ": " + row.msg + " :" + row.userid + ":" + row.time_stamp);
        });
    }
});
io.on('connection', function(socket) {
    console.log('a user connected');

    //Initialize DB

    // db.close();


    //Emiting chat message on receiving
    socket.on('chat message', function(data) {
        console.log('message: ' + data.msg);


        console.log("INSERT into MESSAGE(msg,userid) VALUES (" + data.msg + "," + socket.uid + ")");
        db.serialize(function() {
            db.run("INSERT into MESSAGE(msg,userid) VALUES ('" + data.msg + "','" + socket.uid + "')");
            db.each("SELECT msg_id, datetime(time_id,'localtime') as time_stamp FROM MESSAGE ORDER BY msg_id DESC LIMIT 1;", function(err, row) {
                data['msgid'] = row.msg_id;

            }, function() {;
                io.emit('chat message', data);
            });
        });

    });

    //Checking if User Id is taken
    socket.on('check uname', function(data) {
        var i = -1;
        for (i = 0; i < io.sockets.sockets.length; i++) {
            var client = io.sockets.sockets[i].uid;
            if (client != undefined && client == data.uid) break;
        }
        if (i == io.sockets.sockets.length) {
            socket.emit("uid_unique");
        } else {
            socket.emit("uid_not_unique");
        }
    });

    //Store user id and maintain number of users list
    socket.on('user connected', function(data) {
        console.log('user connected: ' + data.uid);
        socket['uid'] = data.uid;
        var msgid = 0;
        db.serialize(function() {
            db.each("SELECT msg_id FROM MESSAGE ORDER BY msg_id DESC LIMIT 1;", function(err, row) {
                msgid = row.msg_id;
                console.log(msgid + ":" + row.msg_id);
            }, function() {;
                socket.lmsgid = msgid;
                data.msgid = msgid;
                console.log(msgid);
                var total = [];
                for (var i = 0; i < io.sockets.sockets.length; i++) {
                    var client = io.sockets.sockets[i].uid;
                    if (client != undefined && client != "") total.push(client);
                }
                data.total = total.length;

                io.emit('user connected', data);
            });
        });

    });

    socket.on('chatScrollUp', function(data) {
        var result = [];
        db.serialize(function() {
            console.log("SELECT msg_id, datetime(time_id,'localtime','%Y-%m-%d %H:%M') as time_stamp, msg, userid as uid FROM MESSAGE where msgid <= " + data.msgid + " ORDER BY msg_id DESC LIMIT 10;")
            db.each("SELECT msg_id, strftime('%Y-%m-%d %H:%M',time_id,'localtime') as time_stamp, msg, userid as uid FROM MESSAGE where msg_id <= " + parseInt(data.msgid) + " ORDER BY msg_id DESC LIMIT 30;", function(err, row) {
                console.log(row);
                result.push(row);
            }, function() {
                socket.emit('chatScrollUpResult', result);
            });

        });

    });

    //Get online users list
    socket.on('onlineUsersList', function() {
        var data = []; //io.sockets;
        for (var i = 0; i < io.sockets.sockets.length; i++) {
            var client = io.sockets.sockets[i].uid;
            if (client != undefined && client != "") data.push(client);
        }
        socket.emit('onlineUsersList', data);
    });

    //Maintain user list on disconnection
    socket.on('user disconnected', disc);
    socket.on('disconnect', disc);

    function disc() {
        console.log('user disconnected:' + socket['uid']);
        var data = {};
        data.uid = socket.uid + "";
        socket['uid'] = "";
        var total = [];
        for (var i = 0; i < io.sockets.sockets.length; i++) {
            var client = io.sockets.sockets[i].uid;
            if (client != undefined && client != "") total.push(client);
        }
        data.total = total.length;
        io.emit('user disconnected', data);
    }




});


app.use("/images", express.static('/Users/keerthanathangaraju/chatRoom/images'));
app.use("/scripts", express.static('/Users/keerthanathangaraju/chatRoom/scripts'));
app.get('/', function(req, res) {
    res.sendFile('/Users/keerthanathangaraju/chatRoom/index.html');
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});