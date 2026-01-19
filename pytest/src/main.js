module.exports = { main };

const gha = require("@actions/core");
const { checkAsyncGeneratorEmpty } = require("./utils");
const { parseXmlFiles } = require("./io");
const { postResults } = require("./results");

async function main(inputs) {
  // Use files input
  const paths = inputs.files;

  var xmls = parseXmlFiles(paths);

  const { isEmpty, generator } = await checkAsyncGeneratorEmpty(xmls);
  if (isEmpty && inputs.failOnEmpty) {
    gha.setFailed(
      "No JUnit XML file was found. Set `fail-on-empty: false` if that is a valid use case",
    );
  }
  xmls = generator;

  await postResults(
    xmls,
    inputs.title,
    inputs.summary,
    inputs.metadataFields,
    inputs.metadataFieldMapping,
    inputs.resultTypes,
    inputs.details,
    inputs.detailsResultTypes,
  );
}
