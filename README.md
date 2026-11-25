# Omar Alaa — Portfolio

Static site: plain HTML, CSS and JavaScript. No build step. English at the root, Arabic in `ar/`.

## Publish on GitHub Pages
1. Create a repository named `omaraladin.github.io`.
2. Upload everything in this folder to the `main` branch.
3. Settings → Pages → Source: `main` / root.
4. The site goes live at https://omaraladin.github.io (Arabic: https://omaraladin.github.io/ar/)

## Language
The عربي / English button switches to the same page in the other language and remembers the choice,
so a returning visitor lands in the language they picked last.

## Contact form
Until a form service is connected, **Send** opens the visitor's email app with the message filled in.
To receive messages straight to your inbox, create a free form on formspree.io (or web3forms.com)
and paste its endpoint into `FORM_ENDPOINT` near the bottom of `assets/js/main.js`.

## Pages
- `index.html`, `ar/index.html` — home
- `work/*.html`, `ar/work/*.html` — four case studies in each language
