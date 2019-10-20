import { Accordian } from "./accordian.js";
import { TaskView } from "./task_view.js";
import { WebComponent } from "./web_component.js";
import { TaskBuilder } from "../../utils/task_store.js";

/**
 * A list of tasks.
 *
 * Displays a subset of tasks from a larger array, given by a filter.
 * Sorts taks by given comparator.
 * #Attributes
 *   - label
 *
 * TODO(P2) pull menu into its own component, don't use it in here
 *  this should just be for displaying a list of tasks
 */
export class TaskList extends WebComponent {
  constructor(store, filter, compare) {
    super();
    this.store = store;
    this.filter = filter;
    this.compare = compare;
    this.prevBoxes = new Map();
  }

  refresh() {
    // Store positions before updating
    this.prevBoxes = new Map();
    this.qsAll(".task-view").forEach(node => {
      this.prevBoxes.set(
        node.getAttribute("zip-id"),
        node.getBoundingClientRect()
      );
    });

    let filteredTasks = this.store.tasks.filter(this.filter).sort(this.compare);
    // Match tasks with their elements
    this.zip(filteredTasks, ".task-view", "#content", this.refreshTask);

    // Everything is updated, animate transitions based on old positoins
    this.qsAll(".task-view").forEach(node => {
      let prevBox = this.prevBoxes.get(node.getAttribute("zip-id"));
      if (!prevBox) {
        return;
      }
      let newBox = node.getBoundingClientRect();

      let deltaX = prevBox.left - newBox.left;
      let deltaY = prevBox.top - newBox.top;
      node.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      node.style.transition = "transform 0s";
      // Do cool list animation
      requestAnimationFrame(() => {
        node.style.transform = "";
        node.style.transition = "transform 1s";
      });
    });
  }

  refreshTask(task, el) {
    if (el) {
      // We have a task and an element to put it in
      el.firstElementChild.task = task;
      //el.firstElementChild.requestRefresh();
    } else {
      // We have a task but no element to put it in
      // TODO(P2) Figure out a way to apply css transforms
      // to webcomponent without extra div
      el = document.createElement("div");
      el.classList.add("task-view");
      //el.style.animation = "slide-up .5s ease";
      let ts = new TaskView(task);
      el.appendChild(ts);
      this.addListener(ts, "done", this.bubble);
      this.addListener(ts, "edit", this.bubble);
    }

    return el;
  }

  template() {
    return /*html*/ `
<style>
  :host {
    background-color: white;
	}
	
	@keyframes slide-up {
    0% {
        opacity: 0;
        transform: translateY(50%);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
	}

	.task-view {
	}
</style>
<div id ="content"></div>
`;
  }
}

customElements.define("wc-task-list", TaskList);
