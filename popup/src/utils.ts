export const downloadText = (text: string, filename: string) => {
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// Turn "Jane Doe" / "Acme, Inc." into filename-safe parts: "Jane_Doe" / "Acme_Inc".
export const toFileNamePart = (value: string) =>
  value.trim().replace(/\s+/g, "_").replace(/[^\w-]/g, "");

export const extractTextBetweenTags = (text: string, tag: string) => {
  const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, "s"); // "s" flag allows multi-line matches
  const match = text.match(regex);
  return match ? match[1].trim() : null;
};

export const loadPrompt = async (
  fileName: string,
  replacements: Record<string, string>
) => {
  const response = await fetch(`prompts/${fileName}`);

  let promptText = await response.text();

  // Replace placeholders {{cv}}, {{company}}, etc.
  Object.keys(replacements).forEach((key) => {
    promptText = promptText.replace(`{{${key}}}`, replacements[key]);
  });

  return promptText;
};
