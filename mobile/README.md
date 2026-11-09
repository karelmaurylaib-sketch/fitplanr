# FitPlanr on Google Play and the App Store

The apps are **Capacitor 8** shells around the live web app (`https://fitplanr-3.vercel.app`, start screen `/app`).
Every plan, workout and payment stays on the server, so a web deploy updates the apps right away: rebuild the
apps only to change native things (icon, splash, permissions, plugins, version).

| | Android | iOS |
|---|---|---|
| Project | `android/` (Gradle) | `ios/App/App.xcodeproj` (Swift Package Manager, no CocoaPods) |
| App id | `com.fitplanr.app` | `com.fitplanr.app` |
| Min OS | Android 7 (API 24), target API 36 | iOS 15, iPhone only, portrait |
| Push | Firebase Cloud Messaging (`google-services.json`) | APNs (Push Notifications capability, `App.entitlements`) |
| Camera | `CAMERA` permission, camera not required | `NSCameraUsageDescription` |
| Offline | service worker `public/sw.js` + `mobile/www/offline.html` | same (WKAppBoundDomains lets the service worker run) |

## Build

```bash
npm ci
npm run mobile:icons        # only after changing the icon/splash design (scripts/mobile-assets.mjs)
npm run android:release     # → android/app/build/outputs/{apk,bundle}/release/app-release.{apk,aab}
npm run ios:open            # on a Mac with Xcode 16+: opens the project
```

Android signing reads `android/keystore.properties` (never committed):

```
storeFile=/absolute/path/fitplanr-upload.jks
storePassword=…
keyAlias=fitplanr-upload
keyPassword=…
```

CI does both platforms: `.github/workflows/mobile.yml` (Actions → Mobile apps → Run workflow). Secrets are listed at the top of the file.

## Google Play (first upload)

1. Play Console → Create app "FitPlanr" · App · Free · English (US).
2. Release → Testing → Internal testing → Create release → upload `app-release.aab`. Keep **Play App Signing** on (Google holds the app key; ours is the upload key).
3. Store listing: icon `mobile/assets/icon-only.png` (resize to 512×512), feature graphic 1024×500, phone screenshots (`shots/n-*-android-390.png` style, 1080×1920+).
4. App content: privacy policy `https://fitplanr-3.vercel.app/privacy`; Data safety: email, fitness info (workouts), device id (push token), camera used on-device only, nothing sold; Health apps declaration: fitness; Ads: none; target audience 18+.
5. Account deletion URL: in-app (Account → Delete my account) and `https://fitplanr-3.vercel.app/account`.
6. Countries: United States. Promote internal → production after review.

## App Store (first upload)

1. developer.apple.com → Identifiers → `com.fitplanr.app` with **Push Notifications**. Keys → an APNs key (.p8) → set `APNS_KEY`, `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_BUNDLE_ID=com.fitplanr.app`, `APNS_PRODUCTION=1` in Vercel.
2. App Store Connect → New app "FitPlanr", bundle `com.fitplanr.app`, SKU `fitplanr-ios`.
3. Xcode → App target → Signing & Capabilities → your Team (Automatic) → Product → Archive → Distribute → App Store Connect. Or the CI job with an App Store Connect API key.
4. Run on a simulator: Product → Run (any iPhone). On a phone: plug it in, pick it as the destination, Run.
5. App Privacy: same as Data safety above. Export compliance is already answered (`ITSAppUsesNonExemptEncryption = NO`).
6. Availability: United States. Subscriptions are sold on the web through Kwop/Whop; in the app the checkout opens in the in-app browser (US storefront rules allow linking out to web purchases). Do not offer it outside the US without adding In-App Purchase.

## Push reminders (server)

- Android: Firebase project → add Android app `com.fitplanr.app` → download `google-services.json` into `android/app/` (or the `GOOGLE_SERVICES_JSON_BASE64` CI secret) → rebuild. Service account JSON → `FCM_SERVICE_ACCOUNT` in Vercel.
- `CRON_SECRET` in Vercel: the daily reminder (`vercel.json`, 22:07 UTC) calls `/api/cron/reminders`.
- Without keys nothing breaks: the switch only shows in apps that can receive push, and the server simply sends nothing.
