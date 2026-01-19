#!/usr/bin/env bash

set -eufo pipefail

mkdir -p test-data

for n in {1..2}; do
    namespace="Namespace${n}"
    for a in {1..2}; do
        artifact="Artifact${a}"
        for t in {1..2}; do
            type="Type${t}"
            pytest \
                -v \
                --metadata Namespace ${namespace} \
                --metadata Artifact ${artifact} \
                --metadata Type ${type} \
                --junit-xml=test-data/${namespace}_${artifact}_${type}.xml ||
                true
        done
    done
done

touch test-data/Namespace4_Artifact1_Type1.xml
