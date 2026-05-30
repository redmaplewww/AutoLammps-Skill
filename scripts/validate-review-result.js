#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

const [, , reviewPath, rootArg] = process.argv

if (!reviewPath) {
  console.error('Usage: node validate-review-result.js <review-result.json> [project-root]')
  process.exit(2)
}

const projectRoot = rootArg ? path.resolve(rootArg) : process.cwd()

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (err) {
    throw new Error(`Cannot read JSON ${file}: ${err.message}`)
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function evidenceList(review) {
  const lists = [
    asArray(review.manual_refs),
    asArray(review.case_refs),
    asArray(review.memory_refs),
    asArray(review.artifact_refs),
  ]
  for (const mb of Object.values(review.mandatory_check_results || {})) {
    lists.push(asArray(mb && mb.evidence))
  }
  return lists.flat()
}

function isRemoteSource(source) {
  return /^https?:\/\//i.test(source) || /^doi:/i.test(source)
}

function localPathExists(source) {
  if (!source || isRemoteSource(source)) return true
  const normalized = source.replace(/\\/g, '/')
  const candidate = path.isAbsolute(source)
    ? source
    : path.join(projectRoot, normalized)
  return fs.existsSync(candidate)
}

function hasEvidenceType(records, types) {
  return records.some(r => r && types.includes(r.type))
}

const errors = []
let review

try {
  review = readJson(reviewPath)
} catch (err) {
  console.error(err.message)
  process.exit(1)
}

const validStages = new Set(['WF-00', 'WF-01', 'WF-02', 'WF-03A'])
const validDecisions = new Set(['PASS', 'REVISE', 'BLOCKED'])
const validRisk = new Set(['low', 'medium', 'high'])
const validConfidence = new Set(['high', 'medium', 'low'])
const requiredMb = ['MB-001', 'MB-002', 'MB-003', 'MB-004', 'MB-005', 'MB-006', 'MB-007']

if (!validStages.has(review.stage)) errors.push('stage must be WF-00, WF-01, WF-02, or WF-03A')
if (!validDecisions.has(review.decision)) errors.push('decision must be PASS, REVISE, or BLOCKED')
if (!validRisk.has(review.risk_level)) errors.push('risk_level must be low, medium, or high')
if (!validConfidence.has(review.confidence)) errors.push('confidence must be high, medium, or low')

const mbResults = review.mandatory_check_results || {}
for (const id of requiredMb) {
  const result = mbResults[id]
  if (!result || typeof result.triggered !== 'boolean') {
    errors.push(`${id} missing or missing boolean triggered`)
    continue
  }
  if (result.triggered) {
    if (typeof result.passed !== 'boolean') {
      errors.push(`${id} triggered but missing boolean passed`)
    }
    if (asArray(result.evidence).length === 0) {
      errors.push(`${id} triggered but has no evidence`)
    }
    if (result.passed === false && review.decision === 'PASS') {
      errors.push(`${id} failed but decision is PASS`)
    }
  }
}

const records = evidenceList(review)
for (const [index, record] of records.entries()) {
  if (!record || typeof record !== 'object') {
    errors.push(`evidence[${index}] is not an object`)
    continue
  }
  if (!record.type) errors.push(`evidence[${index}] missing type`)
  if (!record.source) errors.push(`evidence[${index}] missing source`)
  if (record.verified !== true) errors.push(`evidence[${index}] must set verified: true`)
  if (record.source && !localPathExists(record.source)) {
    errors.push(`local evidence path does not exist: ${record.source}`)
  }
}

if (review.risk_level === 'high' && review.decision === 'PASS') {
  if (!hasEvidenceType(records, ['manual', 'correction'])) {
    errors.push('high-risk PASS requires manual or correction evidence')
  }
  if (!hasEvidenceType(records, ['case', 'memory', 'artifact'])) {
    errors.push('high-risk PASS requires case, memory, or artifact evidence')
  }
}

const semanticCommands = asArray(review.semantic_commands_touched)
if (semanticCommands.length > 0 && review.decision === 'PASS') {
  if (!hasEvidenceType(records, ['manual', 'correction'])) {
    errors.push('semantic command changes require manual or correction evidence')
  }
}

if (errors.length > 0) {
  console.error('Review validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('Review validation passed')
