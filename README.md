# Personal site

A one-page portfolio: three problems from my day, each with a "before" you drag away to reveal the tool I built for it.

## Run it

```bash
npm install
npm run dev        # http://127.0.0.1:5173
```

Add `?open` to the URL to load with all three demos already open.

## Edit the words

Everything you can read on the site is in **`src/content.ts`**: name, email, links, the three problems, About and Contact. Placeholders are in `[SQUARE BRACKETS]` or start with `TODO`.

Colours are the variables at the top of `src/styles.css`.

## Where things are

| File | What it is |
|---|---|
| `src/content.ts` | All text and links |
| `src/main.ts` | Builds the page and the drag-to-fix panels |
| `src/styles.css` | All styling, light and dark |
| `src/guy.ts` | The little stick figure |
| `src/demos/breakDemo.ts` | Break enforcer: the window that grows over the site |
| `src/demos/danceDemo.ts` | Dance coach: animated figure, generated beat |
| `src/demos/listingsDemo.ts` | Listings: made-up sample data, nothing is scraped |
| `skeletons/` | The design explorations (not part of the built site) |

## Deploy to GitHub Pages

1. Create a GitHub repository and push this folder to its `main` branch.
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` now builds and publishes the site (`.github/workflows/deploy.yml`).

The build uses relative paths, so it works at `username.github.io` and at `username.github.io/repo-name` without changes.
