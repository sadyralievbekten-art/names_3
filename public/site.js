function go(page) {
  window.location = "/" + page;
}

async function load() {
  const res = await fetch("/names");
  const data = await res.json();

  const search = document.getElementById("search").value.toLowerCase();

  const filtered = data.filter(n =>
    n.name.toLowerCase().includes(search)
  );

  render(filtered);
}

function render(data) {
  const list = document.getElementById("list");

  // 👉 если пусто
  if (data.length === 0) {
    list.innerHTML = `
      <div class="empty">
        <h2>Пока нет данных</h2>
        <p>Добавь имена через админку</p>
      </div>
    `;
    return;
  }

  list.innerHTML = "";

  data.forEach(n => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${n.name}</h3>
      <p><b>Значение:</b> ${n.meaning}</p>
      <p><b>Этимология:</b> ${n.etymology}</p>

      <div>
        ${n.tags.map(t =>
          `<span class="tag" onclick="filterTag('${t.name}')">${t.name}</span>`
        ).join("")}
      </div>

      <div>
        ${n.roots.map(r =>
          `<span class="tag" onclick="filterRoot('${r.name}')">${r.name}</span>`
        ).join("")}
      </div>
    `;

    list.appendChild(div);
  });
}

// ===== связь с бэком =====

async function filterTag(tag) {
  const res = await fetch(`/names/by-tag?tag=${tag}`);
  const data = await res.json();
  render(data);
}

async function filterRoot(root) {
  const res = await fetch(`/names/by-root?root=${root}`);
  const data = await res.json();
  render(data);
}

// старт
load();
