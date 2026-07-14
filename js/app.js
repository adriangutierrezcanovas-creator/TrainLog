// Estado + render de toda la app. Sin framework: cada cambio de estado vuelve a
// pintar la pantalla activa con innerHTML. Los overlays (timer, flash) viven en un
// contenedor aparte para no perder el contenido de debajo mientras están abiertos.

const REST_OPTIONS = [60, 120, 180];

const state = {
  screen: "home", // home | exercise | done
  dayKey: null,
  exIndex: 0,
  setIndex: 0,
  weight: 0,
  reps: 0,
  lastDisplay: null, // último valor histórico (fijo durante toda la visita al ejercicio)
  sessionSets: {}, // { exId: [reps_serie1, reps_serie2, ...] } de la sesión actual, para el techo acumulado de fallo-pausa
  completedToday: null,
};

let timerInterval = null;

function currentExId() {
  if (!state.dayKey) return null;
  return dayExerciseId(DAYS[state.dayKey], state.exIndex);
}
function currentEx() {
  const id = currentExId();
  return id ? EX[id] : null;
}
function currentTotalSets() {
  return dayExerciseSets(DAYS[state.dayKey], state.exIndex);
}

function loadValuesFor(dayKey, idx) {
  const day = DAYS[dayKey];
  const exId = dayExerciseId(day, idx);
  const def = EX[exId];
  const last = getLast(exId);
  state.weight = last?.weight ?? def.defaultWeight ?? 0;
  state.reps = last?.reps ?? def.reps ?? 0;
  state.lastDisplay = last;
}

function startDay(key) {
  const day = DAYS[key];
  state.dayKey = key;
  state.exIndex = 0;
  state.setIndex = 0;
  state.sessionSets = {};
  day.exercises.forEach((_, i) => {
    const exId = dayExerciseId(day, i);
    state.sessionSets[exId] = new Array(dayExerciseSets(day, i)).fill(null);
  });
  loadValuesFor(key, 0);
  state.screen = "exercise";
  render();
}

function goBackHome() {
  state.screen = "home";
  state.dayKey = null;
  render();
}

function goBack() {
  if (state.setIndex > 0) {
    state.setIndex -= 1;
  } else if (state.exIndex > 0) {
    const prevIdx = state.exIndex - 1;
    loadValuesFor(state.dayKey, prevIdx);
    state.exIndex = prevIdx;
    state.setIndex = dayExerciseSets(DAYS[state.dayKey], prevIdx) - 1;
  } else {
    goBackHome();
    return;
  }
  render();
}

function jumpToExercise(idx) {
  if (idx === state.exIndex) return;
  loadValuesFor(state.dayKey, idx);
  state.exIndex = idx;
  state.setIndex = 0;
  render();
}

// Suma los reps de las 3 series del ejercicio en fallo-pausa dentro de la sesión
// actual (las ya confirmadas + la que se está editando ahora mismo), para comparar
// contra el techo acumulado (25-28) en vez del techo por serie de un ejercicio normal.
function restPauseCumulativeReps(exId) {
  const arr = state.sessionSets[exId] || [];
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += i === state.setIndex ? state.reps : arr[i] ?? 0;
  }
  return total;
}

function computeAtCeiling(ex, exId) {
  if (ex.bodyweight) return false;
  if (ex.restpause) return restPauseCumulativeReps(exId) >= ex.clusterCeilingMin;
  return ex.repCeiling ? state.reps >= ex.repCeiling : false;
}

function roundToIncrement(value, currentWeight) {
  const inc = currentWeight % 1 !== 0 ? 0.5 : 1;
  return Math.round(value / inc) * inc;
}

function overloadSuggestionText(ex, weight) {
  if (ex.bodyweight || !ex.capMin) return null;
  const lo = roundToIncrement(weight * (1 + ex.capMin / 100), weight);
  const hi = roundToIncrement(weight * (1 + ex.capMax / 100), weight);
  const caveat = ex.conditional ? ", solo si la semana pasada cumpliste el RIR" : "";
  return `Techo alcanzado · sube a ${formatNum(lo)}–${formatNum(hi)} kg (+${ex.capMin}–${ex.capMax}%${caveat})`;
}

// Botón de descanso (60/120/180s) más cercano al descanso de referencia del
// ejercicio; en empate gana la duración mayor (recuperación completa > justa).
function recommendedRestIndex(restSeconds) {
  let best = 0;
  let bestDiff = Infinity;
  REST_OPTIONS.forEach((opt, i) => {
    const diff = Math.abs(opt - restSeconds);
    if (diff < bestDiff || (diff === bestDiff && opt > REST_OPTIONS[best])) {
      bestDiff = diff;
      best = i;
    }
  });
  return best;
}

function exerciseDescriptorText(ex) {
  const rir = `RIR ${ex.rir}`;
  if (ex.restpause) return `${rir} · Fallo-pausa`;
  if (ex.hint) return `${rir} · ${ex.hint}`;
  return `${rir} · objetivo ~${ex.reps} reps`;
}

function lastDisplayText(ex) {
  if (!state.lastDisplay) return null;
  if (ex.bodyweight) return `Última vez: ${formatNum(state.lastDisplay.reps)} reps`;
  return `Última vez: ${formatNum(state.lastDisplay.weight)} kg × ${formatNum(state.lastDisplay.reps)}`;
}

function confirmSet() {
  const ex = currentEx();
  const exId = currentExId();
  const day = DAYS[state.dayKey];

  if (!ex.bodyweight) {
    setLast(exId, { weight: state.weight, reps: state.reps });
  } else {
    setLast(exId, { reps: state.reps });
  }
  state.sessionSets[exId][state.setIndex] = state.reps;
  appendHistory({
    date: todayStr(),
    day: day.label,
    exercise: ex.name,
    set: state.setIndex + 1,
    weight: ex.bodyweight ? "" : state.weight,
    reps: state.reps,
  });

  const totalSets = currentTotalSets();
  const totalExercises = day.exercises.length;
  const isLastSet = state.setIndex + 1 >= totalSets;
  const isLastExercise = state.exIndex + 1 >= totalExercises;

  if (!isLastSet) {
    showFlash(`Serie ${state.setIndex + 2} de ${totalSets}`, () => {
      state.setIndex += 1;
      render();
    });
  } else if (!isLastExercise) {
    const nextIdx = state.exIndex + 1;
    const nextId = dayExerciseId(day, nextIdx);
    showFlash(`Siguiente: ${EX[nextId].name}`, () => {
      loadValuesFor(state.dayKey, nextIdx);
      state.exIndex = nextIdx;
      state.setIndex = 0;
      render();
    });
  } else {
    showFlash("Rutina completada", () => {
      markCompletedToday(day.label);
      state.completedToday = { day: day.label };
      state.screen = "done";
      render();
    });
  }
}

// ---------- Render ----------

function render() {
  const root = document.getElementById("root");
  if (state.screen === "home") {
    root.innerHTML = renderHomeHTML();
    bindHome();
  } else if (state.screen === "done") {
    root.innerHTML = renderDoneHTML();
    bindDone();
  } else {
    root.innerHTML = renderExerciseHTML();
    bindExercise();
  }
}

function renderHomeHTML() {
  const dow = todayDow();
  const hasSessionToday = !!DAYS[dow];

  let mainHTML;
  if (hasSessionToday) {
    if (state.completedToday) {
      mainHTML = `
        <div class="flex-1">
          <p class="eyebrow">Hoy</p>
          <h1 class="h1 h1--lg">Ya entrenaste &#128170;</h1>
          <p class="subtitle">${state.completedToday.day} completado. Puedes repetir o corregir algo.</p>
          <button class="btn-black" id="btn-start">Repetir / corregir</button>
        </div>`;
    } else {
      mainHTML = `
        <div class="flex-1">
          <p class="eyebrow">Hoy toca</p>
          <h1 class="h1 h1--xl">${DAYS[dow].label}</h1>
          <p class="subtitle">${DAYS[dow].tag}</p>
          <button class="btn-black" id="btn-start">Empezar</button>
        </div>`;
    }
  } else {
    mainHTML = `
      <div class="flex-1">
        <p class="eyebrow">Hoy</p>
        <h1 class="h1 h1--lg">Descanso</h1>
        <p class="subtitle">No toca fuerza. Elige un día si vas desfasado.</p>
      </div>`;
  }

  const dayButtons = Object.entries(DAYS)
    .map(([key, d]) => `<button class="day-btn" data-day="${key}">${d.label.slice(0, 3)}</button>`)
    .join("");

  return `
    <div class="screen">
      <div class="home-header">
        <div class="home-brand">
          ${icon("dumbbell", { size: 22, color: "#111", strokeWidth: 2.5 })}
          <span>Training Log</span>
        </div>
        <button class="icon-btn" id="btn-export" aria-label="Exportar registro">
          ${icon("download", { size: 16, color: "#111", strokeWidth: 2.5 })}
        </button>
      </div>
      ${mainHTML}
      <div class="day-picker">
        <p class="day-picker__label">Elegir día</p>
        <div class="day-grid">${dayButtons}</div>
      </div>
    </div>`;
}

function bindHome() {
  const dow = todayDow();
  document.getElementById("btn-export")?.addEventListener("click", exportHistoryCSV);
  document.getElementById("btn-start")?.addEventListener("click", () => startDay(dow));
  document.querySelectorAll(".day-btn").forEach((btn) => {
    btn.addEventListener("click", () => startDay(Number(btn.dataset.day)));
  });
}

function renderDoneHTML() {
  return `
    <div class="screen screen--center">
      <div class="done-badge">${icon("check", { size: 48, color: "var(--lime)", strokeWidth: 3 })}</div>
      <h1 class="done-title">Rutina hecha</h1>
      <p class="done-sub">${DAYS[state.dayKey].label} completado.</p>
      <button class="btn-black" id="btn-home">Volver al inicio</button>
    </div>`;
}

function bindDone() {
  document.getElementById("btn-home")?.addEventListener("click", goBackHome);
}

function renderExerciseHTML() {
  const ex = currentEx();
  const exId = currentExId();
  const day = DAYS[state.dayKey];
  const totalSets = currentTotalSets();
  const totalExercises = day.exercises.length;
  const atCeiling = computeAtCeiling(ex, exId);
  const isLastSetOfExercise = state.setIndex + 1 >= totalSets;
  const isLastExerciseOfDay = state.exIndex + 1 >= totalExercises;
  const isMovingToNextExercise = isLastSetOfExercise && !isLastExerciseOfDay;

  const navButtons = day.exercises
    .map((_, i) => {
      const bg = i === state.exIndex ? "#111" : i < state.exIndex ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.1)";
      const color = i === state.exIndex ? "var(--lime)" : "#111";
      return `<button class="ex-nav__btn" style="background:${bg};color:${color}" data-idx="${i}">${i + 1}</button>`;
    })
    .join("");

  const setDots = Array.from({ length: totalSets })
    .map((_, i) => `<button class="set-dot" data-idx="${i}">${i <= state.setIndex ? '<div class="set-dot__fill"></div>' : ""}</button>`)
    .join("");

  let confirmContent;
  if (isMovingToNextExercise) {
    confirmContent = `Siguiente ${icon("arrow-right", { size: 30, color: "var(--lime)", strokeWidth: 3 })}`;
  } else if (isLastExerciseOfDay && isLastSetOfExercise) {
    confirmContent = `${icon("dumbbell", { size: 30, color: "var(--lime)", strokeWidth: 3 })} ¡Vamos!`;
  } else {
    confirmContent = `${icon("check", { size: 30, color: "var(--lime)", strokeWidth: 3 })} Hecho`;
  }

  const weightField = !ex.bodyweight
    ? `
    <div class="field">
      <p class="field-label">Peso (kg)</p>
      <div class="stepper" id="weight-stepper">
        <button class="stepper__btn" data-delta="-0.5">${icon("minus", { size: 26, color: "var(--lime)", strokeWidth: 3 })}</button>
        <div class="stepper__value">${formatNum(state.weight)}</div>
        <button class="stepper__btn" data-delta="0.5">${icon("plus", { size: 26, color: "var(--lime)", strokeWidth: 3 })}</button>
      </div>
    </div>`
    : "";

  const recoIdx = recommendedRestIndex(ex.restSeconds);
  const timerButtons = [1, 2, 3]
    .map((m, i) => {
      const reco = i === recoIdx;
      return `<button class="timer-btn${reco ? " timer-btn--reco" : ""}" data-min="${m}">${
        reco ? '<span class="timer-star">&#9733;</span>' : ""
      }${icon("timer", { size: 18, color: "var(--lime)" })}${m}'</button>`;
    })
    .join("");

  const lastText = lastDisplayText(ex);
  const ceilingText = atCeiling ? overloadSuggestionText(ex, state.weight) : null;

  return `
    <div class="screen screen--tight">
      <div class="ex-topbar">
        <button class="back-btn" id="btn-back">${icon("chevron-left", { size: 22, color: "var(--lime)" })}</button>
        <span class="ex-topbar__label">${day.label}</span>
        <div class="ex-spacer"></div>
      </div>

      <div class="ex-nav">${navButtons}</div>

      <div class="set-dots">${setDots}</div>
      <p class="set-label">Serie ${state.setIndex + 1} de ${totalSets}</p>

      <div class="flex-1">
        <h1 class="ex-title">${ex.name}</h1>
        ${lastText ? `<p class="ex-last">${lastText}</p>` : ""}
        <p class="ex-hint">${exerciseDescriptorText(ex)}</p>

        ${weightField}

        <div class="field" style="margin-bottom:0">
          <p class="field-label">Repeticiones</p>
          <div class="stepper" id="reps-stepper">
            <button class="stepper__btn" data-delta="-1">${icon("minus", { size: 26, color: "var(--lime)", strokeWidth: 3 })}</button>
            <div class="stepper__value${atCeiling ? " stepper__value--warn" : ""}">${formatNum(state.reps)}</div>
            <button class="stepper__btn" data-delta="1">${icon("plus", { size: 26, color: "var(--lime)", strokeWidth: 3 })}</button>
          </div>
          ${ceilingText ? `<p class="ceiling-warning">${ceilingText}</p>` : ""}
        </div>
      </div>

      <div class="timer-row">${timerButtons}</div>

      <button class="confirm-btn${isLastExerciseOfDay ? " pulse-final" : ""}" id="btn-confirm">${confirmContent}</button>
    </div>`;
}

function formatNum(v) {
  return v % 1 === 0 ? String(v) : v.toFixed(1);
}

function bindExercise() {
  document.getElementById("btn-back")?.addEventListener("click", goBack);
  document.getElementById("btn-confirm")?.addEventListener("click", confirmSet);

  document.querySelectorAll(".ex-nav__btn").forEach((btn) => {
    btn.addEventListener("click", () => jumpToExercise(Number(btn.dataset.idx)));
  });
  document.querySelectorAll(".set-dot").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.setIndex = Number(btn.dataset.idx);
      render();
    });
  });

  document.querySelectorAll("#weight-stepper .stepper__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const delta = Number(btn.dataset.delta);
      state.weight = Math.max(0, +(state.weight + delta).toFixed(1));
      render();
    });
  });
  document.querySelectorAll("#reps-stepper .stepper__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const delta = Number(btn.dataset.delta);
      state.reps = Math.max(0, +(state.reps + delta).toFixed(1));
      render();
    });
  });

  document.querySelectorAll(".timer-btn").forEach((btn) => {
    btn.addEventListener("click", () => showTimerOverlay(Number(btn.dataset.min) * 60));
  });
}

// ---------- Overlays ----------

function showTimerOverlay(seconds) {
  const overlayRoot = document.getElementById("overlay-root");
  const end = Date.now() + seconds * 1000;

  const el = document.createElement("div");
  el.className = "overlay";
  overlayRoot.appendChild(el);

  const paint = () => {
    const remaining = Math.max(0, Math.round((end - Date.now()) / 1000));
    const done = remaining <= 0;
    const mm = String(Math.floor(remaining / 60));
    const ss = String(remaining % 60).padStart(2, "0");
    el.innerHTML = `
      <p class="overlay__eyebrow">${done ? "Descanso terminado" : "Descansando"}</p>
      <div class="overlay__timer${done ? " overlay__timer--done" : ""}">${mm}:${ss}</div>
      <button class="overlay__btn" id="timer-cancel">${icon("x", { size: 26, color: "#111", strokeWidth: 3 })}${done ? "Cerrar" : "Saltar"}</button>`;
    document.getElementById("timer-cancel").addEventListener("click", closeTimer);
    if (done) clearInterval(timerInterval);
  };

  function closeTimer() {
    clearInterval(timerInterval);
    overlayRoot.removeChild(el);
  }

  paint();
  timerInterval = setInterval(paint, 250);
}

function showFlash(text, onDone) {
  const overlayRoot = document.getElementById("overlay-root");
  const el = document.createElement("div");
  el.className = "overlay";
  el.innerHTML = `
    <div class="flash__badge">${icon("check", { size: 40, color: "#111", strokeWidth: 3.5 })}</div>
    <p class="flash__text">${text}</p>`;
  overlayRoot.appendChild(el);

  setTimeout(() => {
    onDone();
    overlayRoot.removeChild(el);
  }, 550);
}

// ---------- Boot ----------

function initApp() {
  state.completedToday = getCompletedToday();
  render();

  const isLocalDev = ["localhost", "127.0.0.1"].includes(location.hostname);
  if ("serviceWorker" in navigator && !isLocalDev) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", initApp);
