import { WebComponent } from "./web_component.js";
import { toMillis } from "../../utils/time_utils.js";

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
    this.task = task;
  }

  refresh() {
    if (!this.task) return;
    this.sub("#tag", this.task.tags[0]);
    this.sub("#name", this.task.name);

    // TODO(P2) do this in a nicer way, should probably decide in tasklist whether to strike
    if (this.task.isDue(Date.now() + toMillis("hours", 12))) {
      this.qs("#name").classList.remove("done");
    } else {
      this.qs("#name").classList.add("done");
    }
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
    return /*html*/ `
  <style>
    .line-item {
      display: flex;
      flex-direction: row;
			border-bottom: .5px solid #ADD8E6;
			border-top: .5px solid #ADD8E6;
			background-color: white;
    }

    .right-column {
      flex: 1;
      text-align: center;
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

    #name, #tag {
      white-space: nowrap;
    }

    #tag {
      font-size: .5em;
      color: lightGrey;
		}

		@keyframes strike {
			from { text-decoration-color: transparent; }
			to { text-decoration-color: auto; }
		}

		.done {
			text-decoration: line-through;
			animation: strike .05s linear;
		}
		
  </style>
	<div id="label" class="line-item button">
		<div id="edit" class="right-column">...</div>
    <div id="info" class="center-column">
      <div id="name"></div>
      <div id="tag"></div>
    </div>
  </div>
  `;
  }
}

customElements.define("wc-task-view", TaskView);
