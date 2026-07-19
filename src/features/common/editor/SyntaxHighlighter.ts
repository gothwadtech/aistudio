export type SupportedLanguage = 
  | "typescript" 
  | "javascript" 
  | "html" 
  | "css" 
  | "json" 
  | "markdown" 
  | "python" 
  | "sql" 
  | "yaml" 
  | "rust" 
  | "go" 
  | "cpp" 
  | "java" 
  | "plain";

export function detectLanguage(filename: string): SupportedLanguage {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return "javascript";
    case "html":
    case "htm":
    case "xml":
    case "svg":
      return "html";
    case "css":
    case "scss":
    case "less":
      return "css";
    case "json":
    case "lock":
      return "json";
    case "md":
    case "markdown":
      return "markdown";
    case "py":
      return "python";
    case "sql":
      return "sql";
    case "yaml":
    case "yml":
      return "yaml";
    case "rs":
      return "rust";
    case "go":
      return "go";
    case "cpp":
    case "cc":
    case "h":
    case "hpp":
    case "c":
      return "cpp";
    case "java":
    case "kt":
      return "java";
    default:
      return "plain";
  }
}

export function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const mimeTypes: Record<string, string> = {
    // Images
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp",
    ico: "image/x-icon",
    bmp: "image/bmp",
    // Audio
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    m4a: "audio/mp4",
    // Video
    mp4: "video/mp4",
    webm: "video/webm",
    oggvideo: "video/ogg",
    // Documents
    pdf: "application/pdf"
  };
  return mimeTypes[ext] || "application/octet-stream";
}

export function isImageFile(filename: string): boolean {
  const mime = getMimeType(filename);
  return mime.startsWith("image/");
}

export function isAudioFile(filename: string): boolean {
  const mime = getMimeType(filename);
  return mime.startsWith("audio/");
}

export function isVideoFile(filename: string): boolean {
  const mime = getMimeType(filename);
  return mime.startsWith("video/");
}

export function isTextFile(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (!filename.includes(".")) return true; // LICENSE, Makefile, etc.
  
  const textExtensions = new Set([
    "txt", "md", "markdown", "mdown", "js", "jsx", "ts", "tsx", "mjs", "cjs", 
    "css", "scss", "sass", "less", "html", "htm", "xml", "svg", "json", "lock", 
    "py", "r", "rb", "pl", "pm", "php", "go", "rs", "c", "cpp", "h", "hpp", 
    "cc", "java", "kt", "kts", "gradle", "sql", "yaml", "yml", "sh", "bash", 
    "zsh", "bat", "cmd", "ps1", "ini", "conf", "config", "properties", "env", 
    "example", "gitignore", "gitattributes", "dockerfile", "editorconfig", "toml",
    "babelrc", "eslintrc", "prettierrc", "flowconfig"
  ]);
  return textExtensions.has(ext);
}

export function isMediaFile(filename: string): boolean {
  return !isTextFile(filename);
}
