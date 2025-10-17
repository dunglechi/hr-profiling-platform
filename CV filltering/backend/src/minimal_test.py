from flask import Flask

app = Flask(__name__)

@app.route("/ping")
def ping():
    return "pong"

if __name__ == '__main__':
    print("Starting minimal Flask app...")
    app.run(host="127.0.0.1", port=5000, debug=False)