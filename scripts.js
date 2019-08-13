var tasks = [];
var taskHistory = [];
var updateCallback;

var localStorage;

window.onload = function() {
  localStorage = window.localStorage;
  var url = new URL(window.location);
  var params = new URLSearchParams(url.search);
  if (localStorage.tasks) {
    tasks = JSON.parse(localStorage.tasks);
  }
  if (localStorage.taskHistory) {
    taskHistory = JSON.parse(localStorage.taskHistory);
  }

  navigate(params.get("page"));
};

function store() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("taskHistory", JSON.stringify(taskHistory));
}

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

function getTemplate(name, id) {
  var node = document.getElementById(name).cloneNode(true);
  node.setAttribute("id", id);
  return node;
}

function displayTasks(time) {
  updateCallback = setInterval(navigate, 6 * 1000);

  var taskDiv = document.getElementById("tasks");
  while (taskDiv.firstChild) {
    taskDiv.removeChild(taskDiv.firstChild);
  }
  tasks.sort(taskCompare(time));
  var passedUpToDate = false;
  for (i in tasks) {
    var task = tasks[i];
    var score = taskScore(task, time);
    var delta = time - task.lastDone - dayToMillis(task.repeat);

    // Add divider for due/overdue items
    if (!passedUpToDate && score <= 1) {
      taskDiv.append(getTemplate("dividerTemplate", "divider"));
      passedUpToDate = true;
    }
    // Get and fill out task button
    var containerDiv = getTemplate("taskDisplay", "task" + i);
    var button = containerDiv.firstElementChild;
    button.setAttribute("onClick", "doTask('" + task.name + "')");
    button.firstElementChild.textContent = task.name;
    button.lastElementChild.textContent =
      (score > 1 ? "Overdue " : "Due in ") + formatDelta(delta);
    taskDiv.append(containerDiv);
  }

  if (!passedUpToDate) {
    taskDiv.append(getTemplate("dividerTemplate", "divider"));
  }

  var button = document.createElement("Button");
  button.textContent = "Add Task";
  button.setAttribute("class", "addButton");
  button.setAttribute("onClick", "navigate('add')");
  taskDiv.append(button);
}

function addTasks() {
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

function displayAdmin() {
  var adminText = document.getElementById("adminText");
  adminText.value = JSON.stringify({ tasks, taskHistory }, null, 2);
}

function navigate(page) {
  // NOTE TO SELF MAYBE NOT THE BEST IDEA
  // Should come up with a better way to update these....
  if (updateCallback) {
    clearInterval(updateCallback);
    updateCallback = null;
  }
  // Hide pages
  // For some reason Element.hidden was not working for task display :/
  document.getElementById("tasks").style.display = "none";
  document.getElementById("add").style.display = "none";
  document.getElementById("admin").style.display = "none";

  if (!page || page === "all") {
    // Default, show tasks
    displayTasks(Date.now());
    document.getElementById("tasks").style.display = "flex";
  }
  if (page === "add" || page === "all") {
    addTasks();
    document.getElementById("add").style.display = "flex";
  }
  if (page === "admin" || page === "all") {
    displayAdmin();
    document.getElementById("admin").style.display = "flex";
  }
}

/**
 * Helpers
 */

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
