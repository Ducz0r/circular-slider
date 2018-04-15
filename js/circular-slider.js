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
    this.opts._rectWidth = 8;
    this.opts._rectHeight = 24;
    this.opts._rectSpacing = 3;
    this.calcs = {}; // Internal calculated values for drawing
    this.id = generateUniqueId();
  }

  // Main drawing function
  CircularSlider.prototype.draw = function() {
    calculateDrawingData.call(this);
    var svg = createMainSvgContainer.call(this);
    createDefs.call(this, svg);
    drawCircleBorder.call(this, svg);
  }

  function generateUniqueId() {
    Date.now().toString(36) + Math.random().toString(36).substr(2, 16);
  }

  function calculateDrawingData() {
    var opts = this.opts;
    var c = this.calcs;

    c.volumeOuter = 2 * Math.PI * (opts.radius + opts._rectHeight / 2);
    c.volumeInner = 2 * Math.PI * (opts.radius - opts._rectHeight / 2);
    c.nrOfRects = Math.floor(c.volumeOuter / (opts._rectWidth + opts._rectSpacing));
    c.updatedRectSpacing =
      (c.volumeOuter - (c.nrOfRects * opts._rectWidth)) / c.nrOfRects;
    c.innerRectWidth = (c.volumeInner - (c.updatedRectSpacing * c.nrOfRects)) / c.nrOfRects;
    c.rectAngle = (2 * Math.PI) / c.nrOfRects;
    c.rectAngleDg = 360 / c.nrOfRects;
    c.centerX = opts.container.offsetWidth / 2;
    c.centerY = opts.container.offsetHeight / 2;
  }

  function createMainSvgContainer() {
    // Create SVG element
    var svg = document.createElementNS(constants.SVG_NAMESPACE, 'svg');
    svg.setAttribute('width', this.opts.container.offsetWidth);
    svg.setAttribute('height', this.opts.container.offsetHeight);
    svg.setAttribute('viewBox', '0 0 ' + this.opts.container.offsetWidth + ' ' + this.opts.container.offsetHeight);
    svg.setAttribute('class', 'circular-slider');
    this.opts.container.appendChild(svg);
    return svg;
  }

  function createDefs(svg) {
    var defs = document.createElementNS(constants.SVG_NAMESPACE, 'defs');
    var polygon = document.createElementNS(constants.SVG_NAMESPACE, 'polygon');
    var innerMargin = (this.opts._rectWidth - this.calcs.innerRectWidth) / 2;
    polygon.setAttribute('points', '0,0 ' + this.opts._rectWidth + ',0' + ' ' + (this.opts._rectWidth - innerMargin) + ',' + this.opts._rectHeight + ' ' + innerMargin + ',' + this.opts._rectHeight);
    polygon.setAttribute('id', 'border-rect-' + this.id);
    polygon.setAttribute('class', 'border-rect');
    defs.appendChild(polygon);
    svg.appendChild(defs);
  }

  function drawCircleBorder(svg) {
    for (var i = 0; i < this.calcs.nrOfRects; i++) {
      var rectX = this.calcs.centerX + Math.sin(i * this.calcs.rectAngle) * this.opts.radius - (this.opts._rectWidth / 2);
      var rectY = this.calcs.centerY - Math.cos(i * this.calcs.rectAngle) * this.opts.radius- (this.opts._rectHeight / 2);
      var useRect = document.createElementNS(constants.SVG_NAMESPACE, 'use');
      useRect.setAttribute('href', '#border-rect-' + this.id);
      useRect.setAttribute('transform', 'rotate(' + (i * this.calcs.rectAngleDg) + ' ' + rectX + ' ' + rectY + ')');
      useRect.setAttribute('x', rectX);
      useRect.setAttribute('y', rectY);
      svg.appendChild(useRect);
    }
  }

  global.CircularSlider = CircularSlider;
})(this);