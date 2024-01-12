const io = require('socket.io-client');

// Tạo kết nối tới server Socket.IO
const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Kết nối thành công!');

    const data = `{"devices":[{"autoIncrementId":0,"Serial":"ce0117117ad6609e0c","Key":"bd1ef738508aef10345133c6ef1b24e4","Name":"SM-G930S","Model":"SM-G930S","Status":null,"countPhone":0,"countMessage":0,"firstTime":true,"lastTime":"2024-01-12T12:55:13.7610113+07:00","RequestOption":null,"Info":null,"CmdInfo":null,"Timezone":null,"CmdProps":null,"CmdGsm":null,"isSelected":true}],"pc":"SERVER3"}`;
    socket.emit('init', data);
    const devices = ['device11', 'device21', 'device31'];


    // setInterval(() => {
    //     const randomDevice = devices[Math.floor(Math.random() * devices.length)];

    //     const data1 = {
    //         pc: 'vietnb2',
    //         device: randomDevice,
    //         message: 'message ' + Date.now()
    //     };
    //     socket.emit('event', data1);
    // }, 1000)
});

socket.on('response', (data) => {
    console.log('Nhận phản hồi từ server:', data);
});

socket.on('disconnect', () => {
    console.log('Mất kết nối với server');
});