# Text Scramble - Quick Reference

## 30-Second Start

```tsx
import { TextScrambleSkill } from '@/app/components/TextScramble';

<TextScrambleSkill text="React" glowColor="blue" />
```

That's it! Animates on hover with blue glow. ✨

---

## Component Variants

### For Skills/Tags
```tsx
<TextScrambleSkill 
  text="Python"
  speed={35}
  glowColor="cyan"
/>
```

### For Titles
```tsx
<TextScrambleTitle 
  text="My Skills"
  speed={30}
  glowColor="cyan"
/>
```

### Custom
```tsx
<TextScramble 
  text="Custom Text"
  speed={40}
  triggerOnHover={true}
  glowColor="purple"
  className="text-xl font-bold"
/>
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | string | - | Text to animate |
| `speed` | number | 40 | Milliseconds per character |
| `triggerOnHover` | boolean | false | Animate on hover |
| `triggerOnScroll` | boolean | false | Animate when entering viewport |
| `glowColor` | "cyan" \| "blue" \| "purple" | "cyan" | Glow effect color |
| `className` | string | "" | Additional Tailwind classes |

---

## Speed Guide

```tsx
// Fast
<TextScramble text="Quick" speed={50} />

// Normal (recommended)
<TextScramble text="Medium" speed={40} />

// Slow
<TextScramble text="Steady" speed={25} />

// Very Slow
<TextScramble text="Smooth" speed={15} />
```

---

## Glow Colors

```tsx
// Cyan (light blue) - Tech/Modern
<TextScramble text="React" glowColor="cyan" />

// Blue - Professional
<TextScramble text="TypeScript" glowColor="blue" />

// Purple - Creative
<TextScramble text="Design" glowColor="purple" />
```

---

## Use Cases

### Skills Section
```tsx
<TextScrambleSkill text="Python" glowColor="cyan" />
<TextScrambleSkill text="React" glowColor="blue" />
<TextScrambleSkill text="Node.js" glowColor="purple" />
```

### Project Titles
```tsx
<TextScrambleTitle text="Featured Project" glowColor="blue" />
```

### Hover Cards
```tsx
<div onMouseEnter={() => setHovered(true)}>
  <TextScramble 
    text="Hover me"
    triggerOnHover
    glowColor="cyan"
  />
</div>
```

### Section Headers
```tsx
<TextScrambleTitle 
  text="Skills & Tools"
  speed={30}
  glowColor="cyan"
/>
```

---

## Animation Behavior

### Hover Trigger
- Animates when user hovers
- Resets when mouse leaves
- Smooth glow effect

### Scroll Trigger
- Animates once when entering viewport
- Fires only once per page load
- No re-trigger on scroll

---

## Customization

### Add Custom Classes
```tsx
<TextScramble 
  text="Styled"
  className="text-2xl font-bold italic"
  glowColor="blue"
/>
```

### Combine with Motion
```tsx
<motion.div whileHover={{ scale: 1.05 }}>
  <TextScrambleSkill text="Scalable" glowColor="cyan" />
</motion.div>
```

---

## Current Usage

Skills section now features:
- **5 skill categories** with organized items
- **Independent animations** on hover
- **Color-coded categories** (cyan, blue, purple)
- **Smooth transitions** between states
- **Performance optimized** with Framer Motion

Each skill reveals its text when hovered with a matching glow effect! 🎯

---

## Performance Tips

1. ✅ Use for ~5-10 items per section
2. ✅ Keep text under 30 characters
3. ✅ Vary speeds for visual interest
4. ✅ Use color coding for organization
5. ✅ Avoid animating off-screen items

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No animation | Set `triggerOnHover={true}` or `triggerOnScroll={true}` |
| Glow not visible | Check `glowColor` is set and browser supports filters |
| Text looks weird | Animation is running - wait or increase `speed` |
| Animation repeats | For hover, it only animates once per hover state |

---

## Browser Support

✅ All modern browsers (Chrome, Firefox, Safari, Edge)  
✅ Mobile browsers  
✅ Requires JavaScript enabled  

---

## Examples in Code

### In Skills Component
```tsx
import { TextScrambleSkill } from '@/app/components/TextScramble';

{skillCategories.map((category) => (
  <div key={category.category}>
    {category.skills.map((skill) => (
      <TextScrambleSkill 
        text={skill}
        speed={35}
        glowColor={category.glowColor}
      />
    ))}
  </div>
))}
```

---

## Next Steps

1. ✅ Component created
2. ✅ Integrated in Skills section
3. ✅ Optimized for performance
4. Ready to customize! 🎨

---

For detailed documentation, see **TEXT_SCRAMBLE_DOCS.md**
