// Time Functions

function formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutes}`;
}

// Chat Functions

async function handleChannelMessage(messageData, memberId) {
    let data = JSON.parse(messageData.text);

    if (data.type === 'chat') {
        addMessageToDom(data.displayName, data.message);
    } else if (data.type === 'borderColor') {
        changeUserBorderColor(data.uid, data.color);
    } else if (data.type === 'muteUpdate') {
        incrementSliderValue(data.uid, data.incrementValue);
    } else if (data.type === 'notification') {
        addNotificationToDom(data.uid, data.action);
    } else if (data.type === 'taskEvent') {
        handleTaskEvent(data.eventType, data.payload);
    }
}

async function sendMessage(e) {
    e.preventDefault();

    let message = e.target.message.value;
    await channel.sendMessage({ text: JSON.stringify({ 'type': 'chat', 'message': message, 'displayName': displayName }) });
    addMessageToDom(displayName, message);
    e.target.reset();
}

function addMessageToDom(name, message) {
    let messagesWrapper = document.getElementById('messages');
    let currentTime = formatTime(new Date());

    let newMessage = `<div class="message__wrapper">
                        <div class="message__body">
                            <strong class="message__author">${name}</strong>
                            <span class="task__time">${currentTime}</span>
                            <p class="message__text">${message}</p>
                        </div>
                      </div>`;

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage);

    let lastMessage = document.querySelector('#messages .message__wrapper:last-child');
    if (lastMessage) {
        lastMessage.scrollIntoView();
    }
}

let messageForm = document.getElementById('message__form');
messageForm.addEventListener('submit', sendMessage);

// Notification Functions

function addNotificationToDom(userId, action) {
    let notificationContainer = document.getElementById('Notification__container');
    let currentTime = formatTime(new Date());
    let message;

    if (userId === uid) {
        message = `You said ${action === 'green' ? 'Yes' : 'No'}`;
    } else {
        message = `User ${userId} said ${action === 'green' ? 'Yes' : 'No'}`;
    }

    let newNotification = `<div class="notification__wrapper" id="notifications__container">
                            <p class="notification__text">${message}</p>
                            <span class="task__time">${currentTime}</span>
                        </div>`;

    notificationContainer.insertAdjacentHTML('beforeend', newNotification);

    let lastNotification = document.querySelector('#Notification__container .notification__wrapper:last-child');
    if (lastNotification) {
        lastNotification.scrollIntoView();
    }
}

document.getElementById('green-btn').addEventListener('click', async () => {
    changeUserBorderColor(uid, 'green');
    sendBorderColorChange('green', true);
    const notificationMessage = JSON.stringify({ 'type': 'notification', 'uid': uid, 'action': 'green' });
    await channel.sendMessage({ text: notificationMessage });
    addNotificationToDom(uid, 'green');
});

document.getElementById('red-btn').addEventListener('click', async () => {
    changeUserBorderColor(uid, 'red');
    sendBorderColorChange('red', true);
    const notificationMessage = JSON.stringify({ 'type': 'notification', 'uid': uid, 'action': 'red' });
    await channel.sendMessage({ text: notificationMessage });
    addNotificationToDom(uid, 'red');
});

// User Border Color Functions

function changeUserBorderColor(uid, color) {
    const userVideoContainer = document.getElementById(`user-container-${uid}`);
    if (userVideoContainer) {
        userVideoContainer.classList.remove('border-green', 'border-red');
        userVideoContainer.classList.add(`border-${color}`);
    }
}

async function sendBorderColorChange(color, incrementSlider = false) {
    const borderColorMessage = JSON.stringify({ 'type': 'borderColor', 'uid': uid, 'color': color, 'incrementSlider': incrementSlider });
    await channel.sendMessage({ text: borderColorMessage });
}

// Mute Update Functions

function incrementSliderValue(uid, increment) {
    let slider = document.getElementById(`user-container-${uid}`).querySelector('.smiley-slider');
    let newValue = parseFloat(slider.value) + increment;
    updateSmiley(uid, newValue);
}

async function sendMuteUpdate(incrementValue) {
    const muteUpdateMessage = JSON.stringify({ 'type': 'muteUpdate', 'uid': uid, 'incrementValue': incrementValue });
    await channel.sendMessage({ text: muteUpdateMessage });
}

// Task Functions

function handleTaskEvent(eventType, payload) {
    if (eventType === 'taskAdded') {
        addTask(payload);
    } else if (eventType === 'taskEdited') {
        editTaskFromPayload(payload.oldTask, payload.newTask);
    } else if (eventType === 'taskDeleted') {
        deleteTaskFromPayload(payload);
    }
}

function addTask(task) {
    let tasksWrapper = document.getElementById('tasks');

    let newTask = ` <div class="task__wrapper">
                        <p class="task__text">${task}</p>
                        <button class="task__edit"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                        </svg></button>
                        <button class="task__delete">X</button>
                    </div>`;

    tasksWrapper.insertAdjacentHTML('beforeend', newTask);

    let taskWrapper = tasksWrapper.lastElementChild;
    taskWrapper.querySelector('.task__text').addEventListener('click', () => {
        taskWrapper.querySelector('.task__text').classList.toggle('line-through');
    });
    taskWrapper.querySelector('.task__edit').addEventListener('click', editTask);
    taskWrapper.querySelector('.task__delete').addEventListener('click', deleteTask);
}

function editTaskFromPayload(oldTask, newTask) {
    let tasksWrapper = document.getElementById('tasks');
    let taskElements = tasksWrapper.querySelectorAll('.task__wrapper');
    taskElements.forEach(taskElement => {
        let taskTextElement = taskElement.querySelector('.task__text');
        if (taskTextElement.innerText === oldTask) {
            taskTextElement.innerText = newTask;
        }
    });
}

function deleteTaskFromPayload(taskText) {
    let tasksWrapper = document.getElementById('tasks');
    let taskElements = tasksWrapper.querySelectorAll('.task__wrapper');
    taskElements.forEach(taskElement => {
        let taskTextElement = taskElement.querySelector('.task__text');
        if (taskTextElement.innerText === taskText) {
            taskElement.remove();
        }
    });
}

let taskForm = document.getElementById('task__form');
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let task = e.target.task.value;
    await sendTask(task);
    addTask(task);
    e.target.reset();
});

async function sendTask(task) {
    const taskMessage = JSON.stringify({ 'type': 'taskEvent', 'eventType': 'taskAdded', 'payload': task });
    await channel.sendMessage({ text: taskMessage });
}

async function leaveChannel() {
    await channel.leave();
    await rtmClient.logout();
}

window.addEventListener('beforeunload', leaveChannel);












// async function handleChannelMessage(messageData, memberId) {
//     let data = JSON.parse(messageData.text);

//     if (data.type === 'chat') {
//         addMessageToDom(data.displayName, data.message);
//     } else if (data.type === 'borderColor') {
//         changeUserBorderColor(data.uid, data.color);
//     } else if (data.type === 'muteUpdate') {
//         incrementSliderValue(data.uid, data.incrementValue);
//     } else if (data.type === 'notification') {
//         addNotificationToDom(data.uid, data.action);
//     } else if (data.type === 'taskEvent') {
//         handleTaskEvent(data.eventType, data.payload);
//     }
    

// }


// async function sendMessage(e) {
//     e.preventDefault();

//     let message = e.target.message.value;
//     await channel.sendMessage({ text: JSON.stringify({ 'type': 'chat', 'message': message, 'displayName': displayName }) });
//     addMessageToDom(displayName, message);
//     e.target.reset();
// };

// function addMessageToDom(name, message) {
//     let messagesWrapper = document.getElementById('messages');
//     let currentTime = formatTime(new Date());

//     let newMessage = `<div class="message__wrapper">
//                         <div class="message__body">
//                             <strong class="message__author">${name}</strong>
//                             <span class="task__time">${currentTime}</span>
//                             <p class="message__text">${message}</p>
//                         </div>
//                       </div>`;

//     messagesWrapper.insertAdjacentHTML('beforeend', newMessage);

//     let lastMessage = document.querySelector('#messages .message__wrapper:last-child');
//     if (lastMessage) {
//         lastMessage.scrollIntoView();
//     }
// };

// function formatTime(date) {
//     let hours = date.getHours();
//     let minutes = date.getMinutes();

//     // Add leading zeros if needed
//     hours = hours < 10 ? '0' + hours : hours;
//     minutes = minutes < 10 ? '0' + minutes : minutes;

//     return `${hours}:${minutes}`;
// }

// // Add the event listener for the message form
// let messageForm = document.getElementById('message__form');
// messageForm.addEventListener('submit', sendMessage);




// // Notification


// function addNotificationToDom(userId, action) {
//     let notificationContainer = document.getElementById('Notification__container');
//     let currentTime = formatTime(new Date());
//     let message;

//     if (userId === uid) {
//         message = `You said ${action === 'green' ? 'Yes' : 'No'}`;
//     } else {
//         message = `User ${userId} said ${action === 'green' ? 'Yes' : 'No'}`;
//     }

//     let newNotification = `<div class="notification__wrapper" id="notifications__container">
//                             <p class="notification__text">${message}</p>
//                             <span class="task__time">${currentTime}</span>
//                         </div>`;

//     notificationContainer.insertAdjacentHTML('beforeend', newNotification);

//     let lastNotification = document.querySelector('#Notification__container .notification__wrapper:last-child');
//     if (lastNotification) {
//         lastNotification.scrollIntoView();
//     }
// };

// document.getElementById('green-btn').addEventListener('click', async () => {
//     changeUserBorderColor(uid, 'green');
//     sendBorderColorChange('green', true);
//     const notificationMessage = JSON.stringify({ 'type': 'notification', 'uid': uid, 'action': 'green' });
//     await channel.sendMessage({ text: notificationMessage });
//     addNotificationToDom(uid, 'green');
// });

// document.getElementById('red-btn').addEventListener('click', async () => {
//     changeUserBorderColor(uid, 'red');
//     sendBorderColorChange('red', true);
//     const notificationMessage = JSON.stringify({ 'type': 'notification', 'uid': uid, 'action': 'red' });
//     await channel.sendMessage({ text: notificationMessage });
//     addNotificationToDom(uid, 'red');
// });




// // Goals

// // tasks.js

// function handleTaskEvent(eventType, payload) {
//     if (eventType === 'taskAdded') {
//         addTask(payload);
//     } else if (eventType === 'taskEdited') {
//         editTaskFromPayload(payload.oldTask, payload.newTask);
//     } else if (eventType === 'taskDeleted') {
//         deleteTaskFromPayload(payload);
//     }
// }

// function editTaskFromPayload(oldTask, newTask) {
//     let tasksWrapper = document.getElementById('tasks');
//     let taskElements = tasksWrapper.querySelectorAll('.task__wrapper');
//     taskElements.forEach(taskElement => {
//         let taskTextElement = taskElement.querySelector('.task__text');
//         if (taskTextElement.innerText === oldTask) {
//             taskTextElement.innerText = newTask;
//         }
//     });
// }

// function deleteTaskFromPayload(taskText) {
//     let tasksWrapper = document.getElementById('tasks');
//     let taskElements = tasksWrapper.querySelectorAll('.task__wrapper');
//     taskElements.forEach(taskElement => {
//         let taskTextElement = taskElement.querySelector('.task__text');
//         if (taskTextElement.innerText === taskText) {
//             taskElement.remove();
//         }
//     });
// }

// let taskForm = document.getElementById('task__form');
// taskForm.addEventListener('submit', async (e) => {
//     e.preventDefault();

//     let task = e.target.task.value;
//     await sendTask(task);
//     addTask(task);
//     e.target.reset();
// });


// function addTask(task) {
//     let tasksWrapper = document.getElementById('tasks');

//     let newTask = ` <div class="task__wrapper">
//                         <p class="task__text">${task}</p>
//                         <button class="task__edit"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
//                             <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
//                             <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
//                         </svg></button>
//                         <button class="task__delete">X</button>
//                     </div>`;

//     tasksWrapper.insertAdjacentHTML('beforeend', newTask);

//     let taskWrapper = tasksWrapper.lastElementChild;
//     taskWrapper.querySelector('.task__text').addEventListener('click', () => {
//         taskWrapper.querySelector('.task__text').classList.toggle('line-through');
//     });
//     taskWrapper.querySelector('.task__edit').addEventListener('click', editTask);
//     taskWrapper.querySelector('.task__delete').addEventListener('click', deleteTask);
// }

// async function editTask(e) {
//     let taskText = e.target.previousElementSibling;
//     let currentText = taskText.innerText;
//     let newText = prompt("Edit task:", currentText);

//     if (newText) {
//         taskText.innerText = newText;
//         const editTaskMessage = JSON.stringify({
//             'type': 'taskEvent',
//             'eventType': 'taskEdited',
//             'payload': { 'oldTask': currentText, 'newTask': newText }
//         });
//         await channel.sendMessage({ text: editTaskMessage });
//     }
// }


// async function deleteTask(e) {
//     let taskWrapper = e.target.parentElement;
//     let taskText = taskWrapper.querySelector(".task__text").innerText;
//     taskWrapper.remove();

//     const deleteTaskMessage = JSON.stringify({
//         'type': 'taskEvent',
//         'eventType': 'taskDeleted',
//         'payload': taskText
//     });
//     await channel.sendMessage({ text: deleteTaskMessage });
// }



// async function sendTask(task) {
//     const taskMessage = JSON.stringify({ 'type': 'taskEvent', 'eventType': 'taskAdded', 'payload': task });
//     await channel.sendMessage({ text: taskMessage });
// }





// async function leaveChannel() {
//     await channel.leave();
//     await rtmClient.logout();
// };


// function incrementSliderValue(uid, increment) {
//     let slider = document.getElementById(`user-container-${uid}`).querySelector('.smiley-slider');
//     let newValue = parseFloat(slider.value) + increment;
//     updateSmiley(uid, newValue);
// }


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


// window.addEventListener('beforeunload', leaveChannel);

