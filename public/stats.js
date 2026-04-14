async function load() {
  const res = await fetch("/stats/tags");
  const data = await res.json();

  const div = document.getElementById("stats");

  div.innerHTML = data.map(x =>
    `<div>${x.name}: ${x.count}</div>`
  ).join("");
}

load();
