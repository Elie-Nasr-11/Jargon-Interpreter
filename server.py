
from flask import Flask, request, jsonify
from interpreter import StructuredJargonInterpreter

app = Flask(__name__)

@app.route("/run", methods=["POST"])
def run():
    data = request.get_json()
    code = data.get("code", "")
    interpreter = StructuredJargonInterpreter()
    interpreter.run(code)
    return jsonify({"output": interpreter.get_output()})

if __name__ == "__main__":
    app.run(debug=True)
