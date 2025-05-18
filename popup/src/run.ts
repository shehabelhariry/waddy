import { loadPrompt } from "./utils";

export async function runAssistantWithFileAndMessage({
  assistantId = "asst_Cp3WziwgSTRXPXWn2SsjEwul",
  file,
}: any) {
  const headers = {
    Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    "OpenAI-Beta": "assistants=v2",
  };

  // Step 1: Create a thread
  const threadRes = await fetch("https://api.openai.com/v1/threads", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
  });
  const { id: threadId } = await threadRes.json();

  // Step 2: Upload the file
  const formData = new FormData();
  formData.append("file", file);
  formData.append("purpose", "assistants");

  const fileRes = await fetch("https://api.openai.com/v1/files", {
    method: "POST",
    headers,
    body: formData,
  });
  const { id: fileId } = await fileRes.json();

  const prompt = await loadPrompt("createCvObject.txt", {});

  // Step 3: Attach the file to the thread
  await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      role: "user",
      content: prompt,
      attachments: [
        {
          file_id: fileId,
          tools: [{ type: "file_search" }],
        },
      ],
    }),
  });

  // Step 5: Run the assistant
  const runRes = await fetch(
    `https://api.openai.com/v1/threads/${threadId}/runs`,
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ assistant_id: assistantId }),
    }
  );
  const { id: runId } = await runRes.json();

  // Step 6: Poll run status
  let runStatus = "queued";
  while (runStatus === "queued" || runStatus === "in_progress") {
    await new Promise((res) => setTimeout(res, 1500));
    const statusRes = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
      {
        headers,
      }
    );
    const data = await statusRes.json();
    runStatus = data.status;
  }

  if (runStatus !== "completed") {
    throw new Error(`Run failed with status: ${runStatus}`);
  }

  // Step 7: Get messages
  const messagesRes = await fetch(
    `https://api.openai.com/v1/threads/${threadId}/messages`,
    {
      headers,
    }
  );
  const { data: messages } = await messagesRes.json();
  const lastMessage = messages.find((msg: any) => msg.role === "assistant");

  return lastMessage?.content?.[0]?.text?.value || "No response from assistant";
}
