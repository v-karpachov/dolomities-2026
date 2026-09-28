# Brenta Start Logistics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Brenta transport block read unmistakably as start logistics before Day 1.

**Architecture:** Keep the existing standalone page and replace only the logistics section's HTML and CSS. Extend the existing static verifier so the semantic heading, route summary, recommendation label, and departure strip cannot regress.

**Tech Stack:** Standalone HTML/CSS and Node.js verification script.

## Global Constraints

- Preserve all route maps, GPX links, day descriptions, and trip figures.
- Keep the page responsive without horizontal overflow at 390 px.
- Use Ukrainian interface copy.

---

### Task 1: Redesign the start logistics block

**Files:**
- Modify: `scripts/verify-brenta-page.mjs`
- Modify: `brenta.html`

**Interfaces:**
- Consumes: the existing `[data-start-logistics]` section before the first `.day-card`.
- Produces: a logistics band with `Як дістатися до старту`, route/date summary, recommended bus, early bus, and departure strip.

- [x] **Step 1: Write the failing verification**

Add checks for `Як дістатися до старту`, `start-logistics-route`, `Рекомендований рейс`, and `start-logistics-departure`.

- [x] **Step 2: Run the verifier and confirm failure**

Run: `node scripts/verify-brenta-page.mjs`

Expected: failure for the first missing redesigned logistics capability.

- [x] **Step 3: Implement the redesigned block**

Replace the current heading hierarchy and option-card styling with the approved logistics band while preserving every timetable value and external link.

- [x] **Step 4: Verify behavior and presentation**

Run: `node scripts/verify-brenta-page.mjs && git diff --check`

Then inspect the page at desktop width and 390 px, confirming no overflow and that the section precedes Day 1.

- [ ] **Step 5: Commit and publish**

Commit only the redesigned page, verifier, design, and plan; push `main`; wait for GitHub Pages; verify the live page.
