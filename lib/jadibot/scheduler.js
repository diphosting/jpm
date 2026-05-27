import { loadDB, updateUser } from "./store.js";
import { killWorker } from "./worker.js";

export function startScheduler() {

    setInterval(() => {
        const db = loadDB();
        const now = Date.now();

        for (let user of db) {

            // EXPIRE CHECK
            if (user.status === "active" && now > user.expire) {
                console.log(`[EXPIRE] ${user.number}`);

                killWorker(user.number);

                updateUser(user.number, {
                    status: "expired",
                    reason: "time_up"
                });
            }

            // HEALTH CHECK
            if (user.status === "active") {
                const last = user.lastSeen || 0;

                if (now - last > 5 * 60 * 1000) {
                    updateUser(user.number, {
                        status: "disconnected",
                        reason: "heartbeat_lost"
                    });
                }
            }
        }

    }, 60 * 1000);
}