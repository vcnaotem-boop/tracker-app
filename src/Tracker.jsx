import React, { useState, useEffect } from "react";

// ---- LOCAL date key. Never use toISOString() for day keys. ----
// toISOString() returns UTC. In Eastern time anything logged after 8PM local
// was landing on the next day's log, splitting daily totals and breaking "Copy last".
// Build the key from local date parts instead.
const dateKey = (d = new Date()) => {
  const x = d instanceof Date ? d : new Date(d + "T00:00:00");
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return x.getFullYear() + "-" + mm + "-" + dd;
};

// Dark theme, same colors sampled from the competition photo, retuned for contrast.
// A straight invert of the light palette goes muddy against near-black, so lightness
// and saturation are bumped on the accents while background/text swap roles.
// paper/card -> the studio backdrop's near-black. ink -> warm off-white (rim-light tone).
// clay/sage/gold/blush -> same source hues, brightened so they still read on dark surfaces.
const C = {
  paper: "#18171A", card: "#211F22", ink: "#F1EDE7", sub: "#97A7B0",
  line: "#332F33", clay: "#4A7DBE", sage: "#7EC1E3", gold: "#A9724F", blush: "#8B6650",
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
  "Cable oblique crunch": { p: ["Obliques"], s: ["Abs"] },
  "Side plank": { p: ["Obliques"], s: [] },
  "Hanging oblique raise": { p: ["Obliques"], s: ["Abs"] },
  "Seated leg curl": { p: ["Hamstrings"], s: [] },
  "Lying leg curl": { p: ["Hamstrings"], s: [] },
  "Stiff-leg deadlift": { p: ["Hamstrings", "Glutes"], s: [] },
  "Wide-grip seated row": { p: ["Lats"], s: ["Upper Back"] },
  "Straight-arm pulldown (wide)": { p: ["Lats"], s: [] },
  "Machine pullover": { p: ["Lats"], s: [] },
  // Added v4 — Day 2 legs + Day 4 varied pull angles
  "Chest-supported row (neutral)": { p: ["Lats", "Upper Back"], s: ["Rear Delt"] },
  "Single-arm cable row (low to high)": { p: ["Lats"], s: ["Upper Back"] },
  "Cable woodchop": { p: ["Obliques"], s: ["Abs"] },
  "DB Bulgarian split squat": { p: ["Quads", "Glutes"], s: ["Hamstrings"] },
  "DB walking lunge": { p: ["Quads", "Glutes"], s: ["Hamstrings"] },
  "DB Romanian deadlift": { p: ["Hamstrings", "Glutes"], s: [] },
  "DB hip thrust": { p: ["Glutes"], s: ["Hamstrings"] },
  "Standing calf raise": { p: ["Calves"], s: [] },
  "Cable crunch (kneeling, weighted)": { p: ["Abs"], s: ["Obliques"] },
  "Lateral raise (cable/DB, strict)": { p: ["Side Delt"], s: [] },
  "Light elbow-safe biceps finisher": { p: ["Biceps"], s: [] },
};
const PRI_MUSCLES = new Set(["Lats", "Hamstrings", "Obliques"]);
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
  title: "Off-season · lat width · hamstrings · obliques",
  note: "Judge feedback (OCB Natural Kingdom, July 2026). Judge 1: conditioning and presentation dialed, delts already competitive. Bring up LAT WIDTH (top priority), HAMSTRING THICKNESS, OBLIQUE/serratus tie-in. Judge 2: work back and shoulders to balance the physique, so delts get light secondary attention, not co-priority. Neck and elbow rules still apply: no overhead, no pulldowns, no heavy direct curls, straps, neutral grips. Straight-arm and machine work carry the lat load. During Jacqueline's recovery run Days 1, 3, 4 only, guilt-free.",
  days: [
    { name: "Day 1 · Back width + hams", items: ["Straight-arm pulldown (wide) — 4×12-15  ● lat width", "Wide-grip seated row — 4×10-12  ● lats", "Machine pullover — 3×12  ● lats", "Seated leg curl — 4×12-15  ● hams", "Stiff-leg deadlift (light, controlled) — 3×10  ● hams", "Cable oblique crunch — 3×15  ● obliques", "Lateral raise (cable/DB, strict) — 3×12-15  ● side delt cap"] },
    { name: "Day 2 · Legs (free-weight, neck-safe)", items: ["DB Bulgarian split squat — 4×8-12/leg  ● quads/glutes", "DB walking lunge — 3×10/leg", "Leg extension — 4×15  ● quads", "DB Romanian deadlift — 4×10-12  ● hams", "DB hip thrust — 3×12  ● glutes", "Standing calf raise — 4×15", "Light elbow-safe biceps finisher — 2×15"] },
    { name: "Day 3 · Delts + chest (maintain) + obliques", items: ["Cable lateral raise — 4×15", "Reverse pec-deck — 4×15", "Incline machine press — 3×10-12", "Lying leg curl — 3×15  ● hams", "Hanging oblique raise — 3×12  ● obliques", "Cable crunch (kneeling, weighted) — 3×12-15  ● abs", "Side plank — 3× hold"] },
    { name: "Day 4 · Lat width, 2nd dose (different angles)", items: ["Machine pullover — 4×12-15  ● lat width", "Chest-supported row (neutral) — 4×10-12  ● lats", "Single-arm cable row (low to high) — 3×12/side  ● lats", "Seated leg curl — 4×12-15  ● hams", "Romanian deadlift (moderate) — 3×10  ● hams", "Cable woodchop — 3×15  ● obliques", "Light elbow-safe biceps finisher — 2×15"] },
  ],
  updated: "v6 · Added weighted cable crunch on Day 3, the only direct loaded rectus work in the plan. Abs were already praised by Judge 1, so this is progression, not a fix. Keep flexion thoracic and lumbar, do not tuck the chin or pull with the neck; drop it if the cervical disc complains. v5 · Judge 2 clarified the shoulder comment: it is the side delt CAP. Lateral raises now run 2x/week (Day 1 finisher + Day 3), 7 sets total. Still secondary to lats. No overhead pressing, machine included, the cervical disc rules it out and it trains the wrong delt head anyway. Day 4 varies lines of pull from Day 1; pullover, seated leg curl and RDL repeat on purpose, that is where load progression gets tracked.",
};

export default function App() {
  const [profile, setProfile] = useState(null);
  const [targets, setTargets] = useState(null);
  const [log, setLog] = useState({});
  const [foods, setFoods] = useState(DEFAULT_FOODS);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState("idle");
  const [storageOk, setStorageOk] = useState(null); // null unknown, true/false known

  // Splash: once per calendar day, first open only. Own key, not one of the four
  // protected ones (profile/targets4/log4/foods), safe to add without touching those.
  const [showSplash, setShowSplash] = useState(() => {
    try { return localStorage.getItem("splashSeen") !== dateKey(); }
    catch (e) { return false; }
  });
  const dismissSplash = () => {
    try { localStorage.setItem("splashSeen", dateKey()); } catch (e) {}
    setShowSplash(false);
  };

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

  // Always-visible data bar. Backup before every app update or device switch.
  const dataBar = (
    <div style={{ background: "#EFE7DA", borderBottom: "1px solid " + C.line, padding: "12px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 16, color: C.ink, fontWeight: 600 }}>Your data</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={backup} style={{ ...primaryBtn, padding: "8px 16px", fontSize: 13 }}>Backup</button>
          <button onClick={restore} style={{ ...ghostBtn, padding: "8px 16px", fontSize: 13 }}>Restore</button>
        </div>
      </div>
      <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, color: C.sub, marginTop: 8, lineHeight: 1.5 }}>
        Tap Backup before any app update or switching devices, then save the copied text. Restore pastes it back.
      </div>
    </div>
  );

  const banner = storageOk === false ? (
    <div style={{ background: "#F6E7DF", borderBottom: "1px solid " + C.line, padding: "10px 16px", fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, color: "#8a3d24" }}>
      Auto-save isn't available in this view, so data may not survive a reload. Use <b>Backup</b> above to copy your data out, and <b>Restore</b> to bring it back.
    </div>
  ) : null;

  if (showSplash) return <Splash onDone={dismissSplash} />;
  if (!loaded) return <Frame><div style={{ padding: 40, textAlign: "center", color: C.sub }}>Loading…</div></Frame>;
  if (!profile || !targets) return <Frame>{dataBar}{banner}<Onboarding onDone={(prof, tgt) => { setProfile(prof); setTargets(tgt); save({ profile: prof, targets: tgt }); }} /></Frame>;

  return <Frame>{dataBar}{banner}<Main
    profile={profile} targets={targets} setTargets={(t) => { setTargets(t); save({ targets: t }); }}
    log={log} setLog={(l) => { setLog(l); save({ log: l }); }}
    foods={foods} setFoods={(f) => { setFoods(f); save({ foods: f }); }}
    saveState={saveState} resetProfile={() => { setProfile(null); setTargets(null); }} /></Frame>;
}

function Splash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div onClick={onDone} style={{ position: "fixed", inset: 0, background: C.paper, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "92vw", maxWidth: 480, aspectRatio: "16/9", position: "relative", borderRadius: 16, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,.5)" }}>
        <img src="/splash.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,.8) 100%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 16, textAlign: "center" }}>
          <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontWeight: 800, fontSize: 21, letterSpacing: ".03em", color: "#fff", textTransform: "uppercase" }}>Let's fucking go</div>
        </div>
      </div>
    </div>
  );
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
  const todayKey = () => dateKey();
  const [tab, setTab] = useState("Today");
  const [day, setDay] = useState(todayKey());
  const blank = { food: [], lifts: [], weight: null, mind: null, water: 0 };
  const d = log[day] || blank;
  const update = (patch) => setLog({ ...log, [day]: { ...blank, ...d, ...patch } });
  const shift = (n) => { const x = new Date(day + "T00:00:00"); x.setDate(x.getDate() + n); setDay(dateKey(x)); };
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
        {tab === "Today" && <Today d={d} update={update} targets={targets} foods={foods} setFoods={setFoods} log={log} day={day} />}
        {tab === "Train" && <Train d={d} update={update} log={log} day={day} />}
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
          <defs>
            {/* Same gradient direction and colors as the shorts in the competition photo. */}
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={C.sage} />
              <stop offset="100%" stopColor={C.clay} />
            </linearGradient>
          </defs>
          <circle cx="54" cy="54" r={r} fill="none" stroke={C.line} strokeWidth="9" />
          <circle cx="54" cy="54" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="9" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} style={{ transition: "stroke-dashoffset .5s" }} />
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

function Today({ d, update, targets, foods, setFoods, log, day }) {
  const MEALS = ["Breakfast", "Lunch", "Dinner", "Snacks"];
  const [openMeal, setOpenMeal] = useState(null);        // which meal is expanded
  const [addTo, setAddTo] = useState(null);              // which meal we're adding to
  const [mode, setMode] = useState("weigh");
  const [f, setF] = useState({ name: "", p: "", c: "", f: "" });
  const [q, setQ] = useState("");
  const [saveToLib, setSaveToLib] = useState(false);
  const [w, setW] = useState("");

  const food = d.food || [];
  const mealItems = (m) => food.filter((e) => (e.meal || "Snacks") === m);
  const mealTotals = (m) => mealItems(m).reduce((a, e) => ({ p: a.p + (+e.p || 0), c: a.c + (+e.c || 0), f: a.f + (+e.f || 0) }), { p: 0, c: 0, f: 0 });
  const dayT = food.reduce((a, e) => ({ p: a.p + (+e.p || 0), c: a.c + (+e.c || 0), f: a.f + (+e.f || 0) }), { p: 0, c: 0, f: 0 });
  const kcal = dayT.p * 4 + dayT.c * 4 + dayT.f * 9;
  const mealCal = (t) => Math.round(t.p * 4 + t.c * 4 + t.f * 9);

  const addEntry = (entry, meal) => update({ food: [...food, { ...entry, meal, id: Date.now() + Math.random() }] });
  const removeEntry = (id) => update({ food: food.filter((e) => e.id !== id) });

  const addManual = (meal) => {
    if (!f.name && !f.p && !f.c && !f.f) return;
    addEntry({ name: f.name, p: +f.p || 0, c: +f.c || 0, f: +f.f || 0 }, meal);
    if (saveToLib && f.name && !foods.some((x) => x.name.toLowerCase() === f.name.toLowerCase())) {
      setFoods([...foods, { id: "u" + Date.now(), name: f.name, p: +f.p || 0, c: +f.c || 0, f: +f.f || 0 }]);
    }
    setF({ name: "", p: "", c: "", f: "" }); setSaveToLib(false);
  };
  const filtered = foods.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()));

  // copy a meal from the most recent previous day that has items in that meal
  const copyMealFromYesterday = (meal) => {
    const days = Object.keys(log).filter((k) => k < day).sort();
    for (let i = days.length - 1; i >= 0; i--) {
      const items = (log[days[i]].food || []).filter((e) => (e.meal || "Snacks") === meal);
      if (items.length) {
        const copies = items.map((e) => ({ ...e, id: Date.now() + Math.random() }));
        update({ food: [...food, ...copies] });
        return;
      }
    }
    alert("No previous " + meal + " found to copy.");
  };

  return (
    <>
      <Card>
        <Ring value={kcal} target={targets.calories} />
        <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
          <MacroBar label="Protein" val={dayT.p} tgt={targets.protein} color={C.sage} />
          <MacroBar label="Carbs" val={dayT.c} tgt={targets.carbs} color={C.gold} />
          <MacroBar label="Fat" val={dayT.f} tgt={targets.fat} color={C.blush} />
        </div>
      </Card>

      {MEALS.map((meal) => {
        const items = mealItems(meal);
        const t = mealTotals(meal);
        const isOpen = openMeal === meal;
        const isAdding = addTo === meal;
        return (
          <Card key={meal}>
            <div onClick={() => setOpenMeal(isOpen ? null : meal)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <div>
                <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 13, fontWeight: 600, color: C.ink }}>{meal}</div>
                <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, color: C.sub, marginTop: 2 }}>
                  {items.length} item{items.length !== 1 ? "s" : ""} · {mealCal(t)} cal · {Math.round(t.p)}p {Math.round(t.c)}c {Math.round(t.f)}f
                </div>
              </div>
              <span style={{ color: C.sub, fontSize: 18 }}>{isOpen ? "–" : "+"}</span>
            </div>

            {isOpen && (
              <div style={{ marginTop: 10 }}>
                {items.map((e) => (
                  <div key={e.id} style={rowLine}>
                    <span style={{ color: C.ink }}>{e.name || "item"}</span>
                    <span style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, color: C.sub }}>{Math.round(e.p) || 0}p {Math.round(e.c) || 0}c {Math.round(e.f) || 0}f<button onClick={() => removeEntry(e.id)} style={xBtn}>×</button></span>
                  </div>
                ))}

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={() => { setAddTo(isAdding ? null : meal); setMode("weigh"); }} style={{ ...primaryBtn, flex: 1 }}>{isAdding ? "Close" : "Add food"}</button>
                  <button onClick={() => copyMealFromYesterday(meal)} style={ghostBtn}>Copy last</button>
                </div>

                {isAdding && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + C.line }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                      {[["weigh", "By weight"], ["saved", "Saved"], ["manual", "Manual"]].map(([k, lbl]) => (
                        <button key={k} onClick={() => setMode(k)} style={{ flex: 1, padding: "7px 0", borderRadius: 9, cursor: "pointer", fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, fontWeight: 600, border: "1px solid " + (mode === k ? C.clay : C.line), background: mode === k ? C.clay : C.card, color: mode === k ? "#fff" : C.ink }}>{lbl}</button>
                      ))}
                    </div>

                    {mode === "weigh" ? (
                      <WeighPicker onAdd={(entry) => { addEntry(entry, meal); }} />
                    ) : mode === "saved" ? (
                      <div>
                        <input autoFocus placeholder="search saved foods…" value={q} onChange={(e) => setQ(e.target.value)} style={{ ...field, width: "100%", marginBottom: 8 }} />
                        <div style={{ maxHeight: 220, overflowY: "auto" }}>
                          {filtered.map((item) => (
                            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid " + C.line }}>
                              <div style={{ cursor: "pointer", flex: 1 }} onClick={() => addEntry({ name: item.name, p: item.p, c: item.c, f: item.f }, meal)}>
                                <div style={{ color: C.ink, fontSize: 14 }}>{item.name}</div>
                                <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, color: C.sub }}>{item.p}p · {item.c}c · {item.f}f</div>
                              </div>
                              <button onClick={() => addEntry({ name: item.name, p: item.p, c: item.c, f: item.f }, meal)} style={{ ...primaryBtn, padding: "6px 12px" }}>Add</button>
                              {item.id.startsWith("u") && <button onClick={() => setFoods(foods.filter((x) => x.id !== item.id))} style={xBtn}>×</button>}
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
                          <input type="checkbox" checked={saveToLib} onChange={(e) => setSaveToLib(e.target.checked)} /> Save to my foods
                        </label>
                        <button onClick={() => addManual(meal)} style={{ ...primaryBtn, width: "100%", marginTop: 10 }}>Add</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}

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

// Parses a PLAN item string like "Straight-arm pulldown (wide) — 4×12-15  ● lat width"
// into { name, setCount }. Falls back to matching LIB loosely if the plan text carries
// a qualifier LIB doesn't have (e.g. "Romanian deadlift (moderate)" -> LIB's "Romanian deadlift").
function parsePlanItem(item) {
  const [namePart, restPart] = item.split(" — ");
  const name = (namePart || item).trim();
  const setMatch = (restPart || "").match(/^(\d+)×/);
  const setCount = setMatch ? parseInt(setMatch[1], 10) : 3;
  let libKey = name;
  if (!LIB[libKey]) {
    const stripped = name.replace(/\s*\([^)]*\)\s*$/, "").trim();
    if (LIB[stripped]) libKey = stripped;
  }
  return { name, setCount, libKey: LIB[libKey] ? libKey : null };
}

// Most recent logged weight for an exercise, searched back through all days.
function lastWeightFor(log, exName, beforeDay) {
  const days = Object.keys(log).filter((k) => k < beforeDay).sort().reverse();
  for (const dKey of days) {
    const l = (log[dKey].lifts || []).find((x) => x.name === exName);
    if (l) {
      const top = l.sets.filter((s) => s.weight).sort((a, b) => (+b.weight) - (+a.weight))[0];
      if (top) return { weight: top.weight, unit: l.unit || "kg", day: dKey };
    }
  }
  return null;
}

function Train({ d, update, log, day }) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState(null);
  const [custom, setCustom] = useState("");
  const [customMuscle, setCustomMuscle] = useState("Side Delt");
  const [sets, setSets] = useState([{ reps: "", weight: "" }]);
  const [wu, setWu] = useState("kg"); // weight unit for this exercise entry — kg or lb, explicit and stored, never assumed
  const [planDayIdx, setPlanDayIdx] = useState(null); // which PLAN day is open in the quick-picker, if any
  const names = Object.keys(LIB);
  const filtered = q ? names.filter((n) => n.toLowerCase().includes(q.toLowerCase())) : names;

  const pickFromPlan = (item) => {
    const { name, setCount, libKey } = parsePlanItem(item);
    setSets(Array.from({ length: setCount }, () => ({ reps: "", weight: "" })));
    if (libKey) { setPicked(libKey); }
    else { setPicked("__custom"); setCustom(name); }
    setPlanDayIdx(null);
  };

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
    update({ lifts: [...d.lifts, { id: Date.now(), name, sets: clean, unit: wu, primary, secondary, pri }] });
    setPicked(null); setQ(""); setCustom(""); setSets([{ reps: "", weight: "" }]);
  };

  return (
    <>
      <Card>
        <CardLabel>From today's plan</CardLabel>
        {planDayIdx === null ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PLAN.days.map((pd, i) => (
              <button key={i} onClick={() => setPlanDayIdx(i)} style={{ ...ghostBtn, flex: "1 1 auto" }}>{pd.name.split(" · ")[0]}</button>
            ))}
          </div>
        ) : (
          <div>
            <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, color: C.sub, marginBottom: 8 }}>{PLAN.days[planDayIdx].name} — tap an exercise to log it</div>
            {PLAN.days[planDayIdx].items.map((item, i) => {
              const { name, setCount, libKey } = parsePlanItem(item);
              const already = d.lifts.some((l) => l.name === name);
              const lw = lastWeightFor(log, name, day);
              return (
                <div key={i} onClick={() => pickFromPlan(item)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid " + C.line, cursor: "pointer", opacity: already ? 0.5 : 1 }}>
                  <div>
                    <div style={{ fontSize: 14, color: libKey && isPriorityEx(libKey) ? C.clay : C.ink }}>{already ? "✓ " : ""}{name}</div>
                    <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, color: C.sub }}>{setCount} sets{lw ? " · last " + lw.weight + lw.unit : ""}</div>
                  </div>
                </div>
              );
            })}
            <button onClick={() => setPlanDayIdx(null)} style={{ ...ghostBtn, width: "100%", marginTop: 10 }}>Back to days</button>
          </div>
        )}
      </Card>

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
                {(() => {
                  const lw = lastWeightFor(log, picked, day);
                  return lw ? <div style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 12, color: C.sage, marginTop: 4 }}>last: {lw.weight}{lw.unit} on {lw.day.slice(5)}</div> : null;
                })()}
              </div>
            )}
            <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center" }}>
              <span style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, color: C.sub }}>weight unit</span>
              <button onClick={() => setWu("kg")} style={{ ...ghostBtn, padding: "4px 12px", fontSize: 12, background: wu === "kg" ? C.clay : "none", color: wu === "kg" ? "#fff" : C.ink, border: wu === "kg" ? "none" : "1px solid " + C.line }}>kg</button>
              <button onClick={() => setWu("lb")} style={{ ...ghostBtn, padding: "4px 12px", fontSize: 12, background: wu === "lb" ? C.clay : "none", color: wu === "lb" ? "#fff" : C.ink, border: wu === "lb" ? "none" : "1px solid " + C.line }}>lb</button>
            </div>
            {sets.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                <span style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 11, color: C.sub, width: 32 }}>#{i + 1}</span>
                <input type="number" placeholder="reps" value={s.reps} onChange={(e) => setSets(sets.map((x, j) => j === i ? { ...x, reps: e.target.value } : x))} style={{ ...field, flex: 1, minWidth: 0 }} />
                <input type="number" placeholder={"weight (" + wu + ")"} value={s.weight} onChange={(e) => setSets(sets.map((x, j) => j === i ? { ...x, weight: e.target.value } : x))} style={{ ...field, flex: 1, minWidth: 0 }} />
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
                {(l.primary || []).join(", ")} · {l.sets.map((s, i) => <span key={i}>{s.reps || "–"}×{s.weight || "–"}{s.weight ? (l.unit || "kg") : ""}{i < l.sets.length - 1 ? " " : ""}</span>)}
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
        <CardLabel>Body weight trend</CardLabel>
        {(() => {
          const allDays = Object.keys(log).sort();
          const wData = allDays.filter((d) => log[d].weight != null).map((d) => ({ label: d.slice(5), value: log[d].weight })).slice(-30);
          return wData.length < 2
            ? <div style={{ color: C.sub, fontFamily: "'Helvetica Neue',sans-serif", fontSize: 13 }}>Log 2+ mornings and the trend line shows here. Individual weigh-ins are noise, this line is the signal.</div>
            : <Sparkline data={wData} color={C.clay} unit=" kg" />;
        })()}
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


// ---- Minimal inline SVG charts. No chart library — keeps the Netlify build
// from depending on a package that may not be installed. Pure React + SVG. ----
function Sparkline({ data, color = C.clay, height = 76, unit = "" }) {
  const width = 320;
  if (!data || data.length < 2) return null;
  const values = data.map((d) => d.value);
  const min = Math.min(...values), max = Math.max(...values);
  const pad = (max - min) * 0.2 || 1;
  const lo = min - pad, hi = max + pad;
  const n = data.length;
  const x = (i) => (i / (n - 1)) * (width - 20) + 10;
  const y = (v) => height - 18 - ((v - lo) / (hi - lo || 1)) * (height - 34);
  const pts = data.map((d, i) => x(i) + "," + y(d.value)).join(" ");
  return (
    <svg width="100%" viewBox={"0 0 " + width + " " + height} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" />
      {data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d.value)} r="2.5" fill={color} />)}
      <text x={10} y={height - 4} fontSize="9" fill={C.sub} fontFamily="'Helvetica Neue',sans-serif">{data[0].label}</text>
      <text x={width - 10} y={height - 4} fontSize="9" fill={C.sub} fontFamily="'Helvetica Neue',sans-serif" textAnchor="end">{data[n - 1].label}</text>
      <text x={width - 10} y={12} fontSize="11" fill={color} fontFamily="'Helvetica Neue',sans-serif" textAnchor="end" fontWeight="600">{values[n - 1]}{unit}</text>
    </svg>
  );
}

function DualLineChart({ seriesA, seriesB, height = 100 }) {
  const width = 320;
  const allDays = Array.from(new Set([...seriesA.data.map((d) => d.day), ...seriesB.data.map((d) => d.day)])).sort();
  if (allDays.length < 2) return null;
  const allVals = [...seriesA.data, ...seriesB.data].map((d) => d.value);
  const min = Math.min(...allVals), max = Math.max(...allVals);
  const pad = (max - min) * 0.2 || 1;
  const lo = min - pad, hi = max + pad;
  const xOf = (day) => (allDays.indexOf(day) / (allDays.length - 1)) * (width - 20) + 10;
  const yOf = (v) => height - 20 - ((v - lo) / (hi - lo || 1)) * (height - 40);
  const lineOf = (s) => s.data.map((d) => xOf(d.day) + "," + yOf(d.value)).join(" ");
  return (
    <svg width="100%" viewBox={"0 0 " + width + " " + height} style={{ display: "block" }}>
      <polyline points={lineOf(seriesA)} fill="none" stroke={seriesA.color} strokeWidth="2" />
      <polyline points={lineOf(seriesB)} fill="none" stroke={seriesB.color} strokeWidth="2" />
      {seriesA.data.map((d, i) => <circle key={"a" + i} cx={xOf(d.day)} cy={yOf(d.value)} r="2.5" fill={seriesA.color} />)}
      {seriesB.data.map((d, i) => <circle key={"b" + i} cx={xOf(d.day)} cy={yOf(d.value)} r="2.5" fill={seriesB.color} />)}
      <text x={10} y={height - 5} fontSize="9" fill={C.sub} fontFamily="'Helvetica Neue',sans-serif">{allDays[0].slice(5)}</text>
      <text x={width - 10} y={height - 5} fontSize="9" fill={C.sub} fontFamily="'Helvetica Neue',sans-serif" textAnchor="end">{allDays[allDays.length - 1].slice(5)}</text>
    </svg>
  );
}

function MeasurementsCard({ log }) {
  const todayKey = () => dateKey();
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
        <div style={{ marginTop: 16 }}>
          {(() => {
            const waistSeries = history.filter((r) => r.waist != null).map((r) => ({ day: r.day, value: r.waist }));
            const shSeries = history.filter((r) => r.shoulders != null).map((r) => ({ day: r.day, value: r.shoulders }));
            if (waistSeries.length < 2 && shSeries.length < 2) return null;
            return (
              <>
                <DualLineChart seriesA={{ color: C.sage, data: waistSeries }} seriesB={{ color: C.clay, data: shSeries }} />
                <div style={{ display: "flex", gap: 14, marginTop: 4, fontFamily: "'Helvetica Neue',sans-serif", fontSize: 10, color: C.sub }}>
                  <span><span style={{ color: C.sage }}>●</span> waist</span>
                  <span><span style={{ color: C.clay }}>●</span> shoulders</span>
                </div>
              </>
            );
          })()}
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

    // weight trend — 7-day averages, NOT first vs last single weigh-in.
    // Two noisy morning weights are not a trend; the adjustment rule needs averages.
    const wts = last14.map((d) => log[d].weight).filter((w) => w != null);
    const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    let weightLine = "none logged";
    if (wts.length >= 6) {
      const half = Math.floor(wts.length / 2);
      const prevAvg = mean(wts.slice(0, half));
      const currAvg = mean(wts.slice(-half));
      const delta = currAvg - prevAvg;
      weightLine = prevAvg.toFixed(2) + " → " + currAvg.toFixed(2) + " (Δ " + (delta >= 0 ? "+" : "") + delta.toFixed(2) + "/period, " + wts.length + " weigh-ins, avg-vs-avg)";
    } else if (wts.length) {
      weightLine = wts.length + " weigh-in(s), latest " + wts[wts.length - 1] + " — need 6+ for a real average, not enough to act on";
    }

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

    // lift detail — last 7 logged days, exercise + set-by-set reps/weight/unit.
    // Coach report only exported set-count volume before; this is the actual load data.
    const liftLines = [];
    last7.forEach((d) => {
      const lifts = log[d].lifts || [];
      if (!lifts.length) return;
      liftLines.push("  " + d.slice(5) + ":");
      lifts.forEach((l) => {
        const setStr = l.sets.map((s) => (s.reps || "–") + "×" + (s.weight || "–") + (s.weight ? (l.unit || "kg") : "")).join(" ");
        liftLines.push("    " + l.name + " — " + setStr);
      });
    });
    const liftDetail = liftLines.length ? liftLines.join("\n") : "  none logged";

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
      "COACH REPORT — " + dateKey(),
      "Window: last " + last14.length + " logged days",
      "",
      "TARGETS: " + targets.calories + " cal / " + targets.protein + "p / " + targets.carbs + "c / " + targets.fat + "f",
      "",
      "NUTRITION (avg of " + foodDays.length + " logged days):",
      "  calories " + avgOf(foodDays, dayCal) + " (target " + targets.calories + ")",
      "  protein " + avgOf(foodDays, dayP) + "g (target " + targets.protein + ")",
      "  carbs " + avgOf(foodDays, dayC) + "g / fat " + avgOf(foodDays, dayF) + "g",
      "",
      "WEIGHT: " + weightLine,
      "",
      "WATER: avg " + (last14.length ? (last14.reduce((a, d) => a + (log[d].water || 0), 0) / last14.length).toFixed(2) : "0") + " L/day (target " + (targets.water || 2.5) + " L)",
      "",
      "TRAINING: " + trainDays + " sessions in last 7 days",
      "  volume by muscle (last 7d): " + volLine,
      "",
      "LIFT DETAIL (last 7d, reps×weight):",
      liftDetail,
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
        Generates a clean summary of your last 2 weeks: averages, weight trend, volume by muscle, per-set lift detail with weights, measurements, headspace. Copy it and paste into your coaching chat for a data-based check-in.
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
