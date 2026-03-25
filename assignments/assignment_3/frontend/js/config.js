/**
 * Configuration panel module
 */
console.log("Config module loaded");

const ConfigPanel = (function () {
  // Default settings
  let settings = {
    year: 2000,
    operator: ">",
    limit: 100,
    visualOptions: {
      showLabels: true,
      showRelationships: true,
      nodeSize: "medium",
    },
  };

  // Change callback
  let onSettingsChangeCallback = null;

  function cloneSettings() {
    return {
      year: settings.year,
      operator: settings.operator,
      limit: settings.limit,
      visualOptions: {
        showLabels: settings.visualOptions.showLabels,
        showRelationships: settings.visualOptions.showRelationships,
        nodeSize: settings.visualOptions.nodeSize,
      },
    };
  }

  // Initialize the config panel
  function init(onSettingsChange) {
    console.log("ConfigPanel init called");
    onSettingsChangeCallback = onSettingsChange;
    renderConfigPanel();
    attachEventListeners();
  }

  // Render the configuration panel
  function renderConfigPanel() {
    const configPanelElement = document.getElementById("configPanel");
    if (!configPanelElement) {
      console.error("Config panel element not found");
      return;
    }

    configPanelElement.innerHTML = `
      <h2 class="config-title">Configuration Panel</h2>

      <div class="config-section">
        <h3 class="section-title">Filter Movies by Year</h3>

        <div class="form-group">
          <label for="operator-select">Operator:</label>
          <select id="operator-select" class="select-input">
            <option value=">" ${
              settings.operator === ">" ? "selected" : ""
            }>Greater than (&gt;)</option>
            <option value="<" ${
              settings.operator === "<" ? "selected" : ""
            }>Less than (&lt;)</option>
            <option value=">=" ${
              settings.operator === ">=" ? "selected" : ""
            }>Greater than or equal to (&ge;)</option>
            <option value="<=" ${
              settings.operator === "<=" ? "selected" : ""
            }>Less than or equal to (&le;)</option>
            <option value="=" ${
              settings.operator === "=" ? "selected" : ""
            }>Equal to (=)</option>
            <option value="<>" ${
              settings.operator === "<>" ? "selected" : ""
            }>Not equal to (&ne;)</option>
          </select>
        </div>

        <div class="form-group">
          <label for="year-slider">Year: <span id="year-value">${
            settings.year
          }</span></label>
          <div class="slider-container">
            <input
              type="range"
              id="year-slider"
              min="1900"
              max="2025"
              step="1"
              value="${settings.year}"
              class="slider-input"
            />
            <div class="slider-value">${settings.year}</div>
          </div>
        </div>

        <div class="form-group">
          <label for="limit-input">Result Limit:</label>
          <input
            type="number"
            id="limit-input"
            min="1"
            max="1000"
            value="${settings.limit}"
            class="number-input"
          />
          <div class="input-help-text">Maximum number of results to return</div>
        </div>
      </div>

      <div class="config-section">
        <h3 class="section-title">Visualization Options</h3>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              id="show-labels"
              ${settings.visualOptions.showLabels ? "checked" : ""}
            />
            Show node labels
          </label>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              id="show-relationships"
              ${settings.visualOptions.showRelationships ? "checked" : ""}
            />
            Show relationship types
          </label>
        </div>

        <div class="form-group">
          <label for="node-size">Node Size:</label>
          <select id="node-size" class="select-input">
            <option value="small" ${
              settings.visualOptions.nodeSize === "small" ? "selected" : ""
            }>Small</option>
            <option value="medium" ${
              settings.visualOptions.nodeSize === "medium" ? "selected" : ""
            }>Medium</option>
            <option value="large" ${
              settings.visualOptions.nodeSize === "large" ? "selected" : ""
            }>Large</option>
          </select>
        </div>
      </div>

      <button id="apply-settings" class="apply-button">Apply Settings</button>
    `;
  }

  function clampLimit(value) {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      return 1;
    }
    return Math.max(1, Math.min(1000, parsed));
  }

  function notifySettingsChange() {
    if (typeof onSettingsChangeCallback === "function") {
      onSettingsChangeCallback(cloneSettings());
    }
  }

  // Attach event listeners to form controls
  function attachEventListeners() {
    const yearSlider = document.getElementById("year-slider");
    const yearValue = document.getElementById("year-value");
    const sliderValue = document.querySelector(".slider-value");

    if (yearSlider) {
      yearSlider.addEventListener("input", function () {
        const value = parseInt(this.value, 10);
        settings.year = value;

        if (yearValue) {
          yearValue.textContent = value;
        }
        if (sliderValue) {
          sliderValue.textContent = value;
        }
      });
    }

    const operatorSelect = document.getElementById("operator-select");
    if (operatorSelect) {
      operatorSelect.addEventListener("change", function () {
        settings.operator = this.value;
      });
    }

    const limitInput = document.getElementById("limit-input");
    if (limitInput) {
      limitInput.addEventListener("change", function () {
        settings.limit = clampLimit(this.value);
        this.value = settings.limit;
      });

      limitInput.addEventListener("blur", function () {
        settings.limit = clampLimit(this.value);
        this.value = settings.limit;
      });
    }

    const showLabelsCheckbox = document.getElementById("show-labels");
    if (showLabelsCheckbox) {
      showLabelsCheckbox.addEventListener("change", function () {
        settings.visualOptions.showLabels = this.checked;
      });
    }

    const showRelationshipsCheckbox =
      document.getElementById("show-relationships");
    if (showRelationshipsCheckbox) {
      showRelationshipsCheckbox.addEventListener("change", function () {
        settings.visualOptions.showRelationships = this.checked;
      });
    }

    const nodeSizeSelect = document.getElementById("node-size");
    if (nodeSizeSelect) {
      nodeSizeSelect.addEventListener("change", function () {
        settings.visualOptions.nodeSize = this.value;
      });
    }

    const applyButton = document.getElementById("apply-settings");
    if (applyButton) {
      applyButton.addEventListener("click", function () {
        notifySettingsChange();
      });
    }
  }

  // Update settings externally
  function updateSettings(newSettings) {
    settings = {
      ...settings,
      ...newSettings,
      visualOptions: {
        ...settings.visualOptions,
        ...(newSettings.visualOptions || {}),
      },
    };
    renderConfigPanel();
    attachEventListeners();
  }

  // Get current settings
  function getSettings() {
    return cloneSettings();
  }

  // Return public API
  return {
    init,
    updateSettings,
    getSettings,
  };
})();
