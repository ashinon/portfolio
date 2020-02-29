import Portfolio from './portfolio.js';
document.addEventListener('DOMContentLoaded', () => {
  new Portfolio();
});
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
