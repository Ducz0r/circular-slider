(function(global) {
  'use strict';

  var constants = {
    SVG_NAMESPACE: 'http://www.w3.org/2000/svg'
  };

  // Constructor
  function CircularSlider(opts) {
    this.opts = {};
    this.opts.container = opts.container || document.body;
    this.opts.color = opts.color || '#0000FF';
    this.opts.limits = opts.limits || [0, 100];
    this.opts.step = opts.step || 5; // Should not be 0
    this.opts.radius = opts.radius || 100; // Should not be 0
    this.opts.valueChanged = opts.valueChanged || undefined;
    this.opts.initValue = opts.initValue || 0;

    this.value = this.opts.initValue;

    this.calcs = {}; // Internal calculations for drawing
    this.elements = {}; // References to elements
  }

  CircularSlider.prototype.draw = function() {
    initializeDrawingData.call(this);
    drawSvg.call(this);
    initHandlers.call(this);
  }

  function initializeDrawingData() {
    var opts = this.opts;
    this.calcs.centerX = opts.container.offsetWidth / 2;
    this.calcs.centerY = opts.container.offsetHeight / 2;
    this.calcs.angleLimitMin = (opts.limits[0] * 2 * Math.PI) / opts.limits[1];
    this.calcs.angleEnd = (this.value * 2 * Math.PI) / opts.limits[1];
  }

  function drawSvg() {
    // Check if SVG object already exists on container, in this case, reuse it
    var svg;
    var children = this.opts.container.children;
    for (var i = 0; i < children.length; i++) {
      if (children[i].tagName === 'svg') {
        var classes = children[i].classList;
        for (var j = 0; j < classes.length; j++) {
          if (classes[j] === 'circular-slider') {
            svg = children[i];
          }
        }
      }
    }
    if (svg === undefined) {
      var svg = document.createElementNS(constants.SVG_NAMESPACE, 'svg');
    }
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('class', 'circular-slider');
    this.opts.container.appendChild(svg);
    this.elements.svg = svg;

    // 'd' parameter, used by 2 paths for the slider
    var d = [
      'M', this.calcs.centerX, this.calcs.centerY - this.opts.radius,
      'a', this.opts.radius, this.opts.radius, 0, 1, 1, 0, 2 * this.opts.radius,
      'a', this.opts.radius, this.opts.radius, 0, 1, 1, 0, -2 * this.opts.radius
    ].join(' ');

    var sliderBackground = document.createElementNS(constants.SVG_NAMESPACE, 'path');
    sliderBackground.setAttribute('d', d);
    sliderBackground.setAttribute('class', 'slider-bg');
    svg.appendChild(sliderBackground);
    this.elements.background = sliderBackground;

    var sliderOverlay = document.createElementNS(constants.SVG_NAMESPACE, 'path');
    sliderOverlay.setAttribute('stroke', this.opts.color);
    sliderOverlay.setAttribute('class', 'slider-overlay');
    svg.appendChild(sliderOverlay);
    this.elements.overlay = sliderOverlay;

    var sliderClickOverlay = document.createElementNS(constants.SVG_NAMESPACE, 'path');
    sliderClickOverlay.setAttribute('d', d);
    sliderClickOverlay.setAttribute('class', 'slider-click-overlay');
    svg.appendChild(sliderClickOverlay);
    this.elements.clickOverlay = sliderClickOverlay;

    var sliderBtn = document.createElementNS(constants.SVG_NAMESPACE, 'circle');
    sliderBtn.setAttribute('r', 16);
    sliderBtn.setAttribute('class', 'slider-btn');
    svg.appendChild(sliderBtn);
    this.elements.button = sliderBtn;

    updateDrawing.call(this);
  }

  function initHandlers() {
    var self = this;

    var clickHandler = function(event) {
      event.preventDefault(); // Cancel dragging on mobile

      var src;
      if (event instanceof TouchEvent) {
        var touches = event.changedTouches;
        for (var i = 0; i < touches.length; i++) {
          var touch = touches[i];
          if (touch.target === self.elements.button) {
            src = touch;
          }
        }
      } else {
        src = event;
      }

      var svgRect = self.elements.svg.getBoundingClientRect();
      var x = src.pageX - (window.scrollX + svgRect.left);
      var y = src.pageY + (window.scrollY + svgRect.top);

      calculateNewAngle.call(self, x, y);
      updateDrawing.call(self);
    }

    var startDragHandler = function(event) {
      document.body.addEventListener('mousemove', clickHandler);
      document.body.addEventListener('mouseup', stopDragHandler);
      document.body.addEventListener('mouseleave', stopDragHandler);
      clickHandler(event);
    }

    var stopDragHandler = function(event) {
      document.body.removeEventListener('mousemove', clickHandler);
      document.body.removeEventListener('mouseup', stopDragHandler);
      document.body.removeEventListener('mouseleave', stopDragHandler);
    }

    var startDragMobileHandler = function(event) {
      document.body.addEventListener('touchmove', clickHandler, { passive: false });
      document.body.addEventListener('touchend', stopDragMobileHandler);
      document.body.addEventListener('touchcancel', stopDragMobileHandler);
      clickHandler(event);
    }

    var stopDragMobileHandler = function(event) {
      document.body.removeEventListener('touchmove', clickHandler);
      document.body.removeEventListener('touchend', stopDragMobileHandler);
      document.body.removeEventListener('touchcancel', stopDragMobileHandler);
    }

    this.elements.clickOverlay.addEventListener('click', clickHandler);
    this.elements.button.addEventListener('mousedown', startDragHandler);
    this.elements.button.addEventListener('touchstart', startDragMobileHandler);
  }

  function calculateNewAngle(x, y) {
    // Use law of cosines to calculate raw angle
    var aSquared = Math.pow(x - this.calcs.centerX, 2) + Math.pow(y - this.calcs.centerY, 2);
    var b = this.opts.radius;
    var cSquared = Math.pow(x - this.calcs.centerX, 2) + Math.pow(y - this.calcs.centerY + this.opts.radius, 2);
    var newAngle = Math.acos((aSquared + b * b - cSquared) / (2 * Math.sqrt(aSquared) * b));
    newAngle = x < this.calcs.centerX ? (2 * Math.PI - newAngle) : newAngle; // Correction

    var newValue;
    if (newAngle < this.calcs.angleLimitMin) {
      // Skip further calculations if angle is less than min. limit
      newValue = this.opts.limits[0];
      newAngle = this.calcs.angleLimitMin;
    } else {
      // Calculate new value
      var newValue = (newAngle * this.opts.limits[1]) / (2 * Math.PI);

      // Fix new value to steps, also fix new angle
      var newValue = Math.round(newValue / this.opts.step) * this.opts.step;
      var newAngle = (newValue * 2 * Math.PI) / this.opts.limits[1];
    }

    // Finally, set new value
    this.value = newValue;
    this.calcs.angleEnd = newAngle;
    if (this.opts.valueChanged !== undefined) {
      this.opts.valueChanged(newValue);
    }
  }

  function updateDrawing() {
    var angleEnd = this.calcs.angleEnd;

    // Correction if max. limit (full circle) reached
    if (this.value === this.opts.limits[1]) {
      angleEnd = 2 * Math.PI - 0.00001;
    }

    var pos = [
      this.calcs.centerX,
      this.calcs.centerY - this.opts.radius,
      this.calcs.centerX + Math.sin(angleEnd) * this.opts.radius,
      this.calcs.centerY - Math.cos(angleEnd) * this.opts.radius
    ];

    // Update overlay
    var arcSweep = angleEnd <= Math.PI ? 0 : 1;
    var d = [
      'M', pos[0], pos[1],
      'A', this.opts.radius, this.opts.radius, 0, arcSweep, 1, pos[2], pos[3]
    ].join(' ');
    this.elements.overlay.setAttribute('d', d);

    // Update button
    this.elements.button.setAttribute('cx', pos[2]);
    this.elements.button.setAttribute('cy', pos[3]);
  }

  global.CircularSlider = CircularSlider;
})(this);