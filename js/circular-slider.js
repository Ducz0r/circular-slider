(function(global) {
  'use strict';

  var constants = {
    SVG_NAMESPACE: 'http://www.w3.org/2000/svg',
    THROTTLING_DELAY: 50
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
    this.style = {}; // Slider parameters that can't be styled using CSS
    this.style.buttonRadius = 16;
  }

  CircularSlider.prototype.draw = function() {
    initializeDrawingData.call(this);
    drawSvg.call(this);
    initializeHandlers.call(this);
  }

  function initializeDrawingData() {
    var opts = this.opts;
    this.calcs.centerX = opts.container.offsetWidth / 2;
    this.calcs.centerY = opts.container.offsetHeight / 2;
    this.calcs.angleLimitMin = (opts.limits[0] * 2 * Math.PI) / opts.limits[1];
    this.calcs.angle = (this.value * 2 * Math.PI) / opts.limits[1];
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
      svg = document.createElementNS(constants.SVG_NAMESPACE, 'svg');
      svg.setAttribute('class', 'circular-slider');
      this.opts.container.appendChild(svg);
    }
    this.elements.svg = svg;

    function drawElementNS(tagName, attributes, className) {
      var element = document.createElementNS(constants.SVG_NAMESPACE, tagName);
      for (var key in attributes) {
        element.setAttribute(key, attributes[key]);
      }
      element.setAttribute('class', className);
      svg.appendChild(element);
      return element;
    }

    // 'd' parameter, used by 2 paths for the slider
    var d = [
      'M', this.calcs.centerX, this.calcs.centerY - this.opts.radius,
      'a', this.opts.radius, this.opts.radius, 0, 1, 1, 0, 2 * this.opts.radius,
      'a', this.opts.radius, this.opts.radius, 0, 1, 1, 0, -2 * this.opts.radius
    ].join(' ');

    this.elements.background = drawElementNS('path', { d: d }, 'slider-bg');
    this.elements.overlay =
      drawElementNS('path', { stroke: this.opts.color }, 'slider-overlay');
    this.elements.clickOverlay =
      drawElementNS('path', { d: d }, 'slider-click-overlay');
    this.elements.button =
      drawElementNS('circle', { r: this.style.buttonRadius }, 'slider-btn');

    // Call the shared function to update SVG
    updateDrawing.call(this);
  }

  function initializeHandlers() {
    var self = this;
    var lastDragHandlerCall = 0; // Throttling for better performance

    var dragHandler = function(event) {
      var now = (new Date).getTime();
      if (now - lastDragHandlerCall < constants.THROTTLING_DELAY) {
        return;
      }
      lastDragHandlerCall = now;

      event.preventDefault(); // Cancel dragging on mobile

      var src;
      if (window.TouchEvent && event instanceof TouchEvent) {
        var touches = event.changedTouches;
        for (var i = 0; i < touches.length; i++) {
          var touch = touches[i];
          if (touch.target === self.elements.button ||
              touch.target === self.elements.clickOverlay) {
            src = touch;
          }
        }
      } else {
        src = event;
      }

      var svgRect = self.elements.svg.getBoundingClientRect();
      var x = src.pageX - (window.scrollX + svgRect.left);
      var y = src.pageY - (window.scrollY + svgRect.top);

      calculateNewAngle.call(self, x, y);
      updateDrawing.call(self);
    }

    var startDragHandler = function(event) {
      document.body.addEventListener('mousemove', dragHandler);
      document.body.addEventListener('mouseup', stopDragHandler);
      document.body.addEventListener('mouseleave', stopDragHandler);
      dragHandler(event);
    }
    var stopDragHandler = function(event) {
      document.body.removeEventListener('mousemove', dragHandler);
      document.body.removeEventListener('mouseup', stopDragHandler);
      document.body.removeEventListener('mouseleave', stopDragHandler);
    }
    var startDragMobileHandler = function(event) {
      document.body.addEventListener('touchmove', dragHandler,
                                     { passive: false });
      document.body.addEventListener('touchend', stopDragMobileHandler);
      document.body.addEventListener('touchcancel', stopDragMobileHandler);
      dragHandler(event);
    }
    var stopDragMobileHandler = function(event) {
      document.body.removeEventListener('touchmove', dragHandler);
      document.body.removeEventListener('touchend', stopDragMobileHandler);
      document.body.removeEventListener('touchcancel', stopDragMobileHandler);
    }

    this.elements.clickOverlay.addEventListener('mousedown', startDragHandler);
    this.elements.clickOverlay.addEventListener('touchstart',
                                                startDragMobileHandler);
    this.elements.button.addEventListener('mousedown', startDragHandler);
    this.elements.button.addEventListener('touchstart', startDragMobileHandler);
  }

  function calculateNewAngle(x, y) {
    // Use law of cosines to calculate raw angle
    var aSquared = Math.pow(x - this.calcs.centerX, 2) +
                   Math.pow(y - this.calcs.centerY, 2);
    var b = this.opts.radius;
    var cSquared = Math.pow(x - this.calcs.centerX, 2) +
                   Math.pow(y - this.calcs.centerY + this.opts.radius, 2);
    var newAngle = Math.acos((aSquared + b * b - cSquared) /
                   (2 * Math.sqrt(aSquared) * b));
    // Correction
    newAngle = x < this.calcs.centerX ? (2 * Math.PI - newAngle) : newAngle;

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
    this.calcs.angle = newAngle;
    if (this.opts.valueChanged !== undefined) {
      this.opts.valueChanged(newValue);
    }
  }

  function updateDrawing() {
    var angle = this.calcs.angle;

    // Correction if max. limit (full circle) reached
    if (this.value === this.opts.limits[1]) {
      angle = 2 * Math.PI - 0.00001;
    }

    var points = [
      { x: this.calcs.centerX, y: this.calcs.centerY - this.opts.radius },
      {
        x: this.calcs.centerX + Math.sin(angle) * this.opts.radius,
        y: this.calcs.centerY - Math.cos(angle) * this.opts.radius
      }
    ];

    // Update overlay
    var arcSweep = angle <= Math.PI ? 0 : 1;
    var d = [
      'M', points[0].x, points[0].y,
      'A', this.opts.radius, this.opts.radius,
           0, arcSweep, 1, points[1].x, points[1].y
    ].join(' ');
    this.elements.overlay.setAttribute('d', d);

    // Update button
    this.elements.button.setAttribute('cx', points[1].x);
    this.elements.button.setAttribute('cy', points[1].y);
  }

  global.CircularSlider = CircularSlider;
})(this);