export async function safeExec(fn, fallback = null) {
  try {
    return await fn();
  } catch (err) {
    console.log("🔥 SAFE EXEC ERROR:", err);
    return fallback;
  }
}