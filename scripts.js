var localStorage;
var tasks = [];
var taskHistory = [];
var version = 1;
var checked = [true, true, false, false];

var updateCallback;

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
  localStorage.setItem("version", version);
}

function load() {
  if (localStorage.tasks) {
    tasks = JSON.parse(localStorage.tasks);
  }
  if (localStorage.taskHistory) {
    taskHistory = JSON.parse(localStorage.taskHistory);
  }

  if (!localStorage.version) {
    // Convert repeat time to millis
    tasks.forEach(task => (task.repeat = daysToMillis(task.repeat)));
    version = 1;
    store();
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

function genCordian(name, id, tasks, taskDiv, time) {
  if (tasks.length === 0) {
    return;
  }
  var accordian = initTemplate("accordianSection", taskDiv);
  accordian.children[0].id = "accordian" + id;
  accordian.children[0].checked = checked[id];
  accordian.children[0].onchange = e => {
    checked[id] = e.target.checked;
  };
  accordian.children[1].textContent = name + " - " + tasks.length;
  accordian.children[1].setAttribute("for", "accordian" + id);

  tasks.forEach(task => {
    var delta = time - task.lastDone - task.repeat;
    // Get and fill out task button
    var containerDiv = initTemplate("taskDisplay", accordian.children[2]);
    var button = containerDiv.firstElementChild;
    button.onclick = () => doTask(task.name);
    button.children[0].textContent = task.name;
    button.children[1].textContent =
      (delta >= 0 ? "Overdue " : "Due in ") + formatDelta(delta);
  });
}

function displayTasks(time) {
  var taskDiv = document.getElementById("container");
  var dueTasks = tasks.filter(task => {
    return time >= task.lastDone + task.repeat;
  });
  dueTasks.sort((t1, t2) => {
    var s1 = (time - t1.lastDone) / t1.repeat;
    var s2 = (time - t2.lastDone) / t2.repeat;
    diff = s2 - s1;

    // TODO check this ordering
    return Math.abs(diff) < 0.001 ? t2.repeat - t1.repeat : diff;
  });

  genCordian("Overdue", 0, dueTasks, taskDiv, time);

  var timesort = (t1, t2) => {
    var d1 = time - t1.lastDone - t1.repeat;
    var d2 = time - t2.lastDone - t2.repeat;
    return d2 - d1;
  };

  var dueSoonTasks = tasks.filter(task => {
    var due = task.lastDone + task.repeat;
    return time < due && time + 12 * 60 * 60 * 1000 > due;
  });
  dueSoonTasks.sort(timesort);

  genCordian("Due Soon", 1, dueSoonTasks, taskDiv, time);

  var dueLaterTasks = tasks.filter(task => {
    var due = task.lastDone + task.repeat;
    return time + 12 * 60 * 60 * 1000 < due && time + 48 * 60 * 60 * 1000 > due;
  });
  dueLaterTasks.sort(timesort);

  genCordian("Due Later", 2, dueLaterTasks, taskDiv, time);

  var theRestTasks = tasks.filter(task => {
    var due = task.lastDone + task.repeat;
    return time + 48 * 60 * 60 * 1000 < due;
  });
  theRestTasks.sort(timesort);

  genCordian("The Rest", 3, theRestTasks, taskDiv, time);

  var navDiv = createElement("div", taskDiv);
  navDiv.className = "navDiv";
  var editButton = createElement("button", navDiv);
  editButton.textContent = "Edit Tasks";
  editButton.onclick = () => navigate("edit");

  updateCallback = setInterval(navigate, 10 * 1000);
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
    repeat = daysToMillis(parseInt(containerDiv.children[1].value));
    lastDone =
      Date.now() -
      repeat -
      daysToMillis(parseInt(containerDiv.children[2].value));
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
    containerDiv.children[1].value = millisToDays(task.repeat);
    containerDiv.children[1].oninput = e => {
      task.repeat = daysToMillis(parseInt(e.target.value));
      store();
    };
    containerDiv.children[2].value =
      millisToDays(task.repeat) - millisToDays(time - task.lastDone);
    containerDiv.children[2].oninput = e => {
      task.lastDone =
        Date.now() - task.repeat - daysToMillis(parseInt(e.target.value));
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
  navDiv.className = "navDiv";
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
  adminText.value = JSON.stringify({ tasks, taskHistory, version }, null, 2);

  var navDiv = createElement("div", taskDiv);
  navDiv.className = "navDiv";
  var button = createElement("button", navDiv);
  button.textContent = "Done";
  button.onclick = () => navigate("edit");

  button = createElement("button", navDiv);
  button.textContent = "Import";
  button.onclick = () => {
    var vals = JSON.parse(adminText.value);

    taskHistory = vals.taskHistory;
    tasks = vals.tasks;
    version = vals.version;
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
    months = Math.round(months);
    return Math.round(months) + " Month" + (months > 1 ? "s" : "");
  }

  if (weeks >= 1) {
    weeks = Math.round(weeks);
    return Math.round(weeks) + " Week" + (weeks > 1 ? "s" : "");
  }

  if (days >= 1) {
    days = Math.round(days);
    return Math.round(days) + " Day" + (days > 1 ? "s" : "");
  }

  if (hours >= 1) {
    hours = Math.round(hours);
    return Math.round(hours) + " Hour" + (hours > 1 ? "s" : "");
  }

  if (minutes >= 1) {
    minutes = Math.round(minutes);
    return Math.round(minutes) + " Minute" + (minutes > 1 ? "s" : "");
  }

  return "Now";
}
