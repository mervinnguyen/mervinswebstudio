# Mervin's Web Studio

Storefront site for Mervin's Web Studio, a service of Mervin's Merchandise LLC. It offers business websites, direct-booking sites for rental hosts, professional portfolios, and care plans.

## Stack

A static site with no build step: `index.html`, `faq.html`, and three service pages use inline page styles and share `animations.js` for motion. Motion is skipped when the visitor prefers reduced motion, and the pages work without JavaScript. The Latin font subsets are self-hosted in `fonts/`, and project screenshots have responsive WebP variants.

## Local preview

    python3 -m http.server 8000

Then open http://localhost:8000.

## Deployment

Hosted on Vercel (project `mervinswebstudio`). Once this repo is linked to the project, every push to `main` deploys to production. `vercel.json` configures revalidating browser caches for static images, fonts, and JavaScript.

## To do

- Confirm package prices
- Add more projects and client testimonials to the Recent work section (screenshots of the live sites sit in `images/`; retake them when a site changes)
- Register and connect mervinswebstudio.com
