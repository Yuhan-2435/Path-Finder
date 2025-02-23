from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for React to access Flask

# Store startLocation globally
start_location_data = {"startLocation": "Not set yet"}

@app.route("/")
def index():
    return "Welcome to the Flask app!"

@app.route('/api/data', methods=["GET", "POST"])
def handle_data():
    global start_location_data  # Allow modifying global variable
    
    if request.method == "POST":
        data = request.get_json()
        start_location = data.get("startLocation")

        if not start_location:
            return jsonify({"error": "No startLocation provided"}), 400

        start_location_data["startLocation"] = start_location  # Save the received data

        return jsonify({
            "message": "Start location received!",
            "status": "success",
            "startLocation": start_location
        }), 200

    elif request.method == "GET":
        data = {
            "message": "Hello, this is a simple API response!",
            "status": "success",
            "number": 42,
            "items": ["apple", "banana", "cherry"],
            "info": {"name": "Adlin", "age": 25, "city": "Kuala Lumpur"},
            "startLocation": start_location_data["startLocation"]
        }
        return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
