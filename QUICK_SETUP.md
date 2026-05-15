# Quick Setup - 3 Steps

## 1️⃣ Copy Frames
Open PowerShell in project root and run:
```powershell
New-Item -ItemType Directory -Path "public\robot-frames" -Force
Copy-Item "New folder\ezgif-frame-*.jpg" "public\robot-frames\" -Force
```

## 2️⃣ Verify Copy
```powershell
(Get-ChildItem "public\robot-frames\" -Filter "*.jpg").Count
```
Should output: **203**

## 3️⃣ Test
- Refresh browser (F5)
- Check console (F12): `✓ Loaded 203/203 frames`
- Scroll down - animation plays!
- At ~74% scroll - text appears with fade + upward motion

---

**That's it!** All 203 frames are now being used for smooth scrollable animation. 🎬
