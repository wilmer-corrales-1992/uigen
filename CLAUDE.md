# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language, and Claude AI generates them in real-time with instant visual feedback. The application uses a virtual file system (no disk writes) and supports persistence for authenticated users via SQLite.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma (SQLite), Anthropic Claude AI, Vercel AI SDK

## Development Commands

```bash
# Initial setup (install deps + generate Prisma client + run migrations)
npm run setup

# Start development server
npm run dev

# Build for production
npm build

# Run linter
npm run lint

# Run tests (Vitest)
npm test

# Reset database (destructive)
npm run db:reset

# Generate Prisma client after schema changes
npx prisma generate

# Create new migration
npx prisma migrate dev --name <migration_name>
```

## Architecture

### Core Data Flow

1. **User Input** → Chat interface receives component request
2. **AI Processing** → `/api/chat` endpoint streams response from Claude using Vercel AI SDK
3. **Tool Execution** → AI uses two tools to manipulate virtual file system:
   - `str_replace_editor` (view/create/str_replace/insert operations)
   - `file_manager` (rename/delete operations)
4. **State Update** → `FileSystemContext.handleToolCall()` executes tools and updates in-memory file system
5. **Re-render** → `triggerRefresh()` causes FileTree, CodeEditor, and PreviewFrame to update
6. **Persistence** → `onFinish()` callback serializes messages and file system state to database (authenticated users only)

### Virtual File System

**Location:** `/src/lib/file-system.ts`

- In-memory tree structure using `FileNode` objects with `Map<string, FileNode>` for children
- Full CRUD operations: `createFile()`, `updateFile()`, `deleteFile()`, `rename()`
- Path normalization (always starts with `/`, no trailing slashes)
- Serialization converts `Map` to `Record<string, FileNode>` for JSON persistence
- Deserialization rebuilds tree structure from flat object

**Key Methods:**
- `createFileWithParents()` - Creates file and parent directories recursively
- `serialize()` - Converts to JSON-compatible format
- `deserializeFromNodes()` - Rebuilds tree from serialized data
- `viewFile()` - Returns file content with optional line range
- `replaceInFile()` - String replacement operation
- `insertInFile()` - Insert content at specific line

### Preview System

**Component:** `/src/components/preview/PreviewFrame.tsx`

The preview system transforms and renders React components in an isolated iframe:

1. **Entry Point Detection** - Auto-detects `/App.jsx`, `/App.tsx`, `/index.jsx`, or `/index.tsx`
2. **JSX Transformation** (`/src/lib/transform/jsx-transformer.ts`):
   - Transforms React/TypeScript via Babel standalone
   - Creates import map with blob URLs for local files
   - Maps external packages to esm.sh CDN (React, ReactDOM, etc.)
   - Supports `@/` alias for root imports
   - Collects CSS imports and injects styles
3. **HTML Generation** - Injects Tailwind CSS CDN, error boundary, and transformed modules
4. **Iframe Rendering** - Uses `srcdoc` with sandbox restrictions (`allow-scripts allow-same-origin allow-forms`)

**Important:** Preview re-transforms all files on every change to ensure consistency.

### Authentication & Sessions

**Location:** `/src/lib/auth.ts`, `/src/actions/index.ts`

- **Session Management:** JWT (jose library) with HS256 algorithm, 7-day expiration
- **Storage:** HTTP-only cookies (SameSite: Lax, Secure in production)
- **Password Hashing:** bcrypt with default salt rounds
- **Middleware:** `/src/middleware.ts` validates sessions on protected routes

**User Actions:**
- `signUp()` - Validates email uniqueness and password length (8+ chars)
- `signIn()` - Verifies credentials via bcrypt
- `signOut()` - Clears session cookie
- `getUser()` - Returns current user from JWT

**Anonymous Work Tracking:** `/src/lib/anon-work-tracker.ts` stores work in `sessionStorage` to prompt sign-up before data loss.

### Database Schema

**Location:** `/prisma/schema.prisma`

```prisma
User {
  id, email (unique), password (hashed), createdAt, updatedAt
  projects: Project[]
}

Project {
  id, name, userId (nullable), messages (JSON string), data (JSON string), createdAt, updatedAt
  user: User (cascade delete)
}
```

- **messages:** Serialized array of chat messages
- **data:** Serialized virtual file system state
- **Prisma client output:** `/src/generated/prisma`

### Context Providers

**FileSystemContext** (`/src/lib/contexts/file-system-context.tsx`):
- Manages `VirtualFileSystem` instance
- Provides CRUD operations and `getAllFiles()` for serialization
- `handleToolCall()` processes AI tool invocations
- `refreshTrigger` number forces dependent components to re-render

**ChatContext** (`/src/lib/contexts/chat-context.tsx`):
- Wraps Vercel AI SDK's `useChat()` hook
- Manages messages, input state, and submission
- Sends file system state in API request body
- Invokes `handleToolCall()` on tool calls from AI

### AI Tool Definitions

**str_replace_editor** (`/src/lib/tools/str-replace.ts`):
- Commands: `view`, `create`, `str_replace`, `insert`, `undo_edit` (not supported)
- Used for reading and modifying file contents
- Supports line-based viewing with `view_range` parameter

**file_manager** (`/src/lib/tools/file-manager.ts`):
- Commands: `rename`, `delete`
- Used for file/directory renaming and deletion
- Rename can move files by changing path (creates parent dirs automatically)

### Routing Structure

```
/ (page.tsx)
  - Checks auth, redirects to most recent project or creates new one
  - Anonymous users see interface without persistence

/:projectId ([projectId]/page.tsx)
  - Server-side auth validation
  - Loads project data (messages, file system) from database
  - Passes to ClientMainContent wrapper

/api/chat (api/chat/route.ts)
  - POST endpoint for AI streaming responses
  - Creates VirtualFileSystem from request body
  - Configures Claude with tools
  - Returns StreamTextResult with onFinish callback for persistence
```

## Key Patterns

### Mock AI Provider

When `ANTHROPIC_API_KEY` is not set, the app uses a mock provider (`/src/lib/providers/mock-provider.ts`) that returns static demo component code. This allows the app to run without API credentials.

### Component Hierarchy

```
RootLayout
└── ClientMainContent (dynamic, no SSR)
    └── MainContent
        └── FileSystemProvider
            └── ChatProvider
                ├── ResizablePanelGroup
                ├── ChatInterface (left panel)
                │   ├── MessageList
                │   └── MessageInput
                └── Tabs (right panel)
                    ├── Preview Tab → PreviewFrame (iframe)
                    └── Code Tab → FileTree + CodeEditor
```

### File Tree Component

**Location:** `/src/components/editor/FileTree.tsx`

- Renders file system hierarchy
- Supports file selection (sets `selectedFile` in context)
- Auto-expands directories containing selected file
- Uses recursive rendering for nested directories

### Code Editor Component

**Location:** `/src/components/editor/CodeEditor.tsx`

- Monaco editor with TypeScript/JavaScript/CSS/HTML support
- Updates file system on content change
- Triggers preview refresh after debounce
- Line numbers enabled, minimap disabled, word wrap enabled

## Testing

**Framework:** Vitest with React Testing Library and jsdom

**Configuration:** `/vitest.config.mts`
- Uses `@vitejs/plugin-react` for JSX transform
- Uses `vite-tsconfig-paths` for `@/` alias resolution
- Environment: jsdom for DOM APIs

**Test Location:** `**/__tests__/*.test.tsx`

**Run single test:**
```bash
npm test -- <test-file-name>
```

## Coding Guidelines

### Use comments sparingly. Only comment complex code.

### The database schema is defined in `/prisma/schema.prisma`. Reference it anytime you need to understand the structure of data stored in database.

## Important Notes

### Security
- **No Server-Side File Writes:** All file operations are in-memory only
- **iframe Sandbox:** Restricts preview to prevent malicious code execution
- **Server-Only Imports:** Use `server-only` package to prevent accidental client exposure
- **Session Validation:** Middleware checks JWT on all protected routes

### AI Integration
- Claude can make up to 40 agentic steps (fewer for mock provider)
- Prompt caching enabled via Anthropic's ephemeral cache
- Tools are stateless - file system state passed in request body each time

### State Management
- No global state library (Redux/Zustand) - uses React Context
- File system state is source of truth
- Preview regenerates on every file system change
- Database only updated after AI response completes

### Path Resolution
- All paths normalized to start with `/` (e.g., `/App.jsx`)
- Import alias `@/` maps to `/src` in TypeScript and preview transform
- CSS imports resolved relative to importing file

### Tailwind CSS
- Version 4 with `@tailwindcss/postcss` plugin
- CDN version injected into preview iframe
- No JIT compilation in preview (uses full CDN build)
