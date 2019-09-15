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
    let counter = "" + this.task.done + "/∞";
    if (this.task.repeat != Infinity)
      counter = this.task.done + "/" + this.task.repeat;
    this.sub("#counter", counter);
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
    // TODO(P2) add button/event
    return /*html*/ `
  <style>
    .line-item {
      display: flex;
      flex-direction: row;
      border-bottom: 1px solid #ADD8E6;
    }

    .left-column, .right-column {
      flex: 1;
      text-align: center;
    }

    .left-column {
      border-left: 1px dotted #ADD8E6;
    }

    .right-column {
       border-right: 1px solid #ADD8E6;
    }

    .center-column {
      flex: 5;
      padding:0 .25em;
    }

    #info {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    #name, #counter {
      white-space: nowrap;
    }

    #counter {
      font-size: .5em;
      color: lightGrey;
    }
  </style>
  <div id="label" class="line-item button">
    <div id="tick" class="right-column"></div>
    <div id="info" class="center-column">
      <div id="name"></div>
      <div id="counter"></div>
    </div>
    <div id="edit" class="left-column">...</div>
  </div>
  `;
  }
}

customElements.define("wc-task-view", TaskView);
