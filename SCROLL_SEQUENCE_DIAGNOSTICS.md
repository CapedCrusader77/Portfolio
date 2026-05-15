# ScrollSequence Frame Loading Diagnostics

## Issue: Frames Not Playing

The animation requires proper frame setup. Here's how to verify and fix:

### Step 1: Copy Frames to Public Folder

```bash
# Create the robot-frames directory in public
mkdir public\robot-frames

# Copy all 29 frames from "New folder" to "public/robot-frames"
# PowerShell command:
Copy-Item "New folder\ezgif-frame-*.jpg" "public\robot-frames\" -Force

# Or manually copy each file ensuring naming is correct
```

### Step 2: Verify Frame Naming

Frames MUST be named exactly as:
```
ezgif-frame-001.jpg
ezgif-frame-002.jpg
...
ezgif-frame-029.jpg
```

**Important**: Zero-padded numbering is required (001, not 1)

### Step 3: Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for messages like:
   - ✓ Loaded frame 001
   - ✓ Loaded frame 002
   - ✗ Failed to load frame XXX

**If you see failures**, the file path or naming is wrong.

### Step 4: Verify File Paths

Check these locations exist:
```
portfolio/
├── public/
│   ├── robot-frames/
│   │   ├── ezgif-frame-001.jpg
│   │   ├── ezgif-frame-002.jpg
│   │   ├── ...
│   │   └── ezgif-frame-029.jpg
│   └── galaxy-bg.jpg
└── src/
```

### Step 5: Network Tab Check

1. In DevTools → Network tab
2. Filter by "robot-frames"
3. You should see 29 requests like:
   - `/robot-frames/ezgif-frame-001.jpg` → 200 OK
   - `/robot-frames/ezgif-frame-002.jpg` → 200 OK

**If you see 404 errors**, files don't exist or naming is wrong.

## Common Issues & Fixes

### Issue: "Loading animation frames..." stays forever
- **Cause**: Frames not found or wrong path
- **Fix**: Check browser console for ✗ Failed messages. Verify files in public/robot-frames/

### Issue: Canvas shows black, no animation
- **Cause**: Frames loaded but not displaying
- **Fix**: Check Network tab - look for image load failures

### Issue: Animation plays but frames are scrambled
- **Cause**: Frames out of order or wrong numbering
- **Fix**: Ensure files are `ezgif-frame-001.jpg`, NOT `ezgif-frame-1.jpg`

### Issue: Text doesn't appear at frame 22
- **Cause**: ScrollTrigger not firing properly
- **Fix**: Check console for JavaScript errors. Ensure frames loaded successfully first.

## Quick Fix Checklist

- [ ] Folder created: `public/robot-frames/`
- [ ] 29 files copied to that folder
- [ ] Files named: `ezgif-frame-001.jpg` ... `ezgif-frame-029.jpg`
- [ ] Zero-padded: 001, 002, etc. (NOT 1, 2, etc.)
- [ ] Browser console shows: ✓ Loaded frame 001 ... ✓ Loaded frame 029
- [ ] No 404 errors in Network tab
- [ ] Canvas appears (even if black initially)
- [ ] Try scrolling - animation should play

## Manual Testing

```javascript
// Paste in browser console to test:
console.log(localStorage.getItem('frameStatus'));

// Check if frames array is populated
// This will help diagnose loading issues
```

## If Still Not Working

1. **Check vite public folder**:
   - Files must be in `public/` at project root
   - Vite will serve them as `/robot-frames/...`

2. **Clear browser cache**:
   - Ctrl+Shift+Delete → Clear all cache
   - Or use Incognito mode to bypass cache

3. **Check file sizes**:
   - Each frame should be reasonable size (50KB-500KB)
   - If files are tiny (<1KB), they may be corrupted

4. **Try simpler test**:
   - Create test.jpg in public/
   - Change component to load `/test.jpg`
   - See if that works to isolate issue

## Component Logs to Check

The component logs to console:
- Frame loading progress: `✓ Loaded frame XXX`
- Total frames loaded: `Loaded 29 frames`
- Failures: `✗ Failed to load frame XXX`

## Performance Notes

- All 29 frames preloaded before animation starts
- ~15MB total (depending on frame size)
- Loading screen shows while frames load
- After load, animation should be smooth

---

**Once frames are properly set up, scroll should trigger the animation automatically!**
