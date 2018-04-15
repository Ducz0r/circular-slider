(function(global) {
  'use strict';

  var constants = {
    SVG_NAMESPACE: 'http://www.w3.org/2000/svg'
  };

  // Constructor
  function CircularSlider(
    container,
    color,
    limits,
    step,
    radius,
    valueChanged
  ) {
    this.opts = {};
    this.opts.container = container || document.body;
    this.opts.color = color || '#0000FF';
    this.opts.limits = limits || [0, 100];
    this.opts.step = step || 5; // Should not be 0
    this.opts.radius = radius || 100; // Should not be 0
    this.opts.valueChanged = valueChanged || undefined;
    this.calcs = {}; // Internal calculated values for drawing
  }

  // Main drawing function
  CircularSlider.prototype.draw = function() {
    calculateDrawingData.call(this);
    var svg = drawSvg.call(this);
  }

  function calculateDrawingData() {
    this.calcs.centerX = this.opts.container.offsetWidth / 2;
    this.calcs.centerY = this.opts.container.offsetHeight / 2;
  }

  function drawSvg() {
    var svg = document.createElementNS(constants.SVG_NAMESPACE, 'svg');
    svg.setAttribute('width', this.opts.container.offsetWidth);
    svg.setAttribute('height', this.opts.container.offsetHeight);
    svg.setAttribute('viewBox', '0 0 ' + this.opts.container.offsetWidth + ' ' + this.opts.container.offsetHeight);
    svg.setAttribute('class', 'circular-slider');
    this.opts.container.appendChild(svg);

    var sliderBackground = document.createElementNS(constants.SVG_NAMESPACE, 'circle');
    sliderBackground.setAttribute('cx', this.calcs.centerX);
    sliderBackground.setAttribute('cy', this.calcs.centerY);
    sliderBackground.setAttribute('r', this.opts.radius);
    sliderBackground.setAttribute('class', 'slider-bg');
    svg.appendChild(sliderBackground);

    return svg;
  }

  global.CircularSlider = CircularSlider;
})(this);