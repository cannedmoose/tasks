import { WebComponent } from "./web_component.js";

/**
 * Task view
 *
 * #Events
 *   - done
 *   - edit
 *   - pause?
 *
 */
export class TaskView extends WebComponent {
  constructor(task) {
    super();
    // TODO(P2) Does upgrading fix this?
    this.task = task || this.task;
  }

  refresh() {
    if (!this.task) return;
    this.sub("#name", this.task.name);
    this.sub("#tick", this.task.isDue(Date.now()) ? "☐" : "☑");
  }

  connected() {
    this.addListener(this.qs("#label"), "click", this.taskClick);
    this.addListener(this.qs("#edit"), "click", this.editClick);
  }

  taskClick(e) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("done", {
        detail: { task: this.task },
        bubbles: true
      })
    );
  }

  editClick(e) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("edit", {
        detail: { task: this.task },
        bubbles: true
      })
    );
  }

  template() {
    // TODO(P2) add pause event
    return /*html*/ `
  <div id="label" class="line-item button">
    <div id="tick" class="right-column"></div>
    <div id="name" class="center-column"></div>
    <div id="edit" class="left-column">✍</div>
  </div>
  <style>
    .line-item {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      border-bottom: 1px solid #ADD8E6;
    }

    .right-column {
      flex: 1;
      border-right: 1px solid #ADD8E6;
      text-align: center;
    }

    .center-column {
      flex: 5;
      margin-left: .5em;
      padding-left: .5em;
      margin-right: .5em;
      padding-right: .5em;
    }

    .left-column {
      flex: 1;
      text-align: center;
      border-left: 1px dotted #ADD8E6;
    }
  </style>
  `;
  }
}

customElements.define("wc-task-view", TaskView);
