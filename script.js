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
      askInput.focus();

      if (Array.isArray(data.result)) {
        output.textContent += "\n" + data.result.join("\n");
      } else {
        output.textContent += "\n" + (data.result || "[No output returned]");
      }
    } else {
      askField.style.display = "none";
      askVar = null;

      if (Array.isArray(data.result)) {
        output.textContent += "\n" + data.result.join("\n");
      } else {
        output.textContent += "\n" + (data.result || "[No output returned]");
      }
    }

    if (data.memory) memory = data.memory;
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
  } catch (err) {
    output.textContent += `\n[ERROR] ${err.message}`;
  }

  scrollOutputToBottom();
  resizeParent();
}

function copyInput() {
  navigator.clipboard.writeText(textarea.value).then(() => {
    // Optional: show feedback
  });
}

function copyOutput() {
  navigator.clipboard.writeText(output.textContent).then(() => {
    // Optional: show feedback
  });
}

window.addEventListener("load", resizeParent);
window.addEventListener("resize", resizeParent);
new MutationObserver(resizeParent).observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});
