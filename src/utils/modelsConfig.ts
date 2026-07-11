export interface AIModel {
  value: string;
  label: string;
  desc: string;
  categories: ("chats" | "software")[];
}

export const DEFAULT_MODELS: AIModel[] = [
  { value: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nemotron-3 Ultra 550B", desc: "Massive scale model for complex structural answers.", categories: ["chats", "software"] },
  { value: "poolside/laguna-m.1:free", label: "Poolside Laguna M.1", desc: "Optimized software engineering and reasoning model.", categories: ["chats", "software"] },
  { value: "nvidia/nemotron-3-super-120b-a12b:free", label: "Nemotron-3 Super 120B", desc: "Supercharged LLM optimized for high intelligence.", categories: ["chats", "software"] },
  { value: "cohere/north-mini-code:free", label: "Cohere North Mini Code", desc: "Fast, specialized code and logic companion.", categories: ["chats", "software"] },
  { value: "poolside/laguna-xs-2.1:free", label: "Poolside Laguna XS 2.1", desc: "Ultra-fast developer assistant.", categories: ["chats", "software"] },
  { value: "nvidia/nemotron-3-nano-30b-a3b:free", label: "Nemotron-3 Nano 30B", desc: "Efficient light-weight companion.", categories: ["chats", "software"] },
  { value: "openai/gpt-oss-120b:free", label: "GPT-OSS 120B", desc: "Open-source scale GPT architecture.", categories: ["chats", "software"] },
  { value: "google/gemma-4-31b-it:free", label: "Gemma-4 31B IT", desc: "Google's next-gen instruction-tuned Gemma model.", categories: ["chats", "software"] },
  { value: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", label: "Nemotron-3 Nano Omni 30B (Reasoning)", desc: "Omni-reasoning and deep logical processing.", categories: ["chats", "software"] },
  { value: "openai/gpt-oss-20b:free", label: "GPT-OSS 20B", desc: "Fast open-source language model.", categories: ["chats", "software"] },
  { value: "nvidia/nemotron-nano-9b-v2:free", label: "Nemotron Nano 9B v2", desc: "Highly optimized lightweight reasoning model.", categories: ["chats", "software"] },
  { value: "nvidia/nemotron-nano-12b-v2-vl:free", label: "Nemotron Nano 12B v2 VL", desc: "Lightweight multi-modal vision and language model.", categories: ["chats", "software"] },
  { value: "google/gemma-4-26b-a4b-it:free", label: "Gemma-4 26B A4B IT", desc: "Efficient and smart next-generation companion.", categories: ["chats", "software"] },
  { value: "nvidia/nemotron-3.5-content-safety:free", label: "Nemotron-3.5 Safety", desc: "Content-safety filter and response guard model.", categories: ["chats", "software"] },
  { value: "liquid/lfm-2.5-1.2b-instruct:free", label: "Liquid LFM 2.5 1.2B", desc: "Next-gen dynamic liquid neural network model.", categories: ["chats", "software"] }
];
