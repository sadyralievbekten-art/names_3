let openedId = null;
let activeTags = [];

async function load() {
  const res = await fetch("/names");
  const data = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  // фильтр по тегам
  let filtered = data;
  if (activeTags.length) {
    filtered = data.filter(n => {
      const tags = (n.tags || []).map(t => t.name);
      return activeTags.every(tag => tags.includes(tag));
    });
  }

  filtered.forEach(n => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ddd";
    div.style.padding = "12px";
    div.style.margin = "10px 0";
    div.style.borderRadius = "6px";

    const isOpen = openedId === n.id;

    div.innerHTML = `
      <div onclick="toggle(${n.id})" style="cursor:pointer;">
        <div style="font-size:18px; font-weight:bold;">
          ${n.name}
        </div>
        <div style="font-style:italic; color:#555;">
          ${n.meaning || ""}
        </div>
      </div>

      <div style="margin-top:6px;">
        ${(n.tags || []).map(t =>
          `<span 
            style="background:#eee; padding:4px 6px; margin:2px; border-radius:4px; cursor:pointer;"
            onclick="addTag('${t.name}', event)"
          >${t.name}</span>`
        ).join("")}
      </div>

      ${isOpen ? `
        <div style="margin-top:10px;">
          <b>Этимология:</b> ${n.etymology || ""}<br><br>

          <b>Корни:</b><br>
          ${(n.roots || []).map(r =>
            `<div 
              style="cursor:pointer;"
              onclick="addTag('${r.name}', event)"
            >${r.name}</div>`
          ).join("")}

          <br>
          <b>Анализ:</b><br>
          ${n.analysis || "нет анализа"}
        </div>
      ` : ""}
    `;

    list.appendChild(div);
  });

  renderActiveTags();
}

// ===== раскрытие =====
function toggle(id) {
  openedId = openedId === id ? null : id;
  load();
}

// ===== добавить тег =====
function addTag(tag, e) {
  e.stopPropagation();

  if (!activeTags.includes(tag)) {
    activeTags.push(tag);
  }

  load();
}

// ===== убрать тег =====
function removeTag(tag) {
  activeTags = activeTags.filter(t => t !== tag);
  load();
}

// ===== показать активные =====
function renderActiveTags() {
  let box = document.getElementById("activeTags");

  if (!box) {
    box = document.createElement("div");
    box.id = "activeTags";
    document.querySelector(".container").prepend(box);
  }

  if (!activeTags.length) {
    box.innerHTML = "";
    return;
  }

  box.innerHTML = activeTags.map(t =>
    `<span 
      style="background:#4caf50; color:white; padding:4px 8px; margin:3px; border-radius:4px; cursor:pointer;"
      onclick="removeTag('${t}')"
    >${t} ✕</span>`
  ).join("");
}

load();
