import { WebComponent } from "./web_component.js";
import { TimeInput } from "./time_input.js";
import { Accordian } from "./accordian.js";
import { toMillis, fromMillis } from "../../utils/time_utils.js";

/**
 * A button that shows task information
 *
 * #Attributes
 *   - open
 *   - create
 * #Events
 *   - toggle
 *   - change
 *
 * TODO(P2) Cleanup template
 */
export class Task extends WebComponent {
  constructor(task) {
    super();
    this.task = task || this.task;
  }

  upgrades() {
    return ["create", "open"];
  }

  refresh() {
    if (!this.task) return;
    this.qs("#name").value = this.task.name;

    let convertedPeriod = fromMillis(this.task.period);
    this.qs("#period").unit = convertedPeriod.unit;
    this.qs("#period").amount = convertedPeriod.amount;

    let convertedNext = fromMillis(this.task.due - Date.now());
    this.qs("#next").unit = convertedNext.unit;
    this.qs("#next").amount = convertedNext.amount;

    this.sub(".name", this.task.name);
    if (!this.create) {
      this.sub("#tick-icon", this.task.due >= Date.now() ? "☑" : "☐");
    }
  }

  connected() {
    this.addListener(this.qs("#accordian"), "toggle", this.onToggle);
    this.addListener(this.qs("#period"), "change", e => {
      this.task.period = e.detail.millis;
    });
    this.addListener(this.qs("#next"), "change", e => {
      this.task.due = Date.now() - e.detail.millis;
    });

    this.addListener(this.qs("#label"), "click", this.taskClick);
    this.addListener(this.qs("#name"), "change", this.nameChange);
    this.addListener(this.qs("#trash-icon"), "click", this.remove);
  }

  onToggle(e) {
    e.stopPropagation();
    this.qs("#name").classList.toggle("editable");
    this.dispatchEvent(
      new CustomEvent("toggle", {
        detail: { open: this.open },
        bubbles: true
      })
    );
  }

  remove(e) {
    /* TODO(P2) figure out better way to do this... */
    this.qs("#name").classList.remove("editable");
    this.open = false;
    this.fireChange("remove");
  }

  nameChange(e) {
    e.stopPropagation();
    this.task.name = this.qs("#name").value;
    this.sub(".name", this.task.name);
  }

  taskClick(e) {
    if (e.target.id == "edit-icon") return;
    e.stopPropagation();
    if (!this.qs("#accordian").open && !this.create) {
      this.fireChange("done");
    }
  }

  fireChange(what) {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { type: what, task: this.task },
        bubbles: true
      })
    );
  }

  get create() {
    return this.hasAttribute("create");
  }

  set create(val) {
    if (val) {
      this.setAttribute("create", "");
      this.qs("#accordian").classList.add("create");
    } else {
      this.removeAttribute("create");
      this.qs("#accordian").classList.remove("create");
    }
  }
  get open() {
    return this.qs("#accordian").open;
  }
  set open(val) {
    this.qs("#accordian").open = val;
    if (val) {
      this.setAttribute("open", "");
    } else {
      this.removeAttribute("open");
    }
  }

  template() {
    return /*html*/ `
  <wc-accordian id="accordian">
    <div id="label" class="line-item" slot="label">
      <span id="tick-icon" class="right-column"></span>
      <input id="name" type="text" placeholder="Name" class="center-column"/>
      <span id="edit-icon" class="left-column">✍</span>
    </div>
    <div id="content" class="line-item" slot="content">
      <span class="right-column"></span>
      <div class="center-column">
        <span>I should <span class="name"></span> every:</span>
        <wc-time-input id="period"></wc-time-input>
        <span>I will next <span class="name"></span> in:</span>
        <wc-time-input id="next"></wc-time-input>
      </div>
      <span id="trash-icon" class="left-column"><span></span>🗑</span>
    </div>
  </wc-accordian>
  <style>
    #content {
      border-bottom: 2px solid #ADD8E6;
      font-size:.5em;
      width: 100%;
    }

    #next {
      padding-bottom: .5em;
    }

    input {
      border: none;
      /*TODO(P3) Figure out how to get inputs to get global styling */
      font: inherit;
    }

    #name {
      pointer-events: none;
      /*TODO(P3) hackey to get label + content to line up, figure out why :/*/
      margin-left: .25em;
      padding-left: .25em;
      margin-right: .25em;
      padding-right: .25em;
      min-width: 0;
    }

    .editable {
      border-bottom: 1px black dotted;
      pointer-events: auto !important;
    }

    /*TODO(P3) add an icon class with cursor biz*/
    #trash-icon {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: pointer;
    }

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

    .create > #label > #tick-icon, .create > #label > #name {
      visibility: hidden;
    }

    .create > #label > #edit-icon {
      border-left: none;
    }

    .create > #label > #name.editable {
      visibility: visible;
    }

    .create > #label {
      border-top: 2px dotted #ADD8E6;
      border-bottom: 2px dotted #ADD8E6;
      margin-top: 1.5em;
    }
  </style>
  `;
  }
}

customElements.define("wc-task", Task);
