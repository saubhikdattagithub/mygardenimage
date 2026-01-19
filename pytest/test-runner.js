#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Mock GitHub Actions core module
const mockSummary = {
  content: "",
  addHeading: (text, level = 1) => {
    mockSummary.content += `${"#".repeat(level)} ${text}\n\n`;
  },
  addTable: (rows) => {
    if (rows.length === 0) return;
    const header = `| ${rows[0].join(" | ")} |`;
    const separator = `| ${rows[0].map(() => "---").join(" | ")} |`;
    const body = rows
      .slice(1)
      .map((row) => `| ${row.join(" | ")} |`)
      .join("\n");
    mockSummary.content += `${header}\n${separator}\n${body}\n\n`;
  },
  addDetails: (label, content) => {
    mockSummary.content += `<details>\n<summary>${label}</summary>\n\n${content}\n</details>\n\n`;
  },
  addRaw: (content, newline = false) => {
    mockSummary.content += content + (newline ? "\n" : "");
  },
  wrap: (tag, content) => `<${tag}>${content}</${tag}>`,
  write: (outputPath) => {
    console.log("=== GENERATED REPORT ===");
    console.log(mockSummary.content);
    console.log("=== END REPORT ===");

    // Only write to file if outputPath is provided
    if (outputPath) {
      fs.writeFileSync(outputPath, mockSummary.content);
      console.log(`Report written to ${outputPath}`);
    }
  },
};

// Mock @actions/core
const mockCore = {
  getInput: (name, options = {}) => {
    const envVar = `INPUT_${name.toUpperCase().replace(/-/g, "_")}`;
    const value = process.env[envVar];
    if (options.required && !value) {
      throw new Error(`Input required and not supplied: ${name}`);
    }
    return value || options.default || "";
  },
  getBooleanInput: (name, options = {}) => {
    const value = mockCore.getInput(name, options);
    return value === "true" || value === "1";
  },
  getMultilineInput: (name, options = {}) => {
    const value = mockCore.getInput(name, options);
    if (!value) return [];
    return value.split("\n").filter((line) => line.trim());
  },
  setFailed: (message) => {
    console.error(`❌ Action failed: ${message}`);
    process.exit(1);
  },
  debug: (message) => {
    console.log(`🐛 DEBUG: ${message}`);
  },
  info: (message) => {
    console.log(`ℹ️  INFO: ${message}`);
  },
  warning: (message) => {
    console.warn(`⚠️  WARNING: ${message}`);
  },
  error: (message) => {
    console.error(`❌ ERROR: ${message}`);
  },
  summary: mockSummary,
};

// Override require to mock @actions/core
const Module = require("module");
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id === "@actions/core") {
    return mockCore;
  }
  return originalRequire.apply(this, arguments);
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const inputs = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace("--", "");
    const value = args[i + 1];

    if (key === "files") {
      inputs.files = value.split(",").map((f) => f.trim());
    } else if (key === "summary") {
      inputs.summary = value === "true";
    } else if (key === "result-types") {
      inputs.resultTypes = value;
    } else if (key === "fail-on-empty") {
      inputs.failOnEmpty = value === "true";
    } else if (key === "title") {
      inputs.title = value;
    } else if (key === "metadata-fields") {
      inputs.metadataFields = value;
    } else if (key === "metadata-field-mapping") {
      inputs.metadataFieldMapping = value;
    } else if (key === "output") {
      inputs.output = value;
    }
  }

  return inputs;
}

// Main execution
async function main() {
  console.log("🧪 pytest-multi-results-action Local Test Runner");
  console.log("================================================");

  const inputs = parseArgs();
  console.log("Inputs:", JSON.stringify(inputs, null, 2));

  // Create test output directory
  if (!fs.existsSync("test-output")) {
    fs.mkdirSync("test-output");
  }

  try {
    // Import and run the main function
    const { main: runMain } = require("./src/main.js");
    await runMain(inputs);

    // Write report to specified output file
    const outputPath = inputs.output || "test-output/report.md";
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    mockSummary.write(outputPath);

    console.log("✅ Test completed successfully");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
