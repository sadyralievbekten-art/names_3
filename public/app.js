const token = localStorage.getItem("token");

if (!token) {
  window.location = "/login.html";
}

function authFetch(url, options = {}) {
  options.headers = options.headers || {};
  options.headers["Authorization"] = token;
  return fetch(url, options);
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value ?? "";
}

function parseList(value) {
  return String(value || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

let editId = null;

async function save() {
  const body = {
    name: getValue("name").trim(),
    meaning: getValue("meaning").trim(),
    etymology: getValue("etymology").trim(),
    tags: parseList(getValue("tags")),
    roots: parseList(getValue("roots"))
  };

  if (!body.name) {
    alert("Имя обязательно");
    return;
  }

  const url = editId ? `/names/${editId}` : "/names";
  const method = editId ? "PUT" : "POST";

  const res = await authFetch(url, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || "Ошибка сохранения");
    return;
  }

  resetForm();
  load();
}

function edit(item) {
  editId = item.id;

  setValue("name", item.name);
  setValue("meaning", item.meaning);
  setValue("etymology", item.etymology);

  setValue("tags", safeArray(item.tags).map(t => t.name ?? "").join(", "));
  setValue("roots", safeArray(item.roots).map(r => r.name ?? "").join(", "));

  const mode = document.getElementById("mode");
  if (mode) mode.innerText = "Редактирование";
}

function resetForm() {
  editId = null;

  setValue("name", "");
  setValue("meaning", "");
  setValue("etymology", "");
  setValue("tags", "");
  setValue("roots", "");

  const mode = document.getElementById("mode");
  if (mode) mode.innerText = "Создание";
}

async function del(id) {
  if (!confirm("Удалить запись?")) return;

  const res = await authFetch(`/names/${id}`, {
    method: "DELETE"
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || "Ошибка удаления");
    return;
  }

  if (editId === id) resetForm();
  load();
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

async function load() {
  const res = await fetch("/names");
  const data = await res.json();

  const list = document.getElementById("list");
  if (!list) return;

  if (!data.length) {
    list.innerHTML = "<p>Пока нет записей.</p>";
    return;
  }

  list.innerHTML = "";

  data.forEach((n) => {
    const tags = safeArray(n.tags).map(t => t.name ?? "").join(", ");
    const roots = safeArray(n.roots).map(r => r.name ?? "").join(", ");

    const div = document.createElement("div");
    div.style.border = "1px solid #ddd";
    div.style.padding = "10px";
    div.style.margin = "10px 0";
    div.style.borderRadius = "8px";

    div.innerHTML = `
      <b>${n.name ?? ""}</b>
      <div style="margin-top:6px;">${n.meaning ?? ""}</div>
      <div style="margin-top:6px;">${n.etymology ?? ""}</div>
      <div style="margin-top:6px;"><b>Теги:</b> ${tags || "нет"}</div>
      <div style="margin-top:6px;"><b>Корни:</b> ${roots || "нет"}</div>
      <div style="margin-top:8px;">
        <button onclick='edit(${JSON.stringify(n).replace(/'/g, "\\'")})'>Редактировать</button>
        <button onclick="del(${n.id})">Удалить</button>
      </div>
    `;

    list.appendChild(div);
  });
}

window.save = save;
window.edit = edit;
window.del = del;
window.resetForm = resetForm;

load();
