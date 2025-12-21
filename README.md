# Jay Neil Pagalunan — Portfolio

Static personal portfolio site built with plain HTML, CSS and vanilla JavaScript.

## Summary

- Static site (no server-side code in the repo).
- Projects gallery with per-project viewer/carousel, bullets & tags, and demo links.
- Contact form posts to a Google Apps Script Web App (server-side script not included in this repo).

## Key Features

- Responsive layout (desktop, tablet and mobile).
- Project viewer with per-project image carousel and details.
- Accessible tooltips for contact icons; keyboard-focusable interactive elements.
- Contact form ready to POST to Google Apps Script (Apps Script deployment required).

## File structure (important files)

- `index.html` — main page
- `css/` — styles (`style.css`, `projects.css`)
- `js/` — JavaScript (`main.js`, `projects.js`)
- `image/` — project and site images (note: singular `image/` folder used in the site)
- `README.md` — this file

## Local preview

You can preview the site locally by simply opening `index.html` in your browser. For a better dev experience use a simple live server (VS Code "Live Server" or any static server).

Quick (PowerShell) commands to run a simple static server using Python (if installed):

```powershell
# from project root
python -m http.server 8000
# then open http://localhost:8000
```

Or use VS Code Live Server extension and open the workspace folder.

## Publishing (GitHub Pages)

This repo is static and works on GitHub Pages. Basic steps:

```powershell
cd "d:\FILES TEMP PLACE HERE\portfolio new"
git init
git add .
git commit -m "Site for GitHub Pages"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Then on GitHub: Settings → Pages → Source → `main` branch (root). The site will be available at `https://<your-username>.github.io/<your-repo>/`.

### Important notes before publishing

- GitHub Pages serves files case-sensitively and encodes spaces in filenames. Rename files that contain spaces (for example `name logo.png` or `background for web.jpg`) to use dashes or underscores and update references in HTML/CSS to avoid broken images.
- The repo uses `image/` (singular) for many images — confirm all `src` references point to the correct folder.

## Contact form (Google Apps Script)

The contact form in `index.html` is wired to POST to a Google Apps Script Web App URL. To receive messages in Gmail you must:

1. Create an Apps Script project at https://script.google.com
2. Create a script using the provided `doPost(e)` implementation (this repo does not contain the server-side script).
3. Set the recipient email inside the Apps Script (e.g., `var RECIPIENT_EMAIL = 'you@example.com';`).
4. Deploy → New deployment → select **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** or **Anyone, even anonymous** (if you expect anonymous visitors)
5. Copy the Web App URL and paste it into the `action` attribute of the form in `index.html`:

```html
<form
  id="contact-form"
  action="https://script.google.com/macros/s/YOUR_WEB_APP_ID/exec"
  method="POST"
></form>
```

6. Test the form. The Apps Script must be authorized to send email with `GmailApp.sendEmail()`; quotas apply.

If you prefer not to use Apps Script, alternatives include Formspree, Netlify Forms, or a serverless function.

## package-lock.json

There is a `package-lock.json` present but no `package.json` in this repo. A lockfile without a `package.json` is unused. It's safe to remove. If you want me to remove it and commit that change I can do so.

## Image / asset housekeeping

- Rename files with spaces to hyphenated names and update references in `index.html` and CSS.
- Keep the `image/` folder consistent.

## Accessibility & UX notes

- Tooltips are keyboard-focusable (`tabindex="0"`) and visible on `:hover` and `:focus`.
- Project tiles show the project meta on hover; long labels may wrap. If you want truncation on tiles with the full title shown only in the viewer, I can add a tiny CSS clamp.

## Troubleshooting

- If an image doesn't load on GitHub Pages, check the exact file name and case.
- If contact form submissions fail, verify the Apps Script URL, deployment access settings, and the script's Gmail authorization.

## License

This repository doesn't include a license file. If you want an open-source license added (MIT, Apache-2.0, etc.), tell me which one and I will add a `LICENSE` file.
