#!/usr/bin/env bash
set -euo pipefail

: "${CODACY_PROJECT_TOKEN:?Set the repository secret CODACY_PROJECT_TOKEN}"
for report in coverage/frontend/lcov.info coverage/server/lcov.info; do
  test -s "$report" || { echo "Missing coverage report: $report" >&2; exit 1; }
done

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
helper="$work/get.sh"
curl --fail --show-error --silent --location \
  https://raw.githubusercontent.com/codacy/codacy-coverage-reporter/54617baa57421746d0afa3df32127d3dd40f3786/get.sh \
  --output "$helper"
printf 'f7fbb3417019d0f73f50426c78cbcd59ed0d57d3c43b25096d0f600ce579cf69  %s\n' "$helper" | shasum -a 256 --check

export CODACY_REPORTER_VERSION=14.1.3
export CODACY_REPORTER_TMP_FOLDER="$work/reporter"
bash "$helper" report --partial -r coverage/frontend/lcov.info
bash "$helper" report --partial -r coverage/server/lcov.info
bash "$helper" final
