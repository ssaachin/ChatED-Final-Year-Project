
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
