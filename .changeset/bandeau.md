---
"@cristal/core": minor
"@cristal/react": minor
---

Add cr-alert and cr-toaster: a message with info, success, warning and danger variants, an optional heading, and a crClose event on every close; where it is placed decides how it behaves. In the page it is an inline banner: it unfolds in height when inserted after page load, and an optional Close button folds it away. Inside a cr-toaster (a fixed area at the bottom right that stacks messages) it is a toast: it slides in from the corner, closes after duration (5000 ms by default, 0 to keep it) with a remaining-time bar that pauses on hover and focus, and closes with its Close button, Escape or a sideways swipe. In both places the message is a status region (an alert region for danger), its type is shown by a distinct icon that draws itself and a prefix read by screen readers ("Error: "), not by colour alone, and the text never fades in; motion is removed when less motion is requested.
