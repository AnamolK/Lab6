import kuzu


def _normalize_value(value):
    """Convert values into JSON-safe primitives."""
    if value is None:
        return None
    if isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, dict):
        return {str(k): _normalize_value(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [_normalize_value(v) for v in value]
    return str(value)


def _get_label(node_attrs):
    label = node_attrs.get("_label") or node_attrs.get("_LABEL")
    if isinstance(label, list):
        return label[0] if label else "Node"
    return str(label) if label is not None else "Node"


def _get_node_id(node_key, node_attrs):
    for key in ("node_id", "id", "_id", "_ID"):
        if key in node_attrs and node_attrs[key] is not None:
            return str(node_attrs[key])
    return str(node_key)


def process_graph_data(result):
    """
    Transform a Kuzu query result into a JSON-serializable graph object
    suitable for the frontend D3 visualization.

    Output format:
    {
        "nodes": [
            {"id": "1", "labels": ["Movie"], "properties": {...}},
            ...
        ],
        "links": [
            {"source": "1", "target": "2", "type": "ACTED_IN"},
            ...
        ]
    }
    """
    graph = result.get_as_networkx(directed=True)

    nodes = []
    node_id_map = {}

    for node_key, node_attrs in graph.nodes(data=True):
        node_id = _get_node_id(node_key, node_attrs)
        label = _get_label(node_attrs)
        node_id_map[node_key] = node_id

        properties = {
            str(key): _normalize_value(value)
            for key, value in node_attrs.items()
            if not str(key).startswith("_")
        }

        nodes.append(
            {
                "id": node_id,
                "labels": [label],
                "properties": properties,
            }
        )

    links = []
    for source, target, edge_attrs in graph.edges(data=True):
        edge_type = edge_attrs.get("_label") or edge_attrs.get("_LABEL") or "RELATED_TO"
        links.append(
            {
                "source": node_id_map.get(source, str(source)),
                "target": node_id_map.get(target, str(target)),
                "type": str(edge_type),
            }
        )

    return {"nodes": nodes, "links": links}


def construct_query(year=None, operator='>', limit=100):
    """
    Build a parameterized movie query that returns matching Movie nodes and
    all of their connected nodes/relationships.
    """
    valid_operators = {">", "<", ">=", "<=", "=", "<>"}
    if operator not in valid_operators:
        raise ValueError(f"Invalid operator: {operator}")

    if year is None:
        year = 2000
    year = int(year)
    limit = max(1, int(limit))

    return f"""
    MATCH (m:Movie)
    WHERE m.year {operator} {year}
    OPTIONAL MATCH (m)-[r]-(n)
    RETURN DISTINCT m, r, n
    LIMIT {limit}
    """.strip()