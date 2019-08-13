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
  tasks.forEach(task => {
    var score = taskScore(task, time);
    var delta = time - task.lastDone - daysToMillis(task.repeat);

    // Add divider for due/overdue items
    if (!passedUpToDate && score <= 1) {
      createElement("div", taskDiv).className = "divider";
      passedUpToDate = true;
    }
    // Get and fill out task button
    var containerDiv = initTemplate("taskDisplay", taskDiv);
    var button = containerDiv.firstElementChild;
    button.onclick = () => doTask(task.name);
    button.children[0].textContent = task.name;
    button.children[1].textContent =
      (score > 1 ? "Overdue " : "Due in ") + formatDelta(delta);
  });

  if (!passedUpToDate) {
    createElement("div", taskDiv).className = "divider";
  }

  var editButton = createElement("button", taskDiv);
  editButton.textContent = "Edit Tasks";
  editButton.onclick = () => navigate("edit");

  updateCallback = setInterval(navigate, 6 * 1000);
}

function editTasks() {
  var time = Date.now();
  var taskDiv = document.getElementById("container");

  // Show add
  var containerDiv = initTemplate("taskEdit", taskDiv);
  var button = createElement("button", containerDiv);
  button.textContent = "Add";
  button.onclick = () => {
    name = containerDiv.children[0].value;
    repeat = parseInt(containerDiv.children[1].value);
    lastDone =
      Date.now() -
      daysToMillis(repeat - parseInt(containerDiv.children[2].value));
    tasks.push({
      name,
      repeat,
      lastDone
    });
    store();
    navigate("edit");
  };
  createElement("div", taskDiv).className = "divider";

  tasks.forEach(task => {
    var containerDiv = initTemplate("taskEdit", taskDiv);
    containerDiv.children[0].value = task.name;
    containerDiv.children[0].oninput = e => {
      task.name = e.target.value;
      store();
    };
    containerDiv.children[1].value = task.repeat;
    containerDiv.children[1].oninput = e => {
      task.repeat = parseInt(e.target.value);
      store();
    };
    containerDiv.children[2].value =
      task.repeat - millisToDays(time - task.lastDone);
    containerDiv.children[2].oninput = e => {
      task.lastDone =
        Date.now() - daysToMillis(task.repeat - parseInt(e.target.value));
      store();
    };
    var button = createElement("button", containerDiv);
    button.textContent = "Delete";
    button.onclick = () => {
      tasks = tasks.filter(e => e !== task);
      store();
      navigate("edit");
    };
  });

  // Navigation
  var navDiv = createElement("div", taskDiv);

  var button = createElement("button", navDiv);
  button.textContent = "Done";
  button.onclick = () => navigate();

  button = createElement("button", navDiv);
  button.textContent = "Admin";
  button.onclick = () => navigate("admin");
}

function taskAdmin() {
  var taskDiv = document.getElementById("container");
  var adminText = createElement("textarea", taskDiv);
  adminText.className = "adminText";
  adminText.value = JSON.stringify({ tasks, taskHistory }, null, 2);

  var navDiv = createElement("div", taskDiv);

  var button = createElement("button", navDiv);
  button.textContent = "Done";
  button.onclick = () => navigate("edit");

  button = createElement("button", navDiv);
  button.textContent = "Import";
  button.onclick = () => {
    var vals = JSON.parse(adminText.value);

    taskHistory = vals.taskHistory;
    tasks = vals.tasks;
    store();
    navigate("admin");
  };
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
  var repeat = daysToMillis(task.repeat);

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

function daysToMillis(days) {
  return days * 86400000;
}

function millisToDays(millis) {
  return Math.round(millis / 86400000);
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
