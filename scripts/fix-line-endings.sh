#!/bin/bash

# Fix line endings for all shell scripts

echo "Fixing line endings for shell scripts..."

# Find all .sh files and fix them
find . -name "*.sh" -type f -exec dos2unix {} \; 2>/dev/null || {
    echo "dos2unix not available, using sed..."
    find . -name "*.sh" -type f -exec sed -i '' $'s/\r$//' {} \;
}

# Make them executable
find . -name "*.sh" -type f -exec chmod +x {} \;

echo "Fixed line endings and set executable permissions for all .sh files"