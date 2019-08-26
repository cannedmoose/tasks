import { HomePage } from "./js/pages/home_page.js";
import { EditPage } from "./js/pages/edit_page.js";
import { TaskStore } from "./js/utils/task_store.js";

var store;
/**
 * Task app main entry point.
 *
 * TODO(P1) finish edit_page
 * TODO(P1) add navigation
 * TODO(P1) add admin
 * TODO(P2) styling
 */

window.onload = function() {
  store = new TaskStore(window.localStorage);
  var url = new URL(window.location);
  var params = new URLSearchParams(url.search);
  store.load();
  navigate(params.get("page"));
};

function navigate(page) {
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
  let taskDiv = document.getElementById("container");
  let homePage = new HomePage(store);
  taskDiv.append(homePage);
}

function editTasks() {
  let taskDiv = document.getElementById("container");
  let editPage = new EditPage(store);
  taskDiv.append(editPage);
}

function taskAdmin() {
  var taskDiv = document.getElementById("container");
  var adminText = createElement("textarea", taskDiv);
  adminText.className = "adminText";
  //adminText.value = JSON.stringify({ store.tasks, taskHistory, version }, null, 2);

  var navDiv = createElement("div", taskDiv);
  navDiv.className = "navDiv";
  var button = createElement("button", navDiv);
  button.textContent = "Done";
  button.onclick = () => navigate("edit");

  button = createElement("button", navDiv);
  button.textContent = "Import";
  button.onclick = () => {
    var vals = JSON.parse(adminText.value);

    /*taskHistory = vals.taskHistory;
    tasks = vals.tasks;
    version = vals.version;
    store();*/
    navigate("admin");
  };
}

function createElement(name, parent) {
  var child = document.createElement(name);
  parent.append(child);
  return child;
}
