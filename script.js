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

function highlightOutput() {
  output.classList.add("highlight");
  setTimeout(() => output.classList.remove("highlight"), 300);
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
      askInput.focus();
    }

    if (Array.isArray(data.result)) {
      output.textContent += "\n" + data.result.join("\n");
    } else {
      output.textContent += "\n" + (data.result || "[No output returned]");
    }

    if (data.memory) memory = data.memory;

    highlightOutput();
  } catch (err) {
    output.textContent += `\n[ERROR] ${err.message}`;
  }

  scrollOutputToBottom();
  resizeParent();
}

async function sendAnswer() {
  const ans = askInput.value;
  if (!askVar) return;

  try {
    const res = await fetch("https://jargon-engine-test.onrender.com/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ var: askVar, value: ans, code, memory }),
    });

    const data = await res.json();

    askField.style.display = data.ask ? "flex" : "none";
    askVar = data.ask ? data.ask_var : null;

    if (data.ask) {
      askInput.placeholder = data.ask;
      askInput.value = "";
      askInput.focus();
    }

    if (Array.isArray(data.result)) {
      output.textContent += "\n" + data.result.join("\n");
    } else {
      output.textContent += "\n" + (data.result || "[No output returned]");
    }

    if (data.memory) memory = data.memory;

    highlightOutput();
  } catch (err) {
    output.textContent += `\n[ERROR] ${err.message}`;
  }

  scrollOutputToBottom();
  resizeParent();
}

function copyInput() {
  navigator.clipboard.writeText(textarea.value).then(() => {
    flash(output, "[Input copied]");
  });
}

function copyOutput() {
  navigator.clipboard.writeText(output.textContent).then(() => {
    flash(output, "[Output copied]");
  });
}

function flash(el, msg) {
  const old = el.textContent;
  el.textContent = msg;
  el.classList.add("flash");
  setTimeout(() => {
    el.textContent = old;
    el.classList.remove("flash");
  }, 600);
}

function resetAll() {
  textarea.value = "";
  output.textContent = "";
  memory = {};
  askVar = null;
  askInput.value = "";
  askField.style.display = "none";
}

window.addEventListener("load", resizeParent);
window.addEventListener("resize", resizeParent);
new MutationObserver(resizeParent).observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});
