# HCIL About dropdown fix

## Cause
The desktop About `<details>` dropdown was closed by `onMouseLeave` on its parent. The dropdown is absolutely positioned below the summary, leaving a small pointer gap; moving the cursor from “About” into the dropdown can trigger `mouseleave` and close the menu before a submenu item can be clicked.

## Apply
Copy `src/components/site/Header.tsx` into the same path in the HCIL repository, replacing the current file.

The fix removes the premature mouse-leave close. The dropdown remains open until the user selects a link, presses Escape, or navigates to another route (the existing pathname effect closes it).

Run `npm run build`, then test the desktop About menu in both `/en` and `/fr`.
