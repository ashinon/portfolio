import Portfolio from './portfolio';
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
declare module NodeList.prototype {
  var forEach : (callbackfn: (value: any, index: number, array: any[]) => void, thisArg?: any) => void;
}
