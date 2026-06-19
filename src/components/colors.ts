import type { MeteoriteGroup } from "@/lib/types";

/** One consistent color per family, used by both the map and the charts. */
export const GROUP_COLORS: Record<MeteoriteGroup, string> = {
  "Ordinary chondrite": "#ff7a3c",
  "Carbonaceous chondrite": "#7fd4ff",
  "Enstatite chondrite": "#c792ea",
  "Other chondrite": "#82e0aa",
  Achondrite: "#ffd166",
  Iron: "#e57373",
  "Stony-iron": "#f78fb3",
  Unknown: "#5c6a82",
};

export const GROUP_ORDER: MeteoriteGroup[] = [
  "Ordinary chondrite",
  "Carbonaceous chondrite",
  "Enstatite chondrite",
  "Other chondrite",
  "Achondrite",
  "Iron",
  "Stony-iron",
  "Unknown",
];
