#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'

const [, , command, ...args] = process.argv
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const validateScript = path.join(repoRoot, 'scripts', 'validate-review-result.js')
const configPath = path.join(repoRoot, 'autolammps-gate.config.json')

function usage() {
  console.log(`AutoLammps evidence gate

Usage:
  node scripts/autolammps-gate.js validate <review-result.json> [project-root]
  node scripts/autolammps-gate.js scan <project-root>
  node scripts/autolammps-gate.js install-codex <target-project>

Commands:
  validate       Validate one review JSON and write a .gate.json sidecar.
  scan           Find and validate review JSON files under a project.
  install-codex  Copy AGENTS.md plus support files into a Codex project.
`)
}

function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    ensureDir(dest)
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry))
    }
    return
  }
  ensureDir(path.dirname(dest))
  fs.copyFileSync(src, dest)
}

function sidecarPath(reviewPath) {
  return `${reviewPath}.gate.json`
}

function runValidate(reviewPath, projectRoot) {
  const absoluteReviewPath = path.resolve(reviewPath)
  const absoluteProjectRoot = path.resolve(projectRoot)
  const result = spawnSync(process.execPath, [validateScript, absoluteReviewPath, absoluteProjectRoot], {
    cwd: repoRoot,
    encoding: 'utf8',
  })

  const ok = result.status === 0
  const sidecar = {
    ok,
    review_path: absoluteReviewPath,
    project_root: absoluteProjectRoot,
    validated_at: new Date().toISOString(),
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || result.error?.message || '').trim(),
  }
  fs.writeFileSync(sidecarPath(reviewPath), `${JSON.stringify(sidecar, null, 2)}\n`)

  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.error) process.stderr.write(`${result.error.message}\n`)
  console.log(`Gate sidecar: ${sidecarPath(reviewPath)}`)
  return ok
}

function findReviewFiles(root, config) {
  const matches = []
  const names = new Set(config.reviewFileNames || [])
  const suffixes = config.reviewFileSuffixes || ['.review.json', 'review-result.json']
  const ignored = new Set(config.ignoreDirs || ['.git', 'node_modules'])

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
        continue
      }
      if (!entry.isFile() || !entry.name.endsWith('.json')) continue
      if (entry.name.endsWith('.gate.json')) continue
      if (names.has(entry.name) || suffixes.some(s => entry.name.endsWith(s))) {
        matches.push(full)
      }
    }
  }

  walk(root)
  return matches
}

function scan(projectRoot) {
  const root = path.resolve(projectRoot || process.cwd())
  const config = readJson(configPath, {}) || {}
  const files = findReviewFiles(root, config)
  if (files.length === 0) {
    console.log(`No review JSON files found under ${root}`)
    return true
  }

  let allOk = true
  for (const file of files) {
    console.log(`\n==> ${file}`)
    if (!runValidate(file, root)) allOk = false
  }
  return allOk
}

function installCodex(targetProject) {
  if (!targetProject) throw new Error('install-codex requires <target-project>')
  const target = path.resolve(targetProject)
  ensureDir(target)

  const targetAgents = path.join(target, 'AGENTS.md')
  const sourceAgents = path.join(repoRoot, 'AGENTS.md')
  const supportDir = path.join(target, '.codex', 'lammps-agent-workflow')

  if (fs.existsSync(targetAgents)) {
    const marker = '<!-- AutoLammps-Skill appended instructions -->'
    const existing = fs.readFileSync(targetAgents, 'utf8')
    const source = fs.readFileSync(sourceAgents, 'utf8')
    if (!existing.includes(marker)) {
      fs.appendFileSync(targetAgents, `\n\n${marker}\n\n${source}\n`)
    }
  } else {
    fs.copyFileSync(sourceAgents, targetAgents)
  }

  for (const dir of ['templates', 'knowledge-capsule', 'scripts']) {
    copyRecursive(path.join(repoRoot, dir), path.join(supportDir, dir))
  }
  fs.copyFileSync(path.join(repoRoot, 'autolammps-gate.config.json'), path.join(supportDir, 'autolammps-gate.config.json'))

  console.log(`Installed Codex instructions: ${targetAgents}`)
  console.log(`Installed support files: ${supportDir}`)
}

try {
  if (!command || command === '--help' || command === '-h') {
    usage()
    process.exit(0)
  }

  if (command === 'validate') {
    const [reviewPath, projectRoot = process.cwd()] = args
    if (!reviewPath) throw new Error('validate requires <review-result.json>')
    process.exit(runValidate(reviewPath, projectRoot) ? 0 : 1)
  }

  if (command === 'scan') {
    const [projectRoot = process.cwd()] = args
    process.exit(scan(projectRoot) ? 0 : 1)
  }

  if (command === 'install-codex') {
    installCodex(args[0])
    process.exit(0)
  }

  throw new Error(`Unknown command: ${command}`)
} catch (err) {
  console.error(err.message)
  process.exit(1)
}
