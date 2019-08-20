class Task extends HTMLElement {
  connectedCallback() {
    var template = document.querySelector("#task-template");
    if (!template) {
      template = document.createElement("template");
      // Convert to document fragment
      template.innerHTML = TEMPLATE;
      // Retrieve actual template
      template = template.content.firstElementChild;
      document.querySelector("head").appendChild(template);
    }

    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
}

customElements.define("the-task", TaskEdit);

const TEMPLATE =
  /*html*/
  `<template id="taskDisplay" class="task">
  <style>
    .task {
      width: 100%;
      display: flex;
    }

  </style>
  <button>
    <slot name="taskName">
      Task Name
    </slot>
    <slot name="taskDesc">
      Task Description
    </slot>
  </button>
</template>
`;
