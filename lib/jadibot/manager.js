import { createWorker } from "./worker.js";
import { updateUser, loadDB } from "./store.js";
import fs from "fs";

export async function createJadibot(number, days, code) {
    const expire = Date.now() + days * 86400000;

    const db = loadDB();

    db.push({
        number,
        code,
        status: "pending",
        expire,
        lastSeen: Date.now(),
        reason: null
    });

    fs.writeFileSync("./database/jadibot.json", JSON.stringify(db, null, 2));

    // create worker session setelah user login nanti
    updateUser(number, {
        status: "waiting_login",
        expire
    });

    return code;
}