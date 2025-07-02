const textarea = document.getElementById("inputCode");
const output = document.getElementById("output");

async function sendCode() {
  const code = textarea.value;
  const response = await fetch("https://jargon-engine.onrender.com/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  });

  const data = await response.json();

  if (data.ask) {
    const answer = prompt(data.ask.question);
    if (answer !== null) {
      const newLine = `SET ${data.ask.var} ("${answer}")`;
      const updatedCode = insertAfterAsk(code, newLine);
      textarea.value = updatedCode;
      sendCode();
    }
  } else {
    output.textContent = data.output || "[No output returned]";
  }
}

function insertAfterAsk(code, insertion) {
  const lines = code.split("\n");
  let idx = lines.findIndex(line => line.trim().startsWith("ASK"));
  if (idx >= 0) {
    lines.splice(idx + 1, 0, insertion);
  }
  return lines.join("\n");
}
