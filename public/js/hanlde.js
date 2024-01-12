const inputPcName = document.getElementById('inputMessage');
const selectPcName = document.getElementById('selectPcName');
const sendButton = document.getElementById('sendButton');
sendButton.addEventListener('click', function() {
    const inputPcNameValue = inputPcName.value;
    const selectedPcName = selectPcName.value;

    // Gửi sự kiện socket với dữ liệu từ ô input và dropdown
    const data = {
        message: inputPcNameValue,
        pc: selectedPcName
    };
    socket.emit('editMessage', data);
    inputPcName.value = '';
});