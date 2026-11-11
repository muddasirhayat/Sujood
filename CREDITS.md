# Credits and licences

Sujood bundles only texts and media whose licences were checked on 12 November 2026.

## Arabic Quran text — Tanzil Project

- Source: [Tanzil Project](https://tanzil.net/), Uthmani text, Version 1.1.
- Licence: Creative Commons Attribution 3.0, with Tanzil's additional terms.
- The verbatim copyright notice is in `assets/notices/NOTICE-TANZIL.txt` and in `assets/content/quran-uthmani.txt`.
- The text is bundled verbatim. It has not been changed.
- A link to [tanzil.net](https://tanzil.net/) is in the in-app About screen so users can follow updates.

## English translation — Marmaduke Pickthall, 1930

- *The Meaning of the Glorious Koran*, translated by Marmaduke Pickthall, 1930.
- Public domain in the United States (published before 1 January 1931; the translator died in 1936), as presented on [English Wikisource](https://en.wikisource.org/wiki/The_Meaning_of_the_Glorious_Koran_(1930)).
- Al-Fatiha uses the 1930 wording aligned to the standard seven ayahs (Pickthall's last two numbered lines belong under ayah 7), which matches the approved mockup.
- Other surahs were taken from the Wikisource proofread 1930 text. Some middle chapters were not yet proofread on Wikisource on 12 November 2026 and are omitted rather than filled from a lower-quality source. The Arabic reader still includes every surah.

## English translation — Talal Itani, Clear Quran (Allah Edition)

- Official file from [ClearQuran.com](https://clearquran.com/download/).
- Licence: [CC BY-ND 4.0](https://creativecommons.org/licenses/by-nd/4.0/), plus the author's permission to reformat and use the files in commercial projects provided the words are not changed.
- Credit, as requested: "Translation by Talal Itani, ClearQuran.com".
- The official Allah Edition is used, not an edited God Edition. The official file and readme are in `assets/content/` and `assets/notices/NOTICE-CLEARQURAN.txt`.

## Hadith

- Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami at-Tirmidhi, An-Nawawi's Forty Hadith and Riyad as-Salihin are listed as classical collections.
- The underlying Arabic compilations are public-domain works. No specific digital Arabic edition with a documented licence was pinned, so no hadith body text is bundled.
- No English hadith wording is bundled. A sunnah.com API key and written terms would be needed before shipping English. Unofficial GitHub dumps were not treated as a licence.
- The "Hadith of the day" card in the mockup used a conventional English wording of Bukhari 1 for layout only. That wording is not in the shipped app.

## Books library

- Pickthall 1930 and Clear Quran (Itani) are included, as licensed above.
- An-Nawawi's Forty Hadith and Riyad as-Salihin appear on the shelf with a note that a documented digital edition is still pending. Their bodies are not invented or bundled.
- Copyrighted popular titles such as *The Sealed Nectar* or *Fortification of the Muslim* are not included.

## 99 Names

- Transliterated names are the traditional list. The short English glosses were written for Sujood and are not taken from a modern copyrighted book. The first ten match the approved mockup.

## Daily dua

- Al-Fatiha, ayah 5, in the 1930 Pickthall wording, which is covered above.

## Nearby mosques

- OpenStreetMap, queried from the device via the Overpass API.
- Licence: Open Database License (ODbL).
- Attribution on the mosques screen: "Map data © OpenStreetMap contributors (ODbL)."

## Prayer times and Qibla

- [adhan](https://github.com/batoulapps/adhan-js) (MIT licence), calculated on the device.
- Default: University of Islamic Sciences, Karachi method, Hanafi Asr. The Karachi method's built-in +1 minute Dhuhr adjustment is cleared so 12 November 2026 matches the published Aladhan sample used in the mockups (Dhuhr 12:16).
- The Hijri date uses the Islamic civil (tabular) calendar, which gives 2 Jumada al-Akhirah 1448 on 12 November 2026, the date used in the mockups.

## Azan audio

- The bundled sounds (`azan_dawn.wav`, `azan_classic.wav`, `azan_dusk.wav`, `chime.wav`) are gentle generated tones, original to Sujood. They are not a recited Azan.
- A royalty-free recited Azan was not bundled because a verifiable licence was not confirmed.

## App icon

- Logo concept 2 (sage mihrab and gold crescent), chosen by the owner.

## Publisher

- Sujood is made by Codixr, a software agency.
- There are no ads, no analytics, and no tracking SDKs.
