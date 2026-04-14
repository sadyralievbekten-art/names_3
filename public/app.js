const token = localStorage.getItem("token");

function authFetch(url, options = {}) {
  options.headers = options.headers || {};
  options.headers["Authorization"] = token;
  return fetch(url, options);
}

let selectedTags = [];
let selectedRoots = [];
let editId = null;

async function save() {
  const body = {
    name: name.value,
    meaning: meaning.value,
    etymology: etymology.value,
    tags: selectedTags,
    roots: selectedRoots
  };

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

  load();
}

async function load() {
  const res = await fetch("/names");
  const data = await res.json();

  list.innerHTML = data.map(n => `
    <div>
      <b>${n.name}</b>
      <button onclick='edit(${JSON.stringify(n)})'>✏</button>
      <button onclick='del(${n.id})'>❌</button>
    </div>
  `).join("");
}

function edit(n) {
  editId = n.id;
  name.value = n.name;
  meaning.value = n.meaning;
  etymology.value = n.etymology;
  selectedTags = n.tags.map(t => t.name);
  selectedRoots = n.roots.map(r => r.name);
}

async function del(id) {
  await authFetch("/names/" + id, { method: "DELETE" });
  load();
}

load();
