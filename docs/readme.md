# Gothwad AI Studio Workstation

Gothwad AI Studio is a fluid, mobile-first developer workspace that integrates with GitHub to manage repositories, branches, files, and perform direct ZIP payload unpack & sync merges.

## 🚀 Key Features

- **GitHub Authentication**: Secure connection via personal access tokens (PAT) or Client ID & Secret.
- **Hierarchical File Explorer**: Smooth, interactive file tree rendering with recursive expansion.
- **Tabbed Code Editor**: Edit code directly inside a fluid, responsive editor with syntax-like layout.
- **Offline & PWA Support**: Supported fully offline with service workers, allowing code writing and management without an active internet connection.
- **Local ZIP Unpacking**: Upload a `.zip` archive containing code files, extract it on the fly, view diffs, and sync changes directly to your GitHub repository.
- **AI Companion Panel**: Collaborative Chat Studio with custom Gemini API support to guide code writing and answer complex technical questions.

---

## 🛠️ Getting Started

### 1. Connecting GitHub
To start working with your repositories:
1. Open the **Auth** panel.
2. Provide your **GitHub Personal Access Token (PAT)** or initiate the **OAuth** flow.
3. Select a repository and branch from the selector.

### 2. Uploading and Synchronizing a ZIP
1. Use the **Zip Sync** icon in the sidebar or drag-and-drop your ZIP archive.
2. The workstation will unpack the archive in memory.
3. Inspect files, review changes, and select files to stage and merge.

### 3. Progressive Web App (PWA) Setup
The workstation is PWA-compatible and runs offline:
- Install the application as a standalone desktop or mobile application.
- All modifications are locally preserved during offline sessions.

---

## 🎨 Layout & Themes
Configure the appearance from the **Settings** panel:
- Change accent colors.
- Adjust UI scaling.
- Toggle between System, Light, and Dark themes.
- Toggle **Desktop Mode** on mobile devices for the full dual-pane panel layouts.
