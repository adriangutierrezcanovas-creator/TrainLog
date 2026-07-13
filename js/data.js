// Modelo de datos de la rutina. Fuente: Rutina de entrenamiento.docx + correcciones
// del usuario (ver CONTEXTO_APP.md). No reordenar ejercicios de un día sin motivo:
// el orden del lunes evita pre-fatigar el hombro con laterales antes de dominadas.

const EX = {
  dominadas: { name: "Dominadas", bodyweight: true, sets: 4, reps: 4, hint: "peso corporal · técnica estricta" },
  rdl: { name: "Peso muerto rumano", sets: 3, reps: 15, defaultWeight: 26.5, kind: "compound" },
  remo_unilateral: { name: "Remo unilateral", sets: 2, reps: 12, defaultWeight: 27, kind: "compound" },
  laterales: { name: "Elevaciones laterales", sets: 3, reps: 12, defaultWeight: 10, kind: "isolation" },
  press_banca: { name: "Press banca", sets: 3, reps: 10, defaultWeight: 27, kind: "compound" },
  flexiones_tempo: { name: "Flexiones tempo", bodyweight: true, sets: 3, reps: 15, hint: "tempo lento" },
  press_militar: { name: "Press militar", sets: 2, reps: 10, defaultWeight: 17, kind: "compound" },
  curl_biceps: { name: "Curl bíceps", sets: 3, reps: 10, defaultWeight: 15, kind: "isolation" },
  bulgara: { name: "Sentadilla búlgara", sets: 3, reps: 10, defaultWeight: 17, kind: "compound" },
  zancadas: { name: "Zancadas", sets: 2, reps: 10, defaultWeight: 27, kind: "compound" },
  extension_triceps: { name: "Extensión tríceps", sets: 3, reps: 12, defaultWeight: 17, kind: "isolation" },
  curl_inclinado: { name: "Curl inclinado", sets: 2, reps: 10, defaultWeight: 15, kind: "isolation" },
  squeeze_press: { name: "Squeeze Press", sets: 3, reps: 15, defaultWeight: 27, kind: "isolation" },
};

const CEILING = { compound: 16, isolation: 20 };

const DAYS = {
  1: { label: "Lunes", tag: "Tirón + cadena posterior", exercises: ["dominadas", "rdl", "remo_unilateral", "laterales"] },
  2: { label: "Martes", tag: "Empuje + bíceps", exercises: ["press_banca", "flexiones_tempo", "press_militar", "curl_biceps"] },
  4: { label: "Jueves", tag: "Pierna + hombro + brazos", exercises: ["bulgara", "zancadas", "extension_triceps", "laterales", "curl_inclinado"] },
  5: { label: "Viernes", tag: "Torso mixto", exercises: ["press_banca", "squeeze_press", "dominadas", "remo_unilateral", "press_militar"] },
};

const LIME = "#D6FA1E";
const WARN = "#FF3B1F";

function todayDow() {
  return new Date().getDay();
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
