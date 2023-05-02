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
