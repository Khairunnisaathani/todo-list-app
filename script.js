const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const emptyMessage = document.getElementById("empty-message");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = [];

try {
    const savedTasks = JSON.parse(localStorage.getItem("myTasks"));
    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(
            task =>
                task &&
                typeof task.id === "string" &&
                typeof task.text === "string" &&
                typeof task.completed === "boolean"
        );
    }
} catch (error) {
    tasks = [];
}

let currentFilter = "all";

function saveTasks() {
    localStorage.setItem("myTasks", JSON.stringify(tasks));
}

function renderTasks() {
    taskList.replaceChildren();

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "completed") {
            return task.completed;
        }

        if (currentFilter === "pending") {
            return !task.completed;
        }

        return true;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task completed");

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const span = document.createElement("span");
        span.className = "task-text";
        span.textContent = task.text;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter(item => item.id !== task.id);
            saveTasks();
            renderTasks();
        });

        li.append(checkbox, span, deleteButton);
        taskList.appendChild(li);
    });

    const remainingTasks = tasks.filter(task => !task.completed).length;

    taskCount.textContent =
        `${remainingTasks} task${remainingTasks !== 1 ? "s" : ""} remaining`;

    emptyMessage.hidden = filteredTasks.length > 0;

    if (filteredTasks.length === 0) {
        emptyMessage.textContent =
            tasks.length === 0
                ? "No tasks yet. Add your first task!"
                : "No tasks found in this filter.";
    }
}

taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {
        return;
    }

    tasks.push({
        id: crypto.randomUUID(),
        text: text,
        completed: false
    });

    saveTasks();
    taskInput.value = "";
    currentFilter = "all";

    filterButtons.forEach(button => {
        button.classList.toggle("active", button.dataset.filter === "all");
    });

    renderTasks();
    taskInput.focus();
});

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(item => {
            item.classList.toggle("active", item === button);
        });

        renderTasks();
    });
});

clearCompletedBtn.addEventListener("click", () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
});

renderTasks();