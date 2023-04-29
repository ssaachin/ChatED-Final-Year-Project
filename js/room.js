// Get the messages container and scroll to the bottom
let messagesContainer = document.getElementById('messages');
messagesContainer.scrollTop = messagesContainer.scrollHeight;

// Get the room name from localStorage
const roomName = localStorage.getItem('current_room');

// Get the saved tasks for the current room
const getSavedTasks = () => {
  const tasksJSON = localStorage.getItem(`tasks_${roomName}`);
  return tasksJSON ? JSON.parse(tasksJSON) : [];
};

// Save the tasks for the current room
const saveTasks = (tasks) => {
  localStorage.setItem(`tasks_${roomName}`, JSON.stringify(tasks));
};

// Add a new task
const addTask = (task) => {
  const tasks = getSavedTasks();
  tasks.push(task);
  saveTasks(tasks);
  displayTasks();
};

// Edit a task
const editTask = (index, newTask) => {
  const tasks = getSavedTasks();
  tasks[index] = newTask;
  saveTasks(tasks);
  displayTasks();
};

// Delete a task
const deleteTask = (index) => {
  const tasks = getSavedTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  displayTasks();
};

// Display tasks
const displayTasks = () => {
  const tasks = getSavedTasks();
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  tasks.forEach((task, index) => {
    const taskElement = document.createElement('div');
    const taskText = document.createElement('span');
    taskText.textContent = task;
    taskElement.appendChild(taskText);

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
      const newTask = prompt('Edit task:', task);
      if (newTask) {
        editTask(index, newTask);
      }
    });
    taskElement.appendChild(editButton);
    editButton.className = 'edit-btn';
    editButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
    <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
  </svg>`;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      deleteTask(index);
    });
    taskElement.appendChild(deleteButton);

    taskList.appendChild(taskElement);
    deleteButton.className = 'delete-btn';
    deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
  </svg>`;
  });
};

// Set up event listeners
document.getElementById('addTask').addEventListener('click', () => {
  const taskInput = document.getElementById('taskInput');
  const task = taskInput.value.trim();

  if (task) {
    addTask(task);
    taskInput.value = '';
  }
});


// Clear all tasks
const clearAllTasks = () => {
  localStorage.removeItem(`tasks_${roomName}`);
  displayTasks();
};

document.getElementById('clearAllTasks').addEventListener('click', () => {
  clearAllTasks();
});

document.getElementById('refreshTasks').addEventListener('click', () => {
  displayTasks();
});


// Display the tasks when the page loads
displayTasks();

