# Timeline Component - Quick Reference Guide

## Quick Start (30 seconds)

```tsx
import { Timeline } from '@/app/components/Timeline';
import { Briefcase, Award, Star } from 'lucide-react';

export function MyTimeline() {
  const items = [
    {
      id: '1',
      date: '2024 — Present',
      title: 'Senior Developer',
      description: 'Leading product development',
      badge: 'Current',
      icon: Briefcase,
      accent: 'blue'
    },
    {
      id: '2',
      date: '2022 — 2024',
      title: 'Developer',
      description: 'Built amazing things',
      badge: 'Prev',
      icon: Award,
      accent: 'purple'
    }
  ];

  return (
    <Timeline 
      items={items}
      title="My Timeline"
      subtitle="Professional journey"
    />
  );
}
```

## Required Fields per Item

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"exp-1"` |
| `date` | string | `"2024 — Present"` |
| `title` | string | `"Senior Developer"` |
| `description` | string | `"Led development..."` |

## Optional Fields per Item

| Field | Type | Options | Example |
|-------|------|---------|---------|
| `badge` | string | Any text | `"Google"` |
| `icon` | LucideIcon | Any from lucide-react | `Briefcase` |
| `accent` | string | `"blue"`, `"purple"`, `"cyan"`, `"green"`, `"pink"` | `"blue"` |

## Timeline Props

```tsx
<Timeline
  items={itemsArray}           // Required: TimelineItem[]
  title="Experience"           // Optional: string (default: "Timeline")
  subtitle="My journey"        // Optional: string (default: "My journey")
/>
```

## Accent Color Quick Reference

```
🔵 blue    → Professional, tech-focused
🟣 purple  → Creative, modern
🔷 cyan    → Fresh, innovative
🟢 green   → Growth, success
🌸 pink    → Dynamic, energetic
```

## Icon Selection by Category

### Professional Experience
- `Briefcase`, `Code`, `Database`, `GitBranch`, `Zap`

### Education & Learning
- `GraduationCap`, `BookOpen`, `Award`, `Certificate`

### Achievements
- `Star`, `Trophy`, `Medal`, `Award`, `Rocket`

### Projects
- `Rocket`, `Code`, `Lightbulb`, `Target`, `CheckCircle`

### General
- `Calendar`, `Clock`, `MapPin`, `ExternalLink`

Import from: `import { IconName } from 'lucide-react';`

## Common Patterns

### Pattern 1: Timeline without Icons
```tsx
const items = [{
  id: '1',
  date: '2024',
  title: 'My Achievement',
  description: 'Something amazing happened',
  badge: 'Milestone'
  // No icon field
}];
```

### Pattern 2: Icon Only (No Badge Text)
```tsx
const items = [{
  id: '1',
  date: '2024',
  title: 'My Achievement',
  description: 'Something amazing happened',
  // No badge field, but add icon
  icon: Star
}];
```

### Pattern 3: All Accents
```tsx
const accents = ['blue', 'purple', 'cyan', 'green', 'pink'];
const items = experiences.map((exp, i) => ({
  ...exp,
  accent: accents[i % accents.length]
}));
```

### Pattern 4: Specific Accents for Categories
```tsx
const items = [
  { ...exp1, accent: 'blue' },    // Current role
  { ...exp2, accent: 'purple' },  // Previous role
  { ...exp3, accent: 'cyan' },    // Freelance
  { ...exp4, accent: 'green' }    // Early career
];
```

## Desktop Layout

```
LEFT ITEM              CENTER LINE              RIGHT ITEM
┌─────────────┐            │              ┌─────────────┐
│ Title       │─────────●──┤              │ Title       │
│ Date        │            │─────────────┤ Date        │
│ Description │            │              │ Description │
└─────────────┘            │              └─────────────┘
                          │
┌─────────────┐            │              ┌─────────────┐
│ Title       │            ├─────────────●│ Title       │
│ Date        │──────────●─┤              │ Date        │
│ Description │            │              │ Description │
└─────────────┘            │              └─────────────┘
```

## Mobile Layout

```
TIMELINE
│
●──── ITEM 1
│     Title
│     Description
│
●──── ITEM 2
│     Title
│     Description
│
●──── ITEM 3
│     Title
│     Description
```

## Animation Timing

- **Item entrance**: 0.8s (on scroll into view)
- **Dot scale**: 0.6s
- **Stagger delay**: 0.1s between items
- **Pulse animation**: 2s infinite
- **Hover scale**: 1.02x
- **Scroll trigger**: 100px before viewport

## Styling Customization

### Colors are applied via Tailwind classes:

```css
/* Accent colors automatically applied to: */
- Timeline dots (glow effect)
- Timeline line (gradient)
- Badge backgrounds
- Border colors
```

### To modify colors, edit `accentConfig` in Timeline.tsx:

```tsx
const accentConfig = {
  blue: {
    dot: "bg-blue-600",           // Dot background
    dotBorder: "border-blue-500/50",  // Dot border
    line: "from-blue-600/40 to-blue-800/20",  // Progress line
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",  // Badge
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.5)]"  // Glow effect
  },
  // ... other colors
};
```

## Performance Tips

1. **Limit items**: Keep to 3-8 items per timeline
2. **Short descriptions**: 1-3 sentences max
3. **Use consistent accents**: Cycle through 4-5 colors
4. **Optimize images**: If adding images, compress them
5. **Browser cache**: Better performance on repeat visits

## Troubleshooting

**Q: Animations not showing?**
A: Check that you're scrolling into the section. Animations trigger when items enter viewport.

**Q: Colors look different?**
A: Ensure Tailwind CSS is properly configured. Colors use arbitrary values like `bg-blue-600`.

**Q: Badge and icon not showing?**
A: Both are optional. Add `badge` and/or `icon` props to display them.

**Q: Mobile layout broken?**
A: The component uses `hidden md:block` for desktop. Check responsive breakpoints.

**Q: How to remove glow effect?**
A: Edit `accentConfig` and remove the `glow` class from relevant accent.

## Integration Examples

### Standalone Page
```tsx
import { Timeline } from '@/app/components/Timeline';
export default function TimelinePage() {
  return <Timeline items={items} title="Timeline" />;
}
```

### Inside Section Component
```tsx
export function Experience() {
  return <Timeline items={experiences} />;
}
```

### Multiple Timelines
```tsx
export function Portfolio() {
  return (
    <div className="space-y-32">
      <Timeline items={experiences} title="Experience" />
      <Timeline items={education} title="Education" />
      <Timeline items={projects} title="Projects" />
    </div>
  );
}
```

## Keyboard & Accessibility

- ✅ Semantic HTML structure
- ✅ Proper heading hierarchy
- ✅ Readable text contrast
- ✅ Scroll-based animations (no motion that could cause seizures)
- 📋 Consider adding `aria-labels` for custom implementations

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers
- ❌ IE11 (not supported)

## File Structure

```
src/app/components/
├── Timeline.tsx           ← Main component
├── Experience.tsx         ← Uses Timeline component
├── TimelineExamples.tsx   ← Usage examples
└── ...
```

## Related Files

- **Documentation**: `TIMELINE_COMPONENT_DOCS.md`
- **Examples**: `src/app/components/TimelineExamples.tsx`
- **Usage in App**: `src/app/components/Experience.tsx`

---

**Last Updated**: 2024
**Component Version**: 1.0.0
**React Version**: 18.3.1+
**Framer Motion Version**: 12.23.24+
