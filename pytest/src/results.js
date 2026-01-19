const fs = require("fs").promises;

const gha = require("@actions/core");

const { zip, prettyDuration } = require("./utils");

module.exports = { postResults };

// FIXME: refactor
const resultTypes = [
  "passed",
  "skipped",
  "xfailed",
  "failed",
  "xpassed",
  "error",
];
const typeToEmoji = {
  passed: "🟢",
  skipped: "🟡",
  xfailed: "🟡",
  failed: "🔴",
  xpassed: "🔴",
  error: "🔴",
};

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function postResults(
  xmls,
  title,
  summary,
  metadataFields,
  metadataFieldMapping,
  resultTypesInput,
  details,
  detailsResultTypesInput,
) {
  const results = await extractResults(xmls);
  if (results.total_tests == 0) {
    return;
  }

  // Parse result types input or use defaults
  let selectedResultTypes = (resultTypesInput || "")
    .split(",")
    .map((t) => t.trim())
    .filter((t) => !!t);
  const allowed = new Set(resultTypes);
  selectedResultTypes = selectedResultTypes.filter((t) => allowed.has(t));
  if (!selectedResultTypes.length) {
    selectedResultTypes = [...resultTypes];
  }

  addResults(
    results,
    title,
    summary,
    metadataFields,
    metadataFieldMapping,
    selectedResultTypes,
    details,
    detailsResultTypesInput,
  );
  await gha.summary.write();
}

async function extractResults(xmls) {
  const multiSuiteResults = {
    suites: {},
    aggregated: {
      total_time: 0.0,
      total_tests: 0,
      passed: [],
      failed: [],
      skipped: [],
      xfailed: [],
      xpassed: [],
      error: [],
    },
  };

  for await (const xml of xmls) {
    const metadata = xml._metadata || {};
    const filePath = xml._filePath || "unknown";

    // Create a meaningful suite identifier
    // Use filename as suite name (ending in *.xml)
    const fileName = filePath.split("/").pop() || "unknown";
    const suiteName = fileName;

    // Initialize suite if not exists
    if (!multiSuiteResults.suites[suiteName]) {
      multiSuiteResults.suites[suiteName] = {
        name: suiteName,
        filePath: filePath,
        total_time: 0.0,
        total_tests: 0,
        passed: [],
        failed: [],
        skipped: [],
        xfailed: [],
        xpassed: [],
        error: [],
        metadata: xml._metadata || {},
      };
    }

    // Check if testsuites exists and has testsuite
    if (!xml.testsuites || !xml.testsuites.testsuite) {
      console.warn(
        `Skipping file ${filePath}: Invalid XML structure - missing testsuites or testsuite`,
      );
      continue;
    }

    var testSuites = xml.testsuites.testsuite;
    testSuites = testSuites instanceof Array ? testSuites : [testSuites];

    for (var testSuite of testSuites) {
      const suiteTime = parseFloat(testSuite["@_time"]);
      multiSuiteResults.suites[suiteName].total_time += suiteTime;
      multiSuiteResults.aggregated.total_time += suiteTime;

      var testCases = testSuite.testcase;
      if (!testCases) {
        continue;
      }
      testCases = testCases instanceof Array ? testCases : [testCases];

      for (const result of testCases) {
        var resultTypeArray;
        var aggregatedResultTypeArray;
        var msg;

        if (Object.hasOwn(result, "failure")) {
          var msg = result.failure["#text"];
          const parts = msg.split("[XPASS(strict)] ");
          if (parts.length == 2) {
            resultTypeArray = multiSuiteResults.suites[suiteName].xpassed;
            aggregatedResultTypeArray = multiSuiteResults.aggregated.xpassed;
            msg = parts[1];
          } else {
            resultTypeArray = multiSuiteResults.suites[suiteName].failed;
            aggregatedResultTypeArray = multiSuiteResults.aggregated.failed;
          }
        } else if (Object.hasOwn(result, "skipped")) {
          if (result.skipped["@_type"] == "pytest.xfail") {
            resultTypeArray = multiSuiteResults.suites[suiteName].xfailed;
            aggregatedResultTypeArray = multiSuiteResults.aggregated.xfailed;
          } else {
            resultTypeArray = multiSuiteResults.suites[suiteName].skipped;
            aggregatedResultTypeArray = multiSuiteResults.aggregated.skipped;
          }
          msg = result.skipped["@_message"];
        } else if (Object.hasOwn(result, "error")) {
          resultTypeArray = multiSuiteResults.suites[suiteName].error;
          aggregatedResultTypeArray = multiSuiteResults.aggregated.error;
          msg = result.error["#text"];
        } else {
          resultTypeArray = multiSuiteResults.suites[suiteName].passed;
          aggregatedResultTypeArray = multiSuiteResults.aggregated.passed;
          msg = undefined;
        }

        const testResult = {
          id: result["@_classname"] + "." + result["@_name"],
          msg: msg,
          suite: suiteName,
        };

        resultTypeArray.push(testResult);
        aggregatedResultTypeArray.push(testResult);

        multiSuiteResults.suites[suiteName].total_tests += 1;
        multiSuiteResults.aggregated.total_tests += 1;
      }
    }
  }

  // Add metadata parsing errors for suites that couldn't parse metadata
  for (const [suiteName, suiteResults] of Object.entries(
    multiSuiteResults.suites,
  )) {
    if (
      suiteResults.metadata &&
      suiteResults.metadata._metadata_parsing_error
    ) {
      // Add a metadata parsing error
      const metadataError = {
        id: "ParsingError.metadata-parsing-error",
        msg: "Metadata could not be parsed from XML file",
      };
      suiteResults.error.push(metadataError);
      multiSuiteResults.aggregated.error.push(metadataError);
      suiteResults.total_tests += 1;
      multiSuiteResults.aggregated.total_tests += 1;
    }
  }

  // Always return the full multiSuiteResults to preserve suites and metadata
  return multiSuiteResults;
}

async function addResults(
  results,
  title,
  summary,
  metadataFields,
  metadataFieldMapping,
  selectedResultTypes,
  details,
  detailsResultTypesInput,
) {
  gha.summary.addHeading(title);

  // Check if we have suite results (single or multi-suite)
  if (results.suites && Object.keys(results.suites).length > 0) {
    addMultiSuiteResults(
      results,
      summary,
      metadataFields,
      metadataFieldMapping,
      selectedResultTypes,
      details,
      detailsResultTypesInput,
    );
  } else {
    // No suites found, use aggregated results (backward compatibility)
    const singleResults = results.aggregated || results;
    addSingleSuiteResults(singleResults, summary, selectedResultTypes);
  }
}

function addMultiSuiteResults(
  results,
  summary,
  metadataFields,
  metadataFieldMapping,
  selectedResultTypes,
  details,
  detailsResultTypesInput,
) {
  if (summary) {
    // Test summary section
    gha.summary.addHeading("Test Summary", 2);
    addOverallSummary(results.aggregated, selectedResultTypes);

    // Test results (per-suite table) section
    gha.summary.addHeading("Test Results", 2);
    // parse details-result-types input (default failed,error)
    let detailedResultTypesForLinks = (
      detailsResultTypesInput || "failed,error"
    )
      .split(",")
      .map((t) => t.trim())
      .filter((t) => !!t);
    const allowedForLinks = new Set(resultTypes);
    detailedResultTypesForLinks = detailedResultTypesForLinks.filter((t) =>
      allowedForLinks.has(t),
    );
    if (!detailedResultTypesForLinks.length) {
      detailedResultTypesForLinks = ["failed", "error"];
    }

    addSuiteTable(
      results.suites,
      metadataFields,
      metadataFieldMapping,
      selectedResultTypes,
      detailedResultTypesForLinks,
    );
  }

  // Add errors/failures result details for each suite (only if any exist)
  const detailsEnabled = details !== false; // default true

  // parse details-result-types input (default failed,error)
  let detailedResultTypes = (detailsResultTypesInput || "failed,error")
    .split(",")
    .map((t) => t.trim())
    .filter((t) => !!t);
  const allowed = new Set(resultTypes);
  detailedResultTypes = detailedResultTypes.filter((t) => allowed.has(t));
  if (!detailedResultTypes.length) {
    detailedResultTypes = ["failed", "error"];
  }

  const hasAnyIssues = Object.values(results.suites).some((suiteResults) =>
    hasRelevantResults(suiteResults, detailedResultTypes),
  );
  if (detailsEnabled && hasAnyIssues) {
    gha.summary.addHeading("Test Details", 2);
    for (const [suiteName, suiteResults] of Object.entries(results.suites)) {
      if (hasRelevantResults(suiteResults, detailedResultTypes)) {
        const suiteSlug = slugify(suiteName);
        gha.summary.addRaw(`<a id="suite-${suiteSlug}"></a>`, true);
        gha.summary.addRaw("\n\n---\n\n", true);
        gha.summary.addHeading(`${suiteName} Details`, 3);
        addSuiteDetails(suiteName, suiteResults, detailedResultTypes);
      }
    }
  }
}

function addSingleSuiteResults(results, summary, selectedResultTypes) {
  if (summary) {
    addSummary(results, selectedResultTypes);
  }

  for (resultType of selectedResultTypes) {
    const results_for_type = results[resultType];
    if (!results_for_type.length) {
      continue;
    }

    gha.summary.addHeading(resultType, 2);

    for (const result of results_for_type) {
      if (result.msg) {
        addDetailsWithCodeBlock(
          gha.summary,
          gha.summary.wrap("code", result.id),
          result.msg,
        );
      } else {
        gha.summary.addDetails(
          gha.summary.wrap("code", result.id),
          "\n\n:heavy_check_mark: Passed",
        );
      }
    }
  }
}

function addOverallSummary(results, selectedResultTypes) {
  gha.summary.addRaw(
    `Ran ${results.total_tests} tests in ${prettyDuration(results.total_time)}`,
    true,
  );

  var rows = [["Result", "Amount"]];
  for (const resultType of selectedResultTypes) {
    const emoji = typeToEmoji[resultType];
    const abs_amount = results[resultType].length;
    const rel_amount = abs_amount / results.total_tests;
    rows.push([
      `${emoji} ${resultType}`,
      `${abs_amount} (${(rel_amount * 100).toFixed(1)}%)`,
    ]);
  }
  gha.summary.addTable(rows);
}

function addSuiteTable(
  suites,
  metadataFields,
  metadataFieldMapping,
  selectedResultTypes,
  detailedResultTypesForLinks,
) {
  // Parse metadata field mapping
  const fieldMapping = metadataFieldMapping
    ? JSON.parse(metadataFieldMapping)
    : {};

  // Use Suite as fallback if no metadata fields provided, otherwise use the order from metadata-fields input
  const fieldsToShow = metadataFields
    ? metadataFields.split(",").map((f) => f.trim())
    : ["Suite"];

  // Build header row using the order of fields as provided
  const headerRow = [];

  // Determine columns strictly from selected result types

  // Add metadata columns in the order they were provided
  fieldsToShow.forEach((field) => {
    const displayName =
      fieldMapping[field] ||
      field.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
    headerRow.push(displayName);
  });

  // Add test statistics columns with emojis
  headerRow.push("Total");
  for (const t of selectedResultTypes) {
    const emoji = typeToEmoji[t];
    const label = `${emoji} ${t.charAt(0).toUpperCase()}${t.slice(1)}`;
    headerRow.push(label);
  }
  headerRow.push("Duration");

  const suiteRows = [headerRow];

  for (const [suiteName, suiteResults] of Object.entries(suites)) {
    const row = [];
    const suiteSlug = slugify(suiteName);

    // Check if this row has errors or failures
    const hasErrors = suiteResults.error && suiteResults.error.length > 0;
    const hasFailures = suiteResults.failed && suiteResults.failed.length > 0;
    const hasIssues = hasErrors || hasFailures;

    // Add metadata values in the order they were provided (no links)
    fieldsToShow.forEach((field, index) => {
      const metadata = suiteResults.metadata || {};
      let text;

      // For Suite field, use the suite name as fallback
      if (field === "Suite") {
        text = metadata[field] || suiteName;
      } else {
        text = metadata[field];
        // If the field doesn't exist, is empty, or is invalid and this is the first column, use the suite name as fallback
        if (
          (!text ||
            text === "-" ||
            text === "" ||
            text === null ||
            text === undefined) &&
          index === 0
        ) {
          text = suiteName;
        } else {
          text = text || "-";
        }
      }

      // Add emoji indicator to the first column for rows with issues
      if (index === 0) {
        const indicator = hasIssues ? "🔴 " : "🟢 ";
        row.push(indicator + text);
      } else {
        row.push(text);
      }
    });

    // Add test statistics - ensure all values are properly formatted
    const totalStr = String(suiteResults.total_tests || 0);
    const countsByType = {
      passed: String(suiteResults.passed.length || 0),
      skipped: String(suiteResults.skipped.length || 0),
      xfailed: String(suiteResults.xfailed.length || 0),
      failed: String(suiteResults.failed.length || 0),
      xpassed: String(suiteResults.xpassed.length || 0),
      error: String(suiteResults.error.length || 0),
    };
    const durationStr = prettyDuration(suiteResults.total_time);

    // Total column (no link)
    row.push(totalStr);
    for (const t of selectedResultTypes) {
      const text = countsByType[t];
      const count = parseInt(text) || 0;
      // Only link if count > 0 and type is in detailed result types
      if (count > 0 && detailedResultTypesForLinks.includes(t)) {
        row.push(`<a href="#suite-${suiteSlug}-${t}">${text}</a>`);
      } else {
        row.push(text);
      }
    }
    row.push(durationStr);

    suiteRows.push(row);
  }

  gha.summary.addTable(suiteRows);
}

function addSuiteDetails(suiteName, suiteResults, detailedResultTypes) {
  for (resultType of detailedResultTypes) {
    const results_for_type = suiteResults[resultType];
    if (!results_for_type.length) {
      continue;
    }

    const suiteSlug = slugify(suiteName);
    gha.summary.addRaw(`<a id="suite-${suiteSlug}-${resultType}"></a>`, true);
    gha.summary.addHeading(resultType, 4);

    // Limit to 10 results and show overflow message if needed
    const maxResults = 10;
    const resultsToShow = results_for_type.slice(0, maxResults);
    const hasMore = results_for_type.length > maxResults;

    for (const result of resultsToShow) {
      if (result.msg) {
        addDetailsWithCodeBlock(
          gha.summary,
          gha.summary.wrap("code", result.id),
          result.msg,
        );
      } else {
        gha.summary.addDetails(
          gha.summary.wrap("code", result.id),
          "\n\n:heavy_check_mark: Passed",
        );
      }
    }

    // Show overflow message if there are more results
    if (hasMore) {
      const remainingCount = results_for_type.length - maxResults;
      gha.summary.addRaw(
        `\n\n> **Note:** ${remainingCount} more ${resultType} result(s) not shown. See full report in artifacts for complete details.`,
        true,
      );
    }
  }
}

function hasRelevantResults(suiteResults, detailedResultTypes) {
  return detailedResultTypes.some(
    (type) => suiteResults[type] && suiteResults[type].length > 0,
  );
}

function addSummary(results, selectedResultTypes) {
  gha.summary.addRaw(
    `Ran ${results.total_tests} tests in ${prettyDuration(results.total_time)}`,
    true,
  );

  var rows = [["Result", "Amount"]];
  for (const resultType of selectedResultTypes) {
    const emoji = typeToEmoji[resultType];
    const abs_amount = results[resultType].length;
    const rel_amount = results.total_tests
      ? abs_amount / results.total_tests
      : 0;
    rows.push([
      `${emoji} ${resultType}`,
      `${abs_amount} (${(rel_amount * 100).toFixed(1)}%)`,
    ]);
  }
  gha.summary.addTable(rows);
}

function addDetailsWithCodeBlock(summary, label, code) {
  return summary.addDetails(
    label,
    "\n\n" + summary.wrap("pre", summary.wrap("code", code)),
  );
}
