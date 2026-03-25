# Graph Visualization Lab

VA-178: Visual Analytics for Graph Data
Instructor: Sjoerd Vink
Date: March 10, 2026

This lab consists of three progressive assignments designed to introduce you to graph databases and visualization. You'll work with a movie rating dataset to create, query, and visualize graph relationships using KuzuDB and D3.js. The ultimate goal of the lab is to build a full-fledged graph visualization system that you can showcase as part of your portfolio!

## Learning Outcomes

By completing this lab, you will:

- Understand the basics of graph database structure and querying
- Gain experience with Cypher, a graph query language
- Learn visualizations specifically designed for graph data
- Develop a full-stack application for visual graph analytics
- Apply basic machine learning techniques to graph data

## Prerequisites

Before starting the lab, ensure you have:

- Python 3.8 or higher installed
- Git installed
- Basic familiarity with Jupyter notebooks
- A text editor or IDE (Visual Studio Code recommended)
- Approximately 2GB of free disk space

## Setup Instructions

Before starting the assignments, set up your environment:

1. Create a Python virtual environment: python3.8 -m venv .venv
2. Activate the virtual environment:
   On Mac/Linux: source .venv/bin/activate
   On Windows: .venv\Scripts\activate
3. Install required dependencies: pip install -r requirements.txt

## Assignment Structure

### Assignment 1: Graph Database Fundamentals

Location: [assignment_1.ipynb](assignments/assignment_1.ipynb)

Assignment instructions are available in the notebook.

### Assignment 2: Interactive Graph Visualization

Location: [assignment_2.ipynb](assignments/assignment_2.ipynb)

Assignment instructions are available in the notebook.

### Assignment 3: Web-Based Graph Visualization

Location: [assignment_3](assignments/assignment_3/)

The grand finale! You'll build a complete web-based visual analytics system for graph data:

- A Flask backend serving graph data from KuzuDB
- Interactive D3.js visualization in the browser
- Configurable filters and visual settings
- Real-time graph updates based on query parameters

To run Assignment 3:

1. Ensure your virtual environment is activated
2. Run the server: python assignments/assignment_3/server.py
3. Open your browser and navigate to http://localhost:3000

For the assignment:

1. Finish the node-link visualization in [visualization.js](assignments/assignment_3/visualization.js)
2. Finish the parameterized query in [graph_viz.py](assignments/assignment_3/graph_viz.py)

## Troubleshooting

If you encounter issues:

1. Ensure your virtual environment is activated
2. Verify all dependencies are installed correctly
3. Check that the database paths are accessible
4. For Assignment 3, confirm the Flask server is running without errors

## How to submit

- Your queries from assignment_1.ipynb
- The parameterized query function from assignment_2.ipynb
- The complete source code for the Visual Analytics application for graphs
- Answers to the reflection questions (in PdF)
- Upload both files to Canvas
- Hooray you’re done!
# 178lab6
