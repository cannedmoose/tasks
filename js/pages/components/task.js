import { WebComponent } from "./web_component.js";
import { TimeInput } from "./time_input.js";
import { Accordian } from "./accordian.js";
import { toMillis, fromMillis } from "../../utils/time_utils.js";
/**
 * A button that shows task information
 *
 * TODO(P2) Cleanup template
 * TODO(P3) Maybe re-use icon spaces for other things...
 * TODO(P3) Add an "importance indicator visual" (want more underlines for more important task)
 */
export class Task extends WebComponent {
  constructor(task) {
    super();
    this.task = task || this.task;
  }

  upgrades() {
    return ["create", "open"];
  }

  connected() {
    this.addListener(this.qs("#accordian"), "toggle", e => {
      e.stopPropagation();
      this.querySelector("#name").classList.toggle("editable");
      this.dispatchEvent(
        new CustomEvent("toggle", {
          detail: { open: this.open },
          bubbles: true
        })
      );
    });
    this.addListener(this.qs("#repeat"), "change", e => {
      this.task.repeat = e.detail.millis;
    });
    this.addListener(this.qs("#next"), "change", e => {
      this.task.lastDone = Date.now() - (this.task.repeat - e.detail.millis);
    });

    this.addListener(this.qs("#label"), "click", this.taskClick);
    this.addListener(this.qs("#name"), "change", this.nameChange);
    this.addListener(this.qs("#trash-icon"), "click", this.remove);
  }

  remove(e) {
    this.fireChange("remove");
  }

  nameChange(e) {
    e.stopPropagation();
    this.task.name = this.querySelector("#name").value;
    this.sub(".name", this.task.name);
  }

  taskClick(e) {
    if (e.target.id == "edit-icon") return;
    e.stopPropagation();
    if (!this.querySelector("#accordian").open && !this.create) {
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

  refresh() {
    if (!this.task) return;
    this.querySelector("#name").value = this.task.name;

    let convertedRepeat = fromMillis(this.task.repeat);
    this.querySelector("#repeat").unit = convertedRepeat.unit;
    this.querySelector("#repeat").amount = convertedRepeat.amount;

    let next = this.task.lastDone + this.task.repeat;
    let convertedNext = fromMillis(next - Date.now());
    this.querySelector("#next").unit = convertedNext.unit;
    this.querySelector("#next").amount = convertedNext.amount;

    this.sub(".name", this.task.name);
    if (!this.create) {
      this.sub("#tick-icon", next >= Date.now() ? "☑" : "☐");
    }
  }

  get create() {
    return this.hasAttribute("create");
  }

  set create(val) {
    if (val) {
      this.setAttribute("create", "");
      this.querySelector("#accordian").classList.add("create");
    } else {
      this.removeAttribute("create");
      this.querySelector("#accordian").classList.remove("create");
    }
  }
  get open() {
    return this.querySelector("#accordian").open;
  }
  set open(val) {
    this.querySelector("#accordian").open = val;
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
        <wc-time-input id="repeat"></wc-time-input>
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
      /*TODO(P3) to reset inherit */
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
      /*TODO(P3) adding the extra span to justify bottom is a little hackey*/
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
