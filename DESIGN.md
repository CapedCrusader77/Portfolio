---
version: alpha
colors:
  ink: "#07090d"
  panel: "#0c1117"
  paper: "#edf0ed"
  muted: "#87929a"
  signal: "#86bdd8"
  signalBright: "#b0d8e7"
typography:
  display:
    fontFamily: "Barlow Condensed, Inter, sans-serif"
    fontSize: "clamp(3.8rem, 7.8vw, 8rem)"
    lineHeight: "0.82"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.94rem"
    lineHeight: "1.8"
  utility:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.63rem"
    lineHeight: "1.4"
rounded:
  DEFAULT: "0"
  small: "0"
spacing:
  section: "clamp(6rem, 12vw, 12rem)"
  gutter: "clamp(1.25rem, 5vw, 5.5rem)"
components:
  navigation:
    background: "rgba(7, 9, 13, 0.72)"
    border: "rgba(237, 240, 237, 0.1)"
  projectVisual:
    background: "#0c1117"
    radius: "0"
  focus:
    outline: "#b0d8e7"
---

## Overview

This is a brand portfolio for Gokul A, an AI and Robotics student working across autonomous systems, data science, and resilient software. The surface is a marketing/content site: its job is to make the work feel credible, legible, and worth exploring.

North star: a quiet robotics lab notebook seen through an architectural lens. The design should feel engineered and editorial, with enough atmosphere to make the work memorable without turning the page into a simulated dashboard.

The signature is a single steel-blue signal accent that travels through hairlines, links, and the hero atmosphere. Everything else stays graphite, paper, or muted grey.

Anti-references: neon cyberpunk, military HUD interfaces, rainbow gradients, glossy SaaS cards, pill-heavy navigation, and decorative telemetry that does not explain the content.

## Colors

The palette has one expressive role: `signal` marks the active path through the page. It is not a status color and should not be repeated as glow, border, fill, and text in the same component. `paper` is reserved for primary reading, while `muted` is used for supporting information.

## Typography

Barlow Condensed carries the large editorial statements and project names. Inter carries readable body copy. IBM Plex Mono is utility-only: section markers, metadata, years, stack labels, and small navigation cues. Headings use sentence case where the words are prose; all-caps are reserved for compact metadata.

## Layout

The page uses a wide editorial column with generous section spacing, thin full-width rules, and asymmetric two-column compositions. Hero content is anchored to the lower half of the architectural image. Work items alternate the image and copy relationship so the page has rhythm without decorative cards.

The mobile layout collapses to one readable column, preserves the same content order, keeps links visible, and removes secondary navigation items rather than shrinking them into unusable controls.

## Elevation & Depth

Depth comes from one dark architectural image, a restrained wash, image treatment, and small positional reveals. Static content is flat. No persistent glass panels, heavy shadows, or blurred card stacks are used.

## Shapes

The site uses square edges and hairline borders as a reference to drawings, instrumentation, and printed technical matter. Rounded shapes are avoided except for the tiny signal node in the hero and timeline markers.

## Components

Navigation is a quiet fixed reading aid, not a pill cluster. Project visuals are large editorial frames with a single metadata line and one clear source action. Skills are a ruled list rather than a tag cloud. Education is a simple chronological pair with one spine. Contact ends with the email as the primary action and social links as secondary rows.

Motion is limited to a slow hero image shift, reveal-on-entry, image hover treatment, and a small amount of link movement. Reduced motion removes transforms and reveal delays while keeping all content visible.

## Do's and Don'ts

- Do let content hierarchy carry the page.
- Do use the blue signal once per local composition.
- Do keep labels short and factual.
- Do use the architectural background as atmosphere, not as a competing illustration.
- Don't add a new status badge, mode switcher, particle system, or glow unless it explains a real interaction.
- Don't turn project descriptions into marketing slogans.
- Don't hide important actions behind hover.
