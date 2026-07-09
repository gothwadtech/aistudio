import { safeStorage } from "../../../utils/safeStorage";

export const integrationStorage = {
  get: (key: string) => safeStorage.getItem(key),
  set: (key: string, val: string) => safeStorage.setItem(key, val),
  remove: (key: string) => safeStorage.removeItem(key)
};
