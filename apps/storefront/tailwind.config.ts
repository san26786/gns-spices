import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /** Brand tokens matching the live gnsspices.com aesthetic:
         *  dark moody base, amber accent, glass surfaces. */
        gns: {
          bg:        '#0A0A0A', // page base — near-black
          surface:   '#171717', // panel base (zinc-900)
          surface2:  '#262626', // raised panel (zinc-800)
          amber:     '#F59E0B', // primary accent (amber-500)
          amberHi:   '#FBBF24', // hover / brand mark (amber-400)
          amberDeep: '#451A03', // text on amber buttons (amber-950)
          muted:     '#D4D4D8', // body subtext (zinc-300)
          muted2:    '#A1A1AA', // captions (zinc-400)
          line:      'rgba(255,255,255,0.10)',
        },

        /** Spice palette — kept for vibrant product tiles on the dark base */
        spice: {
          red:        '#E11D2A',
          crimson:    '#B0121F',
          maroon:     '#4A0A0E',
          chili:      '#E63A1F',
          turmeric:   '#F5B400',
          saffron:    '#FFC72C',
          gold:       '#D4A017',
          cardamom:   '#2FA84F',
          leaf:       '#4FB85F',
          mint:       '#7FCB8A',
          pepper:     '#15110F',
          ink:        '#15110F',
          charcoal:   '#15110F',
          ivory:      '#FFFFFF',
          cream:      '#FFFFFF',
          parchment:  '#FFF8E6',
          paprika:    '#E11D2A',
        },
      },
      fontFamily: {
        /** Outfit is the brand font on gnsspices.com — clean geometric sans */
        sans:    ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        serif:   ['Outfit', 'system-ui', 'sans-serif'], // legacy alias
      },
      boxShadow: {
        amber:    '0 0 20px rgba(245,158,11,0.30)',
        amberHi:  '0 0 30px rgba(245,158,11,0.50)',
      },
      backgroundImage: {
        'spice-grain': "radial-gradient(circle at 20% 20%, rgba(245,158,11,0.12) 0, transparent 45%), radial-gradient(circle at 80% 80%, rgba(225,29,42,0.10) 0, transparent 50%)",
        'gns-hero': "radial-gradient(ellipse at 30% 25%, rgba(245,158,11,0.18) 0%, transparent 55%), radial-gradient(ellipse at 75% 75%, rgba(225,29,42,0.18) 0%, transparent 60%), radial-gradient(ellipse at 60% 100%, rgba(47,168,79,0.10) 0%, transparent 60%), linear-gradient(135deg, #0A0A0A 0%, #1A120A 50%, #0A0A0A 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
