
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
