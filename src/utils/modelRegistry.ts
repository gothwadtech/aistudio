import { safeStorage } from "./safeStorage";
import { AIModel, DEFAULT_MODELS } from "./modelsConfig";

export type { AIModel };


export function getAppModels(): AIModel[] {
  const saved = safeStorage.getItem("gothwad_ai_custom_models_v1");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse custom models list", e);
    }
  }
  return DEFAULT_MODELS;
}

export function saveAppModels(models: AIModel[]) {
  safeStorage.setItem("gothwad_ai_custom_models_v1", JSON.stringify(models));
}
