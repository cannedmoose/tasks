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
 *   - open
 */
export class TaskList extends WebComponent {
  constructor(store, filter, compare, template) {
    super();
    this.store = store;
    this.filter = filter;
    this.compare = compare;
    this.template = template;
    this.showAll = false;
  }

  upgrades() {
    return ["label", "open"];
  }

  refresh() {
    let filter = this.filter;
    if (!this.showAll) {
      filter = task => task.isDue(Date.now()) && this.filter(task);
    }
    let filteredTasks = this.store.tasks.filter(filter).sort(this.compare);
    this.zip(filteredTasks, "wc-task-view", "#content", this.refreshTask);
    this.sub("#label", this.label + " - " + filteredTasks.length);
    this.sub("#eye", this.showAll ? "○" : "◌");
  }

  refreshTask(task, el) {
    // TODO(P2) Test to make sure we aren't dropping/duping tasks
    if (el) {
      // We have a task and an element to put it in
      el.task = task;
      // TODO(P2) figure out better way to enable interacting for single element
      el.classList.remove("interacting");
      el.refresh();
    } else {
      // We have a task but no element to put it in
      let el = new TaskView(task);
      this.addListener(el, "done", this.bubble);
      this.addListener(el, "edit", this.bubble);
      return el;
    }
  }

  connected() {
    this.addListener(this.qs("#add"), "click", e => {
      e.stopPropagation();
      this.dispatchEvent(
        new CustomEvent("edit", {
          detail: { task: this.template },
          bubbles: true
        })
      );
    });

    this.addListener(this.qs("#eye"), "click", e => {
      this.showAll = !this.showAll;
      this.refresh();
    });
  }

  get label() {
    return this.getAttribute("label");
  }

  set label(val) {
    this.setAttribute("label", val);
  }

  template() {
    return /*html*/ `
<style>
  #label,#eye,#add {
    font-size: 1.25em;
    flex:1;
  }

  #add {
    text-align: right;
  }
  #eye {
    text-align: center;
  }

  .sticky {
    position: -webkit-sticky;
    position: sticky;
    top:0px;
  }
  .menu {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    top: 2px;

    padding: 0 .5em;

    border-bottom: 1px solid #ADD8E6;
    border-top: 3px solid #ADD8E6;
    background-color: white;
  }

  .spacer {
    position: -webkit-sticky;
    position: sticky;
    top: 0px;
    height: 2px;
    background-color: white;
  }

  #content {
    background-color: white;
  }
</style>
    <div class="sticky spacer"></div>
    <div class="sticky menu">
      <div id ="label"></div>
      <div id="eye" class="button"></div>
      <div id="add" class="button">+</div>
    </div>
    <div id ="content"></div>
`;
  }
}

customElements.define("wc-task-list", TaskList);
