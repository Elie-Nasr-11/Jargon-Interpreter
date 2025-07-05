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

function scrollOutputToBottom() {
  output.scrollTop = output.scrollHeight;
}

async function sendCode() {
  code = textarea.value;
  memory = {};
  askField.style.display = "none";
  askVar = null;
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
      askInput.disabled = false;
      askInput.focus();
    } else {
      askField.style.display = "none";
      askVar = null;
    }

    if (Array.isArray(data.result)) {
      output.textContent += "\n" + data.result.join("\n");
    } else {
      output.textContent += "\n" + (data.result || "[No output returned]");
    }

    if (data.memory) memory = data.memory;
  } catch (err) {
    output.textContent += `\n[ERROR] Could not connect to server`;
  }

  scrollOutputToBottom();
  resizeParent();
}

async function sendAnswer() {
  const ans = askInput.value;
  if (!askVar) return;

  askInput.disabled = true;

  try {
    const res = await fetch("https://jargon-engine-test.onrender.com/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ var: askVar, value: ans, code, memory }),
    });

    const data = await res.json();

    if (data.ask) {
      askVar = data.ask_var;
      askField.style.display = "flex";
      askInput.placeholder = data.ask;
      askInput.value = "";
      askInput.disabled = false;
      askInput.focus();
    } else {
      askField.style.display = "none";
      askVar = null;
    }

    if (Array.isArray(data.result)) {
      output.textContent += "\n" + data.result.join("\n");
    } else {
      output.textContent += "\n" + (data.result || "[No output returned]");
    }

    if (data.memory) memory = data.memory;
  } catch (err) {
    output.textContent += `\n[ERROR] Could not connect to server`;
  }

  scrollOutputToBottom();
  resizeParent();
}

function copyInput() {
  navigator.clipboard.writeText(textarea.value);
}

function copyOutput() {
  navigator.clipboard.writeText(output.textContent);
}

askInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendAnswer();
  }
});

window.addEventListener("load", resizeParent);
window.addEventListener("resize", resizeParent);
new MutationObserver(resizeParent).observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});
