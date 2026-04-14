async function load() {
  const res = await fetch("/names");
  const data = await res.json();

  const q = document.getElementById("search").value.toLowerCase();

  const filtered = data.filter(n =>
    n.name.toLowerCase().includes(q)
  );

  const list = document.getElementById("list");

  list.innerHTML = filtered.map(n => `
    <div>
      <h3>${n.name}</h3>
      <p>${n.meaning}</p>
      <p>${n.etymology}</p>
      <p>Теги: ${n.tags.map(t=>t.name).join(", ")}</p>
      <p>Корни: ${n.roots.map(r=>r.name).join(", ")}</p>
      <hr>
    </div>
  `).join("");
}

load();
