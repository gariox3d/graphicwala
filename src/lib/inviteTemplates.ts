export type ProgrammeItem = {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  notes?: string;
};

export type RsvpItem = {
  id: string;
  name: string;
  phone: string;
};

export type EventType = "hindu" | "muslim" | "other";

export type InviteFormData = {
  eventType: EventType;
  bride_name?: string;
  groom_name?: string;
  celebrant_name?: string;
  family_name?: string;
  age?: string;
  programmes: ProgrammeItem[];
  rsvp: RsvpItem[];
  compliments_from: string;
  special_instructions: string;
};

export const newProgramme = (name = ""): ProgrammeItem => ({
  id: crypto.randomUUID(),
  name,
  date: "",
  time: "",
  venue: "",
  notes: "",
});

export const newRsvp = (): RsvpItem => ({
  id: crypto.randomUUID(),
  name: "",
  phone: "",
});

// Default programme templates per category slug + event type
export const getDefaultProgrammes = (
  categorySlug: string | undefined,
  eventType: EventType
): ProgrammeItem[] => {
  if (categorySlug === "wedding") {
    if (eventType === "hindu")
      return [
        newProgramme("Haldi"),
        newProgramme("Mehndi"),
        newProgramme("Sangeet"),
        newProgramme("Wedding"),
        newProgramme("Reception"),
      ];
    if (eventType === "muslim")
      return [
        newProgramme("Mehndi"),
        newProgramme("Nikah"),
        newProgramme("Walima"),
        newProgramme("Reception"),
      ];
    return [newProgramme("Wedding Ceremony"), newProgramme("Reception")];
  }
  if (categorySlug === "engagement") return [newProgramme("Engagement Ceremony")];
  if (categorySlug === "birthday") return [newProgramme("Birthday Party")];
  if (categorySlug === "anniversary") return [newProgramme("Anniversary Celebration")];
  if (categorySlug === "grih-pravesh")
    return [newProgramme("Pooja"), newProgramme("Lunch / Dinner")];
  if (categorySlug === "janmotsav") return [newProgramme("Pooja"), newProgramme("Bhog")];
  return [newProgramme("Main Event")];
};

export const getCoupleMode = (categorySlug: string | undefined): "couple" | "person" | "family" => {
  if (!categorySlug) return "person";
  if (["wedding", "engagement", "anniversary"].includes(categorySlug)) return "couple";
  if (["grih-pravesh"].includes(categorySlug)) return "family";
  return "person";
};

// Extract YouTube video / shorts ID
export const getYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

export const getYouTubeThumb = (url: string): string | null => {
  const id = getYouTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
};

export const getYouTubeEmbed = (url: string): string | null => {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
};