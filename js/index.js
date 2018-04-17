var cl = document.getElementById('container-left');
var cr = document.getElementById('container-right');

var slider_opts = [
  { color: '#653f76', limits: [0, 1100], step: 5, radius: 300, initValue: 750 },
  { color: '#007ac2', limits: [200, 1000], step: 5, radius: 250, initValue: 650 },
  { color: '#00a000', limits: [0, 1050], step: 5, radius: 200, initValue: 500 },
  { color: '#ff7818', limits: [0, 1100], step: 5, radius: 150, initValue: 800 },
  { color: '#ff3638', limits: [0, 900], step: 5, radius: 100, initValue: 200 }
];
var sliders = [];

for (var i = 0; i < 2; i++) {
  var container = [cl, cr][i];

  for (var j = 0; j < slider_opts.length; j++) {
    var opts = slider_opts[j];
    opts.container = container;

    var listItem = document.createElement('li');
    opts.container.children[0].appendChild(listItem);

    var box = document.createElement('div');
    box.setAttribute('class', 'box');
    box.style.background = opts.color;
    listItem.appendChild(box);

    var text = document.createElement('span');
    text.innerHTML = opts.initValue + '$';
    listItem.appendChild(text);

    opts.valueChanged = (function() {
      var text2 = text;
      return function(newVal) {
        text2.innerHTML = newVal + '$';
      }
    })();

    var slider = new CircularSlider(opts);
    slider.draw();
    sliders.push(slider);
  }
}