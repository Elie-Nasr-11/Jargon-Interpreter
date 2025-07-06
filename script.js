const textarea = document.getElementById("inputCode");
const output = document.getElementById("output");
const askField = document.getElementById("askField");
const askInput = document.getElementById("askInput");

let memory = {};
let code = "";
let askVar = null;
let answers = [];

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

function fadeOldResponses() {
  const lines = output.querySelectorAll("div.response-line");
  lines.forEach(line => {
    line.style.color = "#0077cc";
    line.style.fontWeight = "normal";
    line.style.fontSize = "0.85em";
  });
}

function typeOutput(text, container, index = 0, callback = () => {}) {
  if (index < text.length) {
    container.textContent += text.charAt(index);
    setTimeout(() => typeOutput(text, container, index + 1, callback), 15);
  } else {
    container.textContent += "\n\n";
    callback();
  }
}

function appendStyledOutput(lines) {
  if (!Array.isArray(lines)) lines = [lines];

  fadeOldResponses();

  lines.forEach(line => {
    const div = document.createElement("div");
    div.className = "response-line";
    div.style.color = "#c42d88";
    div.style.fontWeight = "bold";
    div.style.marginTop = "1em";
    output.appendChild(div);
    typeOutput(line, div, 0, scrollOutputToBottom);
  });
}

async function sendCode() {
  code = textarea.value.trim();
  memory = {};
  answers = [];
  askVar = null;
  output.innerHTML = "";
  askField.style.display = "none";

  try {
    const res = await fetch("https://jargon-engine-test.onrender.com/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, answers }),
    });

    const data = await res.json();

    askField.style.display = data.ask ? "flex" : "none";
    askVar = data.ask ? data.ask_var : null;

    if (data.ask) {
      askInput.placeholder = data.ask;
      askInput.value = "";
      askInput.focus();
    }

    appendStyledOutput(data.result || "[No output returned]");

    if (data.memory) memory = data.memory;

    highlightOutput();
  } catch (err) {
    appendStyledOutput(`[ERROR] ${err.message}`);
  }

  resizeParent();
}

async function sendAnswer() {
  const ans = askInput.value;
  if (!askVar) return;

  answers.push(ans);

  try {
    const res = await fetch("https://jargon-engine-test.onrender.com/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, answers }),
    });

    const data = await res.json();

    askField.style.display = data.ask ? "flex" : "none";
    askVar = data.ask ? data.ask_var : null;

    if (data.ask) {
      askInput.placeholder = data.ask;
      askInput.value = "";
      askInput.focus();
    }

    appendStyledOutput(data.result || "[No output returned]");

    if (data.memory) memory = data.memory;

    highlightOutput();
  } catch (err) {
    appendStyledOutput(`[ERROR] ${err.message}`);
  }

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
  output.innerHTML = "";
  memory = {};
  askVar = null;
  askInput.value = "";
  askField.style.display = "none";
  answers = [];
}

window.addEventListener("load", resizeParent);
window.addEventListener("resize", resizeParent);
new MutationObserver(resizeParent).observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});
