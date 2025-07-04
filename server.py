from flask import Flask, request, jsonify
from StructuredJargonInterpreter import StructuredJargonInterpreter
from AskException import AskException

app = Flask(__name__)
interpreter = StructuredJargonInterpreter()

@app.route("/run", methods=["POST"])
def run():
    data = request.get_json()
    code = data.get("code", "")
    memory = data.get("memory", {})

    try:
        result = interpreter.run(code, memory)
        return jsonify({
            "result": result["output"],
            "memory": result["memory"]
        })
    except AskException as ask:
        return jsonify({
            "ask": ask.prompt,
            "ask_var": ask.variable,
            "result": interpreter.output_log,
            "memory": interpreter.memory
        })

@app.route("/resume", methods=["POST"])
def resume():
    data = request.get_json()
    code = data.get("code", "")
    memory = data.get("memory", {})

    interpreter.code = code
    interpreter.memory = memory

    try:
        result = interpreter.resume_loop()
        return jsonify({
            "result": result["output"],
            "memory": result["memory"]
        })
    except AskException as ask:
        return jsonify({
            "ask": ask.prompt,
            "ask_var": ask.variable,
            "result": interpreter.output_log,
            "memory": interpreter.memory
        })

if __name__ == "__main__":
    app.run(debug=True)
