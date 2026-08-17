---
name: Cali Solidario
colors:
  surface: '#faf9fb'
  surface-dim: '#dbd9dc'
  surface-bright: '#faf9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f6'
  surface-container: '#efedf0'
  surface-container-high: '#e9e7ea'
  surface-container-highest: '#e3e2e4'
  on-surface: '#1b1c1e'
  on-surface-variant: '#434656'
  inverse-surface: '#303032'
  inverse-on-surface: '#f2f0f3'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#004dea'
  primary: '#0041c8'
  on-primary: '#ffffff'
  primary-container: '#0055ff'
  on-primary-container: '#e3e6ff'
  inverse-primary: '#b6c4ff'
  secondary: '#006d35'
  on-secondary: '#ffffff'
  secondary-container: '#8afaa7'
  on-secondary-container: '#007439'
  tertiary: '#a40100'
  on-tertiary: '#ffffff'
  tertiary-container: '#d20000'
  on-tertiary-container: '#ffe1dc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b3'
  secondary-fixed: '#8afaa7'
  secondary-fixed-dim: '#6edd8d'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005227'
  tertiary-fixed: '#ffdad4'
  tertiary-fixed-dim: '#ffb4a8'
  on-tertiary-fixed: '#410000'
  on-tertiary-fixed-variant: '#930100'
  background: '#faf9fb'
  on-background: '#1b1c1e'
  surface-variant: '#e3e2e4'
  background-subtle: '#F7F7F5'
  surface-white: '#FFFFFF'
  accent-warm: '#FFEADB'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
---

## Brand & Style

This design system is built to facilitate social impact and community solidarity. The visual identity balances the civic pride inherent in the colors of the Cali flag with a modern, professional SaaS aesthetic. It avoids the chaotic nature of traditional civic portals by adopting a **Corporate / Modern** style that emphasizes clarity, accessibility, and trust.

The brand personality is reliable and community-oriented. It uses generous whitespace and a systematic grid to transform vibrant primary colors into a sophisticated palette suitable for a professional social solidarity platform. The user experience should feel organized and empowering, making complex social initiatives feel approachable and actionable.

## Colors

The palette is derived directly from the Cali flag, refined for digital legibility. The primary blue is shifted slightly from the pure `#0000FF` to a more modern, accessible digital blue. The secondary green is adjusted to a professional "forest" tone to signify growth and stability.

- **Primary (Blue):** Used for main actions, active states, and navigation headers.
- **Secondary (Green):** Used for "Solidarity" actions, success states, and community-focused highlights.
- **Tertiary (Red):** Used sparingly for urgent alerts, critical calls-to-action, or small decorative accents to maintain balance.
- **Neutral:** A deep off-black for high-contrast typography, paired with a soft warm gray for background surfaces to reduce eye strain.

## Typography

The typography system utilizes **Hanken Grotesk** for headlines to provide a sharp, contemporary character that feels both civic and tech-forward. For body text and functional labels, **Geist** is employed for its exceptional clarity and developer-friendly precision, ensuring that data-heavy solidarity reports and community feeds remain highly legible.

Hierarchy is established through weight and scale rather than decorative shifts. Headers should prioritize the primary color or neutral black, while secondary body text should remain in high-contrast neutrals for accessibility.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop, centered within the viewport with a maximum width of 1280px. This ensures a consistent reading experience for long-form community content.

A 12-column grid is used for the layout:
- **Desktop (1024px+):** 12 columns, 24px gutters, 40px side margins.
- **Tablet (768px - 1023px):** 8 columns, 16px gutters, 24px side margins.
- **Mobile (<767px):** 4 columns, 16px gutters, 16px side margins.

Horizontal spacing and vertical rhythm are strictly based on 8px increments to maintain a structured, professional appearance.

## Elevation & Depth

This design system uses **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows to convey depth. This keeps the interface feeling light and modern.

- **Level 0 (Base):** Using `background-subtle`, this is the canvas for all content.
- **Level 1 (Cards/Surface):** White surfaces with a 1px border in a low-opacity neutral.
- **Level 2 (Interactive):** When hovered or focused, elements gain a soft, tinted ambient shadow (using a low-opacity primary blue) to signify lift.
- **Backdrop Blurs:** Used exclusively for navigation bars and modal overlays to maintain context while focusing on the foreground task.

## Shapes

The shape language is **Rounded**, utilizing a 0.5rem (8px) base radius. This softens the professional tone of the typography, making the platform feel more approachable and "human-centered."

Buttons and form inputs follow the base 8px radius. Larger containers like cards or content modules use the `rounded-lg` (16px) setting to create a friendly, encapsulated look for community projects.

## Components

### Buttons
- **Primary:** Solid primary blue with white text. High-contrast and bold.
- **Secondary:** Solid green with white text, used for "Join" or "Donate" actions.
- **Ghost:** Primary color border and text with no fill, used for secondary navigation actions.

### Cards
Cards are the primary vehicle for "Solidarity Projects." They feature a white background, 16px corner radius, and a subtle 1px border. On hover, they should exhibit a 2px primary-colored bottom border to indicate interactivity.

### Input Fields
Inputs use a white background with a soft gray border. Upon focus, the border transitions to primary blue with a 2px outer glow (ring) of the same color at 20% opacity.

### Navigation
The desktop navigation is a fixed-top header with a backdrop blur. It uses high-contrast neutral text with a secondary green indicator for the "Active" state to highlight the user's current community context.

### Chips & Tags
Used for categorizing social causes (e.g., "Education", "Nutrition"). These use the `accent-warm` background with neutral text to distinguish them from primary action buttons.