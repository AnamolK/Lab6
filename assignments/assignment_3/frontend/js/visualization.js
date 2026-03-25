/**
 * Visualization module for rendering graph data with D3
 */
console.log("Visualization module loaded");

const Visualization = (function () {
  // Default options
  const defaultOptions = {
    showLabels: false,
    showRelationships: false,
    nodeSize: "small",
  };

  // Visualization state
  let svg = null;
  let graphData = null;
  let visualOptions = { ...defaultOptions };
  let simulation = null;
  let dimensions = { width: 0, height: 0 };

  // Initialize visualization
  function init(containerSelector) {
    console.log("Visualization init called with", containerSelector);
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.error("Container not found:", containerSelector);
      return;
    }

    // Create SVG element if it doesn't exist
    if (!svg) {
      svg = d3
        .select(container)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

      // Add zoom behavior
      svg.call(
        d3
          .zoom()
          .scaleExtent([0.1, 10])
          .on("zoom", (event) => {
            const { transform } = event;
            svg.select("g").attr("transform", transform);
          })
      );
    }

    // Handle window resize
    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return svg;
  }

  // Update container dimensions
  function updateDimensions() {
    const container = document.querySelector("#visualization");
    if (container) {
      const rect = container.getBoundingClientRect();
      dimensions = { width: rect.width, height: rect.height };

      if (graphData) {
        render(graphData, visualOptions);
      }
    }
  }

  // Render graph visualization
  function render(data, options = {}) {
    console.log("Visualization render called");

    if (!svg || !data || !data.nodes || !data.links) {
      console.error("Cannot render: missing svg or data");
      return;
    }

    // Store original data
    graphData = data;
    visualOptions = { ...defaultOptions, ...options };

    // Clear previous visualization
    svg.selectAll("*").remove();

    // Stop any existing simulation
    if (simulation) {
      simulation.stop();
    }

    try {
      // Create SVG groups
      const g = svg.append("g");

      // Create force simulation
      simulation = d3
        .forceSimulation(data.nodes)
        .force(
          "link",
          d3
            .forceLink(data.links)
            .id((d) => d.id)
            .distance(100)
        )
        .force("charge", d3.forceManyBody().strength(-300))
        .force(
          "center",
          d3.forceCenter(dimensions.width / 2, dimensions.height / 2)
        );

      // Create links
      const link = g
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 1);

      // Create nodes - all grey
      const node = g
        .append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("fill", "#888") // All nodes are grey
        .call(drag(simulation));

      // Update positions on tick
      simulation.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x || 0)
          .attr("y1", (d) => d.source.y || 0)
          .attr("x2", (d) => d.target.x || 0)
          .attr("y2", (d) => d.target.y || 0);

        node.attr("cx", (d) => d.x || 0).attr("cy", (d) => d.y || 0);
      });

      console.log("Visualization rendered successfully");
    } catch (error) {
      console.error("Error rendering visualization:", error);
    }
  }

  // Drag handler for nodes
  function drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  // Clear visualization
  function clear() {
    if (svg) {
      svg.selectAll("*").remove();
    }

    if (simulation) {
      simulation.stop();
    }
  }

  // Return public API
  return {
    init,
    render,
    clear,
    updateDimensions,
  };
})();
