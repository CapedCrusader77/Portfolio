# Timeline Component Documentation

A visually appealing, fully animated timeline component for developer portfolios with dark theme, glowing accents, and smooth scroll-triggered animations.

## Features

✨ **Visual Features**
- Dark theme with gradient accents
- Glowing neon dots with pulsing animations
- Smooth scroll-triggered animations
- Alternating layout on desktop (left-right pattern)
- Stacked layout on mobile
- Hover effects with glass morphism
- 5 unique color schemes (blue, purple, cyan, green, pink)

⚡ **Performance**
- Uses Framer Motion's optimized animation engine
- Lazy animation triggers on scroll (only animates when in viewport)
- Minimal re-renders with useMemo for accent distribution
- CSS-based animations for GPU acceleration

📱 **Responsive Design**
- Desktop: Alternating left-right layout with center timeline
- Mobile: Single-column stacked layout with left-side timeline
- Tablet: Responsive padding and font sizes

## Installation

The component uses existing dependencies:
- `react` - UI library
- `motion/react` - Animation library (Framer Motion v6)
- `lucide-react` - Icon library
- `tailwindcss` - Styling

No additional packages needed!

## Usage

### Basic Example

```tsx
import { Timeline } from '@/app/components/Timeline';

const items = [
  {
    id: 'exp-1',
    date: '2024 — Present',
    title: 'Senior Developer',
    description: 'Leading development of web applications',
    badge: 'Current Role',
    accent: 'blue'
  },
  {
    id: 'exp-2',
    date: '2022 — 2024',
    title: 'Full Stack Developer',
    description: 'Built wellness applications',
    badge: 'Mindful Digital',
    accent: 'purple'
  }
];

export function MyTimeline() {
  return (
    <Timeline 
      items={items}
      title="My Experience"
      subtitle="Professional journey"
    />
  );
}
```

### With Icons

```tsx
import { Timeline } from '@/app/components/Timeline';
import { Briefcase, Code, Award } from 'lucide-react';

const items = [
  {
    id: 'exp-1',
    date: '2024 — Present',
    title: 'Senior Developer',
    description: 'Leading development',
    badge: 'Current Role',
    icon: Briefcase,  // Add icon here
    accent: 'blue'
  }
];
```

## Component Props

```typescript
interface TimelineItem {
  id: string;                              // Unique identifier
  date: string;                            // Date or year range
  title: string;                           // Main title (role, education, milestone)
  description: string;                     // Detailed description
  badge?: string;                          // Optional badge text (company, certification, etc.)
  icon?: LucideIcon;                       // Optional Lucide icon
  accent?: "blue" | "purple" | "cyan" | "green" | "pink";  // Color scheme
}

interface TimelineProps {
  items: TimelineItem[];                   // Array of timeline items
  title?: string;                          // Section title (default: "Timeline")
  subtitle?: string;                       // Section subtitle (default: "My journey")
}
```

## Accent Colors

Each color includes coordinated styling for dots, lines, badges, and glows:

- **blue**: #3b82f6 - Professional, tech-focused
- **purple**: #9333ea - Creative, modern
- **cyan**: #22d3ee - Fresh, innovative
- **green**: #10b981 - Growth, success
- **pink**: #ec4899 - Dynamic, energetic

Colors are automatically distributed if not specified, or can be manually set per item.

## Animation Details

### Scroll-Triggered Animations
- Items animate in from the side when scrolling into view
- Staggered delay for each item (0.1s between items)
- Smooth easing: `[0.22, 1, 0.36, 1]` (custom cubic-bezier)
- Duration: 0.8s for item content, 0.6s for dots

### Persistent Animations
- Pulsing glow on timeline dots (infinite, 2s duration)
- Staggered pulse timing based on item index
- Hover scale effect on content cards (1.02x)

### Viewport Configuration
- Animations trigger 100px before item enters viewport
- Each animation runs only once (`once: true`)

## Styling & Customization

### CSS Classes Used
- Tailwind utilities for spacing, sizing, colors
- Custom Tailwind plugins for shadows/glows
- Backdrop blur for glass morphism effect
- Gradient backgrounds for visual depth

### Dark Theme Colors
- Background: `slate-950`, `slate-900`
- Text: `white`, `gray-400`
- Accents: Color-specific shades
- Borders: `white/10` for subtle separation

## Performance Optimization

1. **Lazy Animation**: Animations only run when items are in viewport
2. **GPU Acceleration**: Transform/opacity animations for smooth 60fps
3. **Memoization**: `useMemo` caches accent distribution
4. **Efficient Scroll Tracking**: Single scroll listener for entire section
5. **No Layout Shifts**: Fixed dimensions prevent CLS issues

## Browser Support

Works on all modern browsers supporting:
- CSS Grid and Flexbox
- CSS Custom Properties
- CSS Filters and Transforms
- Framer Motion v6+

## Examples

See `TimelineExamples.tsx` for complete examples of:
- Education & Certifications timeline
- Key Milestones timeline
- Featured Projects timeline

Each example demonstrates different badge types, icons, and accent colors.

## Advanced Usage

### Custom Accent Distribution

```tsx
const items = [
  { id: '1', ..., accent: 'blue' as const },
  { id: '2', ..., accent: 'purple' as const },
  { id: '3', ..., accent: 'cyan' as const }
];
```

### Empty Badge (Icon Only)

```tsx
// Item with just icon, no badge text
{
  id: 'item-1',
  date: '2024',
  title: 'Milestone',
  description: 'Achieved something great',
  icon: Star,  // Icon displays in badge without text
  // No badge prop
}
```

### Integrating with Portfolio

The component is already integrated into the Experience section. To use in other sections:

```tsx
// In your component
import { Timeline } from '@/app/components/Timeline';

export function EducationSection() {
  return (
    <Timeline
      items={educationItems}
      title="Education"
      subtitle="Learning journey"
    />
  );
}
```

## Tips & Tricks

1. **Icons**: Use consistent icon themes from Lucide React
2. **Descriptions**: Keep descriptions 1-3 sentences for readability
3. **Date Format**: Use "YYYY — YYYY" for ranges or "Month YYYY" for specific dates
4. **Badge Text**: Keep badges short (1-3 words) for mobile readability
5. **Item Count**: 3-5 items work best; more than 8 may feel crowded
6. **Order**: Arrange items chronologically (newest first or oldest first consistently)

## Troubleshooting

**Animations not working?**
- Ensure Framer Motion is installed: `npm install motion@12`
- Check viewport is set correctly in useScroll hook

**Colors not applying?**
- Verify Tailwind CSS is configured correctly
- Check accent values match enum: "blue" | "purple" | "cyan" | "green" | "pink"

**Layout issues on mobile?**
- Clear browser cache and rebuild
- Check media query breakpoint (md: 768px)

**Performance issues?**
- Reduce number of items per timeline
- Disable animations if on very old devices (using Framer Motion's reduce motion detection)

## Future Enhancements

Potential additions:
- Horizontal timeline variant
- Custom color support (CSS variables)
- Expandable/collapsible items
- Connection lines between related items
- Dark/light theme toggle
- Accessibility enhancements (reduced motion preference)

## License

Part of the portfolio project. See main project LICENSE.
