[README.md](https://github.com/user-attachments/files/30427556/README.md)
# Training Log

Personal nutrition + training tracker. React + Vite. Data persists in your browser via localStorage.

## Run locally
    npm install
    npm run dev

## Deploy to Netlify
Option A — drag & drop:
    npm install
    npm run build
Then drag the `dist/` folder into the Netlify dashboard (Sites → Add new site → Deploy manually).

Option B — from Git:
Push this folder to a repo, "Add new site → Import from Git," pick the repo.
Netlify reads netlify.toml automatically (build: `npm run build`, publish: `dist`).

## Notes
- Data is stored in this browser only. Use the same browser/device to keep your history.
- The in-app Backup button exports your data as text you can paste back via Restore.
