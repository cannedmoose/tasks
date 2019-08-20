export class TaskList extends HTMLElement {
  constructor(open) {
    super();
    this.attachShadow({ mode: "open" });
    this.open = open;
  }

  connectedCallback() {
    var template = document.querySelector("#task-list-template");
    if (!template) {
      template = document.createElement("template");
      // Convert to document fragment
      template.innerHTML = TEMPLATE;
      // Retrieve actual template
      template = template.content.firstElementChild;
      document.querySelector("head").appendChild(template);
    }

    this.shadowRoot.appendChild(template.content.cloneNode(true));
    // Toggle open on label click
    this.shadowRoot.querySelector("#label").onclick = e => {
      this.open = !this.open;
    };

    return Promise.resolve();
  }

  get open() {
    return this.hasAttribute("open");
  }

  set open(val) {
    // Reflect the value of the open property as an HTML attribute.
    if (val) {
      this.setAttribute("open", "");
    } else {
      this.removeAttribute("open");
    }
    this.toggleOpen();
  }

  toggleOpen() {
    if (this.shadowRoot.querySelector('slot[name="content"]')) {
      this.shadowRoot.querySelector('"#content"').classList.toggle("open");
    }
  }
}

customElements.define("the-task-list", TaskList);

// TODO insert template into document
const TEMPLATE = /*html*/ `
<template id = "task-list">
    <style>
  </style>
    <slot name="label">Accordian</slot>
    <slot name="content">CONTENT</slot>
</template >
`;
