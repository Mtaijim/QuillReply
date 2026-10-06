(() => {
  if (document.getElementById("quill-host")) return;

  const host = document.createElement("div");
  host.id = "quill-host";
  document.documentElement.appendChild(host);
  const root = host.attachShadow({ mode: "open" });

  root.innerHTML = `
  <style>
    * { box-sizing: border-box; font-family: "Segoe UI", system-ui, sans-serif; }
    #fab { position: fixed; right: 24px; bottom: 24px; z-index: 2147483647; padding: 12px 20px;
      background: #14213d; color: #fff; border: 0; border-radius: 999px; font-weight: 600; font-size: 14px;
      cursor: pointer; box-shadow: 0 8px 24px rgba(20,33,61,.35); }
    #panel { position: fixed; right: 24px; bottom: 80px; z-index: 2147483647; width: 380px; max-height: 80vh;
      overflow: auto; background: #fff; border: 1px solid #d9deea; border-radius: 12px; color: #14213d;
      box-shadow: 0 20px 50px rgba(20,33,61,.3); }
    #panel[hidden] { display: none; }
    .stripe { height: 7px; background: repeating-linear-gradient(135deg,#d8434a 0 12px,#fff 12px 20px,#2b50e6 20px 32px,#fff 32px 40px); }
    .body { padding: 16px; }
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .head strong { font-size: 16px; }
    .x { background: none; border: 0; font-size: 20px; cursor: pointer; color: #55607a; }
    .row { display: flex; gap: 8px; margin-bottom: 10px; }
    select { flex: 1; padding: 8px; border: 1px solid #d9deea; border-radius: 8px; font-size: 14px; background: #fff; }
    .primary { width: 100%; padding: 10px; background: #2b50e6; color: #fff; border: 0; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; }
    .primary:disabled { background: #aab5e8; cursor: wait; }
    .tabs { display: flex; gap: 4px; margin: 14px 0 8px; border-bottom: 1px solid #d9deea; }
    .tabs button { background: none; border: 0; padding: 6px 10px; cursor: pointer; color: #55607a; font-size: 13px; border-bottom: 2px solid transparent; margin-bottom: -1px; }
    .tabs button.on { color: #14213d; border-bottom-color: #2b50e6; font-weight: 600; }
    textarea { width: 100%; min-height: 150px; padding: 10px; border: 1px solid #d9deea; border-radius: 8px; font-size: 14px; line-height: 1.55; resize: vertical; }
    .actions { display: flex; gap: 8px; margin-top: 8px; }
    .actions button { flex: 1; padding: 9px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; border: 1px solid #14213d; }
    #insert { background: #14213d; color: #fff; }
    #copy { background: #fff; color: #14213d; }
    #status { font-size: 13px; margin: 10px 0 0; color: #55607a; min-height: 18px; }
    #status.err { color: #b3261e; }
  </style>
  <button id="fab">Quill Reply</button>
  <section id="panel" hidden>
    <div class="stripe"></div>
    <div class="body">
      <div class="head"><strong>Quill Reply</strong><button class="x" id="close" aria-label="Close">×</button></div>
      <div class="row">
        <select id="tone"><option>professional</option><option>friendly</option><option>firm</option><option>apologetic</option><option>concise</option></select>
        <select id="lang"><option>English</option><option>Hindi</option><option>Marathi</option></select>
      </div>
      <button class="primary" id="go">Write replies for open email</button>
      <p id="status"></p>
      <div id="result" hidden>
        <div class="tabs" id="tabs"></div>
        <textarea id="draft"></textarea>
        <div class="actions"><button id="insert">Insert in reply</button><button id="copy">Copy</button></div>
      </div>
    </div>
  </section>`;

  const $ = (id) => root.getElementById(id);
  const LABELS = ["Short", "Medium", "Detailed"];
  let drafts = [];
  let active = 1;

  const setStatus = (text, err = false) => {
    $("status").textContent = text;
    $("status").className = err ? "err" : "";
  };

  function getEmailText() {
    const nodes = [...document.querySelectorAll("div.a3s.aiL, div.a3s")];
    const last = nodes[nodes.length - 1];
    return last ? last.innerText.trim().slice(0, 5000) : "";
  }

  function renderTabs() {
    $("tabs").innerHTML = "";
    drafts.forEach((_, i) => {
      const b = document.createElement("button");
      b.textContent = LABELS[i] || `Draft ${i + 1}`;
      b.className = i === active ? "on" : "";
      b.onclick = () => {
        active = i;
        renderTabs();
      };
      $("tabs").appendChild(b);
    });
    $("draft").value = drafts[active] || "";
  }

  $("fab").onclick = () => {
    $("panel").hidden = !$("panel").hidden;
  };
  $("close").onclick = () => {
    $("panel").hidden = true;
  };
  $("draft").oninput = (e) => {
    drafts[active] = e.target.value;
  };

  $("go").onclick = () => {
    const emailContent = getEmailText();
    if (!emailContent)
      return setStatus("Open an email first, then try again.", true);
    $("go").disabled = true;
    setStatus("Writing replies...");
    chrome.runtime.sendMessage(
      {
        type: "generate",
        payload: {
          emailContent,
          tone: $("tone").value,
          length: "medium",
          language: $("lang").value,
        },
      },
      (res) => {
        $("go").disabled = false;
        if (!res || !res.ok)
          return setStatus(res?.error || "Something went wrong.", true);
        drafts = res.drafts;
        active = Math.min(1, drafts.length - 1);
        $("result").hidden = false;
        setStatus("");
        renderTabs();
      },
    );
  };

  const findBox = () => {
    const boxes = [
      ...document.querySelectorAll('div[role="textbox"][g_editable="true"]'),
    ];
    return boxes[boxes.length - 1];
  };

  $("insert").onclick = async () => {
    const text = drafts[active];
    let box = findBox();
    if (!box) {
      const reply =
        document.querySelector("span.ams.bkH") ||
        [...document.querySelectorAll('[role="button"]')].find((b) =>
          /^reply$/i.test(b.getAttribute("aria-label") || b.innerText.trim()),
        );
      if (reply) reply.click();
      await new Promise((r) => setTimeout(r, 700));
      box = findBox();
    }
    if (!box) {
      await navigator.clipboard.writeText(text);
      return setStatus(
        "Reply box not found. Copied instead, so paste it in.",
        true,
      );
    }
    box.focus();
    document.execCommand("insertText", false, text);
    setStatus("Inserted in your reply.");
  };

  $("copy").onclick = async () => {
    await navigator.clipboard.writeText(drafts[active]);
    setStatus("Copied.");
  };
})();
