#!/bin/bash

# Script to add 'export const dynamic = "force-dynamic";' to all API route files
# This fixes the "Dynamic server usage" errors in Next.js

API_DIR="/Users/vbm3265/Desktop/workmate/app/api"

# Find all route.ts files
ROUTE_FILES=$(find "$API_DIR" -name "route.ts")

for file in $ROUTE_FILES; do
  echo "Processing $file"
  
  # Check if the file already has the dynamic export
  if grep -q "export const dynamic" "$file"; then
    echo "  Already has dynamic export, skipping"
  else
    # Add the dynamic export after the imports
    # This assumes all imports are at the top of the file
    awk '
    BEGIN { added = 0; }
    /^import/ { print; next; }
    /^$/ && !added { 
      print ""; 
      print "// Force dynamic rendering for this route"; 
      print "export const dynamic = \"force-dynamic\";"; 
      added = 1; 
      print "";
      next;
    }
    { print; }
    ' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
    
    echo "  Added dynamic export"
  fi
done

echo "Done! All API routes now have dynamic = 'force-dynamic'"
