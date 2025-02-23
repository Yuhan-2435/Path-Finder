from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/")
def index():
    return "Welcome to the Flask app!"



@app.route('/api/data')
def get_data():
    data = {
        "message": "Hello, this is a simple API response!",
        "status": "success",
        "number": 42,
        "items": ["apple", "banana", "cherry"],
        "info": {"name": "Adlin", "age": 25, "city": "Kuala Lumpur"}
    }
    return data

if __name__ == '__main__':
    app.run(debug=True)
