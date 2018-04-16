'use strict';

var slider = new CircularSlider(
  document.getElementById('test'),
  '#0000FF',
  [15, 100],
  5,
  100,
  function(newValue) {
    console.log('New value: ' + newValue);
  },
  25
);
slider.draw();