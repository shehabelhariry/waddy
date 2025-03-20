export const callLLM = async ({
  system,
  prompt,
}: {
  system: string;
  prompt: string;
}) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      max_tokens: 5000,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content.trim();
};

export const downloadText = (text: string, filename: string) => {
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

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
  console.log(response);
  let promptText = await response.text();
  console.log(promptText);

  // Replace placeholders {{cv}}, {{company}}, etc.
  Object.keys(replacements).forEach((key) => {
    promptText = promptText.replace(`{{${key}}}`, replacements[key]);
  });

  return promptText;
};
