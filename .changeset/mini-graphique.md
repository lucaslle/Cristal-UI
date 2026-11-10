---
"@cristal/core": minor
"@cristal/react": minor
---

Add cr-sparkline, a small inline line chart (line or area) drawn at its real pixel size. It is an image named by its required label and a summary of the values in the page language (last value, minimum, maximum, trend). The line draws itself on first display and, when values change, morphs point by point to the new ones (interpolated in JavaScript, so it works in every browser); no drawing and no morph when less motion is requested.
