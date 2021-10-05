// Called from "version" npm script when running `npm version`
// during release process. This script updates the docs to point to the release.
// It also copies the release file to a filename matching the one we want to publish to GitHub.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const version = require('../package.json').version;
const artifact = 'dist/bin/release.tar.gz';
const coreArtifact = 'dist/bin/release-core.tar.gz';

const bazelBinary = path.posix.join(__dirname, '../node_modules/.bin/bazel');

function computeSha256(path) {
  const hash = crypto.createHash('sha256');
  // TODO(alexeagle): consider streaming the bytes into the hash function, if this consumes too much
  // RAM
  return hash.update(fs.readFileSync(path)).digest('hex');
}
const sha256 = computeSha256(artifact);
const coreSha256 = computeSha256(coreArtifact);

for (const f of ['docs/install.md', 'packages/create/index.js']) {
  shell.sed(
      '-i', 'download/[0-9\.]*(-(beta|rc).[0-9]+)?/rules_nodejs-[0-9\.]*(-(beta|rc).[0-9]+)?.tar.gz',
      `download/${version}/rules_nodejs-${version}.tar.gz`, f);
  shell.sed('-i', 'sha256 = \"[0-9a-f]+\"', `sha256 = "${sha256}"`, f);
}
shell.cp('-f', artifact, `rules_nodejs-${version}.tar.gz`);
shell.cp('-f', coreArtifact, `rules_nodejs-core-${version}.tar.gz`);

/**
 * Returns an array of all WORKSPACE the files under a directory.
 */
function findFiles(regex, dir) {
  return fs.readdirSync(dir).reduce((files, file) => {
    const fullPath = path.posix.join(dir, file);
    const isDirectory = fs.statSync(fullPath).isDirectory();
    if (isDirectory) {
      return files.concat(findFiles(regex, fullPath));
    } else if (regex.test(file)) {
      return files.concat(fullPath);
    } else {
      return files;
    }
  }, []);
}

const workspaceFiles = [
  ...findFiles(/^WORKSPACE$/, 'e2e'),
  ...findFiles(/^WORKSPACE$/, 'examples'),
];

for (const f of workspaceFiles) {
  let workspaceContents = fs.readFileSync(f, {encoding: 'utf-8'});
  const regex = new RegExp(`http_archive\\(\\s*name\\s*\\=\\s*"build_bazel_rules_nodejs"[^)]+`);
  const replacement = `http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "${sha256}",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/${version}/rules_nodejs-${
      version}.tar.gz"],
`;
  workspaceContents = workspaceContents.replace(regex, replacement);
  const coreRegex = new RegExp(`http_archive\\(\\s*name\\s*\\=\\s*"rules_nodejs"[^)]+`);
  const coreReplacement = `http_archive(
    name = "rules_nodejs",
    sha256 = "${coreSha256}",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/${version}/rules_nodejs-core-${
      version}.tar.gz"],
`;
  workspaceContents = workspaceContents.replace(coreRegex, coreReplacement);
  fs.writeFileSync(f, workspaceContents);
}

function getBazelArtifactPath(buildInfo, pathFragmentId) {
  let artifactPath = [];
  let fragment = buildInfo.pathFragments.find(p => p.id === pathFragmentId);
  while (fragment.parentId !== undefined) {
    artifactPath = [fragment.label, ...artifactPath];
    fragment = buildInfo.pathFragments.find(p => p.id === fragment.parentId);
  }
  return path.posix.join('bazel-out', ...artifactPath);
}

function getDevserverBinarySha(binary) {
  shell.exec(`${bazelBinary} build ${binary}`, {silent: true});
  const cQuery = `${bazelBinary} cquery ${binary} --output=jsonproto`;
  const ruleInfo = JSON.parse(shell.exec(cQuery, {silent: true}));
  const attributes = ruleInfo.results[0].target.rule.attribute;
  const os = attributes.find(a => a.name === 'goos').stringValue.toLocaleUpperCase();
  const arch = attributes.find(a => a.name === 'goarch').stringValue.toLocaleUpperCase();
  const aQuery = `${bazelBinary} aquery ${binary} --output=jsonproto`;
  const buildInfo = JSON.parse(shell.exec(aQuery, {silent: true}));
  const outputId = buildInfo.actions.find(a => a.mnemonic === 'GoLink').primaryOutputId;
  const artifact = buildInfo.artifacts.find(a => a.id === outputId);
  const binaryPath = getBazelArtifactPath(buildInfo, artifact.pathFragmentId);
  const sha = computeSha256(binaryPath);
  const constantName = `_${os}_${arch}_SHA`;
  return {sha, constantName};
}

const bazelQuery = `${bazelBinary} query "kind(go_transition_binary, @build_bazel_rules_typescript//devserver:*)"`;
const concatjsBinaries = shell.exec(bazelQuery, {silent: true}).split('\n').filter(b => b.trim().length > 0);
const repositoriesPath = 'toolchains/concatjs/repositories.bzl';
let repositories = fs.readFileSync(repositoriesPath, 'utf8');
for (const binary of concatjsBinaries) {
  const {sha, constantName} = getDevserverBinarySha(binary);
  repositories = repositories.replace(new RegExp(`${constantName} = "[a-f0-9]+"`, 'gm'), `${constantName} = "${sha}"`);
}
fs.writeFileSync(repositoriesPath, repositories);
