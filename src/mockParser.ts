import type { AppData, CameraAngle, Character, CharacterPeriod, Prompt, Project, Scene } from "./types";
import { nowIso, uid } from "./utils";

function pickLines(script: string) {
  return script
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function inferNames(script: string) {
  const names = Array.from(
    new Set(
      Array.from(script.matchAll(/(?:^|\n)\s*([\u4e00-\u9fa5A-Za-z]{2,6})[：:]/g)).map((match) => match[1]),
    ),
  );
  return names.length ? names.slice(0, 5) : ["林夏", "顾辰", "周明"];
}

function inferScenes(lines: string[]) {
  const sceneMatches = lines
    .filter((line) => /(内|外|日|夜|清晨|黄昏|雨|街|家|办公室|天台|医院|学校|餐厅)/.test(line))
    .slice(0, 5);
  if (sceneMatches.length) {
    return sceneMatches.map((line, index) => {
      const clean = line.replace(/[【】#]/g, "").slice(0, 18);
      return clean || `核心场景 ${index + 1}`;
    });
  }
  return ["老城区街口", "主角出租屋", "深夜办公室"];
}

export function mockParseScript(current: AppData): AppData {
  const project = current.project;
  if (!project) return current;

  const script = current.scriptText || "第一集\n林夏：我不能再逃避了。\n顾辰：真相就在今晚。\n外 景 老城区街口 夜 雨。";
  const lines = pickLines(script);
  const names = inferNames(script);
  const sceneNames = inferScenes(lines);
  const stamp = nowIso();

  const characters: Character[] = names.map((name, index) => ({
    id: uid("char"),
    projectId: project.id,
    name,
    aliases: index === 0 ? "女主, 核心视角" : "",
    gender: index === 0 ? "女" : index === 1 ? "男" : "未设定",
    identity: index === 0 ? "短剧主角 / 新晋调查者" : index === 1 ? "关键盟友 / 隐藏知情人" : "推动剧情的关系人物",
    firstEpisode: "第1集",
    episodes: "第1-3集",
    personality: index === 0 ? "克制、敏感、有强行动机，遇到压力时会先观察再爆发。" : "目标明确，话少，常把真实情绪藏在行动里。",
    faceBase: index === 0 ? "清冷东方脸，五官利落，眼神有疲惫感但坚定。" : "成熟轮廓，眉眼深，表情内收，适合悬疑向角色。",
    relationship: index === 0 ? "与主要男性角色互相试探，从不信任走向合作。" : "与主角存在信息差，是剧情反转的重要支点。",
    arc: index === 0 ? "从被动卷入事件，到主动掌控真相和选择。" : "从旁观保护者，转为公开站队并承担代价。",
    status: "待审核",
  }));

  const periods: CharacterPeriod[] = characters.flatMap((character, index) => [
    {
      id: uid("period"),
      characterId: character.id,
      name: "初登场造型",
      episodes: "第1集",
      ageState: index === 0 ? "25岁左右" : "30岁左右",
      identityState: character.identity,
      emotionState: "警觉、压抑、带有未说出口的秘密",
      costume: index === 0 ? "深灰风衣，白色内搭，黑色长裤，低调城市感" : "黑色短夹克，深色衬衫，简洁皮鞋",
      hairstyle: index === 0 ? "自然黑色中长发，低马尾或散发" : "短发，侧分，干净但略凌乱",
      makeup: "自然影视妆，强调眼神和面部结构",
      bodyState: "站姿克制，肩颈略紧，动作有目的性",
      prompt: `${character.name}，三视图，正面、侧面、背面，${project.era}，${project.visualStyle}，角色设定图，统一五官，服装细节清晰，${project.defaultRatio}`,
      status: "待审核",
    },
    {
      id: uid("period"),
      characterId: character.id,
      name: "关键转折造型",
      episodes: "第2-3集",
      ageState: index === 0 ? "25岁左右，状态更疲惫" : "30岁左右，伤痕或压力感增强",
      identityState: "被事件推进后的行动状态",
      emotionState: "紧张、决绝、情绪外露",
      costume: index === 0 ? "米白衬衫外搭深色外套，衣角有雨水和灰尘" : "深色大衣，衬衫领口微乱",
      hairstyle: index === 0 ? "发丝略乱，局部湿发" : "短发被雨打湿，额前碎发",
      makeup: "轻微疲惫妆，眼下阴影，真实影视质感",
      bodyState: "呼吸急促，手部动作紧，准备做出选择",
      prompt: `${character.name}，转折期三视图，正面、侧面、背面，服装连续性准确，情绪更强，${project.visualStyle}，角色资产图，${project.defaultRatio}`,
      status: "待审核",
    },
  ]);

  const scenes: Scene[] = sceneNames.map((name, index) => ({
    id: uid("scene"),
    projectId: project.id,
    name,
    aliases: index === 0 ? "开场地点, 追踪点" : "",
    type: /夜|雨/.test(name) ? "外景" : "内景/外景待定",
    locationGroup: index === 0 ? "城市核心线" : "人物关系线",
    episodes: "第1-3集",
    function: index === 0 ? "制造悬念，建立主角处境和视觉基调。" : "承载人物冲突、信息揭示和情绪转折。",
    style: project.visualStyle || "现实主义电影感",
    colorTone: index === 0 ? "冷青灰，低饱和，局部暖色点光" : "中性灰绿，保留肤色，背景压暗",
    lighting: index === 0 ? "雨夜路灯、霓虹反射、强弱对比" : "顶光与侧光混合，强调空间层次",
    weather: index === 0 ? "小雨或雨后潮湿" : "室内稳定光线",
    props: index === 0 ? "湿地面、路牌、旧广告灯箱、手机" : "桌面文件、老照片、玻璃杯、门牌",
    mainPrompt: `${name}，${project.era}，${project.visualStyle}，${index === 0 ? "雨夜城市悬疑氛围" : "人物冲突空间"}，电影级布光，低饱和色彩，空间细节明确，${project.defaultRatio}`,
    status: "待审核",
  }));

  const cameraAngles: CameraAngle[] = scenes.flatMap((scene) => [
    {
      id: uid("angle"),
      sceneId: scene.id,
      name: "建立镜头",
      description: "交代空间全貌、人物位置和视觉基调。",
      prompt: `${scene.name}，广角建立镜头，完整空间关系，电影感构图，${scene.colorTone}，${scene.lighting}`,
      status: "待审核",
    },
    {
      id: uid("angle"),
      sceneId: scene.id,
      name: "人物中近景",
      description: "用于对白和表演，保留环境信息。",
      prompt: `${scene.name}，人物中近景，浅景深，情绪张力，背景保留关键道具，${project.visualStyle}`,
      status: "待审核",
    },
    {
      id: uid("angle"),
      sceneId: scene.id,
      name: "细节特写",
      description: "强调线索、道具或情绪动作。",
      prompt: `${scene.name}，道具或手部动作特写，悬疑线索，电影级微距质感，低饱和`,
      status: "待审核",
    },
  ]);

  const periodPrompts: Prompt[] = periods.map((period) => ({
    id: uid("prompt"),
    projectId: project.id,
    targetType: "人物时期",
    targetId: period.id,
    promptType: "三视图",
    content: period.prompt,
    negativePrompt: "五官漂移，服装不一致，卡通夸张，低清晰度，手部错误，文字水印",
    status: period.status,
    createdAt: stamp,
    updatedAt: stamp,
  }));

  const scenePrompts: Prompt[] = scenes.map((scene) => ({
    id: uid("prompt"),
    projectId: project.id,
    targetType: "场景",
    targetId: scene.id,
    promptType: "场景主提示词",
    content: scene.mainPrompt,
    negativePrompt: "杂乱构图，过曝，廉价影棚感，风格不统一，低清晰度，文字水印",
    status: scene.status,
    createdAt: stamp,
    updatedAt: stamp,
  }));

  const anglePrompts: Prompt[] = cameraAngles.map((angle) => ({
    id: uid("prompt"),
    projectId: project.id,
    targetType: "机位",
    targetId: angle.id,
    promptType: angle.name,
    content: angle.prompt,
    negativePrompt: "镜头畸变过强，主体缺失，构图混乱，低清晰度，文字水印",
    status: angle.status,
    createdAt: stamp,
    updatedAt: stamp,
  }));

  const updatedProject: Project = { ...project, updatedAt: stamp };

  return {
    ...current,
    project: updatedProject,
    characters,
    periods,
    scenes,
    cameraAngles,
    prompts: [...periodPrompts, ...scenePrompts, ...anglePrompts],
  };
}
