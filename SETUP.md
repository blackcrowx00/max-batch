# Max Batch Scramble: setup (all free)

Your site will live at **https://blackcrowx00.github.io/max-batch/**

## 1. Put the files on GitHub
1. Open https://github.com/blackcrowx00/max-batch
2. Click **Add file → Upload files** and drag in every file from this folder
   (index.html, style.css, app.js, config.js, sw.js, manifest.webmanifest, firebase-rules.json, icon-180.png, icon-192.png, icon-512.png).
3. Click **Commit changes**.

## 2. Turn on GitHub Pages
1. In the repo: **Settings → Pages**.
2. Under **Build and deployment**, set Source to **Deploy from a branch**, Branch **main**, folder **/ (root)**, then **Save**.
3. Wait about a minute, then open the URL above. It already works in test mode (scores save on your phone only).

## 3. Make scores shared (free Firebase database)
GitHub Pages can't store scores for everyone, so a free Firebase database does that part. No credit card is needed.
1. Go to https://console.firebase.google.com and sign in with a Google account.
2. **Add project**, name it `max-batch`, and turn Google Analytics off.
3. In the left menu: **Build → Realtime Database → Create Database**. Pick any location and choose **Start in locked mode**.
4. Open the **Rules** tab, replace everything with the contents of `firebase-rules.json`, and click **Publish**.
5. Click the gear icon → **Project settings** → scroll to **Your apps** → click the **</>** (web) icon, name it anything, and register it (skip hosting).
6. Copy the `firebaseConfig` values it shows (apiKey, authDomain, databaseURL, projectId, appId).
7. On GitHub, open `config.js`, click the pencil icon, paste those values into the `firebase` section, and commit.
   If `databaseURL` isn't in what Firebase shows, it's on the Realtime Database page, e.g. `https://max-batch-default-rtdb.firebaseio.com`.

The yellow "Test mode" banner disappears once it's connected.

## 4. Put it on iPhones
1. Open the site link in **Safari** (it must be Safari).
2. Tap **Share → Add to Home Screen → Add**.

## 5. Birdie alerts
- **Inside the app:** when anyone saves a birdie or better, a banner and a sound pop up on every phone that has the app open.
- **Real push notifications (optional, free):** iOS can't do this from a plain web page, so use the ntfy app.
  1. In `config.js`, set `ntfyTopic` to a long random word like `"maxbatch-7f3k9q2x"`.
  2. Everyone installs the free **ntfy** app from the App Store, taps **+**, and subscribes to that same topic.
  3. Done. A birdie now buzzes every phone, even with the app closed.
- The **Turn on alerts** button only appears on iPhones after the app is added to the Home Screen (iOS 16.4+). It is not needed if you use ntfy.

## Using it
- **Enter Score:** pick your team, adjust strokes (it starts at par), tap **Save score**. It jumps to your next open hole. Tap a hole number to fix a score, or **Clear this hole**.
- **Teams:** rename them in `config.js` (`teams`).

## Good to know
- Anyone with the link can enter scores, so only share it with your group. The database rules only accept scores from 1 to 15.
- If the site looks stale after an edit, close the app and reopen it.
