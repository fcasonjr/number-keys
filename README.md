# Number Keys

Flash cards for the musical number system: name any scale degree (1–7), and the notes of 16 chord types, in any major key.

Live site: <https://number-keys.netlify.app>

## Documentation

- [User's guide](docs/USER_GUIDE.md): how to use every part of the app.
- [Project documentation](docs/PROJECT.md): architecture, data model, testing, deployment, and how to extend it.

## Run locally
```
npm install
npm run dev        # http://localhost:5173 (also on your LAN via --host)
npm test           # scale-verification + logic tests
npm run build && npm run preview
```

## Install on your phone
The PWA needs HTTPS (or localhost) to install, so deploy `dist/` to any static host
(Netlify Drop, GitHub Pages, Cloudflare Pages), then:
- **iPhone (Safari):** Share → Add to Home Screen
- **Android (Chrome):** menu → Install app / Add to Home screen

After the first load it works offline. Progress lives in the browser's localStorage,
so use Settings → Export JSON to move it between devices.
