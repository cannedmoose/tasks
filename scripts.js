var tasks = [];
var taskHistory = [];
var updateCallback;

var localStorage;

window.onload = function() {
  localStorage = window.localStorage;
  var url = new URL(window.location);
  var params = new URLSearchParams(url.search);
  load();
  navigate(params.get("page"));
};

function store() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("taskHistory", JSON.stringify(taskHistory));
}

function load() {
  if (localStorage.tasks) {
    tasks = JSON.parse(localStorage.tasks);
  }
  if (localStorage.taskHistory) {
    taskHistory = JSON.parse(localStorage.taskHistory);
  }
}

function navigate(page) {
  // Cleanup
  if (updateCallback) {
    clearInterval(updateCallback);
    updateCallback = null;
  }
  clearPage();

  // Show page
  if (!page || page === "all") {
    // Default, show tasks
    displayTasks(Date.now());
  }
  if (page === "edit" || page === "all") {
    editTasks();
  }
  if (page === "admin" || page === "all") {
    taskAdmin();
  }
}

/**
 * Display pages
 */

function clearPage() {
  var taskDiv = document.getElementById("container");
  while (taskDiv.firstChild) {
    taskDiv.removeChild(taskDiv.firstChild);
  }
}

function displayTasks(time) {
  var taskDiv = document.getElementById("container");
  tasks.sort(taskCompare(time));
  var passedUpToDate = false;
  for (i in tasks) {
    var task = tasks[i];
    var score = taskScore(task, time);
    var delta = time - task.lastDone - dayToMillis(task.repeat);

    // Add divider for due/overdue items
    if (!passedUpToDate && score <= 1) {
      createElement("div", taskDiv).className = "divider";
      passedUpToDate = true;
    }
    // Get and fill out task button
    var containerDiv = initTemplate("taskDisplay", taskDiv);
    var button = containerDiv.firstElementChild;
    button.onClick = () => doTask(task.name);
    button.firstElementChild.textContent = task.name;
    button.lastElementChild.textContent =
      (score > 1 ? "Overdue " : "Due in ") + formatDelta(delta);
  }

  if (!passedUpToDate) {
    createElement("div", taskDiv).className = "divider";
  }

  var addButton = createElement("button", taskDiv);
  addButton.textContent = "Add Task";
  addButton.className = "addButton";
  addButton.onClick, () => navigate("add");

  updateCallback = setInterval(navigate, 6 * 1000);
}

function editTasks() {
  var taskList = document.getElementById("taskList");
  while (taskList.firstChild) {
    taskList.removeChild(taskList.firstChild);
  }
  for (i in tasks) {
    var task = tasks[i];
    var listItem = document.createElement("div");
    taskList.append(listItem);
    listItem.append(
      document.createTextNode(
        '"' + task.name + '" repeats every ' + task.repeat + " days"
      )
    );
  }
}

function taskAdmin() {
  var adminText = document.getElementById("adminText");
  adminText.value = JSON.stringify({ tasks, taskHistory }, null, 2);
}

/**
 * Task actions
 */

function doTask(name) {
  var time = Date.now();
  var task = tasks.find(e => e.name === name);
  task.lastDone = time;
  taskHistory.push({ name, time });
  store();
  navigate();
}

function addUpdateTask() {
  var name = document.getElementById("taskName").value;
  var repeat = parseInt(document.getElementById("taskRepeat").value);
  var task = tasks.find(e => e.name === name);
  console.log(repeat);
  if (!task) {
    if (Number.isNaN(repeat)) {
      return;
    }
    var lastDone = Date.now() - dayToMillis(repeat);
    task = { name, repeat, lastDone };
    tasks.push(task);
  } else {
    if (Number.isNaN(repeat)) {
      tasks = tasks.filter(e => e.name !== name);
      console.log(repeat);
    } else {
      task.repeat = repeat;
    }
  }
  store();
  navigate("add");
}

function adminImport() {
  var adminText = document.getElementById("adminText");
  var vals = JSON.parse(adminText.value);

  taskHistory = vals.taskHistory;
  tasks = vals.tasks;
  store();
  navigate();
}

/**
 * Helpers
 */

function createElement(name, parent) {
  var child = document.createElement(name);
  parent.append(child);
  return child;
}

function initTemplate(name, parent) {
  var child = document.getElementById(name).cloneNode(true);
  // Reset ID so we don't have duplicates
  child.id = undefined;
  parent.append(child);
  return child;
}

function taskScore(task, time) {
  var delta = time - task.lastDone;
  var repeat = dayToMillis(task.repeat);

  return delta / repeat;
}

/**
 * Return a comparator for tasks at a given time.
 */
function taskCompare(time) {
  return function(task1, task2) {
    var score1 = taskScore(task1, time);
    var score2 = taskScore(task2, time);
    var diff = score2 - score1;

    if (Math.abs(diff) < 0.0001) {
      return task1.repeat - task2.repeat;
    }
    return diff;
  };
}

function dayToMillis(days) {
  return days * 86400000;
}

function formatDelta(delta) {
  var millis = Math.abs(delta);
  var seconds = millis / 1000;

  var minutes = seconds / 60;
  var hours = minutes / 60;
  var days = hours / 24;
  var weeks = days / 7;
  var months = weeks / 4;

  if (months >= 1) {
    return Math.round(months) + " Months";
  }

  if (weeks >= 1) {
    return Math.round(weeks) + " Weeks";
  }

  if (days >= 1) {
    return Math.round(days) + " Days";
  }

  if (hours >= 1) {
    return Math.round(hours) + " Hours";
  }

  if (minutes >= 1) {
    return Math.round(minutes) + " Minutes";
  }

  return "Now";
}
/**
 * TODO
 * CLEAN CODE
 * More styling
 */
