import makeWASocket, {
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} from "baileys";

import P from "pino";
import fs from "fs";
import path from "path";
import { updateUser } from "./store.js";

const workers = new Map(); // number -> sock

export async function createWorker(number) {
    const sessionDir = path.join(process.cwd(), "tmp-jadibot", number);

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "22.04"]
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
            updateUser(number, {
                status: "active",
                lastSeen: Date.now(),
                reason: null
            });
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;

            console.log(`[JADIBOT CLOSED] ${number} reason:`, reason);

            if (reason === DisconnectReason.loggedOut) {
                updateUser(number, {
                    status: "banned",
                    reason: "logged_out_by_whatsapp"
                });
                workers.delete(number);
                return;
            }

            // auto reconnect
            setTimeout(() => {
                reconnectWorker(number);
            }, 3000);
        }
    });

    workers.set(number, sock);
    return sock;
}

export async function reconnectWorker(number) {
    console.log(`[RECONNECT] ${number}`);

    try {
        await createWorker(number);
    } catch (e) {
        updateUser(number, {
            status: "disconnected",
            reason: "reconnect_failed"
        });
    }
}

export function getWorker(number) {
    return workers.get(number);
}

export function killWorker(number) {
    const sock = workers.get(number);
    if (sock) {
        sock.logout().catch(() => {});
        workers.delete(number);
    }
}