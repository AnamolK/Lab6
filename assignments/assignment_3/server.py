import os
import sys
from flask import Flask, request, jsonify, send_from_directory
from graph_viz import process_graph_data, construct_query

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from utils import setup_database

app = Flask(__name__, static_folder='frontend')

# Initialize KuzuDB
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
DB_PATH = os.path.join(ROOT_DIR, "tmp")

print(f"Using database path: {DB_PATH}")
conn = setup_database(DB_PATH, delete_existing=False)


@app.route('/')
def index():
    return send_from_directory('frontend', 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('frontend', path)


@app.route('/api/graph', methods=['POST'])
def get_graph_data():
    try:
        print("Received request data")

        payload = request.get_json(silent=True) or {}
        year = payload.get('year', 2000)
        operator = payload.get('operator', '>')
        limit = payload.get('limit', 100)

        query = construct_query(year=year, operator=operator, limit=limit)

        print(f"Executing query: {query}")
        result = conn.execute(query)

        graph_data = process_graph_data(result)

        print(
            f"Returning graph data with {len(graph_data['nodes'])} nodes and "
            f"{len(graph_data['links'])} links"
        )
        return jsonify(graph_data)
    except ValueError as e:
        print(f"Bad request: {e}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error processing graph data request: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/status', methods=['GET'])
def api_status():
    """
    Endpoint for checking API status and database connection.
    """
    try:
        result = conn.execute("MATCH (n) RETURN count(n) as count LIMIT 1")
        node_count = result.get_next()[0]

        return jsonify({
            "status": "ok",
            "database": "connected",
            "nodeCount": node_count
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True, use_reloader=False)