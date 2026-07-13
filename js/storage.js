// Sustituye a window.storage (solo existía en el sandbox de artifacts de Claude.ai)
// por localStorage. Misma forma de claves que el prototipo:
// last:{exerciseId}, history, completed:{YYYY-MM-DD}.

function getCompletedToday() {
  try {
    const raw = localStorage.getItem(`completed:${todayStr()}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function markCompletedToday(dayLabel) {
  try {
    localStorage.setItem(`completed:${todayStr()}`, JSON.stringify({ day: dayLabel }));
  } catch (e) {
    /* ignore */
  }
}

function getLast(exId) {
  try {
    const raw = localStorage.getItem(`last:${exId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setLast(exId, data) {
  try {
    localStorage.setItem(`last:${exId}`, JSON.stringify(data));
  } catch (e) {
    /* ignore */
  }
}

function appendHistory(entry) {
  try {
    let list = [];
    try {
      const raw = localStorage.getItem("history");
      list = raw ? JSON.parse(raw) : [];
    } catch (e) {
      list = [];
    }
    list.push(entry);
    localStorage.setItem("history", JSON.stringify(list));
  } catch (e) {
    /* ignore */
  }
}

function exportHistoryCSV() {
  let list = [];
  try {
    const raw = localStorage.getItem("history");
    list = raw ? JSON.parse(raw) : [];
  } catch (e) {
    list = [];
  }
  const header = "Fecha,Dia,Ejercicio,Serie,Peso (kg),Reps\n";
  const rows = list.map((e) => `${e.date},${e.day},${e.exercise},${e.set},${e.weight ?? ""},${e.reps}`).join("\n");
  const csv = header + rows;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trainlog-${todayStr()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
