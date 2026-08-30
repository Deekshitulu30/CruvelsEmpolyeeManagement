---
name: PeopleOS
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#464555'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#575e70'
  on-secondary: '#ffffff'
  secondary-container: '#d9dff5'
  on-secondary-container: '#5c6274'
  tertiary: '#414855'
  on-tertiary: '#ffffff'
  tertiary-container: '#59606e'
  on-tertiary-container: '#d4dbeb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#dce2f7'
  secondary-fixed-dim: '#c0c6db'
  on-secondary-fixed: '#141b2b'
  on-secondary-fixed-variant: '#404758'
  tertiary-fixed: '#dce2f3'
  tertiary-fixed-dim: '#c0c7d6'
  on-tertiary-fixed: '#151c27'
  on-tertiary-fixed-variant: '#404754'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 80px
    letterSpacing: -0.04em
  display-hero-mobile:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-page:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-section:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The design system for this platform is built on the pillars of **Intelligent Efficiency** and **Premium Professionalism**. It targets high-growth organizations that require a tool as sharp and reliable as their best employees. 

The visual style is **Corporate Modern with a Minimalist edge**, heavily influenced by the high-performance aesthetics of modern developer tools and fintech leaders. The UI prioritizes high signal-to-noise ratios, utilizing generous whitespace and a restricted color palette to ensure users can focus on complex operations without cognitive fatigue. The interface should feel "engineered" rather than decorated—every element exists for a functional purpose, delivered with a refined, premium finish.

## Colors
The palette is rooted in a "Paper & Ink" philosophy. The **Pure White (#FFFFFF)** surfaces represent the workspaces, while **Dark Charcoal (#111827)** provides maximum legibility for data. 

**Professional Indigo (#4F46E5)** is used sparingly for primary actions and focused states to guide the eye without overwhelming the layout. Backgrounds utilize a very subtle **Neutral Gray (#F9FAFB)** to create a soft separation between the application frame and the content cards. High-contrast semantic colors are reserved for status indicators (Success, Warning, Danger), ensuring that critical information is immediately recognizable in dense data environments.

## Typography
This design system utilizes a dual-font stack. **Geist** is employed for headings and technical labels to provide a precise, modern feel with its slightly geometric and tight spacing. **Inter** is used for all body copy and long-form text to ensure maximum readability across all screen types.

Large headlines should use "Tight" letter spacing to feel more cohesive and editorial. For data tables and ID numbers, the monospaced stylistic sets of Geist should be used to ensure vertical alignment of digits.

## Layout & Spacing
The system follows a strict **8px linear grid**. All dimensions, padding, and margins must be multiples of 8 (e.g., 8, 16, 24, 32, 48, 64).

**Desktop Layout:** A 12-column fluid grid within a 1280px max-width container. 
**Sidebar:** A fixed-width left navigation (240px or 280px) is standard for deep application architecture.
**Reflow:** On tablet, the sidebar transitions to a collapsed icon-only state or a hidden drawer. On mobile, the 12-column grid collapses to 4 columns, and page margins reduce to 16px to maximize content density.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Subtle Outlines** rather than heavy shadows. 

1.  **Level 0 (Background):** #F9FAFB. Used for the main application canvas.
2.  **Level 1 (Cards/Surfaces):** #FFFFFF with a 1px solid border (#E5E7EB). This is the primary container for content.
3.  **Level 2 (Popovers/Modals):** #FFFFFF with a slightly more pronounced, diffused shadow (0px 10px 15px -3px rgba(0,0,0,0.05)) and a 1px border.

Shadows should be "ambient"—soft, low-opacity, and naturally diffused to avoid looking heavy or dated.

## Shapes
The shape language is controlled and sophisticated. 
- **Standard Elements:** Buttons, inputs, and small cards use a **8px (0.5rem)** radius to maintain a modern, friendly but professional look.
- **Large Elements:** Modals and large feature cards use a **12px (0.75rem)** radius.
- **Interactive States:** Focus rings should follow the shape of the element with a 2px offset.
- **Icons:** Icons should utilize a 2px stroke weight with slightly rounded caps and joins to match the UI's corner radius.

## Components
- **Buttons:** 
  - *Primary:* Solid Indigo, white text. No gradient. 
  - *Secondary:* White background, 1px Gray-200 border, Dark Charcoal text.
  - *Ghost:* No background or border, Indigo or Charcoal text; subtle gray background on hover.
- **Inputs:** 1px border (#E5E7EB), 8px radius, 16px horizontal padding. Use a 2px Indigo ring for focus states.
- **Data Tables:** Borderless rows with 1px bottom dividers. Header cells use `label-caps` typography with a subtle gray background.
- **Badges (Status):** Low-saturation backgrounds with high-saturation text (e.g., Light Green background with Dark Green text) for high legibility and a premium feel.
- **Avatars:** Always circular to provide a geometric counterpoint to the predominantly rectangular UI elements.
- **Sidebars:** Integrated search at the top, grouped navigation items with subtle icons, and a clear "Active" state using a small vertical Indigo indicator.