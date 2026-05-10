import type { AppData } from "./types";

const KEY = "ai-director-workbench-mvp";

export const emptyData: AppData = {
  project: null,
  scriptText: "",
  characters: [],
  periods: [],
  scenes: [],
  cameraAngles: [],
  prompts: [],
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyData;
    return { ...emptyData, ...JSON.parse(raw) };
  } catch {
    return emptyData;
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearData() {
  localStorage.removeItem(KEY);
}
