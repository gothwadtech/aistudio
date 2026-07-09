# Gothwad Ai Studio coding companion

Gothwad Ai Studio is a highly responsive, fluid mobile-first developer workspace that integrates with GitHub to manage repos, branches, files, and perform direct ZIP payload unpack & sync merges.

## Design Conventions
- Fluid Liquid layout using `app-container` and custom variable dimensions.
- Native mobile height calculation override.
- Strict user-select control (allowed only inside inputs/textareas).
- Dark/Light Theme Support based on system metadata.

## Core Features
1. **GitHub Auth**: Connect via Client ID & Secret or securely with Github Developer Personal Access Tokens (PAT).
2. **File Explorer**: Render hierarchical repository directories with expandable folders.
3. **Interactive Code Editor**: Native editable layout to write direct file payloads.
4. **Local ZIP Unpacking & Synchronization**: Support uploading `.zip` file packages, automatically inflating them, visual file selector/diffing, and directly staging & pushing changes into GitHub repositories.
