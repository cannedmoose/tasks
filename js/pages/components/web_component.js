/**
 * Web component to subclass.
 *
 * Adds a shadow dom filled with a template on construction.
 */
export class WebComponent extends HTMLElement {
  constructor(template) {
    super();
    if (!document.querySelector("#" + template.id)) {
      document.querySelector("head").append(template);
    }
    this.attachShadow({ mode: "open" }).appendChild(
      template.content.cloneNode(true)
    );
  }

  static TEMPLATE(template) {
    const t = document.createElement("template");
    t.innerHTML = template;
    return t.content.firstElementChild;
  }

  _upgradeProperty(prop) {
    if (this.hasOwnProperty(prop)) {
      let value = this[prop];
      delete this[prop];
      this[prop] = value;
    }
  }

  querySelector(query) {
    return this.shadowRoot.querySelector(query);
  }

  // TODO(P2) WOULD BE BETTER IF DECORATOR STYLED (or based on prop name)
  // TODO(P2) Ensure we are Consistently handling/dispatch events
  bind(fn) {
    this[fn] = this[fn].bind(this);
  }
}
