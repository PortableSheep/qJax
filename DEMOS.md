# QJax Demos - Quick Start Guide

This repository includes multiple demo options. Choose the one that works best for you:

## 🌐 Option 1: Standalone Browser Demo (RECOMMENDED - No Setup!)

**Best for:** Quick testing without any installation

**File:** `demo-standalone.html`

**How to run:**
```bash
# Just open in your browser
open demo-standalone.html
# or
firefox demo-standalone.html
# or double-click the file
```

**Features:**
- ✅ No installation required
- ✅ No build step needed
- ✅ Works immediately
- ✅ Demonstrates all QJax features
- ✅ Uses RxJS from CDN

**What it shows:**
- Ordered async request execution
- Queue rate limiting (max 5 pending)
- Visual progress meter
- Real-time status updates

---

## 🔵 Option 2: jQuery Example (Classic v1.x)

**Best for:** Testing the original jQuery plugin

**Location:** `jquery-example/`

**How to run:**
```bash
cd jquery-example
open index.html
```

**Features:**
- ✅ No installation required
- ✅ Original qJax v1.x functionality
- ✅ jQuery-based implementation

---

## 🅰️ Option 3: Angular Example (Full App)

**Best for:** Seeing QJax in a real Angular application

**Location:** `angular-example/`

**Requirements:**
- Node.js 18+
- ~5-10 minutes for first-time setup
- ~200MB for dependencies

**How to run:**
```bash
# 1. Build the QJax library first
npm install
npm run build

# 2. Install and run Angular example
cd angular-example
npm install
npm start
```

**Features:**
- Complete Angular 19 application
- Beautiful UI with animations
- Full TypeScript integration
- Production-ready example

⚠️ **Note:** This requires significant setup time and disk space

---

## 🖥️ Option 4: Node.js Demo Script

**Best for:** Testing QJaxService in Node.js

**File:** `demo.js`

**How to run:**
```bash
npm install
npm run build
node demo.js
```

**Features:**
- Command-line test suite
- 5 test scenarios
- Validates all functionality

---

## 📊 Comparison

| Demo | Setup Time | Installation Required | Best For |
|------|------------|----------------------|----------|
| **Standalone Browser** | 0 seconds | ❌ No | Quick testing |
| **jQuery Example** | 0 seconds | ❌ No | jQuery users |
| **Angular Example** | 5-10 min | ✅ Yes | Production reference |
| **Node.js Script** | 1-2 min | ✅ Yes | CLI testing |

## 🎯 Recommendation

**Start with `demo-standalone.html`** - it's the fastest way to see QJax in action!

Just open it in your browser and start clicking buttons. No setup required.
