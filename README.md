# JavaScript Circular SLider

## How to use

1. Include the CSS and JS files in your HTML:
```html
<html>
  <head>
    ...
    <link rel="stylesheet" href="circular-slider.css">
  </head>
  <body>
    ...
    <script src="js/circular-slider.js"></script>
  </body>
</html>
```

2. Initialize the JS slider with the provided options:

```js
var slider = new CircularSlider({
  container: document.body, // Container/parent HTML element
  color: #000, // Color of the slider
  limits: [0, 100], // Lower and upper limit of the slider values
  step: 5, // Should not be 0
  radius: 100, // Should not be 0
  // Function callback that triggers every time slider value changes,
  // signature is function(newValue) {}
  valueChanged: undefined,
  initValue = 0 // Initial value of the slider
});
```

3. Draw the slider:

```js
slider.draw();
```