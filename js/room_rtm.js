// Time Functions

function formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutes}`;
}



async function handleChannelMessage(messageData, memberId) {
    let data = JSON.parse(messageData.text);

    if (data.type === 'chat') {
        addMessageToDom(data.displayName, data.message);
    } else if (data.type === 'borderColor') {
        changeUserBorderColor(data.uid, data.color);
        incrementSliderValue(data.uid, data.incrementValue);
    } else if (data.type === 'muteUpdate') {
        incrementSliderValue(data.uid, data.incrementValue);
    } else if (data.type === 'notification') {
        addNotificationToDom(data.uid, data.action);
    } else if (data.type === 'taskEvent') {
        if (data.eventType === 'taskAdded') {
            addTask(data.goalData);
        } else if (data.eventType === 'taskDeleted') {
            deleteTaskFromGoals(data.goalData); // Call deleteTaskFromGoals when the 'taskDeleted' event is received
        }
    } else if (data.type === 'handsUp') {
        incrementSliderValue(data.uid, data.incrementValue);
        addHandsUpNotificationToDom(data.uid);
    }
}



// Chat Functions

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

document.getElementById('message__form').addEventListener('submit', async function(e) {
    e.preventDefault();

    let message = e.target.message.value;
    const messageData = JSON.stringify({ 
        'type': 'chat', 
        'message': message, 
        'displayName': displayName })

    await channel.sendMessage({ text: messageData });
    addMessageToDom(displayName, message);
    e.target.reset();
});



// Hands up toasts

function getToastContainer() {
    let toastContainer = document.getElementById('toast-container');

    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.classList.add('toast-container', 'position-absolute', 'bottom-0', 'end-0', 'p-3');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    return toastContainer;
}

function addHandsUpNotificationToDom(userId) {
    let currentTime = formatTime(new Date());
    let message = `User ${userId} raised their hand`;

    let toastElement = `<div class="toast fade show" role="alert" aria-live="assertive" aria-atomic="true">
                            <div class="toast-header">
                                <strong class="me-auto">Hands Up Notification</strong>
                                <small class="text-body-secondary">${currentTime}</small>
                                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                            </div>
                            <div class="toast-body">
                                ${message}
                            </div>
                        </div>`;

    let toastContainer = getToastContainer();
    toastContainer.insertAdjacentHTML('beforeend', toastElement);

    let toast = new bootstrap.Toast(toastContainer.querySelector('.toast:last-child'), { autohide: false });
    toast.show();
}




document.getElementById('handsUp-btn').addEventListener('click', async function() {
    incrementSliderValue(uid, 1)
    const handsUpMessage = JSON.stringify({ 
        'type': 'handsUp', 
        'uid': uid,
        'incrementValue': 1});

    await channel.sendMessage({ text: handsUpMessage });
    addHandsUpNotificationToDom(uid);
});





// Border Notification Functions

function addNotificationToDom(userId, action) {
    let notificationContainer = document.getElementById('Notification__container');
    let currentTime = formatTime(new Date());
    let message;
    let answer;
    
    if (action === 'green') {
        answer = 'Yes';
    } else {
        answer = 'No';
    }

    if (userId === uid) {
        message = `You said ${answer}`;
    } else {
        message = `User ${userId} said ${answer}`;
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
    incrementSliderValue(uid, 2);
    sendBorderColorChange('green', 2);
    const notificationMessage = JSON.stringify({ 
        'type': 'notification', 
        'uid': uid, 'action': 
        'green' });

    await channel.sendMessage({ text: notificationMessage });
    addNotificationToDom(uid, 'green');
});

document.getElementById('red-btn').addEventListener('click', async () => {
    changeUserBorderColor(uid, 'red');
    incrementSliderValue(uid, 2);
    sendBorderColorChange('red', 2);
    const notificationMessage = JSON.stringify({ 
        'type': 'notification', 
        'uid': uid, 
        'action': 'red' });

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

async function sendBorderColorChange(color, incrementValue) {
    const borderColorMessage = JSON.stringify({ 
        'type': 'borderColor', 
        'uid': uid, 
        'color': color,
        'incrementValue': incrementValue
    });
    await channel.sendMessage({ text: borderColorMessage });
}


// Slider Update Functions

function incrementSliderValue(uid, increment) {
    let slider = document.getElementById(`user-container-${uid}`).querySelector('.smiley-slider');
    let newValue = parseFloat(slider.value) + increment;
    updateSmiley(uid, newValue);


}

async function sendMuteUpdate(incrementValue) {
    const muteUpdateMessage = JSON.stringify({ 
        'type': 'muteUpdate', 
        'uid': uid, 
        'incrementValue': incrementValue });
    await channel.sendMessage({ text: muteUpdateMessage });
}


// Task Functions

document.getElementById('task__form').addEventListener('submit', async (e) => {
    e.preventDefault();

    let task = e.target.task.value;
    const taskMessage = JSON.stringify({ 
        'type': 'taskEvent', 
        'eventType': 'taskAdded', 
        'goalData': task 
    });
    await channel.sendMessage({ text: taskMessage });

    addTask(task);
    e.target.reset();
});


function addTask(task) {
    let tasksWrapper = document.getElementById('tasks');

    let newTask = ` <div class="task__wrapper">
                        <p class="task__text">${task}</p>
                        <button class="task__delete">X</button>
                    </div>`;

    tasksWrapper.insertAdjacentHTML('beforeend', newTask);

    let taskWrapper = tasksWrapper.lastElementChild;
    taskWrapper.querySelector('.task__text').addEventListener('click', () => {
        taskWrapper.querySelector('.task__text').classList.toggle('line-through');
    });
    taskWrapper.querySelector('.task__delete').addEventListener('click', deleteTask);
}



async function deleteTask(e) {
    let taskWrapper = e.target.parentElement;
    let taskText = taskWrapper.querySelector(".task__text").innerText;
    taskWrapper.remove(); // Change this line

    const deleteTaskMessage = JSON.stringify({
        'type': 'taskEvent',
        'eventType': 'taskDeleted',
        'goalData': taskText
    });

    await channel.sendMessage({ text: deleteTaskMessage });
    removeTaskFromDOM(taskText);
}


function removeTaskFromDOM(taskText) {
    let tasksWrapper = document.getElementById('tasks');
    let taskElements = tasksWrapper.querySelectorAll('.task__wrapper');
    taskElements.forEach(function(taskElement) {
        let taskTextElement = taskElement.querySelector('.task__text');
        if (taskTextElement.innerText === taskText) {
            taskElement.remove();
        }
    });
}


function deleteTaskFromGoals(taskText) {
    removeTaskFromDOM(taskText);
}


async function leaveChannel() {
    await channel.leave();
    await rtmClient.logout();
}

window.addEventListener('beforeunload', leaveChannel);


















