const BACKEND = "http://localhost:8080";

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== "generate") return;
  fetch(`${BACKEND}/api/email/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(msg.payload),
  })
    .then(async (r) => {
      const data = await r.json();
      sendResponse(
        r.ok
          ? { ok: true, drafts: data }
          : { ok: false, error: data.error || "Request failed." },
      );
    })
    .catch(() =>
      sendResponse({
        ok: false,
        error: "Can't reach the server. Is the backend running?",
      }),
    );
  return true;
});
