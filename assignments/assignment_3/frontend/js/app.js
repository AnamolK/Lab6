/**
 * Main application entrypoint
 */
console.log("App module loaded");

(function () {
  // Store current graph data
  let currentGraphData = { nodes: [], links: [] };
  let isLoading = false;
  let errorMessage = null;

  // Initialize application
  function init() {
    console.log("App init called");

    try {
      // Check if required modules are loaded
      if (typeof Visualization === "undefined") {
        console.error("ERROR: Visualization module is undefined");
        showError("Visualization module failed to load");
        return;
      }

      if (typeof ConfigPanel === "undefined") {
        console.error("ERROR: ConfigPanel module is undefined");
        showError("ConfigPanel module failed to load");
        return;
      }

      if (typeof API === "undefined") {
        console.error("ERROR: API module is undefined");
        showError("API module failed to load");
        return;
      }

      try {
        console.log("Initializing visualization module");
        Visualization.init("#visualization");
        console.log("Visualization initialized");
      } catch (error) {
        console.error("Failed to initialize visualization:", error);
        showError("Visualization initialization failed: " + error.message);
        return;
      }

      try {
        console.log("Initializing config panel module");
        ConfigPanel.init(handleSettingsChange);
        console.log("Config panel initialized");
      } catch (error) {
        console.error("Failed to initialize config panel:", error);
        showError("Config panel initialization failed: " + error.message);
        return;
      }

      // Check API availability and fetch initial data
      API.checkAvailable()
        .then((available) => {
          if (!available) {
            console.warn("Backend API not available");
            const warningElem = document.getElementById("apiWarning");
            if (warningElem) {
              warningElem.textContent =
                "Backend API not available. Please check your server connection.";
              warningElem.style.display = "block";
            }
            return;
          }

          console.log("Backend API is available");

          // Get initial settings from the config panel
          const settings = ConfigPanel.getSettings();

          // Load initial data
          showLoading(true);
          API.fetchGraphData({
            year: settings.year,
            operator: settings.operator,
            limit: settings.limit,
          })
            .then((data) => {
              currentGraphData = data;
              console.log("Initial data loaded:", {
                nodeCount: data.nodes.length,
                linkCount: data.links.length,
              });

              // Render the visualization
              Visualization.render(currentGraphData, settings.visualOptions);
            })
            .catch((error) => {
              console.error("Failed to load initial data:", error);
              showError("Failed to load initial data: " + error.message);
            })
            .finally(() => {
              showLoading(false);
            });
        })
        .catch((error) => {
          console.warn("Failed to check API availability:", error);
          showError("Cannot connect to backend: " + error.message);
        });

      console.log("App initialization complete");
    } catch (error) {
      console.error("Error initializing app:", error);
      showError("Application initialization failed: " + error.message);
    }
  }

  // Handle settings change from config panel
  async function handleSettingsChange(newSettings) {
    console.log("Settings changed:", newSettings);
    showLoading(true);
    clearError();

    try {
      // Use the API module to fetch data
      const params = {
        year: newSettings.year,
        operator: newSettings.operator,
        limit: newSettings.limit,
      };

      console.log("Fetching data with params:", params);

      const data = await API.fetchGraphData(params);

      // Update current graph data
      currentGraphData = data;

      console.log("Data fetched successfully:", {
        nodeCount: data.nodes.length,
        linkCount: data.links.length,
      });

      // Render with the updated data
      Visualization.render(currentGraphData, newSettings.visualOptions);
    } catch (error) {
      console.error("Error fetching data:", error);
      showError("Failed to fetch data: " + error.message);
    } finally {
      showLoading(false);
    }
  }

  // Show/hide loading overlay
  function showLoading(show) {
    isLoading = show;
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) {
      loadingOverlay.style.display = show ? "flex" : "none";
    }
  }

  // Show error message
  function showError(message) {
    errorMessage = message;
    const errorElement = document.getElementById("errorMessage");
    if (errorElement) {
      errorElement.textContent = `Error: ${message}`;
      errorElement.style.display = "block";
    }
  }

  // Clear error message
  function clearError() {
    errorMessage = null;
    const errorElement = document.getElementById("errorMessage");
    if (errorElement) {
      errorElement.style.display = "none";
    }

    // Also clear any API warnings
    const warningElem = document.getElementById("apiWarning");
    if (warningElem) {
      warningElem.style.display = "none";
    }
  }

  function validateGraphData(data) {
    console.log("Validating graph data...");

    if (!data || !data.nodes || !data.links) {
      console.error("Invalid data structure: missing nodes or links");
      return false;
    }

    if (data.nodes.length === 0) {
      console.warn("No nodes in graph data");
      // This might be valid for empty results, not necessarily an error
      return true;
    }

    console.log(
      `Graph data has ${data.nodes.length} nodes and ${data.links.length} links`
    );
    return true;
  }

  // Initialize on DOM load
  document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM loaded, initializing app");
    try {
      init();
    } catch (error) {
      console.error("Failed to initialize app:", error);
      showError("App initialization failed");
    }
  });
})();
