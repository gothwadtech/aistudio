import { safeStorage } from "./safeStorage";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AiChatParams {
  messages: ChatMessage[];
  activeFile?: { path: string; name: string; content?: string } | null;
  workspaceFiles?: string[];
  selectedAgent: string;
  selectedModel: string;
  customApiKey?: string;
  groqApiKey?: string;
  systemInstructionOverride?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiChatResponse {
  text: string;
  usedCustomKey: boolean;
  usedServerKey: boolean;
}

const DEFAULT_SYSTEM_INSTRUCTION = "You are Gothwad AI, an elite, ultra-responsive coding companion integrated directly into Gothwad Ai Studio. You are styled like Cursor, Windsurf, and Google AI Studio to give the ultimate developer workspace experience.\n\n";

export function getSystemInstruction(selectedAgent: string, systemInstructionOverride?: string): string {
  if (systemInstructionOverride) return systemInstructionOverride;

  let systemInstruction = DEFAULT_SYSTEM_INSTRUCTION;

  if (selectedAgent === "engineer") {
    systemInstruction += "ROLE: Elite Software Engineer (Cursor Mode)\n" +
      "- You write pristine, production-ready TypeScript, React, and CSS code.\n" +
      "- Ensure high-fidelity explanations, perfect visual styling using Tailwind utility classes, and optimized logic.\n" +
      "- ALWAYS output complete, updated code blocks. Mark them with accurate language tag. Include a short comment at the start of code block specifying what file this belongs to.\n" +
      "- Be highly concise. Do not waste time with conversational fluff.";
  } else if (selectedAgent === "explainer") {
    systemInstruction += "ROLE: Code Reviewer & Educator\n" +
      "- You analyze complex algorithms and structures line-by-line.\n" +
      "- Highlight performance bottlenecks, security risks, or structural flaws, and suggest specific solutions.\n" +
      "- Explain patterns in clear, simple, and high-fidelity language.";
  } else if (selectedAgent === "bug_hunter") {
    systemInstruction += "ROLE: Debugging Specialist (Bug Hunter)\n" +
      "- You solve compilation, runtime, and linting errors.\n" +
      "- When given a file and an error, identify the exact lines causing the issue and provide corrected code.\n" +
      "- Think step-by-step to explain *why* the bug occurred and *how* your fix resolves it.";
  } else if (selectedAgent === "planner") {
    systemInstruction += "ROLE: Project Planner & Architect (Planning AI Mode)\n" +
      "- You specialize in creating step-by-step project plans, lists of files to modify, structural specifications, and checklists.\n" +
      "- Provide clear, modular milestones to build complex software sequentially.\n" +
      "- Highlight potential structural pitfalls, component lifecycles, and dependency graphs.\n" +
      "- Help the user think through the logic before writing any code.";
  } else if (selectedAgent === "agentic") {
    systemInstruction += "ROLE: Autonomous Coding Agent (Agentic Mode)\n" +
      "- You act as an autonomous software developer that reasons about the workspace, imports, variables, and exports.\n" +
      "- When solving a task, analyze the file tree and trace variable definitions carefully to ensure zero breakage.\n" +
      "- Output complete, highly robust, production-grade files that compile immediately.\n" +
      "- You self-correct and verify correctness logic internally before presenting solutions.";
  } else if (selectedAgent === "designer") {
    systemInstruction += "ROLE: Creative UX/UI Designer (UI Designer Mode)\n" +
      "- You are an elite graphic designer and UI/UX specialist who designs breathtaking user interfaces.\n" +
      "- Focus deeply on visual fidelity, modern dark/light system styling, beautiful typography pairing, elegant tracking, and perfect margins/paddings.\n" +
      "- Use modern Tailwind layouts, high-contrast states, hover scales, and gorgeous micro-animations with motion.\n" +
      "- Always write extremely polished, gorgeous custom Tailwind UI styling. Avoid generic visual blocks.";
  } else {
    systemInstruction += "ROLE: Systems Architect\n" +
      "- You plan folder structures, project design patterns, state management models, and clean separation of concerns.\n" +
      "- Help design databases, APIs, and microservices paths.";
  }

  systemInstruction += "\n\nDirectives:\n" +
    "- Since you are part of an interactive editor, you can suggest code that can be directly applied.\n" +
    "- When proposing code changes for the active file, output the updated file content in a clear Markdown code block. Be sure to write complete, compilable code rather than snippets with '...' placeholders, so the user can easily click 'Apply' to update their file instantly.\n" +
    "- Keep explanations concise, professional, and dense with actual value. Avoid marketing hype, and do not use emojis unless they are functional.\n" +
    "- If asked about the Gothwad Ai Studio platform, you are Gothwad Ai Studio's native developer companion.";

  return systemInstruction;
}

export function buildContextPrompt(
  activeFile?: { path: string; name: string; content?: string } | null,
  workspaceFiles?: string[]
): string {
  let contextPrompt = "";
  if (activeFile) {
    contextPrompt += `=== CURRENT OPEN FILE CONTEXT ===\n` +
      `File Path: ${activeFile.path}\n` +
      `File Content:\n\`\`\`${activeFile.name.split(".").pop() || "txt"}\n${activeFile.content}\n\`\`\`\n\n`;
  }

  if (workspaceFiles && Array.isArray(workspaceFiles) && workspaceFiles.length > 0) {
    contextPrompt += `=== WORKSPACE STRUCTURE ===\n` +
      `Total Files: ${workspaceFiles.length}\n` +
      `List of paths:\n${workspaceFiles.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  return contextPrompt;
}

/**
 * Universal AI chat requester. First attempts Express server proxy,
 * and if that fails or we are in client-only environments (like Cloudflare Pages),
 * makes the call directly to OpenRouter client-side.
 */
export async function callAiChat(params: AiChatParams): Promise<AiChatResponse> {
  const isGroq = params.selectedModel.startsWith("groq/");
  if (isGroq) {
    const groqKey = params.groqApiKey?.trim() || safeStorage.getItem("gothwad_groq_key")?.trim();
    if (!groqKey) {
      throw new Error(
        "Gothwad AI Companion: No Groq API Key provided. Please enter your Groq API Key in settings to connect with your Groq models."
      );
    }

    const systemInstruction = getSystemInstruction(params.selectedAgent, params.systemInstructionOverride);
    const contextPrompt = buildContextPrompt(params.activeFile, params.workspaceFiles);

    const openAiMessages = [];
    openAiMessages.push({ role: "system", content: systemInstruction });

    if (contextPrompt) {
      openAiMessages.push({
        role: "user",
        content: `${contextPrompt}Please load this workspace file structure and the currently active file content. Confirm you understand.`
      });
      openAiMessages.push({
        role: "assistant",
        content: "Understood. I have loaded your workspace file structure and active file content. Let's build!"
      });
    }

    for (const msg of params.messages) {
      openAiMessages.push({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content
      });
    }

    const groqModelName = params.selectedModel.replace(/^groq\//, "");
    const endpoint = "https://api.groq.com/openai/v1/chat/completions";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${groqKey}`
    };

    const payload = {
      model: groqModelName,
      messages: openAiMessages,
      temperature: typeof params.temperature === "number" ? params.temperature : 0.2,
      max_tokens: typeof params.maxTokens === "number" ? params.maxTokens : 1500
    };

    const directRes = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!directRes.ok) {
      const errorText = await directRes.text();
      let parsedErr;
      try {
        parsedErr = JSON.parse(errorText);
      } catch (e) {}
      
      const errorMsg = parsedErr?.error?.message || parsedErr?.error || errorText || `HTTP ${directRes.status}`;
      throw new Error(`Groq Direct Error: ${errorMsg}`);
    }

    const data = await directRes.json();
    const responseText = data.choices?.[0]?.message?.content || "No response choices returned.";

    return {
      text: responseText,
      usedCustomKey: true,
      usedServerKey: false,
    };
  }

  // CLIENT-SIDE DIRECT ONLY
  const activeKey = params.customApiKey?.trim() || safeStorage.getItem("gothwad_ai_key")?.trim() || ((import.meta as any).env?.VITE_OPENROUTER_API_KEY || "");
  
  if (!activeKey) {
    throw new Error(
      "Gothwad AI Companion: No API Key provided. Please enter your OpenRouter API Key in settings to connect with your developer companion client-side."
    );
  }

  const systemInstruction = getSystemInstruction(params.selectedAgent, params.systemInstructionOverride);
  const contextPrompt = buildContextPrompt(params.activeFile, params.workspaceFiles);

  const openAiMessages = [];
  openAiMessages.push({ role: "system", content: systemInstruction });

  if (contextPrompt) {
    openAiMessages.push({
      role: "user",
      content: `${contextPrompt}Please load this workspace file structure and the currently active file content. Confirm you understand.`
    });
    openAiMessages.push({
      role: "assistant",
      content: "Understood. I have loaded your workspace file structure and active file content. Let's build!"
    });
  }

  for (const msg of params.messages) {
    openAiMessages.push({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content
    });
  }

  const endpoint = "https://openrouter.ai/api/v1/chat/completions";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${activeKey}`,
    "HTTP-Referer": "https://aistudio.gothwadtech.com",
    "X-Title": "Gothwad Ai Studio"
  };

  const payload = {
    model: params.selectedModel || "google/gemini-2.5-flash",
    messages: openAiMessages,
    temperature: typeof params.temperature === "number" ? params.temperature : 0.2,
    max_tokens: typeof params.maxTokens === "number" ? params.maxTokens : 1500
  };

  // Run the fetch direct client-side with potential fallback model
  try {
    const directRes = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!directRes.ok) {
      const errorText = await directRes.text();
      let parsedErr;
      try {
        parsedErr = JSON.parse(errorText);
      } catch (e) {}
      
      const errorMsg = parsedErr?.error?.message || parsedErr?.error || errorText || `HTTP ${directRes.status}`;
      throw new Error(`OpenRouter Direct Error: ${errorMsg}`);
    }

    const data = await directRes.json();
    const responseText = data.choices?.[0]?.message?.content || "No response choices returned.";

    return {
      text: responseText,
      usedCustomKey: true,
      usedServerKey: false,
    };
  } catch (err: any) {
    // If the selected model failed (or returned credit/limit issue), let's retry with a free fallback model
    if (params.selectedModel !== "google/gemini-2.5-flash") {
      console.warn(`[AI client] Model ${params.selectedModel} failed. Retrying with google/gemini-2.5-flash...`);
      try {
        const fallbackPayload = {
          ...payload,
          model: "google/gemini-2.5-flash"
        };
        const retryRes = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(fallbackPayload),
        });
        
        if (retryRes.ok) {
          const retryData = await retryRes.json();
          const responseText = retryData.choices?.[0]?.message?.content || "No response choices returned on fallback.";
          return {
            text: responseText,
            usedCustomKey: true,
            usedServerKey: false
          };
        }
      } catch (nestedErr) {
        console.error("[AI client] Fallback model request failed as well:", nestedErr);
      }
    }
    throw new Error(err.message || "Failed to fetch response directly from OpenRouter.");
  }
}
