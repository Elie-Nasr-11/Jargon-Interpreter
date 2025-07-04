const textarea = document.getElementById("inputCode");
const output = document.getElementById("output");
const askField = document.getElementById("askField");
const askInput = document.getElementById("askInput");

let memory = {};
let code = "";
let askVar = null;

function resizeParent() {
  setTimeout(() => {
    const h = document.documentElement.scrollHeight;
    window.parent.postMessage({ type: "resize", height: h }, "*");
  }, 50);
}

async function sendCode() {
  code = textarea.value;
  memory = {};
  askField.style.display = "none";
  output.textContent = "";

  try {
    const res = await fetch("https://jargon-engine-test.onrender.com/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, memory }),
    });

    const data = await res.json();

    if (data.ask) {
      askVar = data.ask_var;
      askField.style.display = "flex";
      askInput.placeholder = data.ask;
      askInput.value = "";
      askInput.focus();
      if (data.result) {
        output.textContent = data.result.join("\n");
      }
    } else {
      askField.style.display = "none";
      askVar = null;
      output.textContent = data.result ? data.result.join("\n") : "[No output returned]";
    }

    if (data.memory) memory = data.memory;
  } catch (err) {
    output.textContent = `[ERROR] ${err.message}`;
  }

  resizeParent();
}

async function sendAnswer() {
  const ans = askInput.value;
  if (!askVar) return;

  console.log("[SEND ANSWER] Triggered");
  console.log("Sending:", { var: askVar, value: ans });

  try {
    const res = await fetch("https://jargon-engine-test.onrender.com/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ var: askVar, value: ans, code, memory }),
    });

    console.log("[SEND ANSWER] Got response");

    const data = await res.json();

    console.log("[SEND ANSWER] Parsed JSON:", data);

    output.textContent = data.result ? data.result.join("\n") : "[No output returned]";

    if (data.ask) {
      askVar = data.ask_var;
      askInput.placeholder = data.ask;
      askInput.value = "";
      askInput.focus();
      askField.style.display = "flex";
    } else {
      askField.style.display = "none";
      askVar = null;
    }

    if (data.memory) memory = data.memory;
  } catch (err) {
    output.textContent = `[ERROR] ${err.message}`;
    console.error("[SEND ANSWER] Error:", err);
  }

  resizeParent();
}

function copyInput() {
  navigator.clipboard.writeText(textarea.value).then(() => {
    // Optional: show temporary visual feedback
  });
}

function copyOutput() {
  navigator.clipboard.writeText(output.textContent).then(() => {
    // Optional: show temporary visual feedback
  });
}

window.addEventListener("load", resizeParent);
window.addEventListener("resize", resizeParent);
new MutationObserver(resizeParent).observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});
