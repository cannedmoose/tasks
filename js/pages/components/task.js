import { WebComponent } from "./web_component.js";
import { TimeInput } from "./time_input.js";
import { Accordian } from "./accordian.js";
/**
 * A button that shows task information
 *
 * TODO(P1) Fix up label spacing
 * TODO(P1) make it so only edit click opens edit (should catch all label onClick and do things depending on target)
 * TODO(P1) Change icons when editing (trash, close edit)
 * TODO(P1) Add actual edit functionality
 *
 * TODO(P3) Add an "importance indicator visual" (want more underlines for more important task)
 */
export class Task extends WebComponent {
  constructor(task) {
    super(TEMPLATE);
    this.task = task;
  }

  get name() {
    return this.getAttribute("name");
  }

  set name(val) {
    this.setAttribute("name", val);
    //this.querySelector("#label").textContent = val;
  }

  connectedCallback() {
    this._upgradeProperty("name");

    this.querySelector("#right-icon").addEventListener("click", e => {
      e.stopPropagation();
    });
    this.querySelector("#label-name").addEventListener("click", e => {
      e.stopPropagation();
    });

    this.querySelectorAll(".name").forEach(el => {
      el.textContent = this.task.name;
    });

    if (this.task.lastDone + this.task.repeat >= Date.now()) {
      this.querySelector("#right-icon").textContent = "☑";
    } else {
      this.querySelector("#right-icon").textContent = "☐";
    }

    this.querySelector("#left-icon").textContent = "✍";
  }
}

customElements.define("wc-task", Task);

const TEMPLATE = WebComponent.TEMPLATE(/*html*/ `
<template id="task-display">
  <style>
    .task {
      width: 100%;

      background-color: white;
      border: none;
      border-bottom: 1px solid #ADD8E6;
    }

    #label {
      width: 100%;
      border-bottom: 1px solid #ADD8E6;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }

    #content {
      display: flex;
      flex-direction: column;
      border-bottom: 2px solid #ADD8E6;
    }

    #right-icon {
      flex-grow: 2;
    }
    #label-name {
      flex-grow: 4;
    }

    #left-icon {
      flex-grow: 1;
    }

    #accordian {
      width: 100%;
    }
  </style>
  <wc-accordian id="accordian">
    <div id ="label" slot="label">
      <span id="right-icon"></span>
      <span id="label-name" class="name"></span>
      <span id="left-icon"></span>
    </div>
    <div id ="content" slot="content">
      <span>I should <span class="name"></span> every:</span>
      <wc-time-input id="repeat"></wc-time-input>
      <span>I will next <span class="name"></span> in:</span>
      <wc-time-input id="next"></wc-time-input>
    </div>
  </wc-accordian>
</template>
`);
