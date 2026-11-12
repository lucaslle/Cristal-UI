---
"@cristal/core": minor
"@cristal/react": minor
---

Add cr-number, an inline number that animates when its value changes: roll (odometer, default), flap (split-flap board), blur (the number slides away with a motion blur), stagger (changed digits swap one by one with a spring), decode (digits scramble then lock in) and count (counts to the new value, tinted green or red with a fading arrow). It is formatted with Intl.NumberFormat in the component language with decimals digits; separators stay still and only digits animate. It inherits the font size, weight and colour around it. The server HTML already shows the formatted value, nothing moves on first render or when less motion is requested, and screen readers and copy read a hidden final value, never the intermediate digits.
