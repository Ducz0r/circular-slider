(function(global) {
  'use strict';

  // Constructor
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

  // Main drawing function
  CircularSlider.prototype.draw = function() {
    var svg = createMainSvgContainer(this.container);
  }

  function createMainSvgContainer(parent) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('class', 'circular-slider');
    parent.appendChild(svg);
    return svg;
  }

  global.CircularSlider = CircularSlider;
})(this);