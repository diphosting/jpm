import { createJadibot } from "../lib/jadibot/manager.js";

export default async function jadibot(sock, sender, text, key, msg) {

    const jid = msg?.key?.remoteJid || sender;
    const args = text.split(" ");

    let number = args[1]?.replace(/[^0-9]/g, "");
    let days = parseInt(args[2]);

    if (!number || !days) {
        return sock.sendMessage(jid, {
            text: "Format: jadibot 628xxx 7"
        });
    }

    const code = await sock.requestPairingCode(number);

    await createJadibot(number, days, code);

    return sock.sendMessage(jid, {
        text:
`✅ JADIBOT CREATED

Nomor: ${number}
Durasi: ${days} hari
Code: ${code}

Status: waiting login`
    });
}