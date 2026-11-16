// Static product catalog used as a fallback when the API is unseeded / unavailable,
// and as the source of truth for the public-facing /shop grid until the catalog
// service is fully wired up.

export type CatalogCategory = 'powders' | 'seeds' | 'masalas' | 'whole' | 'pickles';

/** Consumer-facing tier names. Same vocabulary across every product so shoppers
 *  can compare like-for-like across the range. */
export type GradeTier = 'Home Kitchen' | 'Professional Choice' | "Chef's Reserve";

export interface CatalogVariant {
  /** Tier name for multi-grade products. Omitted for single-grade items
   *  (those render as "House Selection"). */
  tier?: GradeTier;
  /** Origin / grade detail shown as supporting copy beneath the tier */
  description: string;
  /** Default retail pack sizes */
  pack?: string;
}

/** Visual styling for each tier badge — tuned for the dark theme */
export const TIER_BADGE: Record<GradeTier, string> = {
  'Home Kitchen':
    'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  'Professional Choice':
    'bg-rose-500/15 text-rose-300 border-rose-500/40',
  "Chef's Reserve":
    'bg-amber-400/20 text-amber-200 border-amber-300/50',
};

export interface CatalogProduct {
  slug: string;
  name: string;
  shortDesc: string;
  origin: string;
  category: CatalogCategory;
  variants: CatalogVariant[];
  /** Tailwind gradient classes — chosen to match the actual colour of the spice */
  tone: string;
  /** Foreground colour class for text on the tile */
  ink: string;
  /** Decorative emoji shown on the tile */
  icon: string;
}

export const CATEGORY_META: Record<CatalogCategory, { label: string; blurb: string }> = {
  powders: { label: 'Pure Powders',     blurb: 'Stone-milled, single-origin spice powders' },
  seeds:   { label: 'Whole Seeds',      blurb: 'For tempering, grinding & infusing' },
  masalas: { label: 'Signature Masalas',blurb: 'Family blends, slow-roasted in small batches' },
  whole:   { label: 'Whole Spices',     blurb: 'Hand-picked whole spices' },
  pickles: { label: 'Indian Pickles',   blurb: 'Achaars made with grandmother\'s recipes' },
};

export const CATALOG: CatalogProduct[] = [
  // ── Pure powders ─────────────────────────────────────────────────────
  {
    slug: 'turmeric-powder',
    name: 'Turmeric Powder',
    shortDesc: 'Bright, earthy, with clean curcumin warmth.',
    origin: 'Erode & Salem, Tamil Nadu',
    category: 'powders',
    variants: [
      { tier: 'Home Kitchen',    description: 'Salem · 5% curcumin', pack: '100g · 500g' },
      { tier: "Chef's Reserve",  description: 'Erode · 7% curcumin', pack: '100g · 500g' },
    ],
    tone: 'bg-gradient-to-br from-spice-saffron via-spice-turmeric to-spice-gold',
    ink: 'text-spice-maroon',
    icon: '🟡',
  },
  {
    slug: 'chilli-powder',
    name: 'Red Chilli Powder',
    shortDesc: 'Three grades from gentle blush to fiery sting.',
    origin: 'Kashmir, Karnataka & Andhra Pradesh',
    category: 'powders',
    variants: [
      { tier: 'Home Kitchen',         description: 'Kashmiri · mild & vivid red',  pack: '100g · 500g' },
      { tier: 'Professional Choice',  description: 'Byadgi · medium, deep red',    pack: '100g · 500g' },
      { tier: "Chef's Reserve",       description: 'Guntur Sannam · hot, fiery',   pack: '100g · 500g' },
    ],
    tone: 'bg-gradient-to-br from-spice-chili via-spice-red to-spice-crimson',
    ink: 'text-spice-ivory',
    icon: '🌶️',
  },
  {
    slug: 'coriander-powder',
    name: 'Coriander Powder',
    shortDesc: 'Sweet-citrus base note for every Indian gravy.',
    origin: 'Kota, Rajasthan',
    category: 'powders',
    variants: [{ description: 'Standard', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-spice-leaf via-spice-cardamom to-spice-pepper',
    ink: 'text-spice-ivory',
    icon: '🌿',
  },
  {
    slug: 'cumin-powder',
    name: 'Cumin Powder',
    shortDesc: 'Slow-roasted before milling for deep, smoky aroma.',
    origin: 'Unjha, Gujarat',
    category: 'powders',
    variants: [{ description: 'Roasted', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-amber-700 via-amber-800 to-spice-pepper',
    ink: 'text-spice-ivory',
    icon: '🟤',
  },
  {
    slug: 'black-pepper-powder',
    name: 'Black Pepper Powder',
    shortDesc: 'Tellicherry — bold, citrus-piney, gloss-black.',
    origin: 'Tellicherry, Kerala',
    category: 'powders',
    variants: [{ description: 'Tellicherry · fine grind', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-neutral-700 via-spice-pepper to-black',
    ink: 'text-spice-ivory',
    icon: '⚫',
  },
  {
    slug: 'asafoetida-powder',
    name: 'Asafoetida (Hing) Powder',
    shortDesc: 'A pinch transforms dal — savoury, allium-deep.',
    origin: 'Hadik, blended in India',
    category: 'powders',
    variants: [{ description: 'Compounded · gluten-free', pack: '50g · 100g' }],
    tone: 'bg-gradient-to-br from-yellow-200 via-amber-300 to-amber-500',
    ink: 'text-spice-maroon',
    icon: '🟨',
  },
  {
    slug: 'mango-powder',
    name: 'Mango Powder (Amchur)',
    shortDesc: 'Sun-dried green mango — bright sour finish.',
    origin: 'Uttar Pradesh',
    category: 'powders',
    variants: [{ description: 'Premium', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500',
    ink: 'text-spice-maroon',
    icon: '🥭',
  },
  {
    slug: 'black-salt',
    name: 'Black Salt (Kala Namak)',
    shortDesc: 'Mineral-rich, sulphurous — chaat-essential.',
    origin: 'Himalayan foothills',
    category: 'powders',
    variants: [{ description: 'Fine grind', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-stone-500 via-stone-700 to-spice-pepper',
    ink: 'text-spice-ivory',
    icon: '🧂',
  },
  {
    slug: 'ginger-powder',
    name: 'Ginger Powder',
    shortDesc: 'Sun-dried Cochin ginger — warm, lemony bite.',
    origin: 'Cochin, Kerala',
    category: 'powders',
    variants: [{ description: 'Standard', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700',
    ink: 'text-spice-maroon',
    icon: '🫚',
  },
  {
    slug: 'cardamom-powder',
    name: 'Cardamom Powder',
    shortDesc: 'Freshly ground green cardamom — sweet, floral, intense.',
    origin: 'Idukki, Kerala',
    category: 'powders',
    variants: [{ description: 'Premium · stone-ground', pack: '50g · 200g' }],
    tone: 'bg-gradient-to-br from-spice-mint via-spice-leaf to-emerald-800',
    ink: 'text-white',
    icon: '🟢',
  },
  {
    slug: 'cinnamon-powder',
    name: 'Cinnamon Powder',
    shortDesc: 'Sweet Ceylon cinnamon — warm, mellow, never bitter.',
    origin: 'Munnar, Kerala',
    category: 'powders',
    variants: [{ description: 'Ceylon · fine grind', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-orange-700 via-amber-800 to-stone-900',
    ink: 'text-white',
    icon: '🟫',
  },
  {
    slug: 'pink-salt',
    name: 'Pink Himalayan Salt',
    shortDesc: 'Hand-mined rock salt — mineral-rich, gently mineral-sweet.',
    origin: 'Punjab foothills, Himalayas',
    category: 'powders',
    variants: [{ description: 'Fine grind', pack: '200g · 1kg' }],
    tone: 'bg-gradient-to-br from-pink-200 via-rose-400 to-rose-700',
    ink: 'text-spice-maroon',
    icon: '🧂',
  },
  {
    slug: 'white-pepper-powder',
    name: 'White Pepper Powder',
    shortDesc: 'Fermented & polished pepper — sharper, less aromatic than black.',
    origin: 'Sarawak / Tellicherry, Kerala',
    category: 'powders',
    variants: [{ description: 'Fine grind', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-stone-200 via-stone-400 to-stone-600',
    ink: 'text-spice-pepper',
    icon: '⚪',
  },

  // ── Whole seeds ──────────────────────────────────────────────────────
  {
    slug: 'mustard-seeds',
    name: 'Mustard Seeds',
    shortDesc: 'Black mustard — pop them in hot oil.',
    origin: 'Rajasthan',
    category: 'seeds',
    variants: [{ description: 'Black · whole', pack: '200g · 1kg' }],
    tone: 'bg-gradient-to-br from-yellow-700 via-amber-800 to-spice-pepper',
    ink: 'text-spice-ivory',
    icon: '🌰',
  },
  {
    slug: 'cumin-seeds',
    name: 'Cumin Seeds',
    shortDesc: 'Whole jeera — earthy, perfect for tempering.',
    origin: 'Unjha, Gujarat',
    category: 'seeds',
    variants: [{ description: 'Standard · whole', pack: '200g · 1kg' }],
    tone: 'bg-gradient-to-br from-amber-600 via-amber-800 to-spice-pepper',
    ink: 'text-spice-ivory',
    icon: '🌾',
  },

  // ── Masalas (signature blends) ───────────────────────────────────────
  {
    slug: 'garam-masala',
    name: 'Garam Masala',
    shortDesc: 'Family blend No. 7 — warming, fragrant, slow-roasted.',
    origin: 'Blended in India',
    category: 'masalas',
    variants: [{ description: 'Signature blend', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-spice-chili via-spice-red to-spice-maroon',
    ink: 'text-spice-ivory',
    icon: '🍂',
  },
  {
    slug: 'chole-masala',
    name: 'Chole Masala',
    shortDesc: 'Punjabi-style — anardana, dry mango, ginger.',
    origin: 'Blended in India',
    category: 'masalas',
    variants: [{ description: 'Signature blend', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-orange-600 via-spice-chili to-spice-maroon',
    ink: 'text-spice-ivory',
    icon: '🫘',
  },
  {
    slug: 'curry-masala',
    name: 'Curry Masala',
    shortDesc: 'Everyday gravies — turmeric, coriander, chilli.',
    origin: 'Blended in India',
    category: 'masalas',
    variants: [{ description: 'Signature blend', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-spice-turmeric via-spice-gold to-spice-chili',
    ink: 'text-spice-maroon',
    icon: '🍛',
  },
  {
    slug: 'tandoori-masala',
    name: 'Tandoori Masala',
    shortDesc: 'Smoky, deep red — for chicken, paneer, naan.',
    origin: 'Blended in India',
    category: 'masalas',
    variants: [{ description: 'Signature blend', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-spice-red via-spice-crimson to-spice-pepper',
    ink: 'text-spice-ivory',
    icon: '🍗',
  },
  {
    slug: 'biryani-masala',
    name: 'Biryani Masala',
    shortDesc: 'Saffron, mace, star anise — long-grain rice ready.',
    origin: 'Blended in India',
    category: 'masalas',
    variants: [{ description: 'Signature blend', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-spice-saffron via-spice-chili to-spice-crimson',
    ink: 'text-spice-ivory',
    icon: '🍚',
  },
  {
    slug: 'chicken-masala',
    name: 'Chicken Masala',
    shortDesc: 'Balanced heat & body for every chicken curry.',
    origin: 'Blended in India',
    category: 'masalas',
    variants: [{ description: 'Signature blend', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-spice-chili via-red-700 to-spice-maroon',
    ink: 'text-spice-ivory',
    icon: '🍗',
  },
  {
    slug: 'mutton-masala',
    name: 'Mutton Masala',
    shortDesc: 'Robust, peppery — slow-cooked mutton & lamb.',
    origin: 'Blended in India',
    category: 'masalas',
    variants: [{ description: 'Signature blend', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-red-900 via-spice-maroon to-spice-pepper',
    ink: 'text-spice-ivory',
    icon: '🥩',
  },
  {
    slug: 'kitchen-king-masala',
    name: 'Kitchen King Masala',
    shortDesc: 'The all-rounder — vegetables, dals, paneer.',
    origin: 'Blended in India',
    category: 'masalas',
    variants: [{ description: 'Signature blend', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-spice-gold via-spice-chili to-spice-crimson',
    ink: 'text-spice-ivory',
    icon: '👑',
  },

  // ── Whole spices ─────────────────────────────────────────────────────
  {
    slug: 'black-pepper-whole',
    name: 'Whole Black Pepper',
    shortDesc: 'Tellicherry whole peppercorns — table-grinder ready.',
    origin: 'Tellicherry, Kerala',
    category: 'whole',
    variants: [{ description: 'Tellicherry TGSEB', pack: '100g · 500g · 1kg' }],
    tone: 'bg-gradient-to-br from-neutral-700 via-spice-pepper to-black',
    ink: 'text-spice-ivory',
    icon: '⚫',
  },
  {
    slug: 'bay-leaves',
    name: 'Whole Bay Leaves',
    shortDesc: 'Indian tej patta — cinnamon-like, for pulao & dal.',
    origin: 'Uttarakhand',
    category: 'whole',
    variants: [{ description: 'Hand-sorted', pack: '50g · 200g' }],
    tone: 'bg-gradient-to-br from-spice-leaf via-spice-cardamom to-emerald-900',
    ink: 'text-spice-ivory',
    icon: '🍃',
  },

  // ── Additional whole spices ──────────────────────────────────────────
  {
    slug: 'cloves',
    name: 'Whole Cloves (Laung)',
    shortDesc: 'Aromatic, sweet-pungent — for biryani, masala chai.',
    origin: 'Madagascar / Kerala',
    category: 'whole',
    variants: [{ description: 'Hand-sorted whole buds', pack: '50g · 200g' }],
    tone: 'bg-gradient-to-br from-amber-900 via-stone-800 to-black',
    ink: 'text-spice-ivory',
    icon: '🌰',
  },
  {
    slug: 'nutmeg',
    name: 'Whole Nutmeg (Jaiphal)',
    shortDesc: 'Warm, sweet — grate fresh into desserts and pulao.',
    origin: 'Kerala',
    category: 'whole',
    variants: [{ description: 'Whole nuts', pack: '50g · 200g' }],
    tone: 'bg-gradient-to-br from-amber-800 via-amber-900 to-stone-900',
    ink: 'text-spice-ivory',
    icon: '🌰',
  },
  {
    slug: 'jaipatri',
    name: 'Jaipatri (Mace)',
    shortDesc: 'Lacy outer covering of nutmeg — delicate, floral.',
    origin: 'Kerala',
    category: 'whole',
    variants: [{ description: 'Whole blades', pack: '25g · 100g' }],
    tone: 'bg-gradient-to-br from-orange-700 via-amber-800 to-stone-900',
    ink: 'text-spice-ivory',
    icon: '✴️',
  },
  {
    slug: 'cinnamon-stick',
    name: 'Cinnamon Sticks',
    shortDesc: 'True Ceylon cinnamon quills — sweet, mellow, paper-thin.',
    origin: 'Munnar, Kerala',
    category: 'whole',
    variants: [{ description: 'Ceylon quills', pack: '50g · 200g' }],
    tone: 'bg-gradient-to-br from-orange-700 via-amber-800 to-stone-900',
    ink: 'text-spice-ivory',
    icon: '🟫',
  },
  {
    slug: 'green-cardamom-whole',
    name: 'Whole Green Cardamom',
    shortDesc: 'Plump green pods from the Idukki hills.',
    origin: 'Idukki, Kerala',
    category: 'whole',
    variants: [{ description: '8mm AAA grade', pack: '50g · 200g' }],
    tone: 'bg-gradient-to-br from-spice-mint via-spice-leaf to-emerald-800',
    ink: 'text-spice-ivory',
    icon: '🟢',
  },
  {
    slug: 'black-cardamom-whole',
    name: 'Whole Black Cardamom',
    shortDesc: 'Smoky, resinous — for slow-cooked meats and rice.',
    origin: 'Sikkim',
    category: 'whole',
    variants: [{ description: 'Hand-sorted pods', pack: '50g · 200g' }],
    tone: 'bg-gradient-to-br from-stone-700 via-spice-pepper to-black',
    ink: 'text-spice-ivory',
    icon: '⚫',
  },
  {
    slug: 'white-pepper-whole',
    name: 'Whole White Pepper',
    shortDesc: 'Fermented, polished peppercorns — sharper, less aromatic.',
    origin: 'Sarawak / Tellicherry, Kerala',
    category: 'whole',
    variants: [{ description: 'Whole peppercorns', pack: '50g · 200g' }],
    tone: 'bg-gradient-to-br from-stone-200 via-stone-400 to-stone-600',
    ink: 'text-spice-pepper',
    icon: '⚪',
  },
  {
    slug: 'turmeric-whole',
    name: 'Whole Turmeric Fingers',
    shortDesc: 'Sun-dried turmeric rhizome — grate or grind fresh.',
    origin: 'Erode, Tamil Nadu',
    category: 'whole',
    variants: [{ description: 'Premium fingers', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-spice-saffron via-spice-turmeric to-spice-gold',
    ink: 'text-spice-maroon',
    icon: '🟡',
  },
  {
    slug: 'dried-ginger',
    name: 'Whole Dried Ginger (Sonth)',
    shortDesc: 'Sun-dried Cochin ginger — for masala chai and chutneys.',
    origin: 'Cochin, Kerala',
    category: 'whole',
    variants: [{ description: 'Sun-dried whole', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700',
    ink: 'text-spice-maroon',
    icon: '🫚',
  },
  {
    slug: 'byadgi-chilli',
    name: 'Whole Byadgi Chillies',
    shortDesc: 'Deep red Karnataka chillies — colour without much heat.',
    origin: 'Byadgi, Karnataka',
    category: 'whole',
    variants: [{ description: 'Stemless, hand-sorted', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-spice-chili via-spice-red to-spice-crimson',
    ink: 'text-spice-ivory',
    icon: '🌶️',
  },
  {
    slug: 'fenugreek-leaves',
    name: 'Kasuri Methi',
    shortDesc: 'Sun-dried fenugreek leaves — bitter, herbal finish.',
    origin: 'Rajasthan',
    category: 'whole',
    variants: [{ description: 'Hand-rubbed', pack: '25g · 100g' }],
    tone: 'bg-gradient-to-br from-spice-leaf via-spice-cardamom to-emerald-900',
    ink: 'text-spice-ivory',
    icon: '🌿',
  },

  // ── Additional seeds ─────────────────────────────────────────────────
  {
    slug: 'coriander-seeds',
    name: 'Whole Coriander Seeds',
    shortDesc: 'Sweet-citrus base — toast & grind for every gravy.',
    origin: 'Kota, Rajasthan',
    category: 'seeds',
    variants: [{ description: 'Hand-sorted whole', pack: '200g · 1kg' }],
    tone: 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700',
    ink: 'text-spice-maroon',
    icon: '🌾',
  },
  {
    slug: 'fennel-seeds',
    name: 'Fennel Seeds (Saunf)',
    shortDesc: 'Sweet, anise-like — for chai, mukhwas, & paan.',
    origin: 'Gujarat',
    category: 'seeds',
    variants: [{ description: 'Green saunf, whole', pack: '200g · 1kg' }],
    tone: 'bg-gradient-to-br from-spice-mint via-lime-600 to-emerald-800',
    ink: 'text-spice-ivory',
    icon: '🌾',
  },
  {
    slug: 'fenugreek-seeds',
    name: 'Fenugreek Seeds (Methi)',
    shortDesc: 'Bitter, maple-toned — essential for pickles & curries.',
    origin: 'Rajasthan',
    category: 'seeds',
    variants: [{ description: 'Whole seeds', pack: '200g · 1kg' }],
    tone: 'bg-gradient-to-br from-yellow-700 via-amber-800 to-stone-900',
    ink: 'text-spice-ivory',
    icon: '🌱',
  },
  {
    slug: 'carom-seeds',
    name: 'Carom Seeds (Ajwain)',
    shortDesc: 'Sharp, thyme-like — for parathas, dals, and digestion.',
    origin: 'Madhya Pradesh',
    category: 'seeds',
    variants: [{ description: 'Whole seeds', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-amber-700 via-amber-900 to-stone-900',
    ink: 'text-spice-ivory',
    icon: '🌾',
  },

  // ── Additional masalas ───────────────────────────────────────────────
  {
    slug: 'chaat-masala',
    name: 'Chaat Masala',
    shortDesc: 'Tangy, sulphurous, salty — sprinkle on everything chaat.',
    origin: 'Blended in India',
    category: 'masalas',
    variants: [{ description: 'Signature blend', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-spice-gold via-spice-chili to-spice-crimson',
    ink: 'text-spice-ivory',
    icon: '🥄',
  },
  {
    slug: 'chai-masala',
    name: 'Chai Masala',
    shortDesc: 'Cardamom, ginger, clove, pepper — your perfect cup.',
    origin: 'Blended in India',
    category: 'masalas',
    variants: [{ description: 'Signature blend', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-amber-700 via-amber-900 to-stone-900',
    ink: 'text-spice-ivory',
    icon: '🫖',
  },
  {
    slug: 'paneer-masala',
    name: 'Paneer Masala',
    shortDesc: 'Mellow, creamy — for paneer butter masala & tikka.',
    origin: 'Blended in India',
    category: 'masalas',
    variants: [{ description: 'Signature blend', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-spice-saffron via-spice-chili to-spice-crimson',
    ink: 'text-spice-ivory',
    icon: '🥄',
  },
  {
    slug: 'fish-masala',
    name: 'Fish Masala',
    shortDesc: 'Mustard, methi, kokum — for coastal-style fish curries.',
    origin: 'Blended in India',
    category: 'masalas',
    variants: [{ description: 'Signature blend', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-spice-chili via-spice-red to-spice-maroon',
    ink: 'text-spice-ivory',
    icon: '🐟',
  },
  {
    slug: 'pav-bhaji-masala',
    name: 'Pav Bhaji Masala',
    shortDesc: 'Bombay street-side classic — buttery, bright, bold.',
    origin: 'Blended in India',
    category: 'masalas',
    variants: [{ description: 'Signature blend', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-spice-chili via-spice-red to-spice-maroon',
    ink: 'text-spice-ivory',
    icon: '🥘',
  },
  {
    slug: 'sambar-masala',
    name: 'Sambar Masala',
    shortDesc: 'South Indian classic — toor dal, tamarind, coconut.',
    origin: 'Blended in India',
    category: 'masalas',
    variants: [{ description: 'Signature blend', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-spice-turmeric via-orange-600 to-spice-crimson',
    ink: 'text-spice-ivory',
    icon: '🥣',
  },
  {
    slug: 'chicken-biryani-masala',
    name: 'Chicken Biryani Masala',
    shortDesc: 'Hyderabadi-style — for tender, aromatic chicken biryani.',
    origin: 'Blended in India',
    category: 'masalas',
    variants: [{ description: 'Signature blend', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-spice-saffron via-spice-chili to-spice-crimson',
    ink: 'text-spice-ivory',
    icon: '🍚',
  },
  {
    slug: 'mutton-biryani-masala',
    name: 'Mutton Biryani Masala',
    shortDesc: 'Lucknowi-style — for slow-cooked, fragrant mutton biryani.',
    origin: 'Blended in India',
    category: 'masalas',
    variants: [{ description: 'Signature blend', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-red-900 via-spice-maroon to-spice-pepper',
    ink: 'text-spice-ivory',
    icon: '🍚',
  },
  {
    slug: 'shahi-biryani-masala',
    name: 'Shahi Biryani Masala',
    shortDesc: 'Royal blend — saffron, mace, rose & nuts. For special occasions.',
    origin: 'Blended in India',
    category: 'masalas',
    variants: [{ description: 'Signature blend', pack: '100g · 500g' }],
    tone: 'bg-gradient-to-br from-spice-saffron via-spice-gold to-spice-crimson',
    ink: 'text-spice-ivory',
    icon: '👑',
  },

  // ── Indian Pickles (Achaar) ──────────────────────────────────────────
  {
    slug: 'mango-pickle',
    name: 'Mango Pickle',
    shortDesc: 'Aam ka achaar — raw mango in mustard oil & spices.',
    origin: 'Punjab',
    category: 'pickles',
    variants: [{ description: 'Traditional recipe', pack: '300g · 1kg' }],
    tone: 'bg-gradient-to-br from-spice-turmeric via-orange-500 to-spice-crimson',
    ink: 'text-spice-ivory',
    icon: '🥭',
  },
  {
    slug: 'lime-pickle',
    name: 'Lime Pickle',
    shortDesc: 'Nimbu ka achaar — tangy, sun-cured lime.',
    origin: 'Andhra Pradesh',
    category: 'pickles',
    variants: [{ description: 'Traditional recipe', pack: '300g · 1kg' }],
    tone: 'bg-gradient-to-br from-spice-saffron via-spice-turmeric to-spice-gold',
    ink: 'text-spice-maroon',
    icon: '🍋',
  },
  {
    slug: 'lime-chilli-pickle',
    name: 'Lime & Chilli Pickle',
    shortDesc: 'Lime tang meets chilli heat — twice as bold.',
    origin: 'Andhra Pradesh',
    category: 'pickles',
    variants: [{ description: 'Traditional recipe', pack: '300g · 1kg' }],
    tone: 'bg-gradient-to-br from-spice-chili via-spice-red to-spice-crimson',
    ink: 'text-spice-ivory',
    icon: '🌶️',
  },
  {
    slug: 'green-chilli-pickle',
    name: 'Green Chilli Pickle',
    shortDesc: 'Hari mirch achaar — whole green chillies, sharp & sour.',
    origin: 'Punjab',
    category: 'pickles',
    variants: [{ description: 'Traditional recipe', pack: '300g · 1kg' }],
    tone: 'bg-gradient-to-br from-spice-mint via-spice-cardamom to-emerald-800',
    ink: 'text-spice-ivory',
    icon: '🌶️',
  },
  {
    slug: 'mixed-pickle',
    name: 'Mixed Pickle',
    shortDesc: 'Mango, lime, chilli, carrot & ginger — the everything achaar.',
    origin: 'Punjab',
    category: 'pickles',
    variants: [{ description: 'Traditional recipe', pack: '300g · 1kg' }],
    tone: 'bg-gradient-to-br from-spice-gold via-spice-chili to-spice-maroon',
    ink: 'text-spice-ivory',
    icon: '🫙',
  },
];

/** Per-spice visual identity used as a stand-in for product photography.
 *  Maps a product (by slug or by keywords in its name) to:
 *  - `tone` / `ink` — used by colorful catalog tiles (rich text overlay)
 *  - `pile`        — hex colour of the spice powder, used to draw the
 *                    "powder pile on dark" composition for product cards
 *  - `icon`        — emoji shown above the pile (the "whole spice on top")
 *  - `image`       — optional path to a real product photo. If set, the
 *                    photo replaces the powder-pile fallback. Drop files
 *                    into `/public/products/<slug>.jpg` and reference here. */
export interface ProductVisual {
  tone: string;
  ink: string;
  pile: string;
  icon: string;
  image?: string;
}

const DEFAULT_VISUAL: ProductVisual = {
  tone: 'bg-gradient-to-br from-spice-saffron via-spice-turmeric to-spice-chili',
  ink: 'text-spice-maroon',
  pile: '#F5B400',
  icon: '🌶️',
};

/** Keyword → visual map. First match wins, so order is important —
 *  put more specific keywords above more generic ones. */
const KEYWORD_VISUALS: Array<{ test: RegExp; v: ProductVisual }> = [
  // ── Pure spices ────────────────────────────────────────────────────
  { test: /turmeric|haldi/i, v: {
      tone: 'bg-gradient-to-br from-spice-saffron via-spice-turmeric to-spice-gold',
      ink: 'text-spice-maroon', pile: '#F5B400', icon: '🟡',
    } },
  { test: /chilli|chili|mirch|paprika/i, v: {
      tone: 'bg-gradient-to-br from-spice-chili via-spice-red to-spice-crimson',
      ink: 'text-white', pile: '#D81B23', icon: '🌶️',
    } },
  { test: /coriander|dhaniya/i, v: {
      tone: 'bg-gradient-to-br from-spice-leaf via-spice-cardamom to-spice-pepper',
      ink: 'text-white', pile: '#7B6A3A', icon: '🌿',
    } },
  { test: /cumin|jeera/i, v: {
      tone: 'bg-gradient-to-br from-amber-600 via-amber-800 to-spice-pepper',
      ink: 'text-white', pile: '#9A6B2F', icon: '🌾',
    } },
  { test: /mustard|sarson/i, v: {
      tone: 'bg-gradient-to-br from-yellow-600 via-amber-800 to-spice-pepper',
      ink: 'text-white', pile: '#C58A2C', icon: '🌰',
    } },
  { test: /asafoetida|hing/i, v: {
      tone: 'bg-gradient-to-br from-yellow-200 via-amber-300 to-amber-500',
      ink: 'text-spice-maroon', pile: '#E5C547', icon: '🟨',
    } },
  { test: /amchur|mango powder|dry mango/i, v: {
      tone: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500',
      ink: 'text-spice-maroon', pile: '#D4A848', icon: '🥭',
    } },
  { test: /black salt|kala namak/i, v: {
      tone: 'bg-gradient-to-br from-stone-500 via-stone-700 to-spice-pepper',
      ink: 'text-white', pile: '#6B5750', icon: '🧂',
    } },
  { test: /pink salt|himalayan salt|rock salt/i, v: {
      tone: 'bg-gradient-to-br from-pink-200 via-rose-400 to-rose-700',
      ink: 'text-spice-maroon', pile: '#E58FAB', icon: '🧂',
    } },
  { test: /ginger|sonth|adrak/i, v: {
      tone: 'bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700',
      ink: 'text-spice-maroon', pile: '#D6B581', icon: '🫚',
    } },
  // ── Cardamom ───────────────────────────────────────────────────────
  { test: /green cardamom|elaichi/i, v: {
      tone: 'bg-gradient-to-br from-spice-mint via-spice-leaf to-emerald-800',
      ink: 'text-white', pile: '#7BB04A', icon: '🟢',
    } },
  { test: /black cardamom/i, v: {
      tone: 'bg-gradient-to-br from-stone-700 via-spice-pepper to-black',
      ink: 'text-white', pile: '#3D2F26', icon: '⚫',
    } },
  { test: /cardamom/i, v: {
      tone: 'bg-gradient-to-br from-spice-leaf via-spice-cardamom to-emerald-900',
      ink: 'text-white', pile: '#7BB04A', icon: '🌿',
    } },
  // ── Pepper ─────────────────────────────────────────────────────────
  { test: /black pepper|kali mirch|peppercorn|tellicherry|malabar pepper/i, v: {
      tone: 'bg-gradient-to-br from-neutral-700 via-spice-pepper to-black',
      ink: 'text-white', pile: '#5A4A3F', icon: '⚫',
    } },
  { test: /white pepper/i, v: {
      tone: 'bg-gradient-to-br from-stone-200 via-stone-400 to-stone-600',
      ink: 'text-spice-pepper', pile: '#E0D5B0', icon: '⚪',
    } },
  // ── Other whole spices ─────────────────────────────────────────────
  { test: /bay leaf|bay leaves|tej patta/i, v: {
      tone: 'bg-gradient-to-br from-spice-leaf via-spice-cardamom to-emerald-900',
      ink: 'text-white', pile: '#5BA046', icon: '🍃',
    } },
  { test: /cinnamon|dalchini/i, v: {
      tone: 'bg-gradient-to-br from-orange-700 via-amber-800 to-stone-900',
      ink: 'text-white', pile: '#B5651D', icon: '🟫',
    } },
  { test: /clove|laung/i, v: {
      tone: 'bg-gradient-to-br from-amber-900 via-stone-800 to-black',
      ink: 'text-white', pile: '#5C3D2E', icon: '🌰',
    } },
  { test: /fenugreek|methi/i, v: {
      tone: 'bg-gradient-to-br from-yellow-700 via-amber-800 to-stone-900',
      ink: 'text-white', pile: '#A87B2C', icon: '🌱',
    } },
  { test: /fennel|saunf/i, v: {
      tone: 'bg-gradient-to-br from-spice-mint via-lime-600 to-emerald-800',
      ink: 'text-white', pile: '#9BC468', icon: '🌾',
    } },
  { test: /nigella|kalonji/i, v: {
      tone: 'bg-gradient-to-br from-stone-700 via-stone-900 to-black',
      ink: 'text-white', pile: '#2A2522', icon: '⚫',
    } },
  { test: /star anise|chakra phool/i, v: {
      tone: 'bg-gradient-to-br from-amber-800 via-stone-800 to-black',
      ink: 'text-white', pile: '#8B5A2B', icon: '✴️',
    } },
  { test: /saffron|kesar/i, v: {
      tone: 'bg-gradient-to-br from-spice-saffron via-spice-chili to-spice-crimson',
      ink: 'text-white', pile: '#E5870C', icon: '🌼',
    } },
  // ── Masalas / blends ───────────────────────────────────────────────
  { test: /garam masala/i, v: {
      tone: 'bg-gradient-to-br from-spice-chili via-spice-red to-spice-maroon',
      ink: 'text-white', pile: '#9C3826', icon: '🍂',
    } },
  { test: /chole|chana masala/i, v: {
      tone: 'bg-gradient-to-br from-orange-600 via-spice-chili to-spice-maroon',
      ink: 'text-white', pile: '#B95028', icon: '🫘',
    } },
  { test: /curry masala|curry powder/i, v: {
      tone: 'bg-gradient-to-br from-spice-turmeric via-spice-gold to-spice-chili',
      ink: 'text-spice-maroon', pile: '#D8951A', icon: '🍛',
    } },
  { test: /tandoori/i, v: {
      tone: 'bg-gradient-to-br from-spice-red via-spice-crimson to-spice-pepper',
      ink: 'text-white', pile: '#B81E20', icon: '🍗',
    } },
  { test: /biryani/i, v: {
      tone: 'bg-gradient-to-br from-spice-saffron via-spice-chili to-spice-crimson',
      ink: 'text-white', pile: '#D6862A', icon: '🍚',
    } },
  { test: /chicken masala/i, v: {
      tone: 'bg-gradient-to-br from-spice-chili via-red-700 to-spice-maroon',
      ink: 'text-white', pile: '#A33020', icon: '🍗',
    } },
  { test: /meat masala|mutton masala/i, v: {
      tone: 'bg-gradient-to-br from-red-900 via-spice-maroon to-spice-pepper',
      ink: 'text-white', pile: '#7A1F18', icon: '🥩',
    } },
  { test: /kitchen king/i, v: {
      tone: 'bg-gradient-to-br from-spice-gold via-spice-chili to-spice-crimson',
      ink: 'text-white', pile: '#C68030', icon: '👑',
    } },
  { test: /pav bhaji/i, v: {
      tone: 'bg-gradient-to-br from-spice-chili via-spice-red to-spice-maroon',
      ink: 'text-white', pile: '#A93220', icon: '🥘',
    } },
  { test: /sambar|rasam/i, v: {
      tone: 'bg-gradient-to-br from-spice-turmeric via-orange-600 to-spice-crimson',
      ink: 'text-white', pile: '#C46220', icon: '🥣',
    } },
];

/** Image auto-detection: looks in `public/products/` at server startup and
 *  picks up any `<slug>.{jpg,jpeg,png,webp}` file. Drop a file in with the
 *  right slug, refresh, and it appears. No code changes needed.
 *
 *  Manual overrides can still be added below if you want a different filename
 *  than `<slug>`. Manual entries take priority over auto-detection. */
const MANUAL_IMAGE_OVERRIDES: Record<string, string> = {
  // Filename typos in uploaded photos — point correct slugs at the misspelled files
  // so we don't have to rename anything.
  'cardamom-powder':       '/products/cardemom-powder.png',
  'cinnamon-powder':       '/products/cinnamom-powder.png',
  'cinnamon-stick':        '/products/cinnamom.png',
  'cumin-seeds':           '/products/cumin.png',
  'coriander-seeds':       '/products/coriander.png',
  'mustard-seeds':         '/products/mustard.png',
  'fennel-seeds':          '/products/funnel-seeds.png',
  'bay-leaves':            '/products/bay-leaf.png',
  'black-pepper-whole':    '/products/black-pepper.png',
  // Products seeded in the API with slugs that differ from the photo file names
  'black-pepper-tellicherry': '/products/black-pepper.png',
  'cumin-whole':           '/products/cumin.png',
  'cardamom-green':        '/products/green-cardemom.png',
  'white-pepper-whole':    '/products/white-pepper.png',
  'green-cardamom-whole':  '/products/green-cardemom.png',
  'black-cardamom-whole':  '/products/whole-black-cardemom.png',
  'chole-masala':          '/products/chhole-masala.png',
  'sambar-masala':         '/products/sambhar-masala.png',
  'mango-pickle':          '/products/mano-pickle.png',
  'mixed-pickle':          '/products/mix-pickle.png',
};

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;

let _imageCache: Record<string, string> | null = null;

function getProductImagesMap(): Record<string, string> {
  if (_imageCache) return _imageCache;

  const map: Record<string, string> = { ...MANUAL_IMAGE_OVERRIDES };

  // On the server, scan the public/products directory for slug-named files.
  // (Bundled/runtime safe — fs is only required server-side.)
  if (typeof window === 'undefined') {
    try {
      // Lazy-require so client bundles don't try to include `fs`.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('node:fs') as typeof import('node:fs');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('node:path') as typeof import('node:path');
      const dir = path.join(process.cwd(), 'public', 'products');
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const dot = file.lastIndexOf('.');
          if (dot < 0) continue;
          const slug = file.slice(0, dot).toLowerCase();
          const ext = file.slice(dot + 1).toLowerCase() as (typeof IMAGE_EXTENSIONS)[number];
          if (!IMAGE_EXTENSIONS.includes(ext)) continue;
          // Don't overwrite manual overrides.
          if (!map[slug]) map[slug] = `/products/${file}`;
        }
      }
    } catch {
      // No products directory or fs unavailable — ignore, fallback to manual map.
    }
  }

  _imageCache = map;
  return map;
}

/** @deprecated Use `getProductImagesMap()` instead. Kept for backward compat. */
export const PRODUCT_IMAGES = new Proxy({} as Record<string, string>, {
  get(_, key: string) {
    return getProductImagesMap()[key];
  },
  has(_, key: string) {
    return key in getProductImagesMap();
  },
  ownKeys() {
    return Object.keys(getProductImagesMap());
  },
  getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  },
});

/** Resolves the visual for a product given any combination of slug, name, or
 *  category. Order: exact slug match → keyword match on name → category
 *  default → universal default. */
export function getProductVisual(input: {
  slug?: string;
  name?: string;
  category?: string;
}): ProductVisual {
  const image = input.slug ? PRODUCT_IMAGES[input.slug] : undefined;

  // 1. Exact slug match against catalog
  if (input.slug) {
    const hit = CATALOG.find((p) => p.slug === input.slug);
    if (hit) {
      const byName = lookupByKeyword(hit.name) ?? lookupByKeyword(hit.slug);
      return {
        tone: hit.tone,
        ink: hit.ink,
        pile: byName?.pile ?? DEFAULT_VISUAL.pile,
        icon: hit.icon,
        image,
      };
    }
  }

  // 2. Keyword match on name/slug
  const byKw = lookupByKeyword(`${input.name ?? ''} ${input.slug ?? ''}`);
  if (byKw) {
    return { ...byKw, image };
  }

  // 3. Category-level fallback
  if (input.category) {
    if (/masala|blend/i.test(input.category)) {
      return {
        tone: 'bg-gradient-to-br from-spice-chili via-spice-red to-spice-maroon',
        ink: 'text-white', pile: '#A33020', icon: '🥄', image,
      };
    }
    if (/seed/i.test(input.category)) {
      return {
        tone: 'bg-gradient-to-br from-amber-600 via-amber-800 to-spice-pepper',
        ink: 'text-white', pile: '#9A6B2F', icon: '🌾', image,
      };
    }
    if (/whole/i.test(input.category)) {
      return {
        tone: 'bg-gradient-to-br from-stone-700 via-spice-pepper to-black',
        ink: 'text-white', pile: '#5A4A3F', icon: '🌿', image,
      };
    }
  }

  return { ...DEFAULT_VISUAL, image };
}

function lookupByKeyword(haystack: string): ProductVisual | null {
  for (const { test, v } of KEYWORD_VISUALS) {
    if (test.test(haystack)) return v;
  }
  return null;
}

export function filterCatalog(category?: string, q?: string): CatalogProduct[] {
  let items = CATALOG;
  if (category && category in CATEGORY_META) {
    items = items.filter((p) => p.category === category);
  }
  if (q) {
    const needle = q.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.shortDesc.toLowerCase().includes(needle) ||
        p.origin.toLowerCase().includes(needle),
    );
  }
  return items;
}
