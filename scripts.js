import { HomePage } from "./js/pages/home_page.js";
import { AdminPage } from "./js/pages/admin_page.js";
import { TaskStore } from "./js/utils/task_store.js";

var store;
/**
 * Task app main entry point.
 */
window.onload = function() {
  store = new TaskStore(window.localStorage);
  var url = new URL(window.location);
  var params = new URLSearchParams(url.search);
  store.load();

  document.querySelector("#container").addEventListener("nav", e => {
    navigate(e.detail.page);
  });
  navigate(params.get("page"));
};

function navigate(page) {
  clearPage();

  // Show page
  if (!page || page === "all") {
    // Default, show tasks
    displayTasks(Date.now());
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

function taskAdmin() {
  let taskDiv = document.getElementById("container");
  let adminPage = new AdminPage(store);
  taskDiv.append(adminPage);
}
