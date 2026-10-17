# Mervin's Web Studio

Storefront site for Mervin's Web Studio, a service of Mervin's Merchandise LLC. It offers business websites, direct-booking sites for rental hosts, professional portfolios, and care plans.

## Stack

A static site with no build step: `index.html` (home page, inline CSS and form/menu behavior) and `faq.html` (FAQ page with an accordion and FAQ structured data), both sharing `animations.js` for motion: word-by-word headline, rotating audience word, count-up stats, scroll reveals and progress bar, parallax orbs, cursor glow, card spotlights, magnetic buttons, and an audience marquee. Motion is skipped when the visitor prefers reduced motion, and the pages work without JavaScript. Fonts come from Google Fonts.

## Local preview

    python3 -m http.server 8000

Then open http://localhost:8000.

## Deployment

Hosted on Vercel (project `mervinswebstudio`). Once this repo is linked to the project, every push to `main` deploys to production.

## To do

- Confirm package prices
- Add more projects and client testimonials to the Recent work section (screenshots of the live sites sit in `images/`; retake them when a site changes)
- Register and connect mervinswebstudio.com
