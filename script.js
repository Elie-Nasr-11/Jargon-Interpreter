const textarea = document.getElementById("inputCode");
const output = document.getElementById("output");
const askField = document.getElementById("askField");
const askInput = document.getElementById("askInput");

let memory = {};       // Tracks memory state across ASK cycles
let code = "";         // Code stays constant across calls
let askVar = null;     // Current variable to store ASK result

function resizeParent() {
  setTimeout(() => {
    const h = document.documentElement.scrollHeight;
    window.parent.postMessage({ type: "resize", height: h }, "*");
  }, 50);
}

async function sendCode() {
  code = textarea.value;
  memory = {}; // reset memory on first run
  askField.style.display = "none";
  output.textContent = "";

  try {
    const res = await fetch("https://jargon-engine.onrender.com/run", {
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
      output.textContent = data.result || "[No output returned]";
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

  try {
    const res = await fetch("https://jargon-engine.onrender.com/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ var: askVar, value: ans }),
    });

    const data = await res.json();

    if (data.ask) {
      askVar = data.ask_var;
      askField.style.display = "flex";
      askInput.placeholder = data.ask;
      askInput.value = "";
      askInput.focus();
    } else {
      askField.style.display = "none";
      askVar = null;
    }

    output.textContent = data.result ? data.result.join("\n") : "[No output returned]";
    if (data.memory) memory = data.memory;
  } catch (err) {
    output.textContent = `[ERROR] ${err.message}`;
  }

  resizeParent();
}

function copyInput() {
  navigator.clipboard.writeText(textarea.value).then(() => alert("Input copied!"));
}

function copyOutput() {
  navigator.clipboard.writeText(output.textContent).then(() => alert("Output copied!"));
}

window.addEventListener("load", resizeParent);
window.addEventListener("resize", resizeParent);
new MutationObserver(resizeParent).observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});
