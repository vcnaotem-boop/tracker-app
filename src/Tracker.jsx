import React, { useState, useEffect } from "react";

const C = {
  paper: "#F3EEE5", card: "#FBF8F2", ink: "#2A2620", sub: "#8A8175",
  line: "#E4DCCE", clay: "#B5623C", sage: "#6E7B5B", gold: "#C79A3E", blush: "#C08457",
};

// ---- Exercise library: name -> {primary:[], secondary:[], pri (delt/back focus)} ----
// Muscle groups: Side Delt, Rear Delt, Front Delt, Chest, Upper Chest, Lats, Upper Back, Biceps, Triceps, Quads, Hamstrings, Glutes, Calves, Abs
const LIB = {
  // Shoulders
  "DB lateral raise": { p: ["Side Delt"], s: [] },
  "Cable lateral raise": { p: ["Side Delt"], s: [] },
  "Machine lateral raise": { p: ["Side Delt"], s: [] },
  "Lean-away cable lateral raise": { p: ["Side Delt"], s: [] },
  "Reverse pec-deck": { p: ["Rear Delt"], s: ["Upper Back"] },
  "Rope face pull": { p: ["Rear Delt"], s: ["Upper Back"] },
  "Rear-delt cable": { p: ["Rear Delt"], s: [] },
  "Bent-over rear delt raise": { p: ["Rear Delt"], s: ["Upper Back"] },
  "DB shoulder press": { p: ["Front Delt"], s: ["Triceps", "Side Delt"] },
  "Machine shoulder press": { p: ["Front Delt"], s: ["Triceps"] },
  // Back
  "Chest-supported row": { p: ["Upper Back", "Lats"], s: ["Rear Delt", "Biceps"] },
  "Seated cable row (wide)": { p: ["Upper Back"], s: ["Lats", "Rear Delt"] },
  "Seated cable row (neutral)": { p: ["Lats", "Upper Back"], s: ["Biceps"] },
  "Machine row (wide)": { p: ["Upper Back"], s: ["Lats", "Rear Delt"] },
  "Single-arm DB row": { p: ["Lats", "Upper Back"], s: ["Biceps"] },
  "Lat pulldown": { p: ["Lats"], s: ["Biceps"] },
  "Straight-arm pulldown": { p: ["Lats"], s: [] },
  "Pull-up": { p: ["Lats"], s: ["Biceps", "Upper Back"] },
  // Chest
  "Incline machine press": { p: ["Upper Chest"], s: ["Front Delt", "Triceps"] },
  "Incline DB press": { p: ["Upper Chest"], s: ["Front Delt", "Triceps"] },
  "Incline cable flye": { p: ["Upper Chest"], s: ["Chest"] },
  "Flat DB press": { p: ["Chest"], s: ["Front Delt", "Triceps"] },
  "Machine chest press": { p: ["Chest"], s: ["Triceps"] },
  "Pec-deck flye": { p: ["Chest"], s: [] },
  "Cable flye": { p: ["Chest"], s: [] },
  "Push-up": { p: ["Chest"], s: ["Triceps", "Front Delt"] },
  // Arms
  "Hammer curl": { p: ["Biceps"], s: [] },
  "DB curl": { p: ["Biceps"], s: [] },
  "Cable curl": { p: ["Biceps"], s: [] },
  "Machine curl": { p: ["Biceps"], s: [] },
  "Rope pushdown": { p: ["Triceps"], s: [] },
  "Overhead cable extension": { p: ["Triceps"], s: [] },
  "Dips": { p: ["Triceps"], s: ["Chest"] },
  // Legs
  "Leg press": { p: ["Quads"], s: ["Glutes"] },
  "Hack squat": { p: ["Quads"], s: ["Glutes"] },
  "Leg extension": { p: ["Quads"], s: [] },
  "Leg curl": { p: ["Hamstrings"], s: [] },
  "Romanian deadlift": { p: ["Hamstrings", "Glutes"], s: [] },
  "Hip thrust": { p: ["Glutes"], s: ["Hamstrings"] },
  "Calf raise": { p: ["Calves"], s: [] },
  // Core
  "Cable crunch": { p: ["Abs"], s: [] },
  "Hanging leg raise": { p: ["Abs"], s: [] },
  "Plank": { p: ["Abs"], s: [] },
};
const PRI_MUSCLES = new Set(["Side Delt", "Rear Delt", "Lats", "Upper Back", "Upper Chest"]);
const isPriorityEx = (name) => { const e = LIB[name]; if (!e) return false; return e.p.some((m) => PRI_MUSCLES.has(m)); };

// Preloaded staple foods
const DEFAULT_FOODS = [
  { id: "f1", name: "White rice, 150g cooked", p: 4, c: 40, f: 0 },
  { id: "f2", name: "Chicken breast, 6oz", p: 42, c: 0, f: 5 },
  { id: "f3", name: "Tilapia, 8oz", p: 46, c: 0, f: 4 },
  { id: "f4", name: "Egg whites, 1 cup", p: 26, c: 2, f: 0 },
  { id: "f5", name: "Whole egg", p: 6, c: 1, f: 5 },
  { id: "f6", name: "Rice cake", p: 1, c: 7, f: 0 },
  { id: "f7", name: "Honey, 1 tbsp", p: 0, c: 17, f: 0 },
  { id: "f8", name: "Almonds, 20g", p: 4, c: 4, f: 10 },
  { id: "f9", name: "Banana", p: 1, c: 27, f: 0 },
  { id: "f10", name: "Greek yogurt, 150g", p: 15, c: 6, f: 4 },
];


// Per-100g macros for weighed staples (from general food-composition knowledge; use a label when you have one).
// {unit:"g"} => enter grams. {unit:"each", grams:X} => per-piece, weight optional.
const INGREDIENTS = [
  { name: "White rice, cooked", unit: "g", per: 100, p: 2.7, c: 28, f: 0.3 },
  { name: "Brown rice, cooked", unit: "g", per: 100, p: 2.6, c: 23, f: 0.9 },
  { name: "Oats, dry", unit: "g", per: 100, p: 13, c: 67, f: 7 },
  { name: "Chicken breast, cooked", unit: "g", per: 100, p: 31, c: 0, f: 3.6 },
  { name: "Tilapia, cooked", unit: "g", per: 100, p: 26, c: 0, f: 2.7 },
  { name: "Flank steak, cooked", unit: "g", per: 100, p: 27, c: 0, f: 9 },
  { name: "Egg whites, liquid", unit: "g", per: 100, p: 11, c: 0.7, f: 0.2 },
  { name: "Greek yogurt, plain nonfat", unit: "g", per: 100, p: 10, c: 4, f: 0.4 },
  { name: "Almonds", unit: "g", per: 100, p: 21, c: 22, f: 50 },
  { name: "Almond butter", unit: "g", per: 100, p: 21, c: 19, f: 56 },
  { name: "Broccoli, raw", unit: "g", per: 100, p: 2.8, c: 7, f: 0.4 },
  { name: "Strawberries", unit: "g", per: 100, p: 0.7, c: 8, f: 0.3 },
  { name: "Sweet potato, cooked", unit: "g", per: 100, p: 1.6, c: 20, f: 0.1 },
  { name: "Whey protein", unit: "g", per: 100, p: 80, c: 8, f: 6 },
  { name: "Honey", unit: "g", per: 100, p: 0.3, c: 82, f: 0 },
  // countable
  { name: "Whole egg", unit: "each", grams: 50, p: 6, c: 0.4, f: 5 },
  { name: "Banana, medium", unit: "each", grams: 118, p: 1.3, c: 27, f: 0.4 },
  { name: "Rice cake", unit: "each", grams: 9, p: 0.7, c: 7, f: 0.3 },
  { name: "Apple, medium", unit: "each", grams: 182, p: 0.5, c: 25, f: 0.3 },
];

const activityFactors = {
  "Mostly resting (caretaking, low activity)": 1.3,
  "Light (some walking, 2-3 easy sessions)": 1.45,
  "Moderate (training most days)": 1.6,
  "High (hard training + active job)": 1.75,
};

// Current plan, editable only by coach-in-conversation. Held here for reference.
const PLAN = {
  title: "Maintenance-plus · delt + back bias",
  note: "3× full-body, flexible. Miss a day guilt-free. Light/high-rep, stop shy of failure. No overhead, no pulldowns, straps, neutral grips (neck + elbow).",
  days: [
    { name: "Day A", items: ["DB/cable lateral raise — 4×12-15", "Chest-supported row — 4×10-12", "Incline machine press — 3×10-12", "Reverse pec-deck — 3×15", "Machine/hammer curl — 2×12", "Leg press — 2×15"] },
    { name: "Day B", items: ["Cable lateral raise — 4×15", "Seated cable row wide — 4×10-12", "Incline cable flye — 3×12-15", "Rope face pull — 3×15-20", "Rope pushdown — 2×15", "Leg curl — 2×15"] },
    { name: "Day C", items: ["Machine lateral raise — 4×12-15", "Chest-supported row wide — 4×10-12", "Incline machine press — 3×10-12", "Rear-delt cable — 3×15", "Calf raise — 3×15", "Optional arms — 2×12"] },
  ],
  updated: "Set at maintenance phase, Jul 2026",
};

export default function App() {
  const [profile, setProfile] = useState(null);
  const [targets, setTargets] = useState(null);
  const [log, setLog] = useState({});
  const [foods, setFoods] = useState(DEFAULT_FOODS);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState("idle");
  const [storageOk, setStorageOk] = useState(null); // null unknown, true/false known

  // localStorage-backed persistence (works on any normal web host, e.g. Netlify).
  const readKey = (key) => {
    try { const v = localStorage.getItem(key); return v == null ? null : JSON.parse(v); }
    catch (e) { return null; }
  };

  useEffect(() => {
    try {
      const p = readKey("profile"); if (p) setProfile(p);
      const t = readKey("targets4"); if (t) setTargets(t);
      const l = readKey("log4"); if (l) setLog(l);
      const f = readKey("foods"); if (f) setFoods(f);
      // probe that localStorage actually works
      localStorage.setItem("__probe", "1"); localStorage.removeItem("__probe");
      setStorageOk(true);
    } catch (e) { setStorageOk(false); }
    setLoaded(true);
  }, []);

  const save = (patch = {}) => {
    setSaveState("saving");
    try {
      if (patch.log !== undefined) localStorage.setItem("log4", JSON.stringify(patch.log));
      if (patch.targets !== undefined) localStorage.setItem("targets4", JSON.stringify(patch.targets));
      if (patch.profile !== undefined) localStorage.setItem("profile", JSON.stringify(patch.profile));
      if (patch.foods !== undefined) localStorage.setItem("foods", JSON.stringify(patch.foods));
      setStorageOk(true);
      setSaveState("saved"); setTimeout(() => setSaveState("idle"), 1000);
    } catch (e) { setSaveState("error"); setStorageOk(false); }
  };

  const backup = () => {
    const blob = JSON.stringify({ profile, targets, log, foods });
    try { navigator.clipboard.writeText(blob); alert("Backup copied to clipboard. Paste it somewhere safe (Notes, email to yourself)."); }
    catch (e) { window.prompt("Copy your backup:", blob); }
  };
  const restore = () => {
    const raw = window.prompt("Paste a backup:");
    if (!raw) return;
    try { const x = JSON.parse(raw); if (x.profile) setProfile(x.profile); if (x.targets) setTargets(x.targets); if (x.log) setLog(x.log); if (x.foods) setFoods(x.foods); save(x); alert("Restored."); }
    catch (e) { alert("That didn't look like a valid backup."); }
  };

  const banner = storageOk === false ? (
    <div style={{ background: "#F6E7DF", borderBottom: "1px solid " + C.line, padding: "10px 16px", fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, color: "#8a3d24" }}>
      Auto-save isn't available in this view, so data may not survive a reload. Use <b>Backup</b> to copy your data out, and <b>Restore</b> to bring it back.
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={backup} style={{ ...ghostBtn, padding: "6px 12px" }}>Backup</button>
        <button onClick={restore} style={{ ...ghostBtn, padding: "6px 12px" }}>Restore</button>
      </div>
    </div>
  ) : null;

  if (!loaded) return <Frame><div style={{ padding: 40, textAlign: "center", color: C.sub }}>Loading…</div></Frame>;
  if (!profile || !targets) return <Frame>{banner}<Onboarding onDone={(prof, tgt) => { setProfile(prof); setTargets(tgt); save({ profile: prof, targets: tgt }); }} /></Frame>;

  return <Frame>{banner}<Main
    profile={profile} targets={targets} setTargets={(t) => { setTargets(t); save({ targets: t }); }}
    log={log} setLog={(l) => { setLog(l); save({ log: l }); }}
    foods={foods} setFoods={(f) => { setFoods(f); save({ foods: f }); }}
    saveState={saveState} resetProfile={() => { setProfile(null); setTargets(null); }} /></Frame>;
}

function Frame({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#E8E1D5", display: "flex", justifyContent: "center", padding: "16px 0", fontFamily: "'Georgia', serif" }}>
      <div style={{ width: "100%", maxWidth: 430, background: C.paper, borderRadius: 28, overflow: "hidden", boxShadow: "0 12px 40px rgba(42,38,32,.18)", border: "1px solid " + C.line }}>
        {children}
      </div>
    </div>
  );
}

function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState({ name: "", sex: "male", age: "", ht: "", wt: "", units: "metric", activity: Object.keys(activityFactors)[1], goal: "maintain" });
  const Q = ({ children }) => <div style={{ padding: "0 24px" }}>{children}</div>;
  const label = { fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: C.sub, marginBottom: 10 };
  const input = { width: "100%", boxSizing: "border-box", padding: "14px 16px", fontSize: 18, fontFamily: "'Georgia',serif", background: C.card, border: "1px solid " + C.line, borderRadius: 14, color: C.ink, outline: "none" };
  const choice = (active) => ({ flex: 1, padding: "13px 0", textAlign: "center", borderRadius: 12, cursor: "pointer", fontFamily: "'Helvetica Neue',sans-serif", fontSize: 14, fontWeight: 600, border: "1px solid " + (active ? C.clay : C.line), background: active ? C.clay : C.card, color: active ? "#fff" : C.ink });

  const steps = [
    <Q key="n"><div style={label}>First, your name</div><input autoFocus style={input} value={a.name} onChange={(e) => setA({ ...a, name: e.target.value })} placeholder="Mauro" /></Q>,
    <Q key="s"><div style={label}>Biological sex (for the metabolic math)</div><div style={{ display: "flex", gap: 10 }}>
      <div style={choice(a.sex === "male")} onClick={() => setA({ ...a, sex: "male" })}>Male</div>
      <div style={choice(a.sex === "female")} onClick={() => setA({ ...a, sex: "female" })}>Female</div></div></Q>,
    <Q key="u"><div style={label}>Units</div><div style={{ display: "flex", gap: 10 }}>
      <div style={choice(a.units === "metric")} onClick={() => setA({ ...a, units: "metric" })}>kg / cm</div>
      <div style={choice(a.units === "imperial")} onClick={() => setA({ ...a, units: "imperial" })}>lb / in</div></div></Q>,
    <Q key="a"><div style={label}>Age</div><input autoFocus type="number" style={input} value={a.age} onChange={(e) => setA({ ...a, age: e.target.value })} placeholder="43" /></Q>,
    <Q key="h"><div style={label}>Height ({a.units === "metric" ? "cm" : "in"})</div><input autoFocus type="number" style={input} value={a.ht} onChange={(e) => setA({ ...a, ht: e.target.value })} placeholder={a.units === "metric" ? "175" : "69"} /></Q>,
    <Q key="w"><div style={label}>Current weight ({a.units === "metric" ? "kg" : "lb"})</div><input autoFocus type="number" style={input} value={a.wt} onChange={(e) => setA({ ...a, wt: e.target.value })} placeholder={a.units === "metric" ? "70" : "154"} /></Q>,
    <Q key="act"><div style={label}>Right now, activity looks like</div><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Object.keys(activityFactors).map((k) => <div key={k} style={{ ...choice(a.activity === k), textAlign: "left", padding: "13px 16px", fontSize: 13 }} onClick={() => setA({ ...a, activity: k })}>{k}</div>)}</div></Q>,
    <Q key="g"><div style={label}>Goal this phase</div><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[["maintain", "Maintain — hold and recompose (recommended now)"], ["gain", "Slow gain — small surplus for muscle"], ["lose", "Slow lean — small deficit"]].map(([k, t]) =>
        <div key={k} style={{ ...choice(a.goal === k), textAlign: "left", padding: "13px 16px", fontSize: 13 }} onClick={() => setA({ ...a, goal: k })}>{t}</div>)}</div></Q>,
  ];
  const canNext = () => {
    if (step === 0) return a.name.trim();
    if (step === 3) return +a.age > 0;
    if (step === 4) return +a.ht > 0;
    if (step === 5) return +a.wt > 0;
    return true;
  };
  const compute = () => {
    let wtKg = +a.wt, htCm = +a.ht;
    if (a.units === "imperial") { wtKg = +a.wt * 0.4536; htCm = +a.ht * 2.54; }
    const bmr = a.sex === "male" ? 10 * wtKg + 6.25 * htCm - 5 * +a.age + 5 : 10 * wtKg + 6.25 * htCm - 5 * +a.age - 161;
    const tdee = bmr * activityFactors[a.activity];
    let cal = tdee; if (a.goal === "gain") cal = tdee + 200; if (a.goal === "lose") cal = tdee - 350;
    cal = Math.round(cal / 5) * 5;
    const wtLb = wtKg / 0.4536;
    const protein = Math.round(wtLb * 1.0), fat = Math.round(wtLb * 0.35);
    const carbs = Math.max(0, Math.round((cal - protein * 4 - fat * 9) / 4));
    const water = +(wtKg * 0.035).toFixed(1);
    return { calories: cal, protein, fat, carbs, water };
  };
  const last = step === steps.length - 1;
  return (
    <div style={{ padding: "28px 0 24px" }}>
      <div style={{ padding: "0 24px 18px" }}>
        <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: C.clay }}>Setup</div>
        <div style={{ fontSize: 26, color: C.ink, marginTop: 4, lineHeight: 1.15 }}>Let's build your plan</div>
        <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, color: C.sub, marginTop: 8, lineHeight: 1.5 }}>
          Not medical advice. Estimates targets from standard equations; adjust as your weight responds. A tool to guide you, not a scorecard.
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, padding: "0 24px 22px" }}>{steps.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? C.clay : C.line }} />)}</div>
      {steps[step]}
      <div style={{ display: "flex", gap: 10, padding: "26px 24px 0" }}>
        {step > 0 && <button onClick={() => setStep(step - 1)} style={ghostBtn}>Back</button>}
        {!last ? <button disabled={!canNext()} onClick={() => canNext() && setStep(step + 1)} style={{ ...primaryBtn, flex: 1, opacity: canNext() ? 1 : .4 }}>Continue</button>
          : <button onClick={() => onDone({ ...a }, compute())} style={{ ...primaryBtn, flex: 1 }}>See my plan</button>}
      </div>
    </div>
  );
}

function Main({ profile, targets, setTargets, log, setLog, foods, setFoods, saveState, resetProfile }) {
  const todayKey = () => new Date().toISOString().slice(0, 10);
  const [tab, setTab] = useState("Today");
  const [day, setDay] = useState(todayKey());
  const blank = { food: [], lifts: [], weight: null, mind: null, water: 0 };
  const d = log[day] || blank;
  const update = (patch) => setLog({ ...log, [day]: { ...blank, ...d, ...patch } });
  const shift = (n) => { const x = new Date(day); x.setDate(x.getDate() + n); setDay(x.toISOString().slice(0, 10)); };
  const tabs = ["Today", "Train", "Plan", "Mind", "Trends"];
  return (
    <div>
      <div style={{ padding: "20px 22px 14px", borderBottom: "1px solid " + C.line }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: C.clay }}>{profile.name ? profile.name + "'s log" : "Training log"}</div>
            <div style={{ fontSize: 22, color: C.ink, marginTop: 2 }}>{day === todayKey() ? "Today" : day}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 10, color: saveState === "error" ? "#b3402c" : C.sage }}>{saveState === "saving" ? "saving" : saveState === "saved" ? "saved" : ""}</span>
            <button onClick={() => shift(-1)} style={navBtn}>‹</button>
            <button onClick={() => shift(1)} style={navBtn}>›</button>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", padding: "12px 12px 0", gap: 2 }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "9px 0", background: "none", border: "none", cursor: "pointer", fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, fontWeight: 600, color: tab === t ? C.ink : C.sub, borderBottom: "2px solid " + (tab === t ? C.clay : "transparent") }}>{t}</button>
        ))}
      </div>
      <div style={{ padding: 18 }}>
        {tab === "Today" && <Today d={d} update={update} targets={targets} foods={foods} setFoods={setFoods} />}
        {tab === "Train" && <Train d={d} update={update} />}
        {tab === "Plan" && <PlanTab />}
        {tab === "Mind" && <Mind d={d} update={update} />}
        {tab === "Trends" && <Trends log={log} targets={targets} setTargets={setTargets} resetProfile={resetProfile} />}
      </div>
    </div>
  );
}

function Ring({ value, target }) {
  const pct = target ? Math.min(1, value / target) : 0;
  const r = 46, circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ position: "relative", width: 108, height: 108 }}>
        <svg width="108" height="108" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="54" cy="54" r={r} fill="none" stroke={C.line} strokeWidth="9" />
          <circle cx="54" cy="54" r={r} fill="none" stroke={C.clay} strokeWidth="9" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} style={{ transition: "stroke-dashoffset .5s" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 26, color: C.ink }}>{Math.round(value)}</div>
          <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 10, color: C.sub }}>of {target}</div>
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: C.sub }}>Calories</div>
        <div style={{ fontSize: 16, color: C.ink, marginTop: 2 }}>{Math.max(0, target - Math.round(value))} cal left</div>
      </div>
    </div>
  );
}
function MacroBar({ label, val, tgt, color }) {
  const pct = tgt ? Math.min(100, (val / tgt) * 100) : 0;
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, marginBottom: 5 }}>
        <span style={{ color: C.sub, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</span>
        <span style={{ color: val > tgt * 1.1 ? "#b3402c" : C.ink }}>{Math.round(val)}/{tgt}</span>
      </div>
      <div style={{ height: 6, background: C.line, borderRadius: 4, overflow: "hidden" }}><div style={{ width: pct + "%", height: "100%", background: color }} /></div>
    </div>
  );
}

function Today({ d, update, targets, foods, setFoods }) {
  const [f, setF] = useState({ name: "", p: "", c: "", f: "" });
  const [w, setW] = useState("");
  const [mode, setMode] = useState("weigh");
  const [q, setQ] = useState("");
  const [saveToLib, setSaveToLib] = useState(false);
  const t = d.food.reduce((a, e) => ({ p: a.p + (+e.p || 0), c: a.c + (+e.c || 0), f: a.f + (+e.f || 0) }), { p: 0, c: 0, f: 0 });
  const kcal = t.p * 4 + t.c * 4 + t.f * 9;

  const add = () => {
    if (!f.name && !f.p && !f.c && !f.f) return;
    update({ food: [...d.food, { ...f, id: Date.now() }] });
    if (saveToLib && f.name) {
      const exists = foods.some((x) => x.name.toLowerCase() === f.name.toLowerCase());
      if (!exists) setFoods([...foods, { id: "u" + Date.now(), name: f.name, p: +f.p || 0, c: +f.c || 0, f: +f.f || 0 }]);
    }
    setF({ name: "", p: "", c: "", f: "" }); setSaveToLib(false);
  };
  const addFromLib = (item) => { update({ food: [...d.food, { ...item, id: Date.now() }] }); setShowLib(false); setQ(""); };
  const removeFromLib = (id) => setFoods(foods.filter((x) => x.id !== id));
  const filtered = foods.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <Card>
        <Ring value={kcal} target={targets.calories} />
        <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
          <MacroBar label="Protein" val={t.p} tgt={targets.protein} color={C.sage} />
          <MacroBar label="Carbs" val={t.c} tgt={targets.carbs} color={C.gold} />
          <MacroBar label="Fat" val={t.f} tgt={targets.fat} color={C.blush} />
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <CardLabel>Add food</CardLabel>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {[["weigh", "By weight"], ["saved", "Saved"], ["manual", "Manual"]].map(([k, lbl]) => (
            <button key={k} onClick={() => setMode(k)} style={{ flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer", fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, fontWeight: 600, border: "1px solid " + (mode === k ? C.clay : C.line), background: mode === k ? C.clay : C.card, color: mode === k ? "#fff" : C.ink }}>{lbl}</button>
          ))}
        </div>

        {mode === "weigh" ? (
          <WeighPicker onAdd={(entry) => update({ food: [...d.food, { ...entry, id: Date.now() }] })} />
        ) : mode === "saved" ? (
          <div>
            <input autoFocus placeholder="search saved foods…" value={q} onChange={(e) => setQ(e.target.value)} style={{ ...field, width: "100%", marginBottom: 8 }} />
            <div style={{ maxHeight: 260, overflowY: "auto" }}>
              {filtered.length === 0 && <div style={{ color: C.sub, fontFamily: "'Helvetica Neue',sans-serif", fontSize: 13, padding: "8px 0" }}>No match. Use Manual to add it.</div>}
              {filtered.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid " + C.line }}>
                  <div style={{ cursor: "pointer", flex: 1 }} onClick={() => addFromLib(item)}>
                    <div style={{ color: C.ink, fontSize: 14 }}>{item.name}</div>
                    <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, color: C.sub }}>{item.p}p · {item.c}c · {item.f}f</div>
                  </div>
                  <button onClick={() => addFromLib(item)} style={{ ...primaryBtn, padding: "7px 12px" }}>Add</button>
                  {item.id.startsWith("u") && <button onClick={() => removeFromLib(item.id)} style={xBtn}>×</button>}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <input placeholder="name (optional)" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={{ ...field, width: "100%", marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 8 }}>
              {[["p", "protein"], ["c", "carbs"], ["f", "fat"]].map(([k, l]) => (
                <input key={k} type="number" placeholder={l} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} style={{ ...field, flex: 1, minWidth: 0 }} />
              ))}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, color: C.sub, cursor: "pointer" }}>
              <input type="checkbox" checked={saveToLib} onChange={(e) => setSaveToLib(e.target.checked)} /> Save to my foods for next time
            </label>
            <button onClick={add} style={{ ...primaryBtn, width: "100%", marginTop: 10 }}>Add</button>
          </div>
        )}

        {d.food.map((e) => (
          <div key={e.id} style={rowLine}>
            <span style={{ color: C.ink }}>{e.name || "item"}</span>
            <span style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, color: C.sub }}>{e.p || 0}p {e.c || 0}c {e.f || 0}f<button onClick={() => update({ food: d.food.filter((x) => x.id !== e.id) })} style={xBtn}>×</button></span>
          </div>
        ))}
      </Card>

      <Card>
        <CardLabel>Water</CardLabel>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div><span style={{ fontSize: 24, color: C.ink }}>{(d.water || 0).toFixed(2)}</span><span style={{ color: C.sub, fontFamily: "'Helvetica Neue',sans-serif", fontSize: 13 }}> / {targets.water} L</span></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => update({ water: Math.max(0, (d.water || 0) - 0.25) })} style={stepBtn}>−</button>
            <button onClick={() => update({ water: (d.water || 0) + 0.25 })} style={stepBtn}>+</button>
          </div>
        </div>
        <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 10, color: C.sub, marginTop: 6 }}>each tap = 250 ml</div>
      </Card>

      <Card>
        <CardLabel>Weight — morning, fasted</CardLabel>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="number" placeholder={d.weight != null ? String(d.weight) : "e.g. 70.2"} value={w} onChange={(e) => setW(e.target.value)} style={{ ...field, flex: 1 }} />
          <button onClick={() => { if (w !== "") { update({ weight: +w }); setW(""); } }} style={primaryBtn}>Save</button>
        </div>
      </Card>
    </>
  );
}


function WeighPicker({ onAdd }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [amt, setAmt] = useState("");
  const list = q ? INGREDIENTS.filter((i) => i.name.toLowerCase().includes(q.toLowerCase())) : INGREDIENTS;

  const calc = () => {
    if (!sel) return null;
    let factor;
    if (sel.unit === "g") factor = (+amt || 0) / sel.per;          // grams / 100g
    else factor = (+amt || 0);                                     // count of pieces
    return {
      name: sel.unit === "g" ? sel.name + ", " + (amt || 0) + "g" : (amt || 0) + "× " + sel.name,
      p: Math.round(sel.p * factor * 10) / 10,
      c: Math.round(sel.c * factor * 10) / 10,
      f: Math.round(sel.f * factor * 10) / 10,
    };
  };
  const preview = calc();

  if (!sel) {
    return (
      <div>
        <input autoFocus placeholder="search ingredients…" value={q} onChange={(e) => setQ(e.target.value)} style={{ ...field, width: "100%", marginBottom: 8 }} />
        <div style={{ maxHeight: 260, overflowY: "auto" }}>
          {list.map((i) => (
            <div key={i.name} onClick={() => { setSel(i); setAmt(i.unit === "each" ? "1" : ""); }} style={{ padding: "9px 0", borderBottom: "1px solid " + C.line, cursor: "pointer" }}>
              <div style={{ color: C.ink, fontSize: 14 }}>{i.name}</div>
              <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, color: C.sub }}>
                {i.unit === "g" ? "per 100g: " : "each: "}{i.p}p · {i.c}c · {i.f}f
              </div>
            </div>
          ))}
          {list.length === 0 && <div style={{ color: C.sub, fontFamily: "'Helvetica Neue',sans-serif", fontSize: 13, padding: "8px 0" }}>Not in the list. Use Manual to enter it once.</div>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 15, color: C.ink }}>{sel.name}</div>
      <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, color: C.sub, marginBottom: 10 }}>
        {sel.unit === "g" ? "per 100g: " : "each: "}{sel.p}p · {sel.c}c · {sel.f}f
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input autoFocus type="number" placeholder={sel.unit === "g" ? "grams" : "how many"} value={amt} onChange={(e) => setAmt(e.target.value)} style={{ ...field, flex: 1 }} />
        <span style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 13, color: C.sub }}>{sel.unit === "g" ? "g" : "pcs"}</span>
      </div>
      {preview && (
        <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 13, color: C.ink, margin: "12px 0", padding: "10px 12px", background: C.paper, borderRadius: 10 }}>
          = {preview.p}p · {preview.c}c · {preview.f}f · {Math.round(preview.p * 4 + preview.c * 4 + preview.f * 9)} cal
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => { setSel(null); setAmt(""); }} style={ghostBtn}>Back</button>
        <button onClick={() => { if (preview && (+amt) > 0) { onAdd(preview); setSel(null); setAmt(""); } }} style={{ ...primaryBtn, flex: 1 }}>Add</button>
      </div>
    </div>
  );
}

function Train({ d, update }) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState(null);
  const [custom, setCustom] = useState("");
  const [customMuscle, setCustomMuscle] = useState("Side Delt");
  const [sets, setSets] = useState([{ reps: "", weight: "" }]);
  const names = Object.keys(LIB);
  const filtered = q ? names.filter((n) => n.toLowerCase().includes(q.toLowerCase())) : names;

  const commit = () => {
    let name = picked, primary, secondary, pri;
    if (picked === "__custom") {
      name = custom.trim(); if (!name) return;
      primary = [customMuscle]; secondary = []; pri = PRI_MUSCLES.has(customMuscle);
    } else {
      if (!picked) return;
      primary = LIB[picked].p; secondary = LIB[picked].s; pri = isPriorityEx(picked);
    }
    const clean = sets.filter((s) => s.reps || s.weight);
    if (!clean.length) return;
    update({ lifts: [...d.lifts, { id: Date.now(), name, sets: clean, primary, secondary, pri }] });
    setPicked(null); setQ(""); setCustom(""); setSets([{ reps: "", weight: "" }]);
  };

  return (
    <>
      <Card>
        <CardLabel>Log a lift</CardLabel>
        {!picked ? (
          <div>
            <input autoFocus placeholder="search exercises…" value={q} onChange={(e) => setQ(e.target.value)} style={{ ...field, width: "100%", marginBottom: 8 }} />
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {filtered.map((n) => (
                <div key={n} onClick={() => setPicked(n)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + C.line, cursor: "pointer" }}>
                  <div>
                    <div style={{ color: isPriorityEx(n) ? C.clay : C.ink, fontSize: 14 }}>{isPriorityEx(n) ? "● " : ""}{n}</div>
                    <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, color: C.sub }}>{LIB[n].p.join(", ")}{LIB[n].s.length ? " · " + LIB[n].s.join(", ") : ""}</div>
                  </div>
                </div>
              ))}
              <div onClick={() => setPicked("__custom")} style={{ padding: "10px 0", cursor: "pointer", color: C.sub, fontFamily: "'Helvetica Neue',sans-serif", fontSize: 13 }}>+ Custom exercise…</div>
            </div>
          </div>
        ) : (
          <div>
            {picked === "__custom" ? (
              <div>
                <input autoFocus placeholder="exercise name" value={custom} onChange={(e) => setCustom(e.target.value)} style={{ ...field, width: "100%", marginBottom: 8 }} />
                <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, color: C.sub, marginBottom: 6 }}>Primary muscle</div>
                <select value={customMuscle} onChange={(e) => setCustomMuscle(e.target.value)} style={{ ...field, width: "100%", marginBottom: 10 }}>
                  {["Side Delt", "Rear Delt", "Front Delt", "Chest", "Upper Chest", "Lats", "Upper Back", "Biceps", "Triceps", "Quads", "Hamstrings", "Glutes", "Calves", "Abs"].map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            ) : (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 16, color: isPriorityEx(picked) ? C.clay : C.ink }}>{isPriorityEx(picked) ? "● " : ""}{picked}</div>
                <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, color: C.sub, marginTop: 2 }}>{LIB[picked].p.join(", ")}{LIB[picked].s.length ? " · " + LIB[picked].s.join(", ") : ""}</div>
              </div>
            )}
            {sets.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                <span style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, color: C.sub, width: 32 }}>#{i + 1}</span>
                <input type="number" placeholder="reps" value={s.reps} onChange={(e) => setSets(sets.map((x, j) => j === i ? { ...x, reps: e.target.value } : x))} style={{ ...field, flex: 1, minWidth: 0 }} />
                <input type="number" placeholder="weight" value={s.weight} onChange={(e) => setSets(sets.map((x, j) => j === i ? { ...x, weight: e.target.value } : x))} style={{ ...field, flex: 1, minWidth: 0 }} />
              </div>
            ))}
            <button onClick={() => setSets([...sets, { reps: "", weight: "" }])} style={{ ...ghostBtn, width: "100%", marginBottom: 8 }}>+ set</button>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setPicked(null); setSets([{ reps: "", weight: "" }]); }} style={ghostBtn}>Back</button>
              <button onClick={commit} style={{ ...primaryBtn, flex: 1 }}>Save exercise</button>
            </div>
          </div>
        )}
      </Card>

      {d.lifts.length > 0 && (
        <Card>
          <CardLabel>Session</CardLabel>
          {d.lifts.map((l) => (
            <div key={l.id} style={{ padding: "9px 0", borderBottom: "1px solid " + C.line }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: l.pri ? C.clay : C.ink, fontSize: 15 }}>{l.pri ? "● " : ""}{l.name}</span>
                <button onClick={() => update({ lifts: d.lifts.filter((x) => x.id !== l.id) })} style={xBtn}>×</button>
              </div>
              <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, color: C.sub, marginTop: 3 }}>
                {(l.primary || []).join(", ")} · {l.sets.map((s, i) => <span key={i}>{s.reps || "–"}×{s.weight || "–"}{i < l.sets.length - 1 ? " " : ""}</span>)}
              </div>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}

function PlanTab() {
  return (
    <>
      <Card>
        <CardLabel>Current plan</CardLabel>
        <div style={{ fontSize: 18, color: C.ink }}>{PLAN.title}</div>
        <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, color: C.sub, marginTop: 8, lineHeight: 1.6 }}>{PLAN.note}</div>
        <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 10, color: C.sub, marginTop: 8, fontStyle: "italic" }}>{PLAN.updated}</div>
      </Card>
      {PLAN.days.map((day) => (
        <Card key={day.name}>
          <div style={{ fontSize: 15, color: C.clay, marginBottom: 10, fontFamily: "'Helvetica Neue',sans-serif", fontWeight: 600 }}>{day.name}</div>
          {day.items.map((it, i) => (
            <div key={i} style={{ padding: "7px 0", borderBottom: i < day.items.length - 1 ? "1px solid " + C.line : "none", fontFamily: "'Helvetica Neue',sans-serif", fontSize: 13, color: C.ink }}>{it}</div>
          ))}
        </Card>
      ))}
      <Card>
        <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, color: C.sub, lineHeight: 1.6 }}>
          The plan changes when you and your coach decide together in conversation. When it does, this tab updates to match.
        </div>
      </Card>
    </>
  );
}

function Mind({ d, update }) {
  const m = d.mind || { energy: 0, mood: 0, sleep: 0, note: "" };
  const set = (k, v) => update({ mind: { ...m, [k]: v } });
  const Scale = ({ label, k }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: C.sub, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", gap: 7 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => set(k, n)} style={{ flex: 1, padding: "12px 0", borderRadius: 11, cursor: "pointer", border: "1px solid " + (m[k] === n ? C.clay : C.line), background: m[k] === n ? C.clay : C.card, color: m[k] === n ? "#fff" : C.ink, fontFamily: "'Georgia',serif", fontSize: 16 }}>{n}</button>
        ))}
      </div>
    </div>
  );
  return (
    <Card>
      <CardLabel>Headspace</CardLabel>
      <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, color: C.sub, marginBottom: 16, lineHeight: 1.5 }}>Quick 1 (low) to 5 (great). No streaks to keep, nothing to fail. Just noticing.</div>
      <Scale label="Energy" k="energy" />
      <Scale label="Mood" k="mood" />
      <Scale label="Sleep" k="sleep" />
      <textarea placeholder="anything on your mind (optional)" value={m.note} onChange={(e) => set("note", e.target.value)} style={{ ...field, width: "100%", minHeight: 64, resize: "vertical", fontFamily: "'Georgia',serif" }} />
      <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 10, color: C.sub, marginTop: 10, lineHeight: 1.5 }}>If mood sits low for a couple of weeks, that's worth talking to a real person about, not a number to fix here.</div>
    </Card>
  );
}

function Trends({ log, targets, setTargets, resetProfile }) {
  const [edit, setEdit] = useState(false);
  const days = Object.keys(log).sort();
  const last14 = days.slice(-14);

  // Weekly volume per muscle (last 7 logged days)
  const last7 = days.slice(-7);
  const vol = {};
  last7.forEach((day) => {
    (log[day].lifts || []).forEach((l) => {
      const n = l.sets.length;
      (l.primary || []).forEach((m) => { vol[m] = (vol[m] || 0) + n; });
      (l.secondary || []).forEach((m) => { vol[m] = (vol[m] || 0) + n * 0.5; });
    });
  });
  const volSorted = Object.entries(vol).sort((a, b) => b[1] - a[1]);
  const maxVol = volSorted.length ? volSorted[0][1] : 1;

  const rows = last14.map((day) => {
    const d = log[day];
    const p = (d.food || []).reduce((a, e) => a + (+e.p || 0), 0);
    const mind = d.mind ? +(((d.mind.energy || 0) + (d.mind.mood || 0) + (d.mind.sleep || 0)) / 3).toFixed(1) : null;
    const priSets = (d.lifts || []).filter((l) => l.pri).reduce((a, l) => a + l.sets.length, 0);
    return { day: day.slice(5), protein: Math.round(p), weight: d.weight, priSets, mind };
  });
  const weights = rows.map((r) => r.weight).filter((w) => w != null);
  const avg = weights.length ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1) : "—";

  return (
    <>
      <Card>
        <CardLabel>Weekly volume by muscle · last 7 days</CardLabel>
        {volSorted.length === 0
          ? <div style={{ color: C.sub, fontFamily: "'Helvetica Neue',sans-serif", fontSize: 13 }}>Log some lifts and your set volume per muscle shows here. This is how we see if the delt/back bias is real.</div>
          : volSorted.map(([m, v]) => (
            <div key={m} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
              <span style={{ width: 84, fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, color: PRI_MUSCLES.has(m) ? C.clay : C.sub }}>{PRI_MUSCLES.has(m) ? "● " : ""}{m}</span>
              <div style={{ flex: 1, height: 8, background: C.line, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: (v / maxVol) * 100 + "%", height: "100%", background: PRI_MUSCLES.has(m) ? C.clay : C.sage }} />
              </div>
              <span style={{ width: 34, textAlign: "right", fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, color: C.ink }}>{v % 1 === 0 ? v : v.toFixed(1)}</span>
            </div>
          ))}
        {volSorted.length > 0 && <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 10, color: C.sub, marginTop: 8 }}>● = priority. Secondary muscles count half. Aim for delts + back at the top.</div>}
      </Card>

      <Card>
        <CardLabel>Last {last14.length || 0} days</CardLabel>
        {last14.length === 0
          ? <div style={{ color: C.sub, fontFamily: "'Helvetica Neue',sans-serif", fontSize: 13 }}>Patterns show up here as you log.</div>
          : <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
              <Stat big={avg} sm="avg weight" />
              <Stat big={rows.reduce((a, r) => a + r.priSets, 0)} sm="priority sets ●" clay />
              <Stat big={weights.length ? Math.round(rows.reduce((a, r) => a + r.protein, 0) / rows.length) : "—"} sm="avg protein" />
            </div>}
      </Card>

      {last14.length > 0 && (
        <Card>
          <CardLabel>Protein · priority · mind</CardLabel>
          {rows.map((r) => (
            <div key={r.day} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12 }}>
              <span style={{ width: 36, color: C.sub }}>{r.day}</span>
              <div style={{ flex: 1, height: 6, background: C.line, borderRadius: 3, overflow: "hidden" }}><div style={{ width: Math.min(100, (r.protein / targets.protein) * 100) + "%", height: "100%", background: C.sage }} /></div>
              <span style={{ width: 30, color: r.priSets ? C.clay : C.sub, textAlign: "right" }}>{r.priSets ? r.priSets + "●" : "–"}</span>
              <span style={{ width: 26, color: r.mind ? C.ink : C.line, textAlign: "right" }}>{r.mind ?? "–"}</span>
            </div>
          ))}
        </Card>
      )}

      <MeasurementsCard log={log} />

      <CoachReport log={log} targets={targets} />

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <CardLabel>Targets</CardLabel>
          <button onClick={() => setEdit(!edit)} style={ghostBtn}>{edit ? "Done" : "Edit"}</button>
        </div>
        {!edit
          ? <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 13, color: C.ink, lineHeight: 1.8 }}>
              {targets.calories} cal · {targets.protein}p · {targets.carbs}c · {targets.fat}f · {targets.water}L
              <div style={{ color: C.sub, fontSize: 11, marginTop: 6 }}>Weight up &gt;0.5/wk → carbs −30. Down → carbs +30.</div>
            </div>
          : <div>
              {["calories", "protein", "fat", "carbs", "water"].map((k) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 13, color: C.sub, textTransform: "capitalize" }}>{k}</span>
                  <input type="number" value={targets[k]} onChange={(e) => setTargets({ ...targets, [k]: +e.target.value })} style={{ ...field, width: 90 }} />
                </div>
              ))}
              <button onClick={resetProfile} style={{ ...ghostBtn, width: "100%", marginTop: 6 }}>Recalculate from profile</button>
            </div>}
      </Card>
    </>
  );
}


function MeasurementsCard({ log }) {
  const todayKey = () => new Date().toISOString().slice(0, 10);
  const [m, setM] = useState({ waist: "", shoulders: "", chest: "", arms: "" });
  const [saved, setSaved] = useState(false);

  // gather measurement history from log
  const days = Object.keys(log).sort();
  const history = days.filter((d) => log[d].meas).map((d) => ({ day: d, ...log[d].meas }));
  const latest = history.length ? history[history.length - 1] : null;
  const ratio = (r) => (r.shoulders && r.waist ? (r.shoulders / r.waist).toFixed(2) : null);

  const save = () => {
    const key = todayKey();
    const entry = {};
    ["waist", "shoulders", "chest", "arms"].forEach((k) => { if (m[k] !== "") entry[k] = +m[k]; });
    if (Object.keys(entry).length === 0) return;
    // write straight into localStorage-backed log via custom event through window
    const cur = JSON.parse(localStorage.getItem("log4") || "{}");
    const blank = { food: [], lifts: [], weight: null, mind: null, water: 0 };
    cur[key] = { ...blank, ...(cur[key] || {}), meas: { ...((cur[key] || {}).meas || {}), ...entry } };
    localStorage.setItem("log4", JSON.stringify(cur));
    setSaved(true); setTimeout(() => { setSaved(false); location.reload(); }, 600);
  };

  return (
    <Card>
      <CardLabel>Measurements</CardLabel>
      <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, color: C.sub, marginBottom: 12, lineHeight: 1.5 }}>
        Take these every 1-2 weeks, same conditions: morning, relaxed, same tape tension. Shoulders = widest point across delts. Waist = at the navel, relaxed (don't suck in). Consistency matters more than the exact number.
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {[["shoulders", "shoulders"], ["waist", "waist"]].map(([k, l]) => (
          <div key={k} style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 10, color: C.sub, marginBottom: 4, textTransform: "uppercase" }}>{l}</div>
            <input type="number" placeholder="cm/in" value={m[k]} onChange={(e) => setM({ ...m, [k]: e.target.value })} style={{ ...field, width: "100%" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {[["chest", "chest"], ["arms", "arm"]].map(([k, l]) => (
          <div key={k} style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 10, color: C.sub, marginBottom: 4, textTransform: "uppercase" }}>{l}</div>
            <input type="number" placeholder="cm/in" value={m[k]} onChange={(e) => setM({ ...m, [k]: e.target.value })} style={{ ...field, width: "100%" }} />
          </div>
        ))}
      </div>
      <button onClick={save} style={{ ...primaryBtn, width: "100%" }}>{saved ? "Saved ✓" : "Save today's measurements"}</button>

      {latest && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, color: C.sub, textTransform: "uppercase" }}>Latest ({latest.day.slice(5)})</span>
            {ratio(latest) && <span style={{ fontSize: 15, color: C.clay }}>V-taper {ratio(latest)}</span>}
          </div>
          <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 13, color: C.ink, marginTop: 4 }}>
            {latest.shoulders ? "sh " + latest.shoulders : ""}{latest.waist ? " · w " + latest.waist : ""}{latest.chest ? " · ch " + latest.chest : ""}{latest.arms ? " · arm " + latest.arms : ""}
          </div>
          <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 10, color: C.sub, marginTop: 6 }}>V-taper = shoulders ÷ waist. For Men's Physique, this climbing is the goal, more than scale weight.</div>
        </div>
      )}
      {history.length > 1 && (
        <div style={{ marginTop: 12 }}>
          {history.slice(-6).map((r) => (
            <div key={r.day} style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, color: C.sub, padding: "3px 0" }}>
              <span>{r.day.slice(5)}</span>
              <span>{ratio(r) ? "ratio " + ratio(r) : (r.shoulders ? "sh " + r.shoulders : "—")}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function CoachReport({ log, targets }) {
  const [copied, setCopied] = useState(false);
  const build = () => {
    const days = Object.keys(log).sort();
    const last14 = days.slice(-14);
    const last7 = days.slice(-7);

    // nutrition averages (only days with any food)
    const foodDays = last14.filter((d) => (log[d].food || []).length);
    const avgOf = (arr, f) => arr.length ? Math.round(arr.reduce((a, d) => a + f(log[d]), 0) / arr.length) : 0;
    const dayCal = (d) => (d.food || []).reduce((a, e) => a + (+e.p || 0) * 4 + (+e.c || 0) * 4 + (+e.f || 0) * 9, 0);
    const dayP = (d) => (d.food || []).reduce((a, e) => a + (+e.p || 0), 0);
    const dayC = (d) => (d.food || []).reduce((a, e) => a + (+e.c || 0), 0);
    const dayF = (d) => (d.food || []).reduce((a, e) => a + (+e.f || 0), 0);

    // weight trend
    const wts = last14.map((d) => log[d].weight).filter((w) => w != null);
    const wTrend = wts.length >= 2 ? (wts[wts.length - 1] - wts[0]).toFixed(1) : "n/a";

    // volume per muscle last 7
    const vol = {};
    last7.forEach((d) => (log[d].lifts || []).forEach((l) => {
      const n = l.sets.length;
      (l.primary || []).forEach((mm) => vol[mm] = (vol[mm] || 0) + n);
      (l.secondary || []).forEach((mm) => vol[mm] = (vol[mm] || 0) + n * 0.5);
    }));
    const volLine = Object.entries(vol).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + " " + (v % 1 ? v.toFixed(1) : v)).join(", ") || "none logged";

    // training days
    const trainDays = last7.filter((d) => (log[d].lifts || []).length).length;

    // mind averages
    const mindDays = last14.filter((d) => log[d].mind);
    const mAvg = (k) => mindDays.length ? (mindDays.reduce((a, d) => a + (log[d].mind[k] || 0), 0) / mindDays.length).toFixed(1) : "n/a";

    // measurements
    const measDays = days.filter((d) => log[d].meas);
    let measLine = "none logged";
    if (measDays.length) {
      const m = log[measDays[measDays.length - 1]].meas;
      const ratio = m.shoulders && m.waist ? (m.shoulders / m.waist).toFixed(2) : "n/a";
      measLine = "latest " + measDays[measDays.length - 1].slice(5) + ": sh " + (m.shoulders || "?") + ", w " + (m.waist || "?") + ", V-taper " + ratio;
    }

    return [
      "COACH REPORT — " + new Date().toISOString().slice(0, 10),
      "Window: last " + last14.length + " logged days",
      "",
      "TARGETS: " + targets.calories + " cal / " + targets.protein + "p / " + targets.carbs + "c / " + targets.fat + "f",
      "",
      "NUTRITION (avg of " + foodDays.length + " logged days):",
      "  calories " + avgOf(foodDays, dayCal) + " (target " + targets.calories + ")",
      "  protein " + avgOf(foodDays, dayP) + "g (target " + targets.protein + ")",
      "  carbs " + avgOf(foodDays, dayC) + "g / fat " + avgOf(foodDays, dayF) + "g",
      "",
      "WEIGHT: " + (wts.length ? wts[0] + " → " + wts[wts.length - 1] + " (Δ " + wTrend + ") over " + wts.length + " weigh-ins" : "none logged"),
      "",
      "TRAINING: " + trainDays + " sessions in last 7 days",
      "  volume by muscle (last 7d): " + volLine,
      "",
      "MEASUREMENTS: " + measLine,
      "",
      "HEADSPACE (avg): energy " + mAvg("energy") + ", mood " + mAvg("mood") + ", sleep " + mAvg("sleep"),
    ].join("\n");
  };

  const copy = () => {
    const txt = build();
    try { navigator.clipboard.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch (e) { window.prompt("Copy this and paste to your coach:", txt); }
  };

  return (
    <Card>
      <CardLabel>Coach report</CardLabel>
      <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, color: C.sub, marginBottom: 12, lineHeight: 1.5 }}>
        Generates a clean summary of your last 2 weeks, averages, weight trend, volume by muscle, measurements, headspace. Copy it and paste into your coaching chat for a data-based check-in.
      </div>
      <button onClick={copy} style={{ ...primaryBtn, width: "100%" }}>{copied ? "Copied ✓ — paste to your coach" : "Copy coach report"}</button>
    </Card>
  );
}

const Card = ({ children }) => <div style={{ background: C.card, border: "1px solid " + C.line, borderRadius: 18, padding: 18, marginBottom: 14 }}>{children}</div>;
const CardLabel = ({ children }) => <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: C.sub, marginBottom: 12 }}>{children}</div>;
const Stat = ({ big, sm, clay }) => <div><div style={{ fontSize: 24, color: clay ? C.clay : C.ink }}>{big}</div><div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 10, color: C.sub, marginTop: 2 }}>{sm}</div></div>;

const field = { padding: "11px 13px", fontSize: 15, fontFamily: "'Georgia',serif", background: C.paper, border: "1px solid " + C.line, borderRadius: 11, color: C.ink, outline: "none", boxSizing: "border-box" };
const primaryBtn = { background: C.clay, color: "#fff", border: "none", borderRadius: 12, padding: "12px 18px", fontFamily: "'Helvetica Neue',sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" };
const ghostBtn = { background: "none", color: C.ink, border: "1px solid " + C.line, borderRadius: 12, padding: "9px 14px", fontFamily: "'Helvetica Neue',sans-serif", fontSize: 13, cursor: "pointer" };
const navBtn = { background: C.card, color: C.ink, border: "1px solid " + C.line, borderRadius: 9, width: 30, height: 30, cursor: "pointer", fontSize: 16 };
const stepBtn = { background: C.paper, color: C.ink, border: "1px solid " + C.line, borderRadius: 10, width: 40, height: 40, cursor: "pointer", fontSize: 20 };
const rowLine = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid " + C.line, fontSize: 14, marginTop: 2 };
const xBtn = { background: "none", border: "none", color: "#b3402c", cursor: "pointer", fontSize: 16, marginLeft: 8 };
