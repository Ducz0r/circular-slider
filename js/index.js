(function() {
  'use strict';

  var cl = document.getElementById('container-left');
  var cr = document.getElementById('container-right');

  var slider_opts = [
    { container: cl, color: '#653f76', limits: [0, 1100], step: 5, radius: 300, initValue: 750 },
    { container: cl, color: '#007ac2', limits: [0, 1000], step: 5, radius: 250, initValue: 650 },
    { container: cl, color: '#00a000', limits: [0, 1050], step: 5, radius: 200, initValue: 500 },
    { container: cl, color: '#ff7818', limits: [0, 1100], step: 5, radius: 150, initValue: 800 },
    { container: cl, color: '#ff3638', limits: [0, 900], step: 5, radius: 100, initValue: 200 }
  ];
  var sliders = [];

  for (var i = 0; i < slider_opts.length; i++) {
    var opts = slider_opts[i];

    var displayVal = document.createElement('li');
    displayVal.innerHTML = opts.initValue + '$';
    opts.container.children[0].appendChild(displayVal);
    opts.valueChanged = (function() {
      var displayVal2 = displayVal;
      return function(newVal) {
        displayVal2.innerHTML = newVal + '$';
      }
    })();

    var slider = new CircularSlider(opts);
    slider.draw();
    sliders.push(slider);
  }
})();