# Product images

Drop product photos in here, then register them in
`apps/storefront/src/lib/catalog.ts` → `PRODUCT_IMAGES`.

## Recommended specs

- **Format**: JPG or WebP (smaller files), or PNG if you need transparency
- **Aspect ratio**: square (1:1) — the tile is rendered as `aspect-square`
- **Resolution**: 800×800 minimum, 1200×1200 ideal
- **Style**: dark/black backdrop with the spice composed centrally
  (matches the dark site theme — see the existing fallback for reference)

## How to add an image

1. Save the file as `apps/storefront/public/products/<slug>.jpg`
   where `<slug>` matches the product slug (e.g. `turmeric-powder.jpg`).
2. Open `apps/storefront/src/lib/catalog.ts` and add an entry to `PRODUCT_IMAGES`:
   ```ts
   export const PRODUCT_IMAGES: Record<string, string> = {
     'turmeric-powder': '/products/turmeric-powder.jpg',
   };
   ```
3. Refresh `/shop` — the photo will replace the powder-pile fallback.

## Slugs in the static catalog

The default static catalog uses these slugs:

| Slug | Product |
|---|---|
| `turmeric-powder` | Turmeric Powder |
| `chilli-powder` | Red Chilli Powder |
| `coriander-powder` | Coriander Powder |
| `cumin-powder` | Cumin Powder |
| `black-pepper-powder` | Black Pepper Powder |
| `asafoetida-powder` | Asafoetida (Hing) Powder |
| `mango-powder` | Mango Powder (Amchur) |
| `black-salt` | Black Salt (Kala Namak) |
| `ginger-powder` | Ginger Powder |
| `mustard-seeds` | Mustard Seeds |
| `cumin-seeds` | Cumin Seeds |
| `garam-masala` | Garam Masala |
| `chole-masala` | Chole Masala |
| `curry-masala` | Curry Masala |
| `tandoori-masala` | Tandoori Masala |
| `biryani-masala` | Biryani Masala |
| `chicken-masala` | Chicken Masala |
| `meat-masala` | Meat Masala |
| `kitchen-king-masala` | Kitchen King Masala |
| `black-pepper-whole` | Whole Black Pepper |
| `bay-leaves` | Whole Bay Leaves |

Products coming from the API use whatever slug the database contains. If the
slug doesn't match an entry in `PRODUCT_IMAGES`, the dark powder-pile tile is
shown automatically based on keyword matching against the product name.
