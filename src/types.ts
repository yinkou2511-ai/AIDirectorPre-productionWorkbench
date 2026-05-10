export type Status = "待审核" | "已修改" | "已确认" | "需重做" | "已导出";

export interface Project {
  id: string;
  name: string;
  scriptType: string;
  era: string;
  visualStyle: string;
  defaultRatio: string;
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  aliases: string;
  gender: string;
  identity: string;
  firstEpisode: string;
  episodes: string;
  personality: string;
  faceBase: string;
  relationship: string;
  arc: string;
  status: Status;
}

export interface CharacterPeriod {
  id: string;
  characterId: string;
  name: string;
  episodes: string;
  ageState: string;
  identityState: string;
  emotionState: string;
  costume: string;
  hairstyle: string;
  makeup: string;
  bodyState: string;
  prompt: string;
  status: Status;
}

export interface Scene {
  id: string;
  projectId: string;
  name: string;
  aliases: string;
  type: string;
  locationGroup: string;
  episodes: string;
  function: string;
  style: string;
  colorTone: string;
  lighting: string;
  weather: string;
  props: string;
  mainPrompt: string;
  status: Status;
}

export interface CameraAngle {
  id: string;
  sceneId: string;
  name: string;
  description: string;
  prompt: string;
  status: Status;
}

export interface Prompt {
  id: string;
  projectId: string;
  targetType: "人物时期" | "场景" | "机位";
  targetId: string;
  promptType: string;
  content: string;
  negativePrompt: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  project: Project | null;
  scriptText: string;
  characters: Character[];
  periods: CharacterPeriod[];
  scenes: Scene[];
  cameraAngles: CameraAngle[];
  prompts: Prompt[];
}
