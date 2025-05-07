#!/bin/bash

# clean.sh
# 🧹 Full cleanup script for the monorepo build artifacts

set -e

echo "🧹 Cleaning all dist/, .turbo/, and .cache/ directories..."
find . \( -type d -name dist -o -name .turbo -o -name .cache \) -exec rm -rf {} +

echo "🧼 Removing all .tsbuildinfo files..."
find . -type f -name '*.tsbuildinfo' -delete

echo "✅ Clean completed successfully."
