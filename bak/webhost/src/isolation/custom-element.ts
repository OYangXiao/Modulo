class IsolatedElement extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    // Create a shadow root
    const shadow = this.attachShadow({ mode: "open" });
  }
}
customElements.define("modulo-isolated-element", IsolatedElement);
