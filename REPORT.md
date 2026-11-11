# Sujood QA report

Date: 12 November 2026 (Asia/Karachi, UTC+5).

## Tooling

- `npx tsc --noEmit`: clean (exit 0)
- `npx eslint . --ext .ts,.tsx`: 0 errors, 15 style warnings (unused imports, `Array<T>` form)
- `npm test` (`tsx --test`): **22 passed, 0 failed**, across six suites:
  - Hijri civil calendar (2 Jumada al-Akhirah 1448 on 12 Nov 2026; leap-year cycle)
  - Prayer times for Karachi, Hanafi, 12 Nov 2026, matching the mockup sample (Fajr 05:28, Sunrise 06:46, Dhuhr 12:16, Asr 16:10, Maghrib 17:46, Isha 19:04)
  - Per-prayer offsets, later Hanafi Asr, Karachi method name
  - Next-prayer countdown: Fajr in 36 minutes at 04:52 on 12 Nov 2026; rolls to tomorrow after Isha
  - Qibla: ~267.74° (268° West) from Karachi, ~2,800 km; near-zero at the Kaaba; compass rotation
  - Notification scheduling: five Azans and five 15-minute pre-reminders; no past alerts; Jumu'ah Friday 11:30; Suhoor and Iftar only in Ramadan; per-prayer toggle; multi-day fire-at order
  - Persisted state: Karachi + Karachi method + Hanafi defaults, every alert on; accept/reject/migrate; timezone date key

## Visual QA

Each of the 16 approved mockups was compared to a Playwright render of the web export at 390×845, device scale 3 (1170×2535). Side-by-side images are in `/workspace/sujood-compare/<screen>.png` (mockup on the left, app on the right).

Mean absolute pixel error (0–255, lower is closer):

| Screen | MAE |
|---|---|
| splash | 7.11 |
| qibla | 12.99 |
| names | 11.91 |
| quran-list | 14.44 |
| notifications | 15.12 |
| month | 15.46 |
| books | 16.50 |
| home | 16.57 |
| quran-reader | 17.42 |
| mosques | 19.98 |
| hadith | 19.73 |
| books-reader | 21.40 |
| settings | 24.89 |
| tasbih | 25.45 |
| azan | 26.06 |
| onboarding | 29.26 |

Onboarding's higher MAE is mostly anti-aliasing and slight card metrics; the copy, layout and controls match the mockup.

## Remaining differences from the mockups

- The month screen has a **Qibla** pill in the header so the compass stays reachable. It is not in the mockup.
- Prayer times on days other than 12 November 2026 can differ from the mockup table by one minute (adhan-js rounding versus the Aladhan figures the mockup used). 12 November matches exactly.
- **Hadith of the day** shows an honest licence-pending note instead of the mockup's English "Actions are but by intention…". That wording was layout-only in the mockup and is not licensed for redistribution. See CREDITS.md.
- **Nearby mosques** lists live OpenStreetMap results around Karachi, not the mockup's three example mosques (Masjid-e-Tooba, Memon Masjid, Grand Jamia Mosque). Attribution is on the screen. Offline and error states are handled.
- **Settings**: the "Ignore battery optimisation" row sits at the fold and is slightly clipped by the tab bar; it is one short scroll away, and "Allow exact alarms" is fully visible. "Alerts and reminders" and "About and credits" links sit below the fold (they are not in the mockup).
- The library screen includes a "Hadith collections →" link that is not in the mockup, so Hadith stays reachable from Library as well as Home.
- The Pickthall book reader peeks the start of Surah II under The Opening. The mockup showed only The Opening.
- The Quran list, being a little tighter, shows ten or eleven surahs in the first view where the mockup showed nine.
- The 99 Names first view matches the mockup's ten names and "10 of 99" footer; the remaining names are on the same scrollable list.
- Small spacing and type-metric differences remain against the generated mockups.

## Content left out for licence reasons

- No English (or bundled Arabic) **hadith body** for Bukhari, Muslim, Abu Dawud, Tirmidhi, An-Nawawi's Forty or Riyad as-Salihin. Collections are listed. Bodies will be added only when a licensed edition is pinned.
- An-Nawawi's Forty Hadith and Riyad as-Salihin are on the books shelf with a pending-edition note; their bodies are not invented.
- **33 Pickthall chapters** that were not yet proofread on Wikisource are omitted rather than filled from lower-quality OCR. The Arabic Quran reader includes every surah. The About screen and the book reader say this.
- No recited **Azan**. Bundled sounds are gentle generated tones, original to Sujood, credited in CREDITS.md.

## Security review

- No secrets, tokens or API keys in the repository. `EXPO_TOKEN` is used only from the environment for EAS, never written to disk or logged.
- Permissions are the minimum for the features: when-in-use location, notifications, exact alarms, boot completed, vibrate, wake lock. Camera, microphone, storage, media, C2DM, install-referrer and background location are blocked. Preview and production builds also drop the dev-client, badge notifications and `SYSTEM_ALERT_WINDOW` (see `app.config.js`).
- Nearby mosques is the only network call: HTTPS POST to Overpass, 12-second timeout, AbortController, fallback endpoints, graceful offline copy. No other analytics, ads or tracking SDKs.
- Quran, Hadith, books, prayer times, the Azan schedule and Qibla work offline.
- Location stays on the device. The onboarding copy states this.

## Builds

Commit on `main`: `f532a5fff9a653d82d8cbb3c1227908932bf3268` (author MuddasirHayat).
Repository: https://github.com/muddasirhayat/Sujood
EAS project: https://expo.dev/accounts/muddasir_hayat/projects/sujood

Both Android builds finished on 12 November 2026 (Asia/Karachi, UTC+5), from that commit. An earlier pair on `ee70a01` failed in prebuild because Android resource names cannot contain hyphens; the Azan tones were renamed to `azan_dawn.wav` and the rest, and prebuild then succeeded locally before this pair was started.

- Development (dev client APK), finished 3:22 AM PKT
  - https://expo.dev/accounts/muddasir_hayat/projects/sujood/builds/c7bb421e-c082-4a03-8c1d-691e03300a94
  - https://expo.dev/artifacts/eas/z0v_AIl32YFu8hy8vygYUoSGmPSaohGN7uWHOKSfQMk.apk
- Preview (internal APK, no dev client), finished 3:25 AM PKT
  - https://expo.dev/accounts/muddasir_hayat/projects/sujood/builds/b33029c3-6d02-484a-a798-eb48c3839205
  - https://expo.dev/artifacts/eas/pnZRoL2UdTsMb_E4e-tDB07sFUTjSIVh-2ggfr94Pos.apk

A production AAB was optional and was not started.
