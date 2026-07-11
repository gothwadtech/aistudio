# Gothwad AI Studio Agent Guide

Welcome to the **Gothwad AI Studio** agent documentation. This guide outlines the project structure, design conventions, and guidelines for developer agents maintaining or enhancing this application.

## Overview
Gothwad AI Studio is a highly responsive, fluid, mobile-first developer workspace integrating with GitHub for repository management, branching, and advanced local ZIP file synchronizations.

---

## Technical Stack & Architecture

- **Frontend Framework**: React (v18+) with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks & Custom Contexts
- **Animations**: `motion/react`
- **Key Capabilities**:
  - GitHub Authentication (OAuth / PAT)
  - Interactive Code Editor with multi-tab support
  - Responsive Double Sidebar and Panel Layouts
  - Local ZIP Unpacking and Synchronization
  - AI Assistant Panel (Chat Studio)

---

## Key Design Conventions

1. **Fluid Liquid Layout**:
   - The workspace maintains a strict full-screen boundary using the custom `app-container` class and CSS custom variables for height.
2. **Mobile Override**:
   - Uses `--true-height` to resolve mobile Safari/Chrome 100vh address bar bugs dynamically.
3. **Typography**:
   - Clean sans-serif and mono fonts (Inter and JetBrains Mono) with balanced negative space.
4. **Theme Configuration**:
   - Fully supports responsive dark/light themes with configurable accent colors.

---

## Core Operational Modules

### 1. GitHub Auth Engine
- Integrates Personal Access Tokens (PAT) and OAuth Client ID/Secret.
- Stored safely in safe client storage mechanisms.

### 2. Live File Explorer
- Renders file system hierarchies recursively.
- Supports expanding/collapsing folder trees dynamically.

### 3. Native Multi-Tab Code Editor
- Code editor is fully responsive.
- Maintains tabs, handles code edits, and updates parent state seamlessly.

### 4. ZIP Unpacker & Synchronizer
- Allows users to drag-and-drop or select `.zip` archives.
- Unzips locally, visualizes difference tree, and commits updates directly.
