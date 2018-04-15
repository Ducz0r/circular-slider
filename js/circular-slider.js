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
    valueChanged,
    initValue
  ) {
    this.opts = {};
    this.opts.container = container || document.body;
    this.opts.color = color || '#0000FF';
    this.opts.limits = limits || [0, 100];
    this.opts.step = step || 5; // Should not be 0
    this.opts.radius = radius || 100; // Should not be 0
    this.opts.valueChanged = valueChanged || undefined;
    this.opts.initValue = initValue || 25;
    this.calcs = {}; // Internal calculations for drawing
    this.elements = {}; // References to elements
  }

  // Main drawing function
  CircularSlider.prototype.draw = function() {
    calculateDrawingData.call(this);
    var svg = drawSvg.call(this);
  }

  function calculateDrawingData() {
    var opts = this.opts;
    this.calcs.centerX = opts.container.offsetWidth / 2;
    this.calcs.centerY = opts.container.offsetHeight / 2;
    this.calcs.angleStart = (opts.limits[0] * 2 * Math.PI) / opts.limits[1];
    this.calcs.angleEnd = (opts.initValue * 2 * Math.PI) / opts.limits[1];
  }

  function drawSvg() {
    var svg = document.createElementNS(constants.SVG_NAMESPACE, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('class', 'circular-slider');
    this.opts.container.appendChild(svg);
    this.elements.svg = svg;

    var sliderBackground = document.createElementNS(constants.SVG_NAMESPACE, 'circle');
    sliderBackground.setAttribute('cx', this.calcs.centerX);
    sliderBackground.setAttribute('cy', this.calcs.centerY);
    sliderBackground.setAttribute('r', this.opts.radius);
    sliderBackground.setAttribute('class', 'slider-bg');
    svg.appendChild(sliderBackground);
    this.elements.sliderBackground = sliderBackground;

    var sliderOverlay = document.createElementNS(constants.SVG_NAMESPACE, 'path');
    sliderOverlay.setAttribute('stroke', this.opts.color);
    sliderOverlay.setAttribute('class', 'slider-overlay');
    svg.appendChild(sliderOverlay);
    this.elements.sliderOverlay = sliderOverlay;
    updateSliderOverlay.call(this);

    return svg;
  }

  function updateSliderOverlay() {
    var pos = [
      this.calcs.centerX + Math.sin(this.calcs.angleStart) * this.opts.radius,
      this.calcs.centerY - Math.cos(this.calcs.angleStart) * this.opts.radius,
      this.calcs.centerX + Math.sin(this.calcs.angleEnd) * this.opts.radius,
      this.calcs.centerY - Math.cos(this.calcs.angleEnd) * this.opts.radius
    ];
    var arcSweep = this.calcs.angleEnd - this.calcs.angleStart <= Math.PI ? 0 : 1;
    var d = [
      'M', pos[0], pos[1],
      'A', this.opts.radius, this.opts.radius, 0, arcSweep, 1, pos[2], pos[3]
    ].join(' ');
    this.elements.sliderOverlay.setAttribute('d', d);
  }

  global.CircularSlider = CircularSlider;
})(this);