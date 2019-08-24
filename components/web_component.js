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

  slot(slot, element) {
    this.append(element);
    element.setAttribute("slot", slot);
    return this;
  }

  _upgradeProperty(prop) {
    if (this.hasOwnProperty(prop)) {
      let value = this[prop];
      delete this[prop];
      this[prop] = value;
    }
  }
}
