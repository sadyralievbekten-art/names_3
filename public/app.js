const token = localStorage.getItem("token");

if (!token) {
  window.location = "/login.html";
}

function authFetch(url, options = {}) {
  options.headers = options.headers || {};
  options.headers["Authorization"] = token;
  return fetch(url, options);
}

let editId = null;

// ===== SAVE =====
async function save() {
  const name = document.getElementById("name").value;
  const meaning = document.getElementById("meaning").value;
  const etymology = document.getElementById("etymology").value;

  const tags = document.getElementById("tags").value
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);

  const roots = document.getElementById("roots").value
    .split(",")
    .map(r => r.trim())
    .filter(Boolean);

  const body = { name, meaning, etymology, tags, roots };

  if (editId) {
    await authFetch("/names/" + editId, {
      method: "PUT",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(body)
    });
  } else {
    await authFetch("/names", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(body)
    });
  }

  resetForm();
  load();
}

// ===== EDIT =====
function edit(n) {
  editId = n.id;

  document.getElementById("name").value = n.name;
  document.getElementById("meaning").value = n.meaning;
  document.getElementById("etymology").value = n.etymology;

  document.getElementById("tags").value =
    n.tags.map(t => t.name).join(", ");

  document.getElementById("roots").value =
    n.roots.map(r => r.name).join(", ");
}

// ===== DELETE =====
async function del(id) {
  await authFetch("/names/" + id, { method: "DELETE" });
  load();
}

// ===== RESET =====
function resetForm() {
  editId = null;

  document.getElementById("name").value = "";
  document.getElementById("meaning").value = "";
  document.getElementById("etymology").value = "";
  document.getElementById("tags").value = "";
  document.getElementById("roots").value = "";
}

// ===== LOAD =====
async function load() {
  const res = await fetch("/names");
  const data = await res.json();

  const list = document.getElementById("list");

  list.innerHTML = data.map(n => `
    <div style="border:1px solid #ccc; margin:10px; padding:10px;">
      <b>${n.name}</b><br>
      ${n.meaning}<br>
      ${n.etymology}<br>
      Теги: ${n.tags.map(t => t.name).join(", ")}<br>
      Корни: ${n.roots.map(r => r.name).join(", ")}<br>
      <button onclick='edit(${JSON.stringify(n)})'>Редактировать</button>
      <button onclick='del(${n.id})'>Удалить</button>
    </div>
  `).join("");
}

load();
