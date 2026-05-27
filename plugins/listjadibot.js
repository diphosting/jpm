import { loadDB } from "../lib/jadibot/store.js";

export default async function listjadibot(sock, sender, text, key, msg) {

    const jid = msg?.key?.remoteJid || sender;
    const db = loadDB();

    let txt = "📊 JADIBOT STATUS\n\n";

    for (let u of db) {
        txt += `• ${u.number}
  - status: ${u.status}
  - expire: ${new Date(u.expire).toLocaleString()}
  - reason: ${u.reason || "-"}
\n`;
    }

    return sock.sendMessage(jid, { text: txt });
}