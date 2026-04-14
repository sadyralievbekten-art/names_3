const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.text({ type: "text/plain" })); // фикс для CSV
app.use(express.static(path.join(__dirname, "../public")));

const DATA_PATH = path.join(__dirname, "../data/names.json");

const ADMIN_PASSWORD = "12345";
const ADMIN_TOKEN = "secret_token";

// ===== UTILS =====
function readData() {
  if (!fs.existsSync(DATA_PATH)) return [];
  return JSON.parse(fs.readFileSync(DATA_PATH));
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function normalize(str) {
  return (str || "").trim().toLowerCase();
}

// ===== AUTH =====
app.post("/login", (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    return res.json({ token: ADMIN_TOKEN });
  }
  res.status(401).json({ error: "Wrong password" });
});

function checkAuth(req, res, next) {
  if (req.headers["authorization"] !== ADMIN_TOKEN) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

// ===== ROOT (главная страница) =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ===== CRUD =====

// создать
app.post("/names", checkAuth, (req, res) => {
  const { name, meaning, etymology, tags = [], roots = [] } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name required" });
  }

  const data = readData();

  data.push({
    id: Date.now() + Math.random(),
    name,
    meaning: meaning || "",
    etymology: etymology || "",
    tags: tags.map(t => ({ name: t, norm: normalize(t) })),
    roots: roots.map(r => ({ name: r, norm: normalize(r) }))
  });

  writeData(data);
  res.json({ success: true });
});

// все имена
app.get("/names", (req, res) => {
  res.json(readData());
});

// обновить
app.put("/names/:id", checkAuth, (req, res) => {
  const id = Number(req.params.id);
  const data = readData();

  const index = data.findIndex(n => n.id === id);
  if (index === -1) return res.status(404).json({ error: "Not found" });

  const { name, meaning, etymology, tags = [], roots = [] } = req.body;

  data[index] = {
    ...data[index],
    name,
    meaning,
    etymology,
    tags: tags.map(t => ({ name: t, norm: normalize(t) })),
    roots: roots.map(r => ({ name: r, norm: normalize(r) }))
  };

  writeData(data);
  res.json(data[index]);
});

// удалить
app.delete("/names/:id", checkAuth, (req, res) => {
  const data = readData().filter(n => n.id !== Number(req.params.id));
  writeData(data);
  res.json({ success: true });
});

// ===== IMPORT CSV =====
app.post("/import", checkAuth, (req, res) => {
  const csv = req.body;

  if (!csv) {
    return res.status(400).json({ error: "No data" });
  }

  const lines = csv.split("\n").filter(l => l.trim());
  const headers = lines[0].split(",");

  const data = readData();
  let count = 0;

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
    if (!parts) continue;

    const obj = {};
    headers.forEach((h, idx) => {
      obj[h.trim()] = parts[idx]?.replace(/"/g, "").trim();
    });

    if (!obj.name) continue;

    data.push({
      id: Date.now() + Math.random(),
      name: obj.name,
      meaning: obj.meaning || "",
      etymology: obj.etymology || "",
      tags: (obj.tags || "")
        .split(",")
        .map(t => t.trim())
        .filter(Boolean)
        .map(t => ({ name: t, norm: normalize(t) })),
      roots: (obj.roots || "")
        .split(",")
        .map(r => r.trim())
        .filter(Boolean)
        .map(r => ({ name: r, norm: normalize(r) }))
    });

    count++;
  }

  writeData(data);
  res.json({ count });
});

// ===== SEARCH =====

// теги (автоподсказка)
app.get("/tags", (req, res) => {
  const search = normalize(req.query.search || "");
  const map = new Map();

  readData().forEach(n =>
    n.tags.forEach(t => map.set(t.norm, t.name))
  );

  const result = [...map.values()].filter(t =>
    normalize(t).includes(search)
  );

  res.json(result);
});

// корни
app.get("/roots", (req, res) => {
  const search = normalize(req.query.search || "");
  const map = new Map();

  readData().forEach(n =>
    n.roots.forEach(r => map.set(r.norm, r.name))
  );

  const result = [...map.values()].filter(r =>
    normalize(r).includes(search)
  );

  res.json(result);
});

// фильтр по тегу
app.get("/names/by-tag", (req, res) => {
  const tag = normalize(req.query.tag || "");
  res.json(
    readData().filter(n => n.tags.some(t => t.norm === tag))
  );
});

// фильтр по корню
app.get("/names/by-root", (req, res) => {
  const root = normalize(req.query.root || "");
  res.json(
    readData().filter(n => n.roots.some(r => r.norm === root))
  );
});

// ===== СТАТИСТИКА =====

// теги
app.get("/stats/tags", (req, res) => {
  const map = {};

  readData().forEach(n =>
    n.tags.forEach(t => {
      if (!map[t.norm]) {
        map[t.norm] = { name: t.name, count: 0 };
      }
      map[t.norm].count++;
    })
  );

  res.json(Object.values(map).sort((a, b) => b.count - a.count));
});

// корни
app.get("/stats/roots", (req, res) => {
  const map = {};

  readData().forEach(n =>
    n.roots.forEach(r => {
      if (!map[r.norm]) {
        map[r.norm] = { name: r.name, count: 0 };
      }
      map[r.norm].count++;
    })
  );

  res.json(Object.values(map).sort((a, b) => b.count - a.count));
});

// ===== START =====
app.listen(3000, () => {
  console.log("http://localhost:3000");
});
