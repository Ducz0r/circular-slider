(function(global) {
  'use strict';

  function CircularSlider(
    container,
    color,
    limits,
    step,
    radius,
    valueChanged
  ) {
    this.container = container || document.body;
    this.color = color || '#0000FF';
    this.limits = limits || [0, 100];
    this.step = step || 5; // Should not be 0
    this.radius = radius || 20; // Should not be 0
    this.valueChanged = valueChanged || undefined;
  }

  CircularSlider.prototype.draw = function() {
    // TODO
    var div = document.createElement('div');
    div.style.width = '100px';
    div.style.height = '100px';
    div.style.background = this.color;
    this.container.appendChild(div);
  }

  global.CircularSlider = CircularSlider;
})(this);