const gha = require("@actions/core");

const { main } = require("./main");

async function entrypoint() {
  const inputs = getInputs();
  await main(inputs);
}

function getInputs() {
  const files = gha.getMultilineInput("files", { required: true });

  return {
    files: files,
    summary: gha.getBooleanInput("summary", {
      required: false,
    }),
    failOnEmpty: gha.getBooleanInput("fail-on-empty", {
      required: false,
    }),
    title: gha.getInput("title", { required: false }),
    metadataFields: gha.getInput("metadata-fields", { required: false }),
    metadataFieldMapping: gha.getInput("metadata-field-mapping", {
      required: false,
    }),
    resultTypes: gha.getInput("result-types", { required: false }),
    details: gha.getBooleanInput("details", { required: false }),
    detailsResultTypes: gha.getInput("details-result-types", {
      required: false,
    }),
  };
}

entrypoint();
