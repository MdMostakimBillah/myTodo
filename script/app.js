//add task button
let addTaskBtn = document.querySelector(".addTaskBtn");
let taskInputField = document.querySelector(".popup_wraper");
let inputBox = document.querySelector(".inputBox");
let cancelBtn = document.querySelector(".cancel");


function TaskAddBoxShow(){
    addTaskBtn.addEventListener("click", function(){
        taskInputField.classList.add("showBox");
        inputBox.classList.add("showBoxBox");
    });
}
TaskAddBoxShow();

function CancelInputBox(){
    cancelBtn.addEventListener("click", function(event){
        event.preventDefault();
        taskInputField.classList.remove("showBox");
        inputBox.classList.remove("showBoxBox");
        taskArea.value = '';
        hours.value = '';
        minutes.value = '';
    });
}
CancelInputBox();


// Pomodoro watch
const startingMinutes = 25;
const restMinutes = 5;
let time = startingMinutes * 60;
let isPaused = false;
let isRestMode = false;

let countDownElement = document.querySelector(".watch_");
const pausePlayBtn = document.querySelector("#pauseAndPlay");
const resetBtn = document.querySelector("#resetBtn");
const restBtn = document.querySelector("#restBtn");
const timerSound = document.querySelector("#timerSound");
let Activity = document.getElementById("Activity");

// Load state from localStorage on page load
function loadState() {
    let savedState = localStorage.getItem("pomodoroState");
    if (savedState) {
        const { savedTime, savedIsPaused, savedIsRestMode, savedActivity } = JSON.parse(savedState);
        time = parseInt(savedTime) || startingMinutes * 60;
        isPaused = savedIsPaused === 'true' || false;
        isRestMode = savedIsRestMode === 'true' || false;
        Activity.textContent = savedActivity || "Working Time"; // Restore activity status

        // Update display and button icons
        const minutes = Math.floor(time / 60);
        const seconds = time % 60 < 10 ? '0' + (time % 60) : time % 60;
        countDownElement.innerHTML = `${minutes}:${seconds}`;
        pausePlayBtn.className = isPaused ? "fa-solid fa-play" : "fa-solid fa-pause";
        restBtn.className = isRestMode ? "fa-solid fa-arrow-rotate-right" : "fa-solid fa-heart";
    } else {
        // Initialize default display
        countDownElement.innerHTML = `${startingMinutes}:00`;
        Activity.textContent = "Working Time"; // Default activity
    }
}

// Save state to localStorage
function saveState() {
    const state = {
        savedTime: time,
        savedIsPaused: isPaused,
        savedIsRestMode: isRestMode,
        savedActivity: Activity.textContent // Save activity status
    };
    localStorage.setItem('pomodoroState', JSON.stringify(state));
}

// Play sound for mode transitions
function playTimerSound() {
    timerSound.currentTime = 0; // Reset to start
    timerSound.play().catch(error => console.log("Audio playback failed:", error));
}

// Load initial state
loadState();

let interval = setInterval(updateCountDown, 1000);

function updateCountDown() {
    if (!isPaused) {
        const minutes = Math.floor(time / 60);
        let seconds = time % 60;

        seconds = seconds < 10 ? '0' + seconds : seconds;

        countDownElement.innerHTML = `${minutes}:${seconds}`;
        time--;

        if (time < 0) {
            playTimerSound(); // Play sound on mode switch
            if (isRestMode) {
                // Switch to work mode
                isRestMode = false;
                time = startingMinutes * 60;
                restBtn.className = "fa-solid fa-heart";
                countDownElement.innerHTML = `${startingMinutes}:00`;
                Activity.textContent = "Working Time"; // Update activity
            } else {
                // Switch to rest mode
                isRestMode = true;
                time = restMinutes * 60;
                restBtn.className = "fa-solid fa-arrow-rotate-right";
                countDownElement.innerHTML = `${restMinutes}:00`;
                Activity.textContent = "Rest Time"; // Update activity
            }
            pausePlayBtn.className = "fa-solid fa-pause";
            saveState();
        }
        saveState();
    }
}

pausePlayBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pausePlayBtn.className = isPaused ? "fa-solid fa-play" : "fa-solid fa-pause";
    Activity.textContent = isPaused ? "Time Pause" : (isRestMode ? "Rest Time" : "Working Time"); // Update activity
    saveState();
});

resetBtn.addEventListener('click', () => {
    isPaused = false;
    isRestMode = false;
    time = startingMinutes * 60;
    countDownElement.innerHTML = `${startingMinutes}:00`;
    pausePlayBtn.className = "fa-solid fa-pause";
    restBtn.className = "fa-solid fa-heart";
    Activity.textContent = "Working Time"; // Update activity
    saveState();
});

restBtn.addEventListener('click', () => {
    isPaused = false;
    isRestMode = !isRestMode;
    time = isRestMode ? restMinutes * 60 : startingMinutes * 60;
    const minutes = isRestMode ? restMinutes : startingMinutes;
    countDownElement.innerHTML = `${minutes}:00`;
    pausePlayBtn.className = "fa-solid fa-pause";
    restBtn.className = isRestMode ? "fa-solid fa-arrow-rotate-right" : "fa-solid fa-heart";
    Activity.textContent = isRestMode ? "Rest Time" : "Working Time"; // Update activity
    saveState();
});

//drag and drop functionality
let todoItems = document.querySelectorAll(".taskList");
let all_status = document.querySelectorAll(".status");
let trash = document.querySelector(".trash");
let draggableItem = null;
let allTasks = [];
let timers = {};

let CreateTask = document.getElementById("CreateTask");
let Processing = document.getElementById("Processing");
let Complete = document.getElementById("Complete");

// Function to generate a unique ID for tasks
function generateTaskId() {
    return 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Function to request notification permission
function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notifications.");
        return false;
    }

    // Check if permission has already been requested
    const hasRequested = localStorage.getItem('notificationPermissionRequested');
    if (hasRequested) {
        console.log("Notification permission already requested. Current status:", Notification.permission);
        return Notification.permission === "granted";
    }

    if (Notification.permission === "default") {
        Notification.requestPermission(permission => {
            console.log("Notification permission " + (permission === "granted" ? "granted" : "denied"));
            if (permission === "granted") {
                alert("Notification permission granted! You will now receive timeout alerts.");
            } else {
                alert("Notification permission denied. You won't receive timeout alerts unless you enable them in browser settings.");
            }
            // Mark permission as requested
            localStorage.setItem('notificationPermissionRequested', 'true');
        });
    } else {
        console.log("Notification permission is " + Notification.permission);
        // Mark permission as requested even if already granted/denied
        localStorage.setItem('notificationPermissionRequested', 'true');
    }
    return Notification.permission === "granted";
}

// Function to show a notification
function showNotification() {
    console.log("Attempting to show timeout notification at", new Date().toLocaleTimeString());
    if (Notification.permission === "granted") {
        try {
            const notification = new Notification("Task Timeout", {
                body: "Your time is out",
                tag: "timeout-notification"
            });
            console.log("Notification shown at", new Date().toLocaleTimeString());
            notification.onshow = () => console.log("Notification displayed to user");
            notification.onerror = (error) => console.error("Notification error:", error);
        } catch (error) {
            console.error("Failed to show notification:", error.message || error);
        }
    } else {
        console.log("Notification not shown: Permission not granted at", new Date().toLocaleTimeString());
    }
}

// Function to attach drag event listeners to all taskList elements
function attachDragListeners() {
    todoItems = document.querySelectorAll(".taskList");
    todoItems.forEach((item) => {
        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragend', dragEnd);
    });
    console.log('Attached drag listeners to', todoItems.length, 'taskList elements');
}

// Initial attachment of event listeners
attachDragListeners();

// Request notification permission on first page load
document.addEventListener('DOMContentLoaded', () => {
    requestNotificationPermission();
});

function dragStart() {
    draggableItem = this;
    console.log("dragstart for task:", this.dataset.taskId);
}

function dragEnd() {
    draggableItem = null;
    console.log("dragend");
}

// Attach drag-and-drop listeners to status containers
all_status.forEach((status) => {
    status.addEventListener('dragover', dragOver);
    status.addEventListener('dragenter', dragEnter);
    status.addEventListener('dragleave', dragLeave);
    status.addEventListener('drop', dragDrop);
});

// Attach drag-and-drop listeners to trash div
if (trash) {
    trash.addEventListener('dragover', dragOver);
    trash.addEventListener('dragenter', dragEnter);
    trash.addEventListener('dragleave', dragLeave);
    trash.addEventListener('drop', dragDrop);
} else {
    console.error('Trash div not found');
}

function dragOver(e) {
    e.preventDefault();
    console.log('dragover on', this.id || this.className);
}

function dragEnter() {
    console.log('dragenter on', this.id || this.className);
}

function dragLeave() {
    console.log('dragleav on', this.id || this.className);
}

function startTimer(taskId) {
    const taskIndex = allTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    let task = allTasks[taskIndex];
    
    if (task.timerState === 'timeout') {
        const taskDiv = document.querySelector(`.taskList[data-task-id="${taskId}"]`);
        if (taskDiv) {
            const timerDisplay = taskDiv.querySelector('strong');
            const progressBar = taskDiv.querySelector('.progress-bar');
            timerDisplay.textContent = 'Time out';
            if (progressBar) progressBar.style.width = '100%';
        }
        return;
    }

    let remainingSeconds;
    if (typeof task.remainingSeconds !== 'undefined' && task.lastUpdated) {
        remainingSeconds = task.remainingSeconds;
        const elapsedMs = Date.now() - task.lastUpdated;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        console.log(`Task ${taskId}: Loaded remainingSeconds=${remainingSeconds}, elapsedSeconds=${elapsedSeconds}`);
        remainingSeconds = Math.max(0, remainingSeconds - elapsedSeconds);
    } else {
        const hours = parseInt(task.hour) || 0;
        const minutes = parseInt(task.minute) || 0;
        remainingSeconds = hours * 3600 + minutes * 60;
    }

    const initialSeconds = remainingSeconds + (typeof task.remainingSeconds !== 'undefined' && task.lastUpdated ? Math.floor((Date.now() - task.lastUpdated) / 1000) : 0);

    clearInterval(timers[taskId]);

    timers[taskId] = setInterval(() => {
        if (remainingSeconds <= 0) {
            clearInterval(timers[taskId]);
            task.timerState = 'timeout';
            task.progress = 100;
            delete task.remainingSeconds;
            delete task.lastUpdated;
            localStorage.setItem('movedTasks', JSON.stringify(allTasks));
            const taskDiv = document.querySelector(`.taskList[data-task-id="${taskId}"]`);
            if (taskDiv) {
                const timerDisplay = taskDiv.querySelector('strong');
                const progressBar = taskDiv.querySelector('.progress-bar');
                timerDisplay.textContent = 'Time out';
                if (progressBar) progressBar.style.width = '100%';
                showNotification();
            }
            console.log(`Timer for task ${taskId} completed at`, new Date().toLocaleTimeString());
            return;
        }

        remainingSeconds--;
        task.remainingSeconds = remainingSeconds;
        task.lastUpdated = Date.now();
        task.timerState = 'running';
        task.progress = ((initialSeconds - remainingSeconds) / initialSeconds) * 100;
        localStorage.setItem('movedTasks', JSON.stringify(allTasks));
        console.log(`Task ${taskId}: Updated remainingSeconds=${remainingSeconds}, progress=${task.progress}% at`, new Date().toLocaleTimeString());

        const taskDiv = document.querySelector(`.taskList[data-task-id="${taskId}"]`);
        if (taskDiv) {
            const timerDisplay = taskDiv.querySelector('strong');
            const progressBar = taskDiv.querySelector('.progress-bar');
            const hours = Math.floor(remainingSeconds / 3600);
            const minutes = Math.floor((remainingSeconds % 3600) / 60);
            const seconds = remainingSeconds % 60;
            timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            if (progressBar) progressBar.style.width = `${task.progress}%`;
        }
    }, 1000);
}

function dragDrop() {
    if (draggableItem) {
        const taskId = draggableItem.dataset.taskId;
        const taskIndex = allTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            const task = allTasks[taskIndex];
            const oldContainer = draggableItem.parentElement;
            if (this.classList.contains('trash')) {
                allTasks.splice(taskIndex, 1);
                console.log(`Task ${taskId} deleted`, allTasks);
                draggableItem.remove();
                clearInterval(timers[taskId]);
            } else {
                task.status = this.id;
                this.appendChild(draggableItem);
                console.log(`Task ${taskId} moved to ${task.status}`, allTasks);
                if (this.id === 'Processing') {
                    startTimer(taskId);
                } else if (this.id === 'CreateTask') {
                    clearInterval(timers[taskId]);
                    delete task.remainingSeconds;
                    delete task.lastUpdated;
                    delete task.timerState;
                    delete task.progress;
                    const timerDisplay = draggableItem.querySelector('strong');
                    const progressBar = draggableItem.querySelector('.progress-bar');
                    timerDisplay.textContent = `${task.hour}:${task.minute}:00`;
                    if (progressBar) progressBar.style.width = '0%';
                } else if (this.id === 'Complete') {
                    clearInterval(timers[taskId]);
                    delete task.remainingSeconds;
                    delete task.lastUpdated;
                    delete task.timerState;
                    delete task.progress;
                    const timerDisplay = draggableItem.querySelector('strong');
                    const progressBar = draggableItem.querySelector('.progress-bar');
                    timerDisplay.textContent = 'Completed';
                    if (progressBar) progressBar.style.width = '0%';
                }

                if (oldContainer === this) {
                    const containerTasks = Array.from(this.querySelectorAll('.taskList'));
                    containerTasks.forEach((item, index) => {
                        const taskIdx = allTasks.findIndex(t => t.id === item.dataset.taskId);
                        if (taskIdx !== -1) allTasks[taskIdx].order = index;
                    });
                } else {
                    const containerTasks = Array.from(this.querySelectorAll('.taskList'));
                    containerTasks.forEach((item, index) => {
                        const taskIdx = allTasks.findIndex(t => t.id === item.dataset.taskId);
                        if (taskIdx !== -1) allTasks[taskIdx].order = index;
                    });
                }
            }
            localStorage.setItem('movedTasks', JSON.stringify(allTasks));
            console.log('Stored moved tasks:', JSON.parse(localStorage.getItem('movedTasks')));
        } else {
            console.error('Task not found in allTasks:', taskId);
        }
        console.log('dragDrop on', this.id || this.className);
    } else {
        console.error('No draggable item found');
    }
}

// Task popup value
const form = document.querySelector('.popup_wraper form');
const taskArea = document.querySelector(".TaskArea");
const hours = document.querySelector(".hours");
const minutes = document.querySelector(".minutes");
const submitBtn = document.querySelector(".submitBtn");
const createTaskList = document.querySelector('.createTaskList');

form.addEventListener("submit", (e) => {
    e.preventDefault();
    let taskData = {
        id: generateTaskId(),
        description: taskArea.value,
        hour: (hours.value == '') ? '00' : hours.value,
        minute: minutes.value,
        status: createTaskList.id || 'CreateTask',
        order: allTasks.filter(t => t.status === (createTaskList.id || 'CreateTask')).length
    };
    allTasks.push(taskData);
    taskArea.value = '';
    hours.value = '';
    minutes.value = '';
    console.log('New task added:', taskData);
    console.log('All tasks:', allTasks);
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    appendTask(taskData);
    attachDragListeners();
});

function allTaskStore() {
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    console.log('Saved to localStorage:', JSON.parse(localStorage.getItem('tasks')));
}

function loadTasks() {
    const movedTasks = localStorage.getItem('movedTasks');
    if (movedTasks) allTasks = JSON.parse(movedTasks);
    else {
        const storedTasks = localStorage.getItem('tasks');
        allTasks = storedTasks ? JSON.parse(storedTasks) : [];
    }

    all_status.forEach(status => status.innerHTML = '');
    if (createTaskList) createTaskList.innerHTML = '';
    if (trash) trash.innerHTML = '';

    const tasksByStatus = {};
    allTasks.forEach(task => (tasksByStatus[task.status] = tasksByStatus[task.status] || []).push(task));

    Object.keys(tasksByStatus).forEach(status => {
        tasksByStatus[status].sort((a, b) => (a.order || 0) - (b.order || 0));
        const container = document.getElementById(status);
        if (container) {
            tasksByStatus[status].forEach(task => {
                appendTask(task);
                const taskDiv = document.querySelector(`.taskList[data-task-id="${task.id}"]`);
                if (taskDiv) {
                    container.appendChild(taskDiv);
                    const progressBar = taskDiv.querySelector('.progress-bar');
                    if (task.status === 'Processing') {
                        if (task.timerState === 'timeout') {
                            const timerDisplay = taskDiv.querySelector('strong');
                            timerDisplay.textContent = 'Time out';
                            if (progressBar) progressBar.style.width = '100%';
                        } else if (task.remainingSeconds !== undefined) {
                            if (progressBar) progressBar.style.width = `${task.progress || 0}%`;
                            console.log(`Starting timer for task ${task.id} with remainingSeconds=${task.remainingSeconds}`);
                            startTimer(task.id);
                        } else if (task.progress !== undefined) {
                            const timerDisplay = taskDiv.querySelector('strong');
                            timerDisplay.textContent = `${task.hour}:${task.minute}:00`;
                            if (progressBar) progressBar.style.width = `${task.progress}%`;
                        }
                    } else if (task.status === 'Complete') {
                        const timerDisplay = taskDiv.querySelector('strong');
                        timerDisplay.textContent = 'Completed';
                        if (progressBar) progressBar.style.width = '0%';
                    } else {
                        const timerDisplay = taskDiv.querySelector('strong');
                        timerDisplay.textContent = `${task.hour}:${task.minute}:00`;
                        if (progressBar) progressBar.style.width = '0%';
                    }
                }
            });
        }
    });
    attachDragListeners();
    console.log('Loaded tasks:', allTasks);
}

function appendTask(task) {
    const taskDiv = document.createElement('div');
    const progressBar = document.createElement('div');
    progressBar.classList = 'progress-bar';
    progressBar.style.width = '0%';
    taskDiv.className = 'taskList';
    taskDiv.draggable = true;
    taskDiv.dataset.taskId = task.id;
    taskDiv.innerHTML = `<p>${task.description}</p> <strong>${task.hour}:${task.minute}:00</strong>`;
    taskDiv.appendChild(progressBar);
    const defaultContainer = createTaskList || document.querySelector('.createTaskList');
    if (defaultContainer) defaultContainer.appendChild(taskDiv);
    else console.error('Default container (createTaskList) not found');
}

document.addEventListener('DOMContentLoaded', loadTasks);