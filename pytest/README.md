# pytest-multi-results-action

[![CI](https://github.com/gardenlinux/pytest-multi-results-action/actions/workflows/ci.yml/badge.svg)](https://github.com/gardenlinux/pytest-multi-results-action/actions/workflows/ci.yml)
[![Project Status: Active](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)

JavaScript GitHub Action that surfaces pytest JUnit XML results in the workflow summary. Built for multi-suite pipelines (e.g., chroot, QEMU, cloud), with configurable columns and focused details.

> Fork of the excellent [pytest-results-action](https://github.com/pmeier/pytest-results-action) by [@pmeier](https://github.com/pmeier), extended for multi-suite aggregation and metadata.

## Features

- Multi-suite aggregation across multiple XML files or patterns
- Compact summary and per-suite results table with configurable result columns
- Optional details section focused on selected result types (e.g., failed, error)
- Metadata support via pytest-metadata and filename fallback

## Quick start

Ensure pytest emits JUnit XML, then point the action at the files:

```yaml
- name: Download test artifacts
  uses: actions/download-artifact@v4
  with:
    pattern: "*test*"
    path: test-artifacts
    merge-multiple: true

- name: Test Report
  if: always()
  uses: gardenlinux/pytest-multi-results-action@main
  with:
    files: |
      test-artifacts/**/results.xml
      test-artifacts/**/*.test.xml
    title: "Test Results"
    summary: true
    details: true
    result-types: "passed,skipped,failed,error"
    details-result-types: "failed,error"
    fail-on-empty: false
```

## Inputs

| Name                     | Description                                                                     | Required | Default                                       |
| ------------------------ | ------------------------------------------------------------------------------- | -------- | --------------------------------------------- |
| `files`                  | JUnit XML file patterns (file, dir, or glob). Multi-suite aggregation supported | Yes      | -                                             |
| `title`                  | Section title                                                                   | No       | `Test results`                                |
| `summary`                | Include top-level test summary                                                  | No       | `true`                                        |
| `result-types`           | CSV result categories shown in summary/table                                    | No       | `passed,skipped,xfailed,failed,xpassed,error` |
| `details`                | Show details section                                                            | No       | `true`                                        |
| `details-result-types`   | CSV result categories shown in details                                          | No       | `failed,error`                                |
| `metadata-fields`        | CSV metadata fields to show as columns (order preserved). Defaults to Suite     | No       | `""`                                          |
| `metadata-field-mapping` | JSON map of metadata field → display name                                       | No       | `{}`                                          |
| `fail-on-empty`          | Fail if no XML found                                                            | No       | `true`                                        |

Allowed result categories: `passed, skipped, xfailed, failed, xpassed, error`.

## Metadata via pytest-metadata

This action can display extra columns (e.g., Artifact, Type, Namespace) by reading metadata embedded in the JUnit XML. The simplest way to inject these is with the [`pytest-metadata` plugin](https://pypi.org/project/pytest-metadata/).

Install and emit metadata:

```bash
pip install pytest-metadata

pytest \
  --metadata Artifact Artifact1 \
  --metadata Type Type1 \
  --metadata Namespace Namespace1 \
  --junit-xml=results.xml
```

Then configure which fields to show in the table and optionally map display names:

```yaml
with:
  files: test-artifacts/**/*.xml
  metadata-fields: "Namespace,Type,Artifact"
  metadata-field-mapping: '{"Artifact": "Test Artifact", "Type": "Test Type", "Namespace": "Namespace"}'
```

Notes:

- The action reads `pytest-metadata` properties from the XML and makes them available as columns.
- If some fields are missing, it falls back to deriving basic info from filenames when possible.

## Examples

### Basic

```yaml
- name: Test Report
  if: always()
  uses: gardenlinux/pytest-multi-results-action@main
  with:
    files: test-artifacts/**/*.xml
    summary: true
    details: true
    result-types: "failed,error"
    details-result-types: "failed,error"
```

### With metadata columns

```yaml
- name: Test Report (with metadata)
  if: always()
  uses: gardenlinux/pytest-multi-results-action@main
  with:
    files: test-artifacts/**/*.xml
    title: "Test Results"
    summary: true
    details: true
    result-types: "passed,skipped,failed,error"
    details-result-types: "failed,error"
    metadata-fields: "Namespace,Type,Artifact"
    metadata-field-mapping: '{"Artifact": "Test Artifact", "Type": "Test Type", "Namespace": "Namespace"}'
    fail-on-empty: false
```

## Output

Posted to the workflow summary:

1. Test Summary — aggregated counts across suites (for selected `result-types`).
2. Test Results — per-suite table (metadata columns + Total + selected `result-types` + Duration). Failed/Error counts link to details.
3. Test Details — per-suite sections for selected `details-result-types` that have items. Each type capped to keep the report concise.

### Examples

- [Basic](test-output/report.md)
- [With metadata columns](test-output/report-metadata.md)

## Notes

- Keep summaries under GitHub's size limit (1 MB). Prefer showing only failed/error in details; upload full logs/artifacts as needed.
- If metadata is absent, the action falls back to extracting info from filenames.

## Development

```bash
npm run format
npm run test
npm run test-metadata
npm run build
```

## Credits

Forked from [pytest-results-action](https://github.com/pmeier/pytest-results-action) by [@pmeier](https://github.com/pmeier).
