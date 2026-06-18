import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const routesDir = path.resolve(process.cwd(), "src/routes");
const routeExtensions = new Set([".tsx", ".jsx"]);
const excludedRouteFiles = new Set(["styleguide.tsx"]);
function walkFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }

    if (
      entry.isFile() &&
      routeExtensions.has(path.extname(entry.name)) &&
      !excludedRouteFiles.has(entry.name)
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function isIntrinsicJsxName(tagName) {
  if (ts.isIdentifier(tagName)) {
    return /^[a-z]/.test(tagName.text);
  }

  return false;
}

function formatPosition(sourceFile, node) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(sourceFile),
  );
  return `${path.relative(process.cwd(), sourceFile.fileName)}:${line + 1}:${character + 1}`;
}

function checkFile(filePath) {
  const sourceText = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const violations = [];

  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      if (isIntrinsicJsxName(node.tagName)) {
        violations.push({
          position: formatPosition(sourceFile, node),
          tag: node.tagName.getText(sourceFile),
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

if (!fs.existsSync(routesDir)) {
  console.error(
    `Routes directory not found: ${path.relative(process.cwd(), routesDir)}`,
  );
  process.exit(1);
}

const violations = walkFiles(routesDir).flatMap(checkFile);

if (violations.length > 0) {
  console.error("Routes must not render intrinsic HTML elements.");
  console.error(
    "Move route markup/styling into custom components under src/components and keep routes as API/component glue.",
  );
  console.error("");

  for (const violation of violations) {
    console.error(`${violation.position} uses <${violation.tag}>`);
  }

  process.exit(1);
}

console.log("Routes do not render intrinsic HTML elements.");
