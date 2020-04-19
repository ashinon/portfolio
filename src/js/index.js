import Portfolio from './portfolio.js';
document.addEventListener(
  'DOMContentLoaded',
  () => {
    new Portfolio();
  },
  { once: true }
);
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
