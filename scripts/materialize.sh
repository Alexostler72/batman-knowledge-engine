#!/usr/bin/env bash
set -euo pipefail

cat bundle.part* | base64 --decode > project.tar.gz
tar -xzf project.tar.gz --strip-components=1
rm -f bundle.part* project.tar.gz
