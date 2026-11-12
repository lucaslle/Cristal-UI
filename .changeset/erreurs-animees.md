---
"@cristal/core": minor
"@cristal/react": minor
---

Add an `error-animation` prop to every form field with an error message (cr-input, cr-textarea, cr-otp, cr-select, cr-tag-input, cr-card-input, cr-checkbox, cr-radio-group, cr-date-picker, cr-file-upload). It animates the error when it appears and again on every rejected submit: none (default, unchanged), zigzag (the bottom edge buzzes as a red zigzag, then settles flat), pop (a red "!" badge springs out with a few sparks), drop (the message drops in and swings like a hanging sign), echo (the border flashes red twice and sends out two widening echoes), jitter (the letters of the message hop one after another; screen readers still get one sentence) and wobble (the field rocks like jelly). The message is never faded in, nothing moves when less motion is requested, and in forced colors mode the field in error gets a system-coloured outline.
