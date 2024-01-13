const socket = io();
var pc = []
socket.on('event', (data) => {
    console.log("Ok:" + data);
    const eventContainer = document.getElementById('event-container');
    eventContainer.innerHTML = '';

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const deviceData = data[key];
            if (!pc.includes(key)) {
                pc.push(key);
                const option = document.createElement('option');
                option.value = key;
                option.text = key;
                selectPcName.appendChild(option);
            }
            const cardContainer = document.createElement('div');
            if (window.screen.width < 400) {
                cardContainer.classList.add('col-12', 'mb-4');
            } else {
                cardContainer.classList.add('col-lg-4', 'col-md-6', 'mb-4');
            }

            const cardContainerTitle = document.createElement('h3');
            cardContainerTitle.textContent = key;
            cardContainer.appendChild(cardContainerTitle);

            var message = deviceData.message;
            if (message) {
                const cardContainerMessage = document.createElement('h4');
                cardContainerMessage.textContent = message;
                cardContainer.appendChild(cardContainerMessage);
            }
            for (const objectKey in deviceData) {
                if (objectKey != 'message' && deviceData.hasOwnProperty(objectKey)) {
                    const object1 = deviceData[objectKey];
                    const object = object1['queue']
                    let lastMessage = {
                        'time': Date.now(),
                        'message': ''
                    };
                    if (object.queue && object.queue.length > 0) {
                        lastMessage = object.queue[object.queue.length - 1];
                    }

                    const card = document.createElement('div');
                    card.classList.add('card');

                    const cardBody = document.createElement('div');
                    cardBody.classList.add('card-body');

                    const cardTitle = document.createElement('h5');
                    cardTitle.classList.add('card-title');
                    cardTitle.textContent = object1['name'];

                    const cardContent = document.createElement('p');
                    cardContent.classList.add('card-text');
                    var formattedTime = moment(lastMessage.time, 'YYYY-MM-DD HH:mm:ss');
                    const fifteenMinutesAfter = formattedTime.add(15, 'minutes');

                    var isFail = lastMessage.message == '' 
                    || lastMessage.message.toLowerCase().includes('error') 
                    || lastMessage.message.toLowerCase().includes('init')
                    || fifteenMinutesAfter.isBefore(Date.now());
                    formattedTime = formattedTime.format('YYYY-MM-DD HH:mm:ss:SSS')
                    if (isFail) {
                        cardContent.innerHTML = `<span class="message-text-error">${formattedTime}:</span> <span class="message-text-error">Maybe inactive</span>`;
                    } else {
                        cardContent.innerHTML = `<span class="message-time">${formattedTime}:</span> <span class="message-text">Active</span>`;
                    }

                    cardBody.appendChild(cardTitle);
                    cardBody.appendChild(cardContent);

                    card.appendChild(cardBody);

                    cardContainer.appendChild(card);
                }
            }

            eventContainer.appendChild(cardContainer);
        }
    }
});
