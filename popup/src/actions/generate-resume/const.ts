export const COLORS = {
  primary: "#079fc0",
  secondary: "#34495e",
  text: "#333333",
  lightText: "#7f8c8d",
  line: "#bdc3c7",
};

export const FONTS = {
  main: "helvetica",
  sizes: {
    name: 26,
    title: 14,
    sectionHeader: 14,
    subHeader: 11,
    normal: 10,
    small: 9,
  },
  styles: {
    bold: "bold",
    normal: "normal",
    italic: "italic",
  },
};

export const SPACING = {
  tight: 4, // Between title and subtitle
  normal: 6, // Between related content (company + roles)
  section: 8, // Between different sections
} as const;

export const BULLET_INDENT = 4; // Bullet point indentation
export const PAGE_MARGIN = 24;
