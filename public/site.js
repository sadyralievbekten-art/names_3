function go(page) {
  window.location = "/" + page;
}

function safe(arr) {
  return Array.isArray(arr) ? arr : [];
}

async function load() {
  const res = await fetch("/names");
  const data = await res.json();

  const search = document.getElementById("search").value.toLowerCase();

  const filtered = data.filter(n =>
    (n.name || "").toLowerCase().includes(search)
  );

  render(filtered);
}

function reset() {
  document.getElementById("search").value = "";
  load();
}

function render(data) {
  const list = document.getElementById("list");

  if (!data.length) {
    list.innerHTML = `
      <div class="empty">
        <h2>Пока нет имён</h2>
        <p>Добавь их через админку</p>
      </div>
    `;
    return;
  }

  list.innerHTML = "";

  data.forEach(n => {
    const div = document.createElement("div");
    div.className = "card";

    const tags = safe(n.tags);

    div.innerHTML = `
      <div class="name">${n.name || ""}</div>

      <div class="tags">
        ${tags.map(t =>
          `<span class="tag">${t.name}</span>`
        ).join("")}
      </div>
    `;

    list.appendChild(div);
  });
}

load();
