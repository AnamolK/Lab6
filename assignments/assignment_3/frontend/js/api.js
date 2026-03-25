/**
 * API module for communication with the backend
 */
console.log("API module loaded");

const API = (function () {
  const BASE_URL = window.location.origin;

  /**
   * Fetch graph data from the backend based on filter parameters
   * @param {Object} params - Filter parameters
   * @param {number} params.year - Year to filter by
   * @param {string} params.operator - Comparison operator (>, <, =, etc.)
   * @param {number} params.limit - Maximum number of results
   * @returns {Promise<Object>} - Graph data with nodes and links
   */
  async function fetchGraphData(params = {}) {
    try {
      console.log("API: Fetching graph data with params:", params);

      const response = await fetch(`${BASE_URL}/api/graph`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log("API: Received graph data:", {
        nodes: data.nodes?.length || 0,
        links: data.links?.length || 0,
      });

      return data;
    } catch (error) {
      console.error("API: Error fetching graph data:", error);
      throw error;
    }
  }

  /**
   * Check if the API is available
   * @returns {Promise<boolean>} - True if API is available
   */
  async function checkAvailable() {
    try {
      const response = await fetch(`${BASE_URL}/api/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      console.error("API: Error checking availability:", error);
      return false;
    }
  }

  // Public API
  return {
    fetchGraphData,
    checkAvailable,
  };
})();
