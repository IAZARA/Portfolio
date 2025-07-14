# Plan for Windows XP Loading Bar Animation

## Objective
To modify the existing loading animation in `ZarateXP` to mimic the classic Windows XP loading bar, featuring three blue squares that slide across the bar, disappear, and then reappear from the beginning in a continuous loop.

## Current State Analysis
- The `boot.css` file defines the styling for `.loading-block` elements and an animation named `loading-progress`.
- The `index.html` file currently contains 28 `<div class="loading-block"></div>` elements within the `<div class="loading-bar">`.
- The current `loading-progress` animation makes each block appear and disappear with a staggered delay, rather than sliding.

## Proposed Changes

### 1. Modify `ZarateXP/index.html`
- **Action:** Reduce the number of `<div class="loading-block"></div>` elements.
- **Details:** Inside the `<div class="loading-bar">` element, keep only **three** `<div class="loading-block"></div>` elements.

```html
<div class="loading-bar-container">
    <div class="loading-bar">
        <div class="loading-block"></div>
        <div class="loading-block"></div>
        <div class="loading-block"></div>
    </div>
</div>
```

### 2. Modify `ZarateXP/css/boot.css`
- **Action:** Adjust styles for `.loading-bar` and `.loading-block`, and define a new keyframe animation.

#### Update `.loading-bar`
- **Details:**
    - Add `justify-content: flex-start;` to ensure the blocks start from the left.
    - Add `overflow: hidden;` to hide the blocks as they move out of the container, creating the illusion of disappearing.

```css
.loading-bar {
    height: 100%;
    display: flex;
    gap: 2px; /* Keep existing gap */
    padding: 0 2px; /* Keep existing padding */
    justify-content: flex-start; /* New: Align blocks to the start */
    overflow: hidden; /* New: Hide overflowing content */
}
```

#### Update `.loading-block`
- **Details:**
    - Set a fixed `width` (e.g., `15px`) to make the blocks more square-like.
    - Set `opacity: 1;` so they are always visible during their slide.
    - Remove the existing `animation-delay` properties for `nth-child` as they will be handled by the new animation.
    - Update the `animation` property to use the new `xp-loading-slide` keyframes.

```css
.loading-block {
    width: 15px; /* Modified: Fixed width for square appearance */
    height: 100%;
    background: #316AC5;
    opacity: 1; /* Modified: Always visible */
    animation: xp-loading-slide 2s linear infinite; /* Modified: New animation */
}

/* Remove all existing .loading-block:nth-child(n) { animation-delay: ...; } rules */
```

#### Define `@keyframes xp-loading-slide`
- **Details:** Create a new keyframe animation that moves the blocks horizontally across the `loading-bar-container`. The animation will loop infinitely. Each block will have a slightly different `animation-delay` to create the "chasing" effect.

```css
@keyframes xp-loading-slide {
    0% {
        transform: translateX(-100%); /* Start off-screen to the left */
    }
    100% {
        transform: translateX(calc(300px + 100%)); /* Move across the 300px container + its own width */
    }
}

/* Apply animation delays to each block using nth-child selectors */
.loading-block:nth-child(1) {
    animation-delay: 0s;
}
.loading-block:nth-child(2) {
    animation-delay: 0.2s; /* Adjust delay for chasing effect */
}
.loading-block:nth-child(3) {
    animation-delay: 0.4s; /* Adjust delay for chasing effect */
}
```

## Verification
After implementing the changes, I will:
1.  Open `index.html` in a web browser to visually confirm the new loading animation.
2.  Ensure the three squares slide smoothly, disappear, and reappear from the beginning in a continuous loop, matching the Windows XP style.
3.  Check for any layout or styling regressions on the boot screen.
