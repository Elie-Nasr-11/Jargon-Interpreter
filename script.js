const textarea = document.getElementById("inputCode");
const output = document.getElementById("output");
const askField = document.getElementById("askField");
const askInput = document.getElementById("askInput");
const askButton = document.getElementById("askButton");

function resizeParent() {
  setTimeout(() => {
    const h = document.documentElement.scrollHeight;
    window.parent.postMessage({ type: "resize", height: h }, "*");
  }, 50);
}

async function sendCode() {
  const code = textarea.value;
  output.textContent = "";
  askField.style.display = "none";

  try {
    const res = await fetch("https://jargon-engine.onrender.com/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: code }),
    });
    const data = await res.json();
    if (data.ask) {
      askField.style.display = "flex";
      askInput.placeholder = data.ask;
      askInput.value = "";
    } else {
      output.textContent = data.result || "[No output returned]";
    }
  } catch (err) {
    output.textContent = `[ERROR] ${err.message}`;
  }
  resizeParent();
}

async function sendAnswer() {
  const ans = askInput.value;
  try {
    const res = await fetch("https://jargon-engine.onrender.com/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer: ans }),
    });
    const data = await res.json();
    if (data.ask) {
      askInput.placeholder = data.ask;
      askInput.value = "";
    } else {
      askField.style.display = "none";
      output.textContent = data.result || "[No output returned]";
    }
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
