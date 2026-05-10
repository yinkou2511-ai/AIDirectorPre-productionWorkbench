import { Clapperboard, Download, FileJson, FileText, FolderKanban, ListChecks, Plus, Sparkles, Trash2, Upload, Users, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import { mockParseScript } from "./mockParser";
import { emptyData, loadData, saveData } from "./storage";
import type { AppData, CameraAngle, Character, CharacterPeriod, Project, Prompt, Scene, Status } from "./types";
import { downloadJson, nowIso, statusClass, statuses, uid } from "./utils";

type Page = "home" | "script" | "characters" | "character" | "scenes" | "scene" | "prompts" | "export";
type NavItem = { page: Page; label: string; icon: ElementType };

const navItems: NavItem[] = [
  { page: "home", label: "项目首页", icon: FolderKanban },
  { page: "script", label: "剧本上传", icon: FileText },
  { page: "characters", label: "人物库", icon: Users },
  { page: "scenes", label: "场景库", icon: Clapperboard },
  { page: "prompts", label: "提示词审核", icon: ListChecks },
  { page: "export", label: "导出中心", icon: FileJson },
];

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label><span className="field-label">{label}</span><input className="field-input" value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Area({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return <label><span className="field-label">{label}</span><textarea className="field-area resize-y" rows={rows} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function StatusSelect({ value, onChange }: { value: Status; onChange: (value: Status) => void }) {
  return <select className="field-input" value={value} onChange={(event) => onChange(event.target.value as Status)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select>;
}

function Pill({ status }: { status: Status }) {
  return <span className={`status-pill ${statusClass(status)}`}>{status}</span>;
}

function Blank({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed border-line bg-white p-10 text-center text-sm text-muted">{text}</div>;
}

function makeProject(existing?: Project | null): Project {
  const stamp = nowIso();
  return { id: existing?.id || uid("project"), name: existing?.name || "AI导演前期工作台项目", scriptType: existing?.scriptType || "AI短剧", era: existing?.era || "当代都市", visualStyle: existing?.visualStyle || "写实电影感，低饱和，清晰美术设定", defaultRatio: existing?.defaultRatio || "16:9", createdAt: existing?.createdAt || stamp, updatedAt: stamp };
}

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [page, setPage] = useState<Page>("home");
  const [characterId, setCharacterId] = useState("");
  const [sceneId, setSceneId] = useState("");

  useEffect(() => saveData(data), [data]);

  const stats = useMemo(() => ({ characters: data.characters.length, periods: data.periods.length, scenes: data.scenes.length, angles: data.cameraAngles.length, prompts: data.prompts.length, confirmed: data.prompts.filter((prompt) => prompt.status === "已确认").length }), [data]);
  const selectedCharacter = data.characters.find((item) => item.id === characterId) || data.characters[0];
  const selectedScene = data.scenes.find((item) => item.id === sceneId) || data.scenes[0];
  const patch = (mutator: (current: AppData) => AppData) => setData((current) => mutator(current));
  const ensureProject = () => setData((current) => (current.project ? current : { ...current, project: makeProject() }));

  function updateProject(field: keyof Project, value: string) {
    patch((current) => (current.project ? { ...current, project: { ...current.project, [field]: value, updatedAt: nowIso() } } : current));
  }

  function parseScript() {
    setData((current) => mockParseScript(current.project ? current : { ...current, project: makeProject() }));
    setPage("characters");
  }

  function loadTxt(file: File) {
    const reader = new FileReader();
    reader.onload = () => patch((current) => ({ ...current, scriptText: String(reader.result || "") }));
    reader.readAsText(file, "utf-8");
  }

  const updateCharacter = (id: string, value: Partial<Character>) => patch((current) => ({ ...current, characters: current.characters.map((item) => item.id === id ? { ...item, ...value } : item) }));
  const updatePrompt = (id: string, value: Partial<Prompt>) => patch((current) => ({ ...current, prompts: current.prompts.map((item) => item.id === id ? { ...item, ...value, updatedAt: nowIso() } : item) }));

  function updatePeriod(id: string, value: Partial<CharacterPeriod>) {
    patch((current) => ({ ...current, periods: current.periods.map((item) => item.id === id ? { ...item, ...value } : item), prompts: value.prompt ? current.prompts.map((prompt) => prompt.targetId === id ? { ...prompt, content: value.prompt || prompt.content, status: "已修改", updatedAt: nowIso() } : prompt) : current.prompts }));
  }

  function updateScene(id: string, value: Partial<Scene>) {
    patch((current) => ({ ...current, scenes: current.scenes.map((item) => item.id === id ? { ...item, ...value } : item), prompts: value.mainPrompt ? current.prompts.map((prompt) => prompt.targetId === id ? { ...prompt, content: value.mainPrompt || prompt.content, status: "已修改", updatedAt: nowIso() } : prompt) : current.prompts }));
  }

  function updateAngle(id: string, value: Partial<CameraAngle>) {
    patch((current) => ({ ...current, cameraAngles: current.cameraAngles.map((item) => item.id === id ? { ...item, ...value } : item), prompts: value.prompt ? current.prompts.map((prompt) => prompt.targetId === id ? { ...prompt, content: value.prompt || prompt.content, status: "已修改", updatedAt: nowIso() } : prompt) : current.prompts }));
  }

  function addCharacter() {
    if (!data.project) return;
    const character: Character = { id: uid("char"), projectId: data.project.id, name: "新人物", aliases: "", gender: "未设定", identity: "", firstEpisode: "", episodes: "", personality: "", faceBase: "", relationship: "", arc: "", status: "待审核" };
    patch((current) => ({ ...current, characters: [...current.characters, character] }));
    setCharacterId(character.id);
    setPage("character");
  }

  function addScene() {
    if (!data.project) return;
    const scene: Scene = { id: uid("scene"), projectId: data.project.id, name: "新场景", aliases: "", type: "", locationGroup: "", episodes: "", function: "", style: data.project.visualStyle, colorTone: "", lighting: "", weather: "", props: "", mainPrompt: "", status: "待审核" };
    patch((current) => ({ ...current, scenes: [...current.scenes, scene] }));
    setSceneId(scene.id);
    setPage("scene");
  }

  function exportJson() {
    downloadJson(`${data.project?.name || "ai-director-project"}.json`, data);
    patch((current) => ({ ...current, prompts: current.prompts.map((prompt) => ({ ...prompt, status: prompt.status === "已确认" ? "已导出" : prompt.status })) }));
  }

  function reset() {
    if (confirm("确定清空当前浏览器中的项目数据吗？")) {
      setData(emptyData);
      setCharacterId("");
      setSceneId("");
      setPage("home");
    }
  }

  return <div className="min-h-screen bg-paper"><aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-panel lg:block"><div className="flex h-16 items-center gap-3 border-b border-line px-5"><div className="flex h-9 w-9 items-center justify-center rounded-md bg-signal text-white"><Video size={19} /></div><div><h1 className="text-sm font-semibold">AI导演前期工作台</h1><p className="text-xs text-muted">MVP 本地原型</p></div></div><nav className="space-y-1 p-3">{navItems.map(({ page: itemPage, label, icon: Icon }) => { const active = page === itemPage || (itemPage === "characters" && page === "character") || (itemPage === "scenes" && page === "scene"); return <button key={itemPage} className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm ${active ? "bg-signal/10 font-medium text-signal" : "text-slate-700 hover:bg-slate-50"}`} onClick={() => setPage(itemPage)}><Icon size={17} />{label}</button>; })}</nav></aside><main className="lg:pl-64"><header className="sticky top-0 z-10 flex min-h-16 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur lg:px-8"><div><p className="text-xs text-muted">{data.project?.scriptType || "尚未创建项目"}</p><h2 className="text-lg font-semibold">{data.project?.name || "AI导演前期工作台"}</h2></div><div className="flex gap-2"><button className="btn" onClick={() => setPage("export")}><Download size={16} />导出</button><button className="btn btn-danger" onClick={reset}><Trash2 size={16} />清空</button></div></header><div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">{renderPage()}</div></main></div>;

  function renderPage() {
    if (page !== "home" && !data.project) return <Blank text="请先在项目首页创建项目，再上传剧本或管理资产。" />;
    if (page === "script") return <ScriptPage />;
    if (page === "characters") return <CharactersPage />;
    if (page === "character") return selectedCharacter ? <CharacterDetail character={selectedCharacter} /> : <CharactersPage />;
    if (page === "scenes") return <ScenesPage />;
    if (page === "scene") return selectedScene ? <SceneDetail scene={selectedScene} /> : <ScenesPage />;
    if (page === "prompts") return <PromptsPage />;
    if (page === "export") return <ExportPage />;
    return <HomePage />;
  }

  function HomePage() {
    return <div className="space-y-6"><section className="rounded-md border border-line bg-white p-5"><div className="mb-5 flex items-center justify-between gap-3"><div><h3 className="text-base font-semibold">项目设置</h3><p className="mt-1 text-sm text-muted">设定项目语境，模拟解析会据此生成资产提示词。</p></div><button className="btn btn-primary" onClick={ensureProject}><Plus size={16} />{data.project ? "保存项目" : "创建项目"}</button></div>{data.project ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><Field label="项目名称" value={data.project.name} onChange={(value) => updateProject("name", value)} /><Field label="剧本类型" value={data.project.scriptType} onChange={(value) => updateProject("scriptType", value)} /><Field label="时代背景" value={data.project.era} onChange={(value) => updateProject("era", value)} /><Field label="默认画幅" value={data.project.defaultRatio} onChange={(value) => updateProject("defaultRatio", value)} /><div className="md:col-span-2"><Field label="视觉风格" value={data.project.visualStyle} onChange={(value) => updateProject("visualStyle", value)} /></div></div> : <Blank text="还没有项目。点击创建后即可开始导入剧本。" />}</section><section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">{Object.entries({ 人物: stats.characters, 人物时期: stats.periods, 场景: stats.scenes, 机位: stats.angles, 提示词: stats.prompts, 已确认: stats.confirmed }).map(([label, value]) => <div key={label} className="rounded-md border border-line bg-white p-4"><p className="text-xs text-muted">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}</section></div>;
  }

  function ScriptPage() {
    return <section className="rounded-md border border-line bg-white p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-base font-semibold">剧本输入</h3><p className="mt-1 text-sm text-muted">支持 TXT 导入，也可以直接粘贴剧本文本。</p></div><label className="btn cursor-pointer"><Upload size={16} />导入 TXT<input className="hidden" type="file" accept=".txt,text/plain" onChange={(event) => event.target.files?.[0] && loadTxt(event.target.files[0])} /></label></div><textarea className="field-area min-h-[420px] resize-y font-mono" value={data.scriptText} placeholder={"第一集\n外 景 老城区街口 夜 雨\n林夏：我不能再逃避了。\n顾辰：真相就在今晚。"} onChange={(event) => patch((current) => ({ ...current, scriptText: event.target.value }))} /><div className="mt-4 flex justify-end"><button className="btn btn-primary" onClick={parseScript} disabled={!data.scriptText.trim()}><Sparkles size={16} />模拟解析剧本</button></div></section>;
  }

  function CharactersPage() {
    return <div className="space-y-4"><Toolbar title="人物库" desc="管理人物基础分析、关系和成长弧线。" action="新增人物" onAction={addCharacter} />{data.characters.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{data.characters.map((character) => <button key={character.id} className="rounded-md border border-line bg-white p-4 text-left hover:border-signal" onClick={() => { setCharacterId(character.id); setPage("character"); }}><div className="flex justify-between gap-3"><div><h4 className="font-semibold">{character.name}</h4><p className="mt-1 text-sm text-muted">{character.identity || "未填写身份"}</p></div><Pill status={character.status} /></div><p className="mt-3 line-clamp-2 text-sm text-slate-600">{character.personality || "暂无人物分析"}</p></button>)}</div> : <Blank text="暂无人物。请先模拟解析，或手动新增人物。" />}</div>;
  }

  function CharacterDetail({ character }: { character: Character }) {
    const periods = data.periods.filter((period) => period.characterId === character.id);
    return <div className="space-y-5"><button className="btn" onClick={() => setPage("characters")}>返回人物库</button><section className="rounded-md border border-line bg-white p-5"><div className="mb-4 flex items-center justify-between"><h3 className="text-base font-semibold">人物详情</h3><div className="w-36"><StatusSelect value={character.status} onChange={(status) => updateCharacter(character.id, { status })} /></div></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><Field label="姓名" value={character.name} onChange={(value) => updateCharacter(character.id, { name: value })} /><Field label="别名" value={character.aliases} onChange={(value) => updateCharacter(character.id, { aliases: value })} /><Field label="性别" value={character.gender} onChange={(value) => updateCharacter(character.id, { gender: value })} /><Field label="身份" value={character.identity} onChange={(value) => updateCharacter(character.id, { identity: value })} /><Field label="首次出现" value={character.firstEpisode} onChange={(value) => updateCharacter(character.id, { firstEpisode: value })} /><Field label="出现集数" value={character.episodes} onChange={(value) => updateCharacter(character.id, { episodes: value })} /><Area label="性格" value={character.personality} onChange={(value) => updateCharacter(character.id, { personality: value })} /><Area label="面部基底" value={character.faceBase} onChange={(value) => updateCharacter(character.id, { faceBase: value })} /><Area label="人物关系" value={character.relationship} onChange={(value) => updateCharacter(character.id, { relationship: value })} /><div className="md:col-span-2 xl:col-span-3"><Area label="成长弧线" value={character.arc} onChange={(value) => updateCharacter(character.id, { arc: value })} /></div></div></section><h3 className="text-base font-semibold">人物时期造型库</h3>{periods.map((period) => <section key={period.id} className="rounded-md border border-line bg-white p-5"><div className="grid gap-4 md:grid-cols-[1fr_160px]"><Field label="时期名称" value={period.name} onChange={(value) => updatePeriod(period.id, { name: value })} /><label><span className="field-label">状态</span><StatusSelect value={period.status} onChange={(status) => updatePeriod(period.id, { status })} /></label></div><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3"><Field label="集数" value={period.episodes} onChange={(value) => updatePeriod(period.id, { episodes: value })} /><Field label="年龄状态" value={period.ageState} onChange={(value) => updatePeriod(period.id, { ageState: value })} /><Field label="身份状态" value={period.identityState} onChange={(value) => updatePeriod(period.id, { identityState: value })} /><Field label="情绪状态" value={period.emotionState} onChange={(value) => updatePeriod(period.id, { emotionState: value })} /><Field label="服装" value={period.costume} onChange={(value) => updatePeriod(period.id, { costume: value })} /><Field label="发型" value={period.hairstyle} onChange={(value) => updatePeriod(period.id, { hairstyle: value })} /><Field label="妆容" value={period.makeup} onChange={(value) => updatePeriod(period.id, { makeup: value })} /><Field label="身体状态" value={period.bodyState} onChange={(value) => updatePeriod(period.id, { bodyState: value })} /><div className="md:col-span-2 xl:col-span-3"><Area label="三视图提示词" rows={4} value={period.prompt} onChange={(value) => updatePeriod(period.id, { prompt: value })} /></div></div></section>)}</div>;
  }

  function ScenesPage() {
    return <div className="space-y-4"><Toolbar title="场景库" desc="管理场景风格、色调、道具和主提示词。" action="新增场景" onAction={addScene} />{data.scenes.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{data.scenes.map((scene) => <button key={scene.id} className="rounded-md border border-line bg-white p-4 text-left hover:border-signal" onClick={() => { setSceneId(scene.id); setPage("scene"); }}><div className="flex justify-between gap-3"><div><h4 className="font-semibold">{scene.name}</h4><p className="mt-1 text-sm text-muted">{scene.locationGroup || "未分组"}</p></div><Pill status={scene.status} /></div><p className="mt-3 line-clamp-2 text-sm text-slate-600">{scene.function || "暂无场景功能说明"}</p></button>)}</div> : <Blank text="暂无场景。请先模拟解析，或手动新增场景。" />}</div>;
  }

  function SceneDetail({ scene }: { scene: Scene }) {
    const angles = data.cameraAngles.filter((angle) => angle.sceneId === scene.id);
    return <div className="space-y-5"><button className="btn" onClick={() => setPage("scenes")}>返回场景库</button><section className="rounded-md border border-line bg-white p-5"><div className="mb-4 flex items-center justify-between"><h3 className="text-base font-semibold">场景详情</h3><div className="w-36"><StatusSelect value={scene.status} onChange={(status) => updateScene(scene.id, { status })} /></div></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><Field label="场景名称" value={scene.name} onChange={(value) => updateScene(scene.id, { name: value })} /><Field label="别名" value={scene.aliases} onChange={(value) => updateScene(scene.id, { aliases: value })} /><Field label="类型" value={scene.type} onChange={(value) => updateScene(scene.id, { type: value })} /><Field label="场景组" value={scene.locationGroup} onChange={(value) => updateScene(scene.id, { locationGroup: value })} /><Field label="集数" value={scene.episodes} onChange={(value) => updateScene(scene.id, { episodes: value })} /><Field label="天气" value={scene.weather} onChange={(value) => updateScene(scene.id, { weather: value })} /><Area label="戏剧功能" value={scene.function} onChange={(value) => updateScene(scene.id, { function: value })} /><Area label="风格" value={scene.style} onChange={(value) => updateScene(scene.id, { style: value })} /><Area label="色调" value={scene.colorTone} onChange={(value) => updateScene(scene.id, { colorTone: value })} /><Area label="灯光" value={scene.lighting} onChange={(value) => updateScene(scene.id, { lighting: value })} /><Area label="道具" value={scene.props} onChange={(value) => updateScene(scene.id, { props: value })} /><div className="md:col-span-2 xl:col-span-3"><Area label="场景主提示词" rows={4} value={scene.mainPrompt} onChange={(value) => updateScene(scene.id, { mainPrompt: value })} /></div></div></section><h3 className="text-base font-semibold">场景机位库</h3>{angles.map((angle) => <section key={angle.id} className="rounded-md border border-line bg-white p-5"><div className="grid gap-4 md:grid-cols-[1fr_160px]"><Field label="机位名称" value={angle.name} onChange={(value) => updateAngle(angle.id, { name: value })} /><label><span className="field-label">状态</span><StatusSelect value={angle.status} onChange={(status) => updateAngle(angle.id, { status })} /></label></div><div className="mt-4 grid gap-4 md:grid-cols-2"><Area label="机位说明" value={angle.description} onChange={(value) => updateAngle(angle.id, { description: value })} /><Area label="机位提示词" value={angle.prompt} onChange={(value) => updateAngle(angle.id, { prompt: value })} /></div></section>)}</div>;
  }

  function PromptsPage() {
    return <div className="space-y-4"><div><h3 className="text-base font-semibold">提示词审核中心</h3><p className="mt-1 text-sm text-muted">集中审核人物三视图、场景主提示词和机位提示词。</p></div>{data.prompts.length ? data.prompts.map((prompt) => <section key={prompt.id} className="rounded-md border border-line bg-white p-4"><div className="mb-3 grid gap-3 md:grid-cols-[1fr_160px]"><div className="flex flex-wrap items-center gap-2"><Pill status={prompt.status} /><span className="text-sm font-medium">{prompt.targetType}</span><span className="text-sm text-muted">{prompt.promptType}</span></div><StatusSelect value={prompt.status} onChange={(status) => updatePrompt(prompt.id, { status })} /></div><Area label="正向提示词" rows={3} value={prompt.content} onChange={(value) => updatePrompt(prompt.id, { content: value, status: "已修改" })} /><div className="mt-3"><Area label="反向提示词" rows={2} value={prompt.negativePrompt} onChange={(value) => updatePrompt(prompt.id, { negativePrompt: value, status: "已修改" })} /></div></section>) : <Blank text="暂无提示词。请先模拟解析剧本生成提示词库。" />}</div>;
  }

  function ExportPage() {
    return <div className="space-y-5"><section className="rounded-md border border-line bg-white p-5"><div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="text-base font-semibold">导出中心</h3><p className="mt-1 text-sm text-muted">导出包含项目、剧本、人物、时期、场景、机位和提示词的完整 JSON。</p></div><button className="btn btn-primary" onClick={exportJson} disabled={!data.project}><Download size={16} />导出完整 JSON</button></div><div className="grid gap-3 md:grid-cols-3"><Info label="项目" value={data.project?.name || "未创建"} /><Info label="提示词审核" value={`${stats.confirmed}/${stats.prompts} 已确认`} /><Info label="资产规模" value={`${stats.characters} 人物 / ${stats.scenes} 场景 / ${stats.angles} 机位`} /></div></section><section className="rounded-md border border-line bg-white p-5"><h3 className="mb-3 text-base font-semibold">JSON 预览</h3><pre className="max-h-[520px] overflow-auto rounded-md bg-slate-950 p-4 text-xs leading-5 text-slate-100">{JSON.stringify(data, null, 2)}</pre></section></div>;
  }
}

function Toolbar({ title, desc, action, onAction }: { title: string; desc: string; action: string; onAction: () => void }) {
  return <div className="flex items-center justify-between gap-3"><div><h3 className="text-base font-semibold">{title}</h3><p className="mt-1 text-sm text-muted">{desc}</p></div><button className="btn btn-primary" onClick={onAction}><Plus size={16} />{action}</button></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-line bg-paper p-4"><p className="text-xs text-muted">{label}</p><p className="mt-2 font-medium">{value}</p></div>;
}
