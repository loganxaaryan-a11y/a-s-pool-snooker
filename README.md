# A.S. Pool & Snooker Club — Kimi website redesign

GitHub Pages–ready, static HTML/CSS/JS website. No build command, database, or hosting subscription required.

## How to publish

1. Create a new public GitHub repository or open the existing website repository.
2. Upload the **contents of this folder** to the repository root (`index.html`, `assets/`, `data/`). The archival `reference/` folder is intentionally excluded from this publishing ZIP.
3. In GitHub **Settings → Pages**, select **Deploy from a branch**, branch `main`, folder `/(root)` and save.
4. Preview the published address on desktop and phone, click every location's map and phone links, and check every image. Add a custom domain later if desired.

For a quick local preview, open `index.html` or run `python -m http.server 8000` from this folder.

## What is included

- A photo-led, responsive homepage; modern forest-green/cream/amber visual language; responsive mobile navigation.
- 13 searchable club/location cards preserved from Kimi's version, with city filters, direct map links and contact links.
- Interactive Leaflet/OpenStreetMap branch map, synchronized with the filters and map-selection links.
- Individual club-detail overlays with three representative photos, contact and directions.
- Fully working gallery with filters, keyboard/lightbox controls and mobile swipe; optimized enhanced-image WebP assets.
- About, visit and events/contact sections, with a truthful **mailto** interaction (opens the visitor's email application; no backend/form submission).
- A dedicated optional, animated 8-ball discovery section with 15 pool balls and 13 branch choices; no third-party animation libraries.
- The old Kimi/Argon reference HTML is intentionally excluded from this public upload package. Keep your previous archive separately for rollback.

## Important owner-verification checklist BEFORE going live

1. **Confirm all 13 locations with the owner.** Current names and order follow the owner-shared QR directory, not the discarded Kimi/Argon alternatives. Confirm that no branch has since opened, closed or changed its name.
2. **Confirm map pins and addresses.** The latitude/longitude points were inherited from Kimi and are approximate pending confirmation; the address and linked Google business listing may not match the exact pin. The map explicitly notes this.
3. **Confirm phone numbers** for each club and whether the listed contact is authorized for business inquiries. Kimi uses several shared numbers.
4. **Confirm the central contact email** (`arvindkhant3588@gmail.com`), especially before publishing the email links and the contact form.
5. **Confirm operating hours and prices.** Kimi's original draft has conflicting, unverified 24-hour/late-night and equipment claims. These are retained under `draftHours`, `draftRating`, and `draftTables` in the data for easy checking but intentionally not displayed on the public page.
6. **Approve photo use and branch attribution.** The provided enhanced assets are AI-retouched from user-shared visual references; some changed architecture, signage, table arrangements and people, so they are used here as representative brand/gallery visuals, not claims of exact interiors at particular branches. Replace with owner-approved photography when available. `data/image-credits.json` documents the imagery.
7. Validate permission to republish any source photographs captured from third-party listing websites.
8. Add the owner's social account, official branding file, analytics and domain once provided. None were invented.

## Maintaining the locations

`data/locations.json` is a readable master list. For the no-build static site, `data/locations.js` contains the same array assigned to `window.CLUB_LOCATIONS`; update **both files** after editing a branch, or regenerate the JavaScript with:

```bash
python -c "from pathlib import Path; p=Path('data'); (p/'locations.js').write_text('window.CLUB_LOCATIONS = '+(p/'locations.json').read_text().rstrip()+';\\n')"
```

Coordinates should come from the owner's verified Google Maps listings. Do not publish estimated geo-pins as exact.

## Image optimization

Images are stored as compressed WebP files in `assets/images/` and referenced by local relative paths. This avoids the dead `watermarked_img_*.jpg` paths and large image payloads in the original Kimi HTML. Replace a file at the same path or change its path in the data/gallery definition.

## Technical constraints

The page itself works as static files. The interactive map and fonts depend on CDNs (Leaflet/OpenStreetMap tiles and Google Fonts). If they fail, the map shows a fallback and individual Google Maps directions remain available. The contact form has no server and will not silently pretend to send a message.


## Owner QR list and 8-ball discovery (2026-10-31 update)

The 13 branch **names and ordering** in `data/locations.json` come from the owner-shared QR page:
https://qr2.me-qr.com/link-list/PR155wep/show

1. Vastral
2. Maninagar (Bhairavnath)
3. Nikol
4. Shahibaug
5. C.G. Road
6. Maninagar (Jawahar Chowk)
7. K.K. Nagar
8. Bopal (TRP Mall)
9. Chandkheda
10. Gandhinagar PDPU
11. Anand
12. Sindhu Bhavan
13. Nadiad

**Correction from previous Kimi draft:** the QR directory does **not** include Shela / Snooker Century or Vastral / Snooker Den. They were removed; K.K. Nagar and Sindhu Bhavan are now included.

**QR link quality:** the QR directory's K.K. Nagar Google link appears to point to Hocco Eatery; Bopal's points to TRP Mall rather than an A.S. club pin. For these we use explicit A.S. Google Maps search links instead of sending customers to the wrong business. Owner should confirm these, plus exact addresses for K.K. Nagar and Sindhu Bhavan.

### Optional cinematic break — 2.5D canvas upgrade
A small, voluntary section between the About area and main locations directory now uses the black 8-ball photo supplied for this project as its opening visual. Clicking **Take your shot** (or the photo) cuts to a Canvas 2D table: the white cue ball rolls forward, collides with a **15-ball rack**, and the balls spread with lightweight collision physics and a polished, shaded-material effect. Then **13 accessible location buttons** appear, each opening the existing club-detail panel. Because there are 13 branches but a normal eight-ball rack contains 15 numbered balls, the two counts are intentionally distinct.

- **Skip / Just show locations**, **Play again**, keyboard-friendly location buttons, reduced-motion bypass.
- **No autoplay, audio, heavy WebGL/3D dependency, required game interaction, or backend.** The full searchable directory remains available independently.
- Files: `assets/break-cinematic.js`, styles in `assets/site.css`, poster `assets/images/break-eight.webp`.
- The canvas uses physical-inspired motion, not a professional physics engine or literal real-table simulation.
- Before publishing, test on an actual iPhone/Android browser as well as desktop; browser security may prevent opening local files directly, in which case use GitHub Pages or a local server.

The remaining 11 map coordinates were carried over from the Kimi research draft and remain approximate until independently confirmed. The two new entries omit unverified coordinates and phone numbers rather than guessing.

## Pre-publication fixes applied (2026-10-31)

- Replaced Sindhu Bhavan’s questionable `kgmid` URL with an A.S.-specific Google Maps search; do not substitute a venue pin until owner confirms.
- Removed “(exact address to confirm)” from public cards and club detail views; these now display locality-level addresses only.
- Assigned different representative images to K.K. Nagar and Sindhu Bhavan, giving each of the 13 cards a distinct cover photo. Image-to-branch attribution is still not confirmed.
- Ensured the Enquire link inside a club popup dismisses it before taking the visitor to the contact form.
- Removed public “Pin pending” chips and kept missing map pins out of the interactive map.
- Excluded `reference/` from the publishing ZIP. The source files in this package are ready to upload at the GitHub repository root.

**Important:** Photos are AI-enhanced illustrations based on supplied venue references. Some reconstructed images materially differ from the original spaces. Owner approval and appropriate photo rights are still required before describing them as exact images of any particular branch. Eleven inherited map markers remain approximate. Contact email, numbers, addresses, and opening hours still require owner sign-off.
