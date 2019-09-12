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
  }

  upgrades() {
    return ["label", "open"];
  }

  refresh() {
    let filteredTasks = this.store.tasks.filter(this.filter).sort(this.compare);
    this.zip(filteredTasks, "wc-task-view", "#content", this.refreshTask);
    this.sub("#label", this.label + " - " + filteredTasks.length);
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
  #label {
    width: 100%;
    font-size: 1.5em;
  }

  .menu {
    position: -webkit-sticky;
    position: sticky;
    top: 2px;

    display: flex;
    flex-direction: row;
    justify-content: space-between;

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
</style>
  <div class="spacer"></div>
  <div class="menu"><div id ="label"></div><div id="add" class="button">➕</div></div>
  <div id ="content"></div>
`;
  }
}

customElements.define("wc-task-list", TaskList);
