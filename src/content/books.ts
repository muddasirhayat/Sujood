export type BookId = "pickthall" | "itani" | "nawawi" | "riyad";

export type BookMeta = {
  id: BookId;
  title: string;
  subtitle: string;
  badge: string;
  color: string;
  licensed: boolean;
  pendingNote?: string;
};

export const BOOKS: BookMeta[] = [
  {
    id: "pickthall",
    title: "The Meaning of the Glorious Koran",
    subtitle: "Marmaduke Pickthall, 1930",
    badge: "Public domain",
    color: "#4E6A52",
    licensed: true,
  },
  {
    id: "itani",
    title: "Clear Quran",
    subtitle: "Talal Itani · ClearQuran.com",
    badge: "CC BY-ND 4.0",
    color: "#B08A3E",
    licensed: true,
  },
  {
    id: "nawawi",
    title: "An-Nawawi's Forty Hadith",
    subtitle: "Arabic text, classical work",
    badge: "Public-domain work",
    color: "#6E8468",
    licensed: false,
    pendingNote:
      "The Arabic of this medieval collection is a public-domain work. A specific digital edition with a documented licence has not yet been pinned, so the body is not bundled. It is listed here so the shelf matches the plan.",
  },
  {
    id: "riyad",
    title: "Riyad as-Salihin",
    subtitle: "Imam an-Nawawi · Arabic first",
    badge: "Public-domain work",
    color: "#C4A48A",
    licensed: false,
    pendingNote:
      "The Arabic of this medieval collection is a public-domain work. A specific digital edition with a documented licence has not yet been pinned, so the body is not bundled.",
  },
];

export function bookById(id: string): BookMeta | undefined {
  return BOOKS.find((b) => b.id === id);
}

export const HADITH_COLLECTIONS = [
  {
    id: "bukhari",
    title: "Sahih al-Bukhari",
    subtitle: "Arabic compilation, public-domain work",
    licensedEnglish: false,
  },
  {
    id: "muslim",
    title: "Sahih Muslim",
    subtitle: "Arabic compilation, public-domain work",
    licensedEnglish: false,
  },
  {
    id: "abudawud",
    title: "Sunan Abu Dawud",
    subtitle: "Pending a licensed English edition",
    licensedEnglish: false,
  },
  {
    id: "tirmidhi",
    title: "Jami at-Tirmidhi",
    subtitle: "Pending a licensed English edition",
    licensedEnglish: false,
  },
  {
    id: "nawawi40",
    title: "An-Nawawi's Forty Hadith",
    subtitle: "Short collection · Arabic first",
    licensedEnglish: false,
    bookId: "nawawi" as const,
  },
  {
    id: "riyad",
    title: "Riyad as-Salihin",
    subtitle: "Also in the books library",
    licensedEnglish: false,
    bookId: "riyad" as const,
  },
];
