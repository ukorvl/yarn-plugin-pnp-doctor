import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".yarn",
  "artifacts",
  "bundles",
  "coverage",
  "dist",
  "lib",
  "node_modules",
]);

const markdownFiles = [];

function collectMarkdownFiles(directory) {
  for (const entry of readdirSync(directory)) {
    const absolutePath = join(directory, entry);
    const relativePath = absolutePath.slice(root.length + 1);
    const stat = statSync(absolutePath);

    if (stat.isDirectory()) {
      if (!ignoredDirectories.has(entry)) collectMarkdownFiles(absolutePath);
      continue;
    }

    if (stat.isFile() && extname(entry).toLowerCase() === ".md") {
      markdownFiles.push(relativePath);
    }
  }
}

function isSkippableTarget(target) {
  return target === "" || target.startsWith("#") || hasUrlScheme(target);
}

function normalizeTarget(rawTarget) {
  const trimmed = rawTarget.trim();
  const titleStart = findMarkdownTitleStart(trimmed);
  const withoutTitle = titleStart === -1 ? trimmed : trimmed.slice(0, titleStart);
  const withoutAnchor = withoutTitle.split("#")[0] ?? "";
  return withoutAnchor.startsWith("<") && withoutAnchor.endsWith(">")
    ? withoutAnchor.slice(1, -1)
    : withoutAnchor;
}

function hasUrlScheme(target) {
  const colonIndex = target.indexOf(":");

  if (colonIndex <= 0) return false;

  const firstCode = target.codePointAt(0) ?? 0;
  const isAlpha =
    (firstCode >= 65 && firstCode <= 90) || (firstCode >= 97 && firstCode <= 122);

  if (!isAlpha) return false;

  for (const character of target.slice(1, colonIndex)) {
    const code = character.codePointAt(0) ?? 0;
    const isValid =
      (code >= 65 && code <= 90) ||
      (code >= 97 && code <= 122) ||
      (code >= 48 && code <= 57) ||
      character === "+" ||
      character === "." ||
      character === "-";

    if (!isValid) return false;
  }

  return true;
}

function findMarkdownTitleStart(target) {
  for (let index = 0; index < target.length - 1; index += 1) {
    const current = target[index];
    const next = target[index + 1];

    if ((current === " " || current === "\t") && (next === '"' || next === "'")) {
      return index;
    }
  }

  return -1;
}

function extractMarkdownTargets(content) {
  const targets = [];
  let searchFrom = 0;

  while (searchFrom < content.length) {
    const start = content.indexOf("](", searchFrom);

    if (start === -1) break;

    const targetStart = start + 2;
    const targetEnd = content.indexOf(")", targetStart);

    if (targetEnd === -1) break;

    targets.push(content.slice(targetStart, targetEnd));
    searchFrom = targetEnd + 1;
  }

  return targets;
}

collectMarkdownFiles(root);

const failures = [];

for (const file of markdownFiles) {
  const content = readFileSync(join(root, file), "utf8");

  for (const rawTarget of extractMarkdownTargets(content)) {
    const target = normalizeTarget(rawTarget);

    if (isSkippableTarget(target)) continue;

    const targetPath = resolve(dirname(join(root, file)), decodeURI(target));

    if (!existsSync(targetPath)) {
      failures.push(`${file}: missing link target "${target}"`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Markdown links OK: ${markdownFiles.length} files checked.`);
}
