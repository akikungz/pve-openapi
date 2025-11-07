#!/usr/bin/env bun

/**
 * Convert schema.js to TypeScript format for pve.ts
 * Usage: bun run scripts/convert-schema.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const schemaPath = resolve(process.cwd(), "schema.js");
const outputPath = resolve(process.cwd(), "src/libs/pve.ts");

try {
  console.log("Reading schema from:", schemaPath);
  let schemaData = readFileSync(schemaPath, "utf-8");
  
  // Check if export statement exists, if not add it
  let exportMatch = schemaData.indexOf("export { apiSchema };");
  if (exportMatch === -1) {
    console.log("Adding export statement to schema.js...");
    // Find ];\n pattern after the array
    const startMatch = schemaData.indexOf("const apiSchema = [");
    if (startMatch === -1) {
      throw new Error("Could not find 'const apiSchema = [' in schema.js");
    }
    
    // Look for ]; followed by two newlines (which indicates end of the array)
    const searchFrom = startMatch + 19; // length of "const apiSchema = ["
    const pattern = /\]\s*;\s*\n\s*\n/;
    const match = schemaData.substring(searchFrom).match(pattern);
    
    if (!match) {
      throw new Error("Could not find end of apiSchema array (looking for ]; followed by blank line)");
    }
    
    const insertPos = searchFrom + (match.index || 0) + match[0].length;
    
    // Insert export statement
    schemaData = schemaData.substring(0, insertPos) + 
                 "export { apiSchema };\n\n" + 
                 schemaData.substring(insertPos);
    
    // Write the updated schema.js back
    writeFileSync(schemaPath, schemaData, "utf-8");
    console.log("✓ Export statement added to schema.js");
    
    exportMatch = schemaData.indexOf("export { apiSchema };");
  }
  
  // Now extract just the array content
  const startMatch = schemaData.indexOf("const apiSchema = [");
  if (startMatch === -1) {
    throw new Error("Could not find 'const apiSchema = [' in schema.js");
  }
  
  // Find the array start
  const arrayStart = schemaData.indexOf("[", startMatch);
  
  // Count brackets to find where the array actually ends
  let bracketCount = 0;
  let arrayEnd = -1;
  let inString = false;
  let escapeNext = false;
  let stringChar = '';
  
  for (let i = arrayStart; i < exportMatch; i++) {
    const char = schemaData[i];
    
    // Handle escape sequences
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    // Handle strings
    if ((char === '"' || char === "'") && !inString) {
      inString = true;
      stringChar = char;
      continue;
    }
    
    if (char === stringChar && inString) {
      inString = false;
      stringChar = '';
      continue;
    }
    
    // Only count brackets outside of strings
    if (!inString) {
      if (char === '[' || char === '{') {
        bracketCount++;
      } else if (char === ']' || char === '}') {
        bracketCount--;
        
        // When bracketCount reaches 0, we've found the end of the top-level array
        if (bracketCount === 0 && char === ']') {
          arrayEnd = i + 1; // Include the ]
          break;
        }
      }
    }
  }
  
  if (arrayEnd === -1) {
    throw new Error("Could not find matching closing bracket for apiSchema array");
  }
  
  let arrayContent = schemaData.substring(arrayStart, arrayEnd);
  
  // The array content should be pure JSON, but might have extra whitespace
  arrayContent = arrayContent.trim();
  
  // Parse the array using eval since it's JavaScript syntax
  console.log("Parsing schema array...");
  const apiData = eval(`(${arrayContent})`);

  // Generate TypeScript file content
  const tsContent = `export const apiSchema = ${JSON.stringify(apiData, null, 2)};
`;

  console.log("Writing TypeScript schema to:", outputPath);
  writeFileSync(outputPath, tsContent, "utf-8");

  console.log("✓ Schema conversion completed successfully!");
  console.log("  Generated:", outputPath);
} catch (error) {
  console.error("✗ Error converting schema:", error);
  process.exit(1);
}
