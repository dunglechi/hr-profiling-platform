#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/test')
def test():
    return jsonify({"message": "Flask is working", "status": "ok"})

if __name__ == '__main__':
    print("Starting minimal Flask test...")
    app.run(host='127.0.0.1', port=5001, debug=True)