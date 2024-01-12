const Queue = require('./queue');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const socketConnections = [];
const mapData = {};
const mapSocket = {};

io.on('connection', (socket) => {
    console.log('Một kết nối socket mới đã được thiết lập.');
    socketConnections.push(socket);

    socket.on('init', (data) => {
        try {
            console.log(data);
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            console.log(socket.id)
            mapSocket[socket.id] = data.pc
            var event_device = {}
            if (data.devices != null) {
                data.devices.forEach(device => {
                    event_device[device.Serial] = {
                        name: device.Name,
                        queue: new Queue(20)
                    };
                });
                mapData[data.pc] = event_device
            }
        } catch (e) {
            console.error(e);
        }
        socketConnections.forEach((socket) => {
            socket.emit('event', mapData);
        });
    });

    socket.on('event', (data) => {
        try {
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            var message = {
                "time": Date.now(),
                "message": data.message
            }
            mapData[data.pc][data.device].queue.enqueue(message);
            socketConnections.forEach((socket) => {
                socket.emit('event', mapData);
            });
        } catch (e) {
            console.error(e);
        }
    });

    socket.on('disconnect', () => {
        console.log('Socket đã mất kết nối.');
        var pc = mapSocket[socket.id]
        console.log(pc);
        if(pc){
            mapData[pc] = {
                "Disconnected":{
                name: "Disconnected",
                queue: new Queue(20)
            }};
            socketConnections.forEach((socket) => {
                socket.emit('event', mapData);
            });
        }
    });

    socketConnections.forEach((socket) => {
        socket.emit('event', mapData);
    });
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server đang lắng nghe tại cổng ${port}`);
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/tracking', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});