let openedId = null;

async function load() {
  const res = await fetch("/names");
  const data = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach(n => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.margin = "10px";
    div.style.cursor = "pointer";

    const isOpen = openedId === n.id;

    div.innerHTML = `
      <b onclick="toggle(${n.id})">${n.name}</b><br>

      ${isOpen ? `
        <div style="margin-top:10px;">
          ${n.meaning || ""}<br>
          ${n.etymology || ""}<br>
          Теги: ${(n.tags || []).map(t => t.name).join(", ")}<br>
          Корни: ${(n.roots || []).map(r => r.name).join(", ")}<br>
          ${n.analysis || ""}
        </div>
      ` : ""}
    `;

    list.appendChild(div);
  });
}

function toggle(id) {
  if (openedId === id) {
    openedId = null;
  } else {
    openedId = id;
  }

  load();
}

load();
