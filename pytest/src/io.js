const fs = require("fs").promises;
const path = require("path");

const core = require("@actions/core");
const glob = require("@actions/glob");

const { XMLParser } = require("fast-xml-parser");

module.exports = { parseXmlFiles };

async function* collectXmlFiles(paths) {
  // Handle both single path (legacy) and multiple paths (new)
  const pathArray = Array.isArray(paths) ? paths : [paths];

  for (const path of pathArray) {
    if (!path) continue; // Skip empty paths

    const globber = await glob.create(path, {
      implicitDescendants: false,
    });
    const foundPaths = await globber.glob();

    for (const file_or_dir of foundPaths) {
      var stats;
      try {
        stats = await fs.stat(file_or_dir);
      } catch (error) {
        core.setFailed(`Action failed with error ${error}`);
      }
      if (stats.isFile()) {
        yield file_or_dir;
      } else {
        const globber = await glob.create(file_or_dir + "/**/*.xml", {
          implicitDescendants: false,
        });
        for await (const file of globber.glob()) {
          yield file;
        }
      }
    }
  }
}

async function* parseXmlFiles(paths) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    processEntities: false,
    attributeNamePrefix: "@_",
  });

  for await (const file of collectXmlFiles(paths)) {
    try {
      const xmlContent = await fs.readFile(file, "utf-8");

      // Handle empty files by creating a mock result
      if (!xmlContent.trim()) {
        console.warn(`Skipping empty file: ${file}`);
        const emptyFileResult = {
          testsuites: {
            testsuite: {
              "@_name": "empty-file",
              "@_tests": "0",
              "@_errors": "1",
              "@_failures": "0",
              "@_skipped": "0",
              "@_time": "0.0",
              testcase: {
                "@_name": "empty-file-error",
                "@_classname": "ParsingError",
                error: {
                  "#text": "Skipping empty file",
                },
              },
            },
          },
        };
        emptyFileResult._filePath = file;
        emptyFileResult._metadata = extractMetadata(emptyFileResult, file);
        yield emptyFileResult;
        continue;
      }

      const parsedXml = parser.parse(xmlContent);

      // Add file path to the parsed XML for later use
      parsedXml._filePath = file;
      parsedXml._metadata = extractMetadata(parsedXml, file);

      yield parsedXml;
    } catch (error) {
      console.error(`Error parsing XML file ${file}: ${error.message}`);
      // Continue processing other files instead of failing completely
      continue;
    }
  }
}

function extractMetadata(parsedXml, filepath) {
  const metadata = {};

  // Extract metadata from testsuite attributes if available
  if (parsedXml.testsuites && parsedXml.testsuites.testsuite) {
    const testsuite = parsedXml.testsuites.testsuite;

    // Extract pytest-metadata properties
    if (testsuite.properties && testsuite.properties.property) {
      const properties = Array.isArray(testsuite.properties.property)
        ? testsuite.properties.property
        : [testsuite.properties.property];

      properties.forEach((prop) => {
        const name = prop["@_name"];
        const value = prop["@_value"];
        if (name && value) {
          metadata[name] = value;
        }
      });
    }

    // Extract any other custom attributes
    Object.keys(testsuite).forEach((key) => {
      if (
        key.startsWith("@_") &&
        ![
          "@_name",
          "@_errors",
          "@_failures",
          "@_skipped",
          "@_tests",
          "@_time",
          "@_timestamp",
          "@_hostname",
        ].includes(key)
      ) {
        const fieldName = key.substring(2); // Remove @_ prefix
        metadata[fieldName] = testsuite[key];
      }
    });
  }

  // If no metadata was found, use filename as fallback
  if (Object.keys(metadata).length === 0) {
    const basename = path.basename(filepath);
    metadata["Suite"] = basename;
    // Mark this as a metadata parsing error
    metadata["_metadata_parsing_error"] = true;
  }

  return metadata;
}
