import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// API route handlers for GitHub Authentication
app.get("/api/auth/config", (req, res) => {
  const host = req.get("host") || "localhost:3000";
  const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  
  let appUrl = process.env.APP_URL || "";
  if (!appUrl || appUrl === "MY_APP_URL") {
    appUrl = `${protocol}://${host}`;
  }

  res.json({
    clientId: process.env.GITHUB_CLIENT_ID || "",
    appUrl: appUrl
  });
});

// Exchange OAuth code for GitHub Access Token
app.post("/api/auth/github/token", async (req, res) => {
  const { code } = req.body;
  if (!code) {
    res.status(400).json({ error: "Code is required" });
    return;
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(500).json({ 
      error: "GitHub OAuth credentials are not configured on the server." 
    });
    return;
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    const data = await response.json();
    if (data.error) {
      res.status(400).json(data);
    } else {
      res.json(data);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to exchange GitHub token" });
  }
});

// Handle GitHub redirect callback for popup-based flow
app.get("/api/auth/github/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) {
    res.status(400).send(`
      <html>
        <body style="background:#09090b; color:#f43f5e; font-family:monospace; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
          <div style="background:#18181b; border:1px solid #27272a; padding:24px; border-radius:12px; text-align:center;">
            <h1 style="font-size:18px; margin-bottom:8px;">Authentication Error</h1>
            <p style="color:#71717a; font-size:12px;">No code returned from GitHub</p>
          </div>
        </body>
      </html>
    `);
    return;
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(500).send(`
      <html>
        <body style="background:#09090b; color:#f43f5e; font-family:monospace; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
          <div style="background:#18181b; border:1px solid #27272a; padding:24px; border-radius:12px; text-align:center;">
            <h1 style="font-size:18px; margin-bottom:8px;">Configuration Error</h1>
            <p style="color:#71717a; font-size:12px;">GitHub Client ID or Secret keys are missing from the host environment.</p>
          </div>
        </body>
      </html>
    `);
    return;
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    const data = await response.json();
    if (data.error || !data.access_token) {
      const errMsg = data.error_description || data.error || "Failed token exchange";
      res.status(400).send(`
        <html>
          <body style="background:#09090b; color:#f43f5e; font-family:monospace; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
            <div style="background:#18181b; border:1px solid #27272a; padding:24px; border-radius:12px; text-align:center;">
              <h1 style="font-size:18px; margin-bottom:8px;">Access Denied</h1>
              <p style="color:#71717a; font-size:12px;">${errMsg}</p>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: "GOTHWAD_STUDIO_OAUTH_FAILURE", error: "${errMsg}" }, "*");
              }
            </script>
          </body>
        </html>
      `);
    } else {
      res.send(`
        <html>
          <head>
            <title>Gothwad Ai Studio Authentication Success</title>
            <style>
              body {
                background-color: #09090b;
                color: #d4d4d8;
                font-family: monospace;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
              }
              .card {
                background: #18181b;
                border: 1px solid #27272a;
                padding: 24px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
              }
              h1 { color: #f4f4f5; margin-bottom: 8px; font-size: 18px; }
              p { color: #71717a; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1 style="color:#22c55e;">Connection Successful!</h1>
              <p>Staging secure workspace keys... This window will close automatically.</p>
            </div>
            <script>
              try {
                if (window.opener) {
                  window.opener.postMessage({ type: 'GOTHWAD_STUDIO_OAUTH_SUCCESS', token: '${data.access_token}' }, '*');
                  setTimeout(() => {
                    window.close();
                  }, 1200);
                } else {
                  window.location.href = '/';
                }
              } catch (e) {
                console.error("Failed to transmit token", e);
              }
            </script>
          </body>
        </html>
      `);
    }
  } catch (err: any) {
    const errMsg = err.message || "OAuth exchange exception";
    res.status(500).send(`
      <html>
        <body style="background:#09090b; color:#f43f5e; font-family:monospace; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
          <div style="background:#18181b; border:1px solid #27272a; padding:24px; border-radius:12px; text-align:center;">
            <h1 style="font-size:18px; margin-bottom:8px;">Exchange Failed</h1>
            <p style="color:#71717a; font-size:12px;">${errMsg}</p>
          </div>
        </body>
      </html>
    `);
  }
});

// Proxy routes to prevent CORS limitations in GitHub API
app.all("/api/github-proxy/*", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "No GitHub Access Token provided in Authorization header" });
    return;
  }

  // Get the sub-path
  const githubPath = req.params[0] || "";
  const queryParams = new URLSearchParams(req.query as any).toString();
  const url = `https://api.github.com/${githubPath}${queryParams ? `?${queryParams}` : ""}`;

  const headers: Record<string, string> = {
    "Authorization": authHeader,
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "Gothwad-Studio-App"
  };

  if (req.headers["content-type"]) {
    headers["Content-Type"] = req.headers["content-type"] as string;
  }

  try {
    const options: RequestInit = {
      method: req.method,
      headers
    };

    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && req.body) {
      options.body = JSON.stringify(req.body);
    }

    const githubResponse = await fetch(url, options);
    
    // Some endpoints return 204 No Content
    if (githubResponse.status === 204) {
      res.status(204).end();
      return;
    }

    const responseData = await githubResponse.json();
    res.status(githubResponse.status).json(responseData);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to proxy request to GitHub" });
  }
});

// AI Configuration Endpoint to check server status of OpenRouter API Key
app.get("/api/ai/config", (req, res) => {
  const hasServerKey = !!(process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY);
  res.json({
    hasServerKey
  });
});

// AI Coding Assistant Chat Endpoint (Cursor/Windsurf Style - Supports OpenRouter, Gemini, OpenAI, and Custom)
app.post("/api/ai/chat", async (req, res) => {
  const { 
    messages, 
    activeFile, 
    workspaceFiles, 
    selectedAgent, 
    apiProvider = "openrouter", 
    selectedModel = "meta-llama/llama-3.3-70b-instruct:free", 
    customApiKey, 
    customEndpoint,
    systemInstructionOverride,
    temperature,
    maxTokens
  } = req.body;

  // 1. Structure a strong, high-vibe system instruction based on the agent selected
  let systemInstruction = "";
  if (systemInstructionOverride) {
    systemInstruction = systemInstructionOverride;
  } else {
    systemInstruction = "You are Gothwad AI, an elite, ultra-responsive coding companion integrated directly into Gothwad Ai Studio. You are styled like Cursor, Windsurf, and Google AI Studio to give the ultimate developer workspace experience.\n\n";

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

    // Add general response directives
    systemInstruction += "\n\nDirectives:\n" +
      "- Since you are part of an interactive editor, you can suggest code that can be directly applied.\n" +
      "- When proposing code changes for the active file, output the updated file content in a clear Markdown code block. Be sure to write complete, compilable code rather than snippets with '...' placeholders, so the user can easily click 'Apply' to update their file instantly.\n" +
      "- Keep explanations concise, professional, and dense with actual value. Avoid marketing hype, and do not use emojis unless they are functional.\n" +
      "- If asked about the Gothwad Ai Studio platform, you are Gothwad Ai Studio's native developer companion.";
  }

  // Build the code workspace context
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

  try {
    const endpoint = "https://openrouter.ai/api/v1/chat/completions";
    
    // Determine active key
    let key = "";
    let usedCustomKey = false;
    let usedServerKey = false;

    if (customApiKey && customApiKey.trim() !== "") {
      key = customApiKey.trim();
      usedCustomKey = true;
    } else if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim() !== "") {
      key = process.env.OPENROUTER_API_KEY.trim();
      usedServerKey = true;
    } else if (process.env.OPEN_ROUTER_API_KEY && process.env.OPEN_ROUTER_API_KEY.trim() !== "") {
      key = process.env.OPEN_ROUTER_API_KEY.trim();
      usedServerKey = true;
    }

    if (!key) {
      res.status(400).json({
        error: "OpenRouter API Key is missing. Please provide your OpenRouter API Key in Gothwad AI settings or add it as host environment variable (OPENROUTER_API_KEY)."
      });
      return;
    }
    const authHeader = `Bearer ${key}`;

    // Format OpenAI-compatible messages array
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

    for (const msg of messages) {
      openAiMessages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      });
    }

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": authHeader,
      "HTTP-Referer": "https://ai.studio/build",
      "X-Title": "Gothwad Ai Studio"
    };

    const payload = {
      model: selectedModel || "google/gemini-2.5-flash:free",
      messages: openAiMessages,
      temperature: typeof temperature === "number" ? temperature : 0.2,
      max_tokens: typeof maxTokens === "number" ? maxTokens : 1500
    };

    let finalModel = payload.model;
    let resData: any = null;

    async function attemptFetch(currentModel: string, currentMaxTokens: number, depth = 0): Promise<any> {
      if (depth > 2) {
        throw new Error("Maximum retry depth exceeded for OpenRouter API requests.");
      }

      const activePayload = {
        ...payload,
        model: currentModel,
        max_tokens: currentMaxTokens
      };

      console.log(`[AI server.ts] Attempting OpenRouter fetch. Model: "${currentModel}", max_tokens: ${currentMaxTokens}, attempt: ${depth + 1}`);

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(activePayload)
      });

      console.log(`[AI server.ts] OpenRouter response status: ${response.status} (${response.statusText})`);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[AI server.ts] HTTP ${response.status} Error:`, errorText);

        const isCreditIssue = errorText.includes("credits") || errorText.includes("afford") || errorText.includes("max_tokens") || response.status === 402;
        const isProviderIssue = errorText.includes("Provider returned error") || errorText.includes("No endpoints found") || errorText.includes("unavailable") || [408, 429, 502, 503, 504].includes(response.status);

        if (isCreditIssue && currentMaxTokens > 800) {
          console.log("[AI server.ts] Retrying with max_tokens = 800 due to credit/limit issue.");
          return attemptFetch(currentModel, 800, depth + 1);
        }

        if (isProviderIssue && currentModel !== "google/gemini-2.5-flash:free") {
          console.log("[AI server.ts] Retrying with fallback google/gemini-2.5-flash:free due to provider issue.");
          finalModel = "google/gemini-2.5-flash:free";
          return attemptFetch("google/gemini-2.5-flash:free", currentMaxTokens, depth + 1);
        }

        let parsedErr;
        try { parsedErr = JSON.parse(errorText); } catch(e) {}
        const msg = parsedErr?.error?.message || parsedErr?.error || errorText || `HTTP ${response.status}`;
        throw new Error(msg);
      }

      const data = await response.json() as any;

      if (data.error) {
        const errObj = data.error;
        const errText = typeof errObj === "string" ? errObj : JSON.stringify(errObj);
        console.warn(`[AI server.ts] OpenRouter returned 200 OK with error payload:`, errText);

        const isCredit = errText.includes("credits") || errText.includes("afford") || errText.includes("max_tokens") || errObj.code === 402 || errObj.code === 4002;
        const isProvider = errText.includes("overloaded") || errText.includes("No endpoints") || errText.includes("Provider returned error") || errObj.code === 429 || errObj.code === 503 || errObj.code === 502;

        if (isCredit && currentMaxTokens > 800) {
          console.log("[AI server.ts] Retrying with max_tokens = 800 due to inline error credit/limit.");
          return attemptFetch(currentModel, 800, depth + 1);
        }

        if (isProvider && currentModel !== "google/gemini-2.5-flash:free") {
          console.log("[AI server.ts] Retrying with fallback google/gemini-2.5-flash:free due to inline provider error.");
          finalModel = "google/gemini-2.5-flash:free";
          return attemptFetch("google/gemini-2.5-flash:free", currentMaxTokens, depth + 1);
        }

        throw new Error(errObj.message || errText);
      }

      const content = data?.choices?.[0]?.message?.content;
      if (content === undefined || content === null) {
        console.warn("[AI server.ts] No choices or message content found in successful response. Data keys:", Object.keys(data));
        if (currentModel !== "google/gemini-2.5-flash:free") {
          console.log("[AI server.ts] Retrying with fallback google/gemini-2.5-flash:free due to missing message content.");
          finalModel = "google/gemini-2.5-flash:free";
          return attemptFetch("google/gemini-2.5-flash:free", currentMaxTokens, depth + 1);
        }
      }

      return data;
    }

    try {
      resData = await attemptFetch(payload.model, payload.max_tokens);
    } catch (apiErr: any) {
      console.error("[AI server.ts] All fetch attempts failed. Final API Error:", apiErr);
      res.status(500).json({
        error: `OpenRouter API Error: ${apiErr.message || apiErr}`
      });
      return;
    }

    let modelResponseText = resData?.choices?.[0]?.message?.content || "";
    
    if (!modelResponseText) {
      console.warn(`[AI server.ts] WARNING: No message content found in final resData. choices:`, JSON.stringify(resData?.choices));
      modelResponseText = "No response text was generated by the model. Please check your OpenRouter account configuration or try a different model.";
    } else {
      console.log(`[AI server.ts] Successfully extracted response text (length: ${modelResponseText.length} chars).`);
    }
    
    // If fell back, prepend a subtle notice to inform user
    if (finalModel !== selectedModel) {
      modelResponseText = `*⚠️ Note: Gothwad AI automatically recovered your session by falling back to high-availability **Gemini 2.5 Flash** because the selected model (${selectedModel}) was temporarily overloaded or unavailable.*\n\n` + modelResponseText;
    }

    res.json({ 
      text: modelResponseText,
      usedCustomKey,
      usedServerKey,
      actualModel: finalModel
    });

  } catch (err: any) {
    console.error("[AI Chat Route Error]:", err);
    res.status(500).json({ error: err.message || "An error occurred while generating AI response" });
  }
});

// Vite middleware setup for development and Static handling for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Gothwad Ai Studio Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
