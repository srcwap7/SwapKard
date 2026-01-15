#!/usr/bin/env bash

# Replace URLs like http://localhost:2000
# with http://localhost:2000

find . -type f -exec sed -i.bak \
  's|https://swapkard\.onrender\.com/[A-Za-z0-9_-]\+|http://localhost:2000|g' {} +

echo "Replacement done. Backup files created with .bak extension."
