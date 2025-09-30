// Load tasks from localStorage or start with empty
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editIndex = null; // to track edit mode

// Render tasks on screen
function renderTasks(filter = "all", searchQuery = "") {
  const taskList = document.getElementById("tasks");
  taskList.innerHTML = "";

  // Sort tasks by date (nearest first)
  tasks.sort((a, b) => new Date(a.date) - new Date(b.date));

  tasks.forEach((task, index) => {
    // Apply filters
    if (filter === "completed" && !task.completed) return;
    if (filter === "pending" && task.completed) return;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return;

    const li = document.createElement("li");

    const taskText = document.createElement("span");
    taskText.textContent = `${task.title} (Due: ${task.date}) [${task.priority}]`;

    const today = new Date().toISOString().split("T")[0];
    if (!task.completed) {
      if (task.date < today) taskText.style.color = "red";
      else if (task.date === today) taskText.style.color = "orange";
      else taskText.style.color = "green";
    }
    if (task.completed) {
      taskText.classList.add("completed");
      taskText.style.color = "gray";
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.onchange = () => toggleComplete(index);

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = () => editTask(index);

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.onclick = () => deleteTask(index);

    li.appendChild(checkbox);
    li.appendChild(taskText);
    li.appendChild(editBtn);
    li.appendChild(delBtn);

    taskList.appendChild(li);
  });

  updateProgress();
  localStorage.setItem("tasks", JSON.stringify(tasks));

  // 🔥 update timeline and calendar
  renderTimeline();
  renderCalendar();
}

// Add or update a task
function addTask() {
  const title = document.getElementById("taskTitle").value;
  const date = document.getElementById("taskDate").value;
  const notes = document.getElementById("taskNotes").value;
  const priority = document.getElementById("taskPriority").value;

  if (!title || !date) {
    alert("Please enter a task and date!");
    return;
  }

  if (editIndex !== null) {
    // Update existing task
    tasks[editIndex] = { 
      title, 
      date, 
      notes, 
      priority, 
      completed: tasks[editIndex].completed 
    };
    editIndex = null;
    document.querySelector("#task-form button").textContent = "Add Task";
  } else {
    // Add new task
    tasks.push({ title, date, notes, priority, completed: false });
  }

  // Reset form
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDate").value = "";
  document.getElementById("taskNotes").value = "";

  renderTasks();
}

// Edit a task
function editTask(index) {
  const task = tasks[index];
  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskDate").value = task.date;
  document.getElementById("taskNotes").value = task.notes;
  document.getElementById("taskPriority").value = task.priority;

  editIndex = index;
  document.querySelector("#task-form button").textContent = "Update Task";
}

// Toggle completion
function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  renderTasks();
}

// Delete a task
function deleteTask(index) {
  tasks.splice(index, 1);
  renderTasks();
}

// Update progress bar
function updateProgress() {
  const done = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  document.getElementById("progressText").textContent = `${done}/${total}`;
  document.getElementById("progressFill").style.width = total ? `${(done/total)*100}%` : "0%";
}

// Filter tasks
function filterTasks(type) {
  renderTasks(type, document.getElementById("searchInput")?.value || "");
}

// Search tasks
function searchTasks() {
  const query = document.getElementById("searchInput").value;
  renderTasks("all", query);
}

// Daily reminder
function checkReminders() {
  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter(t => t.date === today && !t.completed);
  if (todayTasks.length > 0) {
    alert("Reminder: You have tasks due today!\n" + todayTasks.map(t => "- " + t.title).join("\n"));
  }
}

// ===== TIMELINE =====
function renderTimeline() {
  const container = document.getElementById("timelineContainer");
  container.innerHTML = "";

  if (tasks.length === 0) {
    container.innerHTML = "<p>No tasks to show</p>";
    return;
  }

  tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
  tasks.forEach(task => {
    const item = document.createElement("div");
    item.className = `timeline-item ${task.priority}`;
    item.innerHTML = `
      <h4>${task.title}</h4>
      <p>${task.date}</p>
      <small>${task.notes || ""}</small>
    `;
    container.appendChild(item);
  });
}

// ===== CALENDAR =====
function renderCalendar() {
  const container = document.getElementById("calendarContainer");
  container.innerHTML = "";

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day";
    container.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const cell = document.createElement("div");
    cell.className = "calendar-day";
    if (dateStr === new Date().toISOString().split("T")[0]) {
      cell.classList.add("today");
    }

    const dateLabel = document.createElement("div");
    dateLabel.className = "date";
    dateLabel.textContent = day;
    cell.appendChild(dateLabel);

    const dayTasks = tasks.filter(t => t.date === dateStr);
    dayTasks.forEach(t => {
      const dot = document.createElement("span");
      dot.className = `task-dot ${t.priority}`;
      dot.title = t.title;
      cell.appendChild(dot);
    });

    container.appendChild(cell);
  }
}

// Run once
checkReminders();
renderTasks();
