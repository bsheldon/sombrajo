// static heatmap
// var data = [
//   { id: 1, value: 90 },
//   { id: 2, value: 259 },
//   { id: 3, value: 950 },
//   { id: 4, value: 1045 }
// ]
// var heatmap = new Sombrajo({ collection: data });

// dynamic heatmap
var refresh = function() {
  var elems = document.querySelectorAll('[data-entry-id]');
  data = [];
  for (i=0; i < elems.length; i++) {
    data.push({ element: elems[i], value: 39 * Math.random() });
  }
  heatmap.setCollection(data);
};
window.setInterval(refresh, 500);
var heatmap = new Sombrajo({ glow: 30, opacity: 0.4 });