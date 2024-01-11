const io = require('socket.io-client');

// Tạo kết nối tới server Socket.IO
const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Kết nối thành công!');

    const data = {
        pc: 'vietnb1',
        devices: ['device11', 'device21', 'device31']
    };
    socket.emit('init', data);
    const devices = ['device11', 'device21', 'device31'];


    setInterval(() => {
        const randomDevice = devices[Math.floor(Math.random() * devices.length)];

        const data1 = {
            pc: 'vietnb1',
            device: randomDevice,
            message: 'message ' + Date.now()
        };
        socket.emit('event', data1);
    }, 1000)
});

socket.on('response', (data) => {
    console.log('Nhận phản hồi từ server:', data);
});

socket.on('disconnect', () => {
    console.log('Mất kết nối với server');
});