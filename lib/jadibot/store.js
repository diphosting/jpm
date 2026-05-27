import fs from "fs";

const DB_PATH = "./database/jadibot.json";

// pastikan folder & file ada
function ensureDB() {
    const dir = "./database";

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, "[]", "utf8");
    }
}

export function loadDB() {
    try {
        ensureDB();

        const data = fs.readFileSync(DB_PATH, "utf8");

        if (!data || data.trim() === "") {
            fs.writeFileSync(DB_PATH, "[]", "utf8");
            return [];
        }

        return JSON.parse(data);
    } catch (err) {
        console.log("⚠️ DB rusak, auto reset:", err);

        fs.writeFileSync(DB_PATH, "[]", "utf8");
        return [];
    }
}

export function saveDB(data) {
    ensureDB();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

export function updateUser(number, data) {
    let db = loadDB();

    const idx = db.findIndex(v => v.number === number);

    if (idx !== -1) {
        db[idx] = { ...db[idx], ...data };
    } else {
        db.push({ number, ...data });
    }

    saveDB(db);
}

export function getUser(number) {
    return loadDB().find(v => v.number === number);
}