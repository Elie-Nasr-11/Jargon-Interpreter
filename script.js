
function runCode() {
  const code = document.getElementById("codeInput").value;
  fetch("https://jargon-engine.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ code: code })
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById("output").innerText = data.output;
  });
}
