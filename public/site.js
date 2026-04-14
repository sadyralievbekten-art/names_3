function go(page) {
  window.location = "/" + page;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value) {
  return String(value ?? "").toLowerCase();
}

async function load() {
  const res = await fetch("/names");
  const data = await res.json();

  const query = normalizeText(document.getElementById("search").value).trim();

  const filtered = data.filter((n) =>
    normalizeText(n.name).includes(query)
  );

  render(filtered);
}

function resetFilter() {
  document.getElementById("search").value = "";
  load();
}

function render(data) {
  const list = document.getElementById("list");

  if (!data.length) {
    list.innerHTML = `
      <div class="empty">
        <h2>Пока нет данных</h2>
        <p>Добавь хотя бы 1 запись через админку или импорт.</p>
        <p>
          <button class="btn" onclick="go('login.html')">Перейти в админку</button>
        </p>
      </div>
    `;
    return;
  }

  list.innerHTML = "";

  data.forEach((n) => {
    const tags = safeArray(n.tags);
    const roots = safeArray(n.roots);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h2>${n.name ?? ""}</h2>
      <div class="meta"><b>Значение:</b> ${n.meaning ?? ""}</div>
      <div class="meta"><b>Этимология:</b> ${n.etymology ?? ""}</div>

      <div style="margin-top:10px;">
        <b>Теги:</b><br>
        ${tags.length
          ? tags.map(t => `<span class="tag" onclick="filterTag('${(t.name ?? "").replace(/'/g, "\\'")}')">${t.name ?? ""}</span>`).join("")
          : "<span class='meta'>нет тегов</span>"}
      </div>

      <div style="margin-top:10px;">
        <b>Корни:</b><br>
        ${roots.length
          ? roots.map(r => `<span class="tag" onclick="filterRoot('${(r.name ?? "").replace(/'/g, "\\'")}')">${r.name ?? ""}</span>`).join("")
          : "<span class='meta'>нет корней</span>"}
      </div>
    `;

    list.appendChild(card);
  });
}

async function filterTag(tag) {
  const res = await fetch(`/names/by-tag?tag=${encodeURIComponent(tag)}`);
  const data = await res.json();
  render(data);
}

async function filterRoot(root) {
  const res = await fetch(`/names/by-root?root=${encodeURIComponent(root)}`);
  const data = await res.json();
  render(data);
}

document.getElementById("search").addEventListener("keydown", (e) => {
  if (e.key === "Enter") load();
});

load();
