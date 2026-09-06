import { useLayoutEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  description: string;
  badge?: string;
  icon: LucideIcon;
  accent?: 'cyan' | 'purple' | 'blue';
}

interface TimelineProps {
  items: TimelineItem[];
  title?: string;
  subtitle?: string;
}

const accentColors = {
  cyan: '#22d3ee',
  purple: '#a855f7',
  blue: '#60a5fa',
};

const isCurrentItem = (date: string) => /present|current|now/i.test(date);

export function Timeline({ items, title = 'Experience', subtitle }: TimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || items.length === 0) return;

    const context = gsap.context(() => {
      const progressLine = section.querySelector<HTMLElement>('[data-experience-progress]');
      const continuation = section.querySelector<HTMLElement>('[data-experience-continuation]');
      const nodes = gsap.utils.toArray<HTMLElement>('[data-experience-node]');
      const nodeCores = gsap.utils.toArray<HTMLElement>('[data-experience-node-core]');
      const years = gsap.utils.toArray<HTMLElement>('[data-experience-year]');
      const connectors = gsap.utils.toArray<HTMLElement>('[data-experience-connector]');
      const contents = gsap.utils.toArray<HTMLElement>('[data-experience-content]');
      const extras = gsap.utils.toArray<HTMLElement>('[data-experience-extra]');
      const contactLine = section.querySelector<HTMLElement>('[data-experience-contact-line]');
      const contactLabel = section.querySelector<HTMLElement>('[data-experience-contact-label]');
      const progressLabel = section.querySelector<HTMLElement>('[data-experience-progress-label]');

      if (!progressLine || nodes.length === 0) return;

      const nodePositions = items.map((_, index) => {
        if (items.length === 1) return 0.5;
        return 0.16 + (index / (items.length - 1)) * 0.68;
      });
      const lineStart = 0.08;
      const lineDuration = 0.82;
      let activeIndex = -1;

      const setProgressLabel = (index: number) => {
        if (!progressLabel || index === activeIndex) return;
        activeIndex = index;
        progressLabel.textContent = `${String(Math.max(index + 1, 1)).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
      };

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const mobile = window.matchMedia('(max-width: 767px)').matches;

      if (reduceMotion) {
        gsap.set([continuation, progressLine, contactLine, contactLabel], {
          clearProps: 'all',
          opacity: 1,
          scale: 1,
          y: 0,
        });
        gsap.set([...nodes, ...nodeCores, ...years, ...connectors, ...contents, ...extras], {
          clearProps: 'all',
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0,
        });
        setProgressLabel(items.length - 1);
        return;
      }

      gsap.set(continuation, { opacity: 0.25, scaleY: 0.35, transformOrigin: 'top center' });
      gsap.set(progressLine, { opacity: 1, scaleY: 0, transformOrigin: 'top center' });
      gsap.set(contactLine, { opacity: 0, scaleY: 0, transformOrigin: 'top center' });
      gsap.set(contactLabel, { opacity: 0, y: 10 });
      gsap.set(nodes, { opacity: 0.3, scale: 0.78, transformOrigin: 'center' });
      gsap.set(nodeCores, { opacity: 0, scale: 0, transformOrigin: 'center' });
      gsap.set(years, { opacity: 0.3, x: 8 });
      gsap.set(connectors, { opacity: 0.2, scaleX: 0, transformOrigin: 'left center' });
      gsap.set(contents, { opacity: 0.28, x: 12 });
      gsap.set(extras, { opacity: 0, y: 8 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: mobile ? 'top 78%' : 'top top',
          end: mobile ? 'bottom 62%' : 'bottom bottom',
          scrub: 0.85,
          pin: false,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const lineProgress = gsap.utils.clamp(
              0,
              1,
              (self.progress - lineStart) / lineDuration,
            );
            let nextIndex = 0;
            nodePositions.forEach((position, index) => {
              if (lineProgress >= position) nextIndex = index;
            });
            setProgressLabel(nextIndex);
          },
        },
      });

      timeline
        .to(continuation, { opacity: 1, scaleY: 1, duration: 0.08, ease: 'none' }, 0)
        .to(progressLine, { scaleY: 1, duration: lineDuration, ease: 'none' }, lineStart);

      items.forEach((_, index) => {
        const nodeTime = lineStart + lineDuration * nodePositions[index];

        timeline
          .to(nodes[index], { opacity: 1, scale: 1, duration: 0.055, ease: 'power2.out' }, nodeTime)
          .to(nodeCores[index], { opacity: 1, scale: 1, duration: 0.055, ease: 'power2.out' }, nodeTime)
          .to(years[index], { opacity: 1, x: 0, duration: 0.07, ease: 'power2.out' }, nodeTime + 0.035)
          .to(connectors[index], { opacity: 1, scaleX: 1, duration: 0.1, ease: 'power2.out' }, nodeTime + 0.055)
          .to(contents[index], { opacity: 1, x: 0, duration: 0.12, ease: 'power2.out' }, nodeTime + 0.09)
          .to(extras[index], { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' }, nodeTime + 0.18);
      });

      timeline
        .to(contactLine, { opacity: 0.75, scaleY: 1, duration: 0.08, ease: 'none' }, 0.93)
        .to(contactLabel, { opacity: 1, y: 0, duration: 0.07, ease: 'power2.out' }, 0.96);

      setProgressLabel(0);
    }, section);

    return () => context.revert();
  }, [items]);

  return (
    <section ref={sectionRef} id="experience" className="experience-scroll-shell">
      <div className="experience-scroll-sticky">
        <div className="experience-scroll-continuation" data-experience-continuation aria-hidden="true" />

        <header className="experience-scroll-header">
          <div>
            <span className="experience-scroll-kicker">EXPERIENCE / 05</span>
            <h2>{title}.</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <span className="experience-scroll-progress" data-experience-progress-label>
            01 / {String(items.length).padStart(2, '0')}
          </span>
        </header>

        <div className="experience-scroll-track" aria-label={`${title} timeline`}>
          <div className="experience-scroll-line" aria-hidden="true">
            <span data-experience-progress />
          </div>

          <div className="experience-scroll-items">
            {items.map((item, index) => {
              const Icon = item.icon;
              const accent = accentColors[item.accent ?? 'cyan'];
              const current = isCurrentItem(item.date);
              const position = items.length === 1 ? 50 : 16 + (index / (items.length - 1)) * 68;
              const itemStyle = {
                '--experience-position': `${position}%`,
                '--experience-accent': accent,
              } as CSSProperties & Record<string, string>;

              return (
                <article
                  key={item.id}
                  className={`experience-scroll-item${current ? ' is-current' : ''}`}
                  style={itemStyle}
                  data-experience-item
                >
                  <div className="experience-scroll-year" data-experience-year>
                    {item.date}
                  </div>

                  <div
                    className="experience-scroll-node"
                    data-experience-node
                    aria-label={`${item.title}, ${item.date}`}
                  >
                    <span className="experience-scroll-node-core" data-experience-node-core />
                    <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
                    {current && <span className="experience-scroll-now">NOW</span>}
                  </div>

                  <span className="experience-scroll-connector" data-experience-connector aria-hidden="true" />

                  <div className="experience-scroll-content" data-experience-content>
                    <div className="experience-scroll-meta">
                      <span>{item.badge ?? 'JOURNEY'}</span>
                      {current && <span>ONGOING</span>}
                    </div>
                    <h3>{item.title}</h3>
                    <p className="experience-scroll-subtitle">{item.subtitle}</p>
                    <p className="experience-scroll-description">{item.description}</p>
                    <div className="experience-scroll-extra" data-experience-extra>
                      <span>{current ? 'CURRENT FOCUS' : 'FOUNDATION'}</span>
                      <span className="experience-scroll-extra-dot" style={{ backgroundColor: accent }} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="experience-scroll-contact-line" data-experience-contact-line aria-hidden="true" />
        <span className="experience-scroll-contact-label" data-experience-contact-label>
          NEXT / CONTACT
        </span>
      </div>
    </section>
  );
}
