export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  agent?: string;
  keyStatus?: "custom" | "server" | "missing";
}

export interface ContentBlock {
  type: "text" | "code";
  content: string;
  language?: string;
}
