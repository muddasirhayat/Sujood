# Sujood

Sujood is a calm, offline-first Islamic prayer app by Codixr, a software agency. There are no ads, no analytics and no tracking.

The default location is Karachi, the default calculation method is the University of Islamic Sciences, Karachi, and the default Asr school is Hanafi. Prayer times are calculated on the device with [adhan-js](https://github.com/batoulapps/adhan-js).

## Features

- Next-prayer countdown and today's five prayer times
- Monthly prayer times with Hijri dates
- Azan alerts (exact alarms where Android allows), a full-screen Azan, Test Azan, per-prayer sounds and a battery-optimisation guide
- Qibla compass
- Tasbih with a salah tracker, saved on the device
- Quran reader: Tanzil Arabic (CC BY 3.0, verbatim) and Pickthall 1930 English (public domain), bundled offline
- Hadith collections listed; English bodies wait on a verified licence (see [CREDITS.md](CREDITS.md))
- Islamic books library (public-domain and open-licence works only)
- 99 Names, a daily dua, and an Islamic calendar
- Alerts for the Azan, a daily ayah, a daily hadith, Jumu'ah, Suhoor and Iftar
- Nearby mosques via the OpenStreetMap Overpass API (the only feature that needs a network)
- Settings: calculation method, Hanafi/Shafi, per-prayer minute offsets, sounds

## Stack

Expo SDK 57, expo-router, TypeScript, React Native. Package name `com.codixr.sujood`.

## Development

```bash
npm install
npm run typecheck
npm run lint
npm test
npx expo start
```

EAS profiles (see `eas.json`):

- `development` — dev client APK
- `preview` — internal APK, no dev client
- `production` — Play App Bundle, autoIncrement

## Licences

All bundled texts and sounds are documented in [CREDITS.md](CREDITS.md).
