// Modelo de datos de la rutina. Fuente: Rutina de entrenamiento.docx + correcciones
// del usuario + ACTUALIZACION_JULIO_2026.md. No reordenar ejercicios de un día sin
// motivo: el orden del lunes evita pre-fatigar el hombro con laterales antes de
// dominadas.
//
// Campos por ejercicio:
// - kind: 'compound' | 'isolation' -> techo de reps antes de subir peso (16 / 20).
//   No aplica a bodyweight ni a fallo-pausa (usan sus propias reglas).
// - capMin/capMax: % de incremento de peso sugerido al alcanzar el techo. No se
//   deriva de `kind` porque press_banca/press_militar son compuestos pero limitados
//   al 5-7% (motivo: episodio real de sobrecarga en codo/hombro, ver
//   ACTUALIZACION_JULIO_2026.md sección 0). No simplificar esto.
// - conditional: true en bulgara/zancadas -> la sugerencia de peso lleva la
//   coletilla "solo si la semana pasada cumpliste el RIR" (no hay histórico de RIR
//   real, así que se muestra siempre con la coletilla en vez de omitirla).
// - restpause: true en los 3 ejercicios a fallo real. Es solo una etiqueta y un
//   techo distinto (acumulado de 3 series, no por serie) — la mecánica de
//   series/stepper es idéntica a cualquier otro ejercicio, no crear pantalla nueva.
// - restSeconds: descanso de referencia para marcar el botón de timer recomendado.

const EX = {
  dominadas: {
    name: "Dominadas",
    bodyweight: true,
    sets: 4,
    repsTarget: [8, 6, 4, 4], // objetivo por serie, ya no uniforme (ver ACTUALIZACION_JULIO_2026_v2.md #1)
    progressionNote: "+1 rep cada ~2 semanas, prioriza series 3 y 4",
    hint: "peso corporal · técnica estricta",
    rir: "1-2",
    restSeconds: 180, // subido desde 150 -- a probar, caída grande de reps entre serie 1 y 2
  },
  rdl: {
    name: "Peso muerto rumano",
    sets: 3,
    reps: 15,
    defaultWeight: 26.5,
    kind: "compound",
    repCeiling: 16,
    capMin: 7,
    capMax: 10,
    rir: "1-2",
    restSeconds: 150,
  },
  remo_unilateral: {
    name: "Remo unilateral",
    sets: 2,
    reps: 12,
    defaultWeight: 27,
    kind: "compound",
    repCeiling: 16,
    capMin: 7,
    capMax: 10,
    rir: "1-2",
    restSeconds: 120,
  },
  press_banca: {
    name: "Press banca",
    sets: 3,
    reps: 10,
    defaultWeight: 24.5, // bajado desde 27 (episodio de sobrecarga, ver actualización jul-2026); solo afecta al default, no al histórico ya guardado
    kind: "compound",
    repCeiling: 16,
    capMin: 5,
    capMax: 7,
    rir: "1-2",
    restSeconds: 150,
  },
  flexiones_tempo: {
    name: "Flexiones tempo",
    bodyweight: true,
    sets: 3,
    reps: 15,
    hint: "tempo lento",
    rir: "1",
    restSeconds: 75,
  },
  press_militar: {
    name: "Press militar",
    sets: 2,
    reps: 10,
    defaultWeight: 17,
    kind: "compound",
    repCeiling: 16,
    capMin: 5,
    capMax: 7,
    rir: "1-2",
    restSeconds: 135,
  },
  bulgara: {
    name: "Sentadilla búlgara",
    sets: 3,
    reps: 10,
    defaultWeight: 17,
    kind: "compound",
    repCeiling: 16, // vuelve a alinearse con el genérico de compuestos (bajó a 13 en la revisión anterior, pero 13 reps con 17kg mostró margen de sobra para subir carga)
    capMin: 7,
    capMax: 10,
    conditional: true,
    rir: "1-2",
    restSeconds: 135,
  },
  zancadas: {
    name: "Zancadas",
    sets: 2,
    reps: 10,
    defaultWeight: 27,
    kind: "compound",
    repCeiling: 16,
    capMin: 7,
    capMax: 10,
    conditional: true,
    rir: "1-2",
    restSeconds: 105,
  },
  curl_martillo: {
    name: "Curl martillo",
    sets: 3,
    reps: 10,
    defaultWeight: 15,
    kind: "isolation",
    repCeiling: 20,
    capMin: 10,
    capMax: 15,
    rir: "1-2",
    restSeconds: 75,
  },
  curl_inclinado: {
    name: "Curl inclinado",
    sets: 2,
    reps: 10,
    defaultWeight: 15,
    kind: "isolation",
    repCeiling: 20,
    capMin: 10,
    capMax: 15,
    rir: "1-2",
    restSeconds: 75,
  },
  squeeze_press: {
    name: "Squeeze Press",
    sets: 3,
    reps: 15,
    defaultWeight: 27,
    kind: "isolation",
    repCeiling: 20,
    capMin: 5, // aislamiento con cap especial: va con el grupo press, no 10-15
    capMax: 7,
    rir: "1-2",
    restSeconds: 105,
  },
  laterales: {
    name: "Elevaciones laterales",
    sets: 3,
    reps: 12,
    defaultWeight: 6, // deload desde 10 (solo default; no sobrescribe last:laterales ya guardado)
    kind: "isolation",
    capMin: 10,
    capMax: 15,
    restpause: true,
    clusterCeilingMin: 22, // antes 25/28 genérico -- estimación de partida, a ajustar con datos reales
    clusterCeilingMax: 24,
    rir: "0-1",
    restSeconds: 105,
  },
  curl_biceps: {
    name: "Curl bíceps",
    sets: 3,
    reps: 10,
    defaultWeight: 15,
    kind: "isolation",
    capMin: 10,
    capMax: 15,
    restpause: true,
    clusterCeilingMin: 20, // antes 25/28 genérico -- estimación de partida, a ajustar con datos reales
    clusterCeilingMax: 22,
    rir: "0-1",
    restSeconds: 135,
  },
  extension_triceps: {
    name: "Extensión tríceps",
    sets: 2, // bajado desde 3 (jueves jul-2026): el tríceps ya recibe volumen indirecto suficiente de los presses
    reps: 12,
    defaultWeight: 17,
    kind: "isolation",
    capMin: 10,
    capMax: 15,
    restpause: true,
    clusterCeilingMin: 22, // antes 25/28 genérico -- estimación de partida, a ajustar con datos reales
    clusterCeilingMax: 24,
    rir: "0-1",
    restSeconds: 105,
  },
};

// Un día puede referenciar un ejercicio por su id (usa EX[id].sets tal cual) o con
// un override `{ id, sets }` cuando ese día se hacen menos/más series que el
// default (p.ej. press banca: 3 series el martes, 2 el viernes).
const DAYS = {
  1: {
    label: "Lunes",
    tag: "Tirón + cadena posterior",
    exercises: ["dominadas", "rdl", "remo_unilateral", "laterales", "curl_martillo"],
  },
  2: {
    label: "Martes",
    tag: "Empuje + bíceps",
    exercises: ["press_banca", "flexiones_tempo", "press_militar", "curl_biceps"],
  },
  4: {
    label: "Jueves",
    tag: "Pierna + hombro + brazos",
    // laterales al final (jul-2026): igual que en lunes, no gastar el hombro antes del trabajo principal
    exercises: ["bulgara", "zancadas", "extension_triceps", "curl_inclinado", "laterales"],
  },
  5: {
    label: "Viernes",
    tag: "Torso mixto",
    exercises: [{ id: "press_banca", sets: 2 }, "squeeze_press", "dominadas", "remo_unilateral", "press_militar"],
  },
};

const LIME = "#D6FA1E";
const WARN = "#FF3B1F";

function todayDow() {
  return new Date().getDay();
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function dayExerciseId(day, idx) {
  const item = day.exercises[idx];
  return typeof item === "string" ? item : item.id;
}

function dayExerciseSets(day, idx) {
  const item = day.exercises[idx];
  if (typeof item === "string") return EX[item].sets;
  return item.sets ?? EX[item.id].sets;
}
