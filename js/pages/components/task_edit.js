import { WebComponent } from "./web_component.js";
import { TimeInput } from "./time_input.js";
import { Accordian } from "./accordian.js";
import { Tabs } from "./tabs.js";
import { toMillis, fromMillis } from "../../utils/time_utils.js";

/**
 * Edit/Create form for task
 *
 * # Events
 *   - confirm
 *   - cancel
 *   - delete
 */
export class TaskEdit extends WebComponent {
  constructor(task) {
    super();
    this.task = task || this.task;
  }

  refresh() {
    if (!this.task) return;
    this.qs("#name").value = this.task.name;
    this.qs("#tag").value = this.task.tags[0];

    let blockedBy = this.qs("#blocked-by");
    let nothingEl = document.createElement("option");
    nothingEl.textContent = "--Nothing--";
    blockedBy.append(nothingEl);
    // TODO (P1)
    // Fix this, need a way to have storage hear withoput relying on the task...
    /**this.task.storage.tasks.forEach(task => {
      let el = document.createElement("option");
      el.value = task.id;
      el.textContent = task.name;
      blockedBy.append(el);
    });*/

    /**let convertedPeriod = fromMillis(this.task.period);
    this.qs("#period").unit = convertedPeriod.unit;
    this.qs("#period").amount = convertedPeriod.amount;

    let convertedNext = fromMillis(this.task.due - Date.now());
    this.qs("#next").unit = convertedNext.unit;
    this.qs("#next").amount = convertedNext.amount;*/
  }

  connected() {
    this.addListener(this.qs("#delete"), "click", e => {
      e.stopPropagation();
      this.dispatchEvent(
        new CustomEvent("delete", {
          detail: { task: this.task },
          bubbles: true
        })
      );
    });

    this.addListener(this.qs("#cancel"), "click", e => {
      e.stopPropagation();
      this.dispatchEvent(
        new CustomEvent("cancel", {
          detail: { task: this.task },
          bubbles: true
        })
      );
    });

    this.addListener(this.qs("#confirm"), "click", e => {
      e.stopPropagation();
      // TODO(P1) store values
      this.dispatchEvent(
        new CustomEvent("confirm", {
          detail: { task: this.task },
          bubbles: true
        })
      );
    });
  }

  template() {
    // TODO(P1) Styling
    return /*html*/ `
  <span>Name</span>
  <input id="name" type="text" placeholder="shopping"/>
  <span>Tag</span>
  <input id="tag" type="text" placeholder="todo"/>
  <span>Blocked by</span>
  <select id="blocked-by">
  </select>
  <span>Repeats</span>
  <wc-tabs page="Once">
    <div label="Once">
      <div>Due</div>
      <wc-time-input>
      </wc-time-input>
    </div>
    <div label="Multiple">
      <div>Times</div>
      <input id="tag" type="number"/>
      <div>Repeats Every</div>
      <wc-time-input>
      </wc-time-input>
    </div>
    <div label="Forever">
      <div>Repeats Every</div>
      <wc-time-input>
      </wc-time-input>
    </div>
  </wc-tabs>
  <div id="icons">
    <div id="delete">🗑</div>
    <div id="cancel">✕</div>
    <div id="confirm">✓</div>
  </div>
  <style>
    input {
      border: none;
      /*TODO(P3) Figure out how to get inputs to get global styling */
      font: inherit;
    }

    input[type=text] {
      border-bottom: 1px black dotted;
    }

    :host {
      display: flex;
      flex-direction: column;
    }

    #icons {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      cursor: pointer;
      -webkit-user-select: none;  /* Chrome all / Safari all */
      -moz-user-select: none;     /* Firefox all */
      -ms-user-select: none;      /* IE 10+ */
      user-select: none;          /* Likely future */
    }
  </style>
  `;
  }
}

customElements.define("wc-task-edit", TaskEdit);
