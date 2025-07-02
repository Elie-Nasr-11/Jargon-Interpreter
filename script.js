function sendCode() {
  const code = document.getElementById("inputCode").value;
  const output = document.getElementById("output");
  const askField = document.getElementById("askField");
  const askInput = document.getElementById("askInput");

  output.textContent = "";
  askField.style.display = "none";

  fetch("https://jargon-engine.onrender.com/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: code })
  })
  .then(res => res.json())
  .then(data => {
    if (data.ask) {
      askField.style.display = "flex";
      askInput.value = "";
      askInput.placeholder = data.ask;
      askInput.focus();
    } else {
      output.textContent = data.result || "[No output returned]";
    }
  })
  .catch(err => {
    output.textContent = `[ERROR] ${err.message}`;
  });
}

function sendAnswer() {
  const answer = document.getElementById("askInput").value;
  const output = document.getElementById("output");

  fetch("https://jargon-engine.onrender.com/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer: answer })
  })
  .then(res => res.json())
  .then(data => {
    if (data.ask) {
      document.getElementById("askInput").placeholder = data.ask;
      document.getElementById("askInput").value = "";
    } else {
      document.getElementById("askField").style.display = "none";
      output.textContent = data.result || "[No output returned]";
    }
  })
  .catch(err => {
    output.textContent = `[ERROR] ${err.message}`;
  });
}

function copyInput() {
  navigator.clipboard.writeText(document.getElementById("inputCode").value)
    .then(() => alert("Input copied to clipboard!"));
}

function copyOutput() {
  navigator.clipboard.writeText(document.getElementById("output").textContent)
    .then(() => alert("Output copied to clipboard!"));
}
