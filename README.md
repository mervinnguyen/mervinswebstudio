# Mervin's Web Studio

Storefront site for Mervin's Web Studio, a service of Mervin's Merchandise LLC. It offers business websites, direct-booking sites for rental hosts, professional portfolios, and care plans.

## Stack

A static site with no build step: `index.html`, `faq.html`, and three service pages use inline page styles and share `animations.js` for motion. Motion is skipped when the visitor prefers reduced motion, and the pages work without JavaScript. The Latin font subsets are self-hosted in `fonts/`, and project screenshots have responsive WebP variants.

## Local preview

    python3 -m http.server 8000

Then open http://localhost:8000.

## Deployment

Hosted on Vercel (project `mervinswebstudio`). Once this repo is linked to the project, every push to `main` deploys to production. `vercel.json` configures revalidating browser caches for static images, fonts, and JavaScript.

## Optional integrations

Edit `site-config.js` before production launch:

- `MWS_FORM_ENDPOINT`: a Formspree-compatible endpoint that accepts `POST` requests. The contact form keeps its email fallback when this is blank.
- `MWS_ANALYTICS_DOMAIN`: the domain registered with Plausible. Analytics stays disabled when this is blank.

Do not put API keys or private credentials in this static site. Use a server-side function or the provider's public form endpoint.

## To do

- Confirm package prices
- Add more projects and client testimonials to the Recent work section (screenshots of the live sites sit in `images/`; retake them when a site changes)
- Register and connect mervinswebstudio.com
