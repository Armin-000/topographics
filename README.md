# Topographic Canvas Animation

Interactive topographic map built with HTML, CSS and JavaScript.

The project uses Perlin Noise and the Marching Squares algorithm to generate animated contour lines similar to geographic elevation maps.

---

## Features

- Dense contour lines
- Thicker major lines at regular intervals
- Dark theme with orange glow effect
- Mouse interaction that raises terrain
- Fully responsive fullscreen canvas
- Smooth animated noise evolution

---

## Project Structure

.
├── index.html
├── style.css
├── script.js
└── README.md

---

## How to Run

Because script.js uses ES modules, you need to run the project using a local server.

### Option 1: VS Code Live Server

Right click index.html and choose Open with Live Server.

---

## Configuration

You can adjust visual density and performance inside script.js:

const settings = {
  thresholdIncrement: 4,
  thickLineThresholdMultiple: 4,
  res: 7,
  baseZOffset: 0.00018
}

### Performance Tips

- Increase res to improve performance
- Increase thresholdIncrement to reduce number of contour lines
- Decrease baseZOffset to slow down animation
- Reduce mouseRadius if needed

---

## How It Works

1. A 3D Perlin noise field generates elevation values.
2. The Marching Squares algorithm extracts contour lines at multiple thresholds.
3. Lines are drawn to canvas with varying thickness depending on level.
4. Mouse interaction modifies local noise values to create terrain deformation.
5. Animation evolves over time by incrementing the noise z-offset.

---

## Technologies Used

- HTML5 Canvas
- JavaScript ES Modules
- Perlin Noise library

---

## License

This project is free to use and modify.