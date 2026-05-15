# ScrollSequence Component Setup

## Overview
The `ScrollSequence` component has been created with the following features:

✅ **29-frame robot animation** plays on a fixed canvas as user scrolls
✅ **Empty text during first 20 frames** - text is hidden initially  
✅ **Frame 22 trigger** - when the animation reaches frame 22 (smoke billow), text fades in
✅ **Smooth text animation** - "Gokul. A" and subtext fade in with upward movement (y: 20 → 0)
✅ **Sticky canvas** - canvas remains fixed while smoke frames stay visible
✅ **Scroll out at 300vh** - entire section scrolls away after full appearance

## Configuration

### Frame Images Setup
The component expects robot animation frames to be located at:
```
/public/robot-frames/ezgif-frame-001.jpg
/public/robot-frames/ezgif-frame-002.jpg
...
/public/robot-frames/ezgif-frame-029.jpg
```

**To set up:**
1. Create a `robot-frames` folder in the `public/` directory:
   ```bash
   mkdir public/robot-frames
   ```

2. Copy the 29 frame images from `New folder/` to `public/robot-frames/`:
   - The frames should be named: `ezgif-frame-001.jpg` through `ezgif-frame-029.jpg`
   - Ensure the numbering is zero-padded (001, 002, etc.)

3. Alternatively, you can use a script to copy them:
   ```powershell
   # PowerShell
   Copy-Item "New folder\ezgif-frame-*.jpg" "public\robot-frames\"
   ```

### Component Parameters
In `src/app/components/ScrollSequence.tsx`:
- `TOTAL_FRAMES`: Set to 29 (total frames in animation)
- `FRAME_TO_REVEAL_TEXT`: Set to 22 (frame where text should appear)

### Text Content
Customize the text in the component:
- Title: "Gokul. A" (line 197)
- Subtitle: "Building efficient algorithms..." (line 205)

## How It Works

1. **Frame Loading**: All 29 frames are preloaded before component renders
2. **Scroll Mapping**: As user scrolls through the 300vh height:
   - Frame progression: 0 → 29 (linearly mapped to scroll progress)
   - At ~75% scroll (frame 22), text reveal timeline triggers
3. **Text Animation**:
   - Title fades in from opacity 0 → 1 with y movement 20 → 0
   - Subtitle follows with slight delay
4. **Fixed Positioning**: Canvas stays fixed while scroll container moves
5. **Exit**: After user scrolls past 300vh, next section appears

## Scroll Sections Timeline

- **0-100vh**: Animation frames 0-10, text hidden
- **100-200vh**: Animation frames 10-22, text hidden then reveals
- **200-300vh**: Animation frames 22-29, text visible
- **300vh+**: Next section scrolls into view

## Performance Notes

- Canvas rendering is optimized with frame-based updates
- Frames are centered and scaled to fit viewport
- ScrollTrigger manages all scroll events efficiently
- No text rendering on canvas - uses CSS/DOM for better performance

## Debugging

If frames aren't loading:
1. Check browser console for "Failed to load frame" warnings
2. Verify files exist in `public/robot-frames/`
3. Check file naming: must be `ezgif-frame-001.jpg` format
4. Ensure file permissions allow reading

If scroll animation isn't smooth:
1. Try adjusting `scrub: 0.5` value (higher = smoother but laggy)
2. Reduce frame count if needed
3. Check for other heavy animations on the page

## Integration

The `ScrollSequence` component replaces the old `Hero` component in `App.tsx`:
- Old: `<Hero />`
- New: `<ScrollSequence />`

The component is positioned at the top of the page, followed by About, Projects, etc.
