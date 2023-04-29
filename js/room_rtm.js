async function handleChannelMessage(messageData, memberId) {
    let data = JSON.parse(messageData.text);

    if (data.type === 'chat') {
        addMessageToDom(data.displayName, data.message);
    } else if (data.type === 'borderColor') {
        changeUserBorderColor(data.uid, data.color);
        if (data.incrementSlider) {
            incrementSliderValue(data.uid, 1);
        }
    } else if (data.type === 'muteUpdate') {
        incrementSliderValue(data.uid, data.incrementValue);
    } else if (data.type === 'notification') {
        addNotificationToDom(data.uid, data.action);
    }
};

async function sendMessage(e) {
    e.preventDefault();

    let message = e.target.message.value;
    await channel.sendMessage({ text: JSON.stringify({ 'type': 'chat', 'message': message, 'displayName': displayName }) });
    addMessageToDom(displayName, message);
    e.target.reset();
};

function addMessageToDom(name, message) {
    let messagesWrapper = document.getElementById('messages');

    let newMessage = `<div class="message__wrapper">
                        <div class="message__body">
                            <strong class="message__author">${name}</strong>
                            <p class="message__text">${message}</p>
                        </div>
                      </div>`;

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage);

    let lastMessage = document.querySelector('#messages .message__wrapper:last-child');
    if (lastMessage) {
        lastMessage.scrollIntoView();
    }
};

async function leaveChannel() {
    await channel.leave();
    await rtmClient.logout();
};

function incrementSliderValue(uid, incrementValue) {
    const slider = document.querySelector(`#user-container-${uid} .video__slider input[type="range"]`);
    if (slider) {
        slider.value = Math.max(0, Math.min(parseInt(slider.value) + incrementValue, parseInt(slider.max)));
    }
};

async function sendMuteUpdate(incrementValue) {
    const muteUpdateMessage = JSON.stringify({ 'type': 'muteUpdate', 'uid': uid, 'incrementValue': incrementValue });
    await channel.sendMessage({ text: muteUpdateMessage });
};

function addNotificationToDom(userId, action) {
    let notificationContainer = document.getElementById('Notification__container');
    let message;

    if (userId === uid) {
        message = `You said ${action === 'green' ? 'Yes' : 'No'}`;
    } else {
        message = `User ${userId} said ${action === 'green' ? 'Yes' : 'No'}`;
    }

    let newNotification = `<div class="notification__wrapper">
                            <p class="notification__text">${message}</p>
                          </div>`;

    notificationContainer.insertAdjacentHTML('beforeend', newNotification);
};

function changeUserBorderColor(uid, color) {
    const userVideoContainer = document.getElementById(`user-container-${uid}`);
    if (userVideoContainer) {
        userVideoContainer.classList.remove('border-green', 'border-red');
        userVideoContainer.classList.add(`border-${color}`);
    }
};

async function sendBorderColorChange(color, incrementSlider = false) {
    const borderColorMessage = JSON.stringify({ 'type': 'borderColor', 'uid': uid, 'color': color, 'incrementSlider': incrementSlider });
    await channel.sendMessage({ text: borderColorMessage });
};

document.getElementById('green-btn').addEventListener('click', async () => {
    changeUserBorderColor(uid, 'green');
    incrementSliderValue(uid);
    sendBorderColorChange('green', true);
    const notificationMessage = JSON.stringify({ 'type': 'notification', 'uid': uid, 'action': 'green' });
    await channel.sendMessage({ text: notificationMessage });
    addNotificationToDom(uid, 'green');
});

document.getElementById('red-btn').addEventListener('click', async () => {
    changeUserBorderColor(uid, 'red');
    incrementSliderValue(uid);
    sendBorderColorChange('red', true);
    const notificationMessage = JSON.stringify({ 'type': 'notification', 'uid': uid, 'action': 'red' });
    await channel.sendMessage({ text: notificationMessage });
    addNotificationToDom(uid, 'red');
});

window.addEventListener('beforeunload', leaveChannel);
let messageForm = document.getElementById('message__form');
messageForm.addEventListener('submit', sendMessage);









// async function handleChannelMessage(messageData, memberId) {
//     let data = JSON.parse(messageData.text);

//     if (data.type === 'chat') {
//         addMessageToDom(data.displayName, data.message);
//     } else if (data.type === 'borderColor') {
//         changeUserBorderColor(data.uid, data.color);
//         if (data.incrementSlider) {
//             incrementSliderValue(data.uid, 1);
//         }
//     } else if (data.type === 'muteUpdate') {
//         incrementSliderValue(data.uid, data.incrementValue);
//     }
// };

// async function sendMessage(e) {
//     e.preventDefault();

//     let message = e.target.message.value;
//     await channel.sendMessage({ text: JSON.stringify({ 'type': 'chat', 'message': message, 'displayName': displayName }) });
//     addMessageToDom(displayName, message);
//     e.target.reset();
// };

// function addMessageToDom(name, message) {
//     let messagesWrapper = document.getElementById('messages');

//     let newMessage = `<div class="message__wrapper">
//                         <div class="message__body">
//                             <strong class="message__author">${name}</strong>
//                             <p class="message__text">${message}</p>
//                         </div>
//                       </div>`;

//     messagesWrapper.insertAdjacentHTML('beforeend', newMessage);

//     let lastMessage = document.querySelector('#messages .message__wrapper:last-child');
//     if (lastMessage) {
//         lastMessage.scrollIntoView();
//     }
// };

// async function leaveChannel() {
//     await channel.leave();
//     await rtmClient.logout();
// };

// function incrementSliderValue(uid, incrementValue) {
//     const slider = document.querySelector(`#user-container-${uid} .video__slider input[type="range"]`);
//     if (slider) {
//         slider.value = Math.max(0, Math.min(parseInt(slider.value) + incrementValue, parseInt(slider.max)));
//     }
// };

// async function sendMuteUpdate(incrementValue) {
//     const muteUpdateMessage = JSON.stringify({ 'type': 'muteUpdate', 'uid': uid, 'incrementValue': incrementValue });
//     await channel.sendMessage({ text: muteUpdateMessage });
// };

// function changeUserBorderColor(uid, color) {
//     const userVideoContainer = document.getElementById(`user-container-${uid}`);
//     if (userVideoContainer) {
//         userVideoContainer.classList.remove('border-green', 'border-red');
//         userVideoContainer.classList.add(`border-${color}`);
//     }
// };

// async function sendBorderColorChange(color, incrementSlider = false) {
//     const borderColorMessage = JSON.stringify({ 'type': 'borderColor', 'uid': uid, 'color': color, 'incrementSlider': incrementSlider });
//     await channel.sendMessage({ text: borderColorMessage });
// };

// document.getElementById('green-btn').addEventListener('click', () => {
//     changeUserBorderColor(uid, 'green');
//     incrementSliderValue(uid);
//     sendBorderColorChange('green', true);
// });

// document.getElementById('red-btn').addEventListener('click', () => {
//     changeUserBorderColor(uid, 'red');
//     incrementSliderValue(uid);
//     sendBorderColorChange('red', true);
// });

// window.addEventListener('beforeunload', leaveChannel);
// let messageForm = document.getElementById('message__form');
// messageForm.addEventListener('submit', sendMessage);






