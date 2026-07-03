/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'primary-fixed-dim': '#f8bc63',
        primary: '#ffd9a7',
        'secondary-container': '#2b3c9e',
        'on-error-container': '#ffdad6',
        'surface-container-high': '#282933',
        'tertiary-fixed': '#e8e2d4',
        'primary-fixed': '#ffddb2',
        'on-tertiary-fixed': '#1d1c13',
        'surface-variant': '#32343e',
        'on-primary': '#452b00',
        'inverse-on-surface': '#2e303a',
        'on-surface': '#e1e1ef',
        'tertiary-fixed-dim': '#cbc6b9',
        'on-tertiary': '#333027',
        'on-primary-fixed-variant': '#624000',
        'on-surface-variant': '#d4c4b2',
        'inverse-surface': '#e1e1ef',
        'outline-variant': '#504537',
        'surface-tint': '#f8bc63',
        'surface-container-lowest': '#0c0e16',
        'surface-container': '#1d1f28',
        error: '#ffb4ab',
        'primary-container': '#f4b860',
        'on-secondary': '#0d2287',
        'on-tertiary-container': '#535045',
        'on-tertiary-fixed-variant': '#49473d',
        'surface-dim': '#11131c',
        surface: '#11131c',
        'inverse-primary': '#825500',
        'surface-container-highest': '#32343e',
        'error-container': '#93000a',
        'on-secondary-fixed-variant': '#2b3c9e',
        outline: '#9d8e7e',
        'tertiary-container': '#c7c2b5',
        'on-primary-container': '#6f4800',
        'on-error': '#690005',
        tertiary: '#e4ded0',
        'secondary-fixed-dim': '#bbc3ff',
        secondary: '#bbc3ff',
        'surface-bright': '#373943',
        'on-background': '#e1e1ef',
        'on-secondary-container': '#a4b0ff',
        'on-secondary-fixed': '#000f5d',
        'surface-container-low': '#191b24',
        'on-primary-fixed': '#291800',
        'secondary-fixed': '#dee0ff',
        background: '#11131c',
        // Parchment surface used inside answer cards (not part of the MD3 token set,
        // kept literal in the original Stitch export — named here for reuse)
        parchment: '#F7F1E3',
        'parchment-ink': '#14161F',
        'parchment-border': '#dcd2be',
        'parchment-card': '#fdfaf2',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        // NOTE: intentionally not overriding `full` here. Tailwind's default
        // (9999px) is what makes rounded-full render as a true circle on
        // larger elements (GlowOrb, EmptyState icon, InputBar send button).
        // Small pill/dot elements (status dots, the web-search toggle) still
        // render correctly with the true default, since border-radius clamps
        // to half the element's own size regardless of how large the radius
        // value is — a previous override here (0.75rem) broke every large
        // circular element while only "coincidentally" still working for
        // small ones.
      },
      spacing: {
        'component-padding': '1.5rem',
        'section-gap': '3rem',
        'ink-line-height': '1px',
        'page-margin': '2rem',
      },
      fontFamily: {
        'headline-md': ['"Source Serif 4"', 'serif'],
        'question-accent': ['Caveat', 'cursive'],
        'display-lg': ['"Source Serif 4"', 'serif'],
        'body-md': ['"Source Serif 4"', 'serif'],
        'label-mono': ['"JetBrains Mono"', 'monospace'],
        'body-lg': ['"Source Serif 4"', 'serif'],
        'display-lg-mobile': ['"Source Serif 4"', 'serif'],
      },
      fontSize: {
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'question-accent': ['28px', { lineHeight: '32px', fontWeight: '400' }],
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-mono': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '500' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'display-lg-mobile': ['32px', { lineHeight: '40px', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
}
