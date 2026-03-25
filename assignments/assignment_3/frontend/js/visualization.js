/**
 * Visualization module for rendering graph data with D3
 */
console.log("Visualization module loaded");

const Visualization = (function () {
    // Default options
    const defaultOptions = {
        showLabels: true,
        showRelationships: true,
        nodeSize: "small",
    };
    const nodeColorScale = d3.scaleOrdinal(d3.schemeObservable10);
    const linkColorScale = d3.scaleOrdinal(d3.schemeAccent);
    
    // Visualization state
    let svg = null;
    let graphData = null;
    let visualOptions = { ...defaultOptions };
    let simulation = null;
    let dimensions = { width: 0, height: 0 };
    const nodeRadiusScale = d3
        .scaleOrdinal()
        .domain(["small", "medium", "large"])
        .range([5, 7, 10])
        .unknown(5);

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
                    }),
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

    function getLinkTypes(links) {
        return [...new Set(links.map((d) => d.type).filter(Boolean))];
    }

    function getNodeLabels(nodes) {
        return [...new Set(nodes.map((d) => d.labels?.[0]).filter(Boolean))];
    }

    function appendLegendSection(legend, titleText, items, colorScale) {
        const title = document.createElement("div");
        title.className = "legend-title";
        title.textContent = titleText;
        legend.appendChild(title);

        items.forEach((itemLabel) => {
            const item = document.createElement("div");
            item.className = "legend-item";
            item.innerHTML = `<span class="legend-color" style="background:${colorScale(itemLabel)}"></span><span></span>`;
            item.lastChild.textContent = itemLabel;
            legend.appendChild(item);
        });
    }

    function syncLegend(nodeLabels, linkTypes) {
        const container = document.querySelector("#visualization");
        if (!container) return;

        container.querySelector(".graph-legend")?.remove();
        if (
            (!visualOptions.showLabels || !nodeLabels.length) &&
            (!visualOptions.showRelationships || !linkTypes.length)
        ) {
            return;
        }

        const legend = document.createElement("div");
        legend.className = "graph-legend";

        if (visualOptions.showLabels && nodeLabels.length) {
            appendLegendSection(legend, "Nodes", nodeLabels, nodeColorScale);
        }

        if (visualOptions.showRelationships && linkTypes.length) {
            appendLegendSection(legend, "Links", linkTypes, linkColorScale);
        }

        container.appendChild(legend);
    }

    // Render graph visualization
    function render(data, options = {}) {
        console.log("Visualization render called");

        if (!svg || !data || !data.nodes || !data.links) {
            console.error("Cannot render: missing svg or data");
            return;
        }
        console.log("Data received for rendering:", data);
        console.log("Options received for rendering:", options);

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
            const nodeRadius = nodeRadiusScale(visualOptions.nodeSize);
            const nodeLabels = getNodeLabels(data.nodes);
            const linkTypes = getLinkTypes(data.links);
            nodeColorScale.domain(nodeLabels);
            linkColorScale.domain(linkTypes);
            syncLegend(nodeLabels, linkTypes);

            // Create force simulation
            simulation = d3
                .forceSimulation(data.nodes)
                .force(
                    "link",
                    d3
                        .forceLink(data.links)
                        .id((d) => d.id)
                        .distance(100),
                )
                .force("charge", d3.forceManyBody().strength(-300))
                .force(
                    "center",
                    d3.forceCenter(dimensions.width / 2, dimensions.height / 2),
                );

            // Create links
            const link = g
                .append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(data.links)
                .enter()
                .append("line")
                .attr("stroke", (d) =>
                    visualOptions.showRelationships
                        ? linkColorScale(d.type || "Other")
                        : "#94a3b8",
                )
                .attr("stroke-opacity", 0.8)
                .attr("stroke-width", 2);

            console.log("Links created:", link.size());
            // Create nodes - all grey
            const node = g
                .append("g")
                .attr("class", "nodes")
                .selectAll("circle")
                .data(data.nodes)
                .enter()
                .append("circle")
                .attr("r", nodeRadius)
                .attr("fill", (d) =>
                    visualOptions.showLabels
                        ? nodeColorScale(d.labels?.[0] || "Other")
                        : "#888",
                )
                .call(drag(simulation));

            // Update positions on tick
            simulation.on("tick", () => {
                link.attr("x1", (d) => d.source.x || 0)
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
        document.querySelector("#visualization .graph-legend")?.remove();

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
