import { describe, it, expect } from 'vitest';
import { formatToolMessage, extractFilename } from '../format-tool-message';

describe('extractFilename', () => {
  it('extracts filename from simple path', () => {
    expect(extractFilename('/App.tsx')).toBe('App.tsx');
  });

  it('extracts filename from nested path', () => {
    expect(extractFilename('/src/components/Button.tsx')).toBe('Button.tsx');
  });

  it('handles path without leading slash', () => {
    expect(extractFilename('App.tsx')).toBe('App.tsx');
  });

  it('returns "file" for empty string', () => {
    expect(extractFilename('')).toBe('file');
  });

  it('handles Windows-style paths', () => {
    expect(extractFilename('src\\Button.tsx')).toBe('Button.tsx');
  });

  it('handles trailing slash', () => {
    expect(extractFilename('/src/components/')).toBe('components');
  });

  it('handles deeply nested paths', () => {
    expect(extractFilename('/src/app/components/ui/forms/Input.tsx')).toBe('Input.tsx');
  });
});

describe('formatToolMessage - str_replace_editor', () => {
  describe('create command', () => {
    it('formats in-progress message', () => {
      const toolInvocation = {
        toolName: 'str_replace_editor',
        args: { command: 'create', path: '/App.tsx' },
        state: 'call' as const,
      };
      expect(formatToolMessage(toolInvocation)).toBe('Creating App.tsx...');
    });

    it('formats completed message', () => {
      const toolInvocation = {
        toolName: 'str_replace_editor',
        args: { command: 'create', path: '/src/components/Button.tsx' },
        state: 'result' as const,
      };
      expect(formatToolMessage(toolInvocation)).toBe('Created Button.tsx');
    });

    it('handles partial-call state', () => {
      const toolInvocation = {
        toolName: 'str_replace_editor',
        args: { command: 'create', path: '/Card.tsx' },
        state: 'partial-call' as const,
      };
      expect(formatToolMessage(toolInvocation)).toBe('Creating Card.tsx...');
    });
  });

  describe('view command', () => {
    it('formats in-progress message', () => {
      const toolInvocation = {
        toolName: 'str_replace_editor',
        args: { command: 'view', path: '/Button.tsx' },
        state: 'call' as const,
      };
      expect(formatToolMessage(toolInvocation)).toBe('Viewing Button.tsx...');
    });

    it('formats completed message', () => {
      const toolInvocation = {
        toolName: 'str_replace_editor',
        args: { command: 'view', path: '/Button.tsx' },
        state: 'result' as const,
      };
      expect(formatToolMessage(toolInvocation)).toBe('Viewed Button.tsx');
    });
  });

  describe('str_replace command', () => {
    it('formats in-progress message', () => {
      const toolInvocation = {
        toolName: 'str_replace_editor',
        args: { command: 'str_replace', path: '/Card.tsx' },
        state: 'call' as const,
      };
      expect(formatToolMessage(toolInvocation)).toBe('Editing Card.tsx...');
    });

    it('formats completed message', () => {
      const toolInvocation = {
        toolName: 'str_replace_editor',
        args: { command: 'str_replace', path: '/Card.tsx' },
        state: 'result' as const,
      };
      expect(formatToolMessage(toolInvocation)).toBe('Edited Card.tsx');
    });
  });

  describe('insert command', () => {
    it('formats in-progress message', () => {
      const toolInvocation = {
        toolName: 'str_replace_editor',
        args: { command: 'insert', path: '/Form.tsx' },
        state: 'call' as const,
      };
      expect(formatToolMessage(toolInvocation)).toBe('Editing Form.tsx...');
    });

    it('formats completed message', () => {
      const toolInvocation = {
        toolName: 'str_replace_editor',
        args: { command: 'insert', path: '/Form.tsx' },
        state: 'result' as const,
      };
      expect(formatToolMessage(toolInvocation)).toBe('Edited Form.tsx');
    });
  });

  describe('undo_edit command', () => {
    it('formats in-progress message', () => {
      const toolInvocation = {
        toolName: 'str_replace_editor',
        args: { command: 'undo_edit', path: '/Button.tsx' },
        state: 'call' as const,
      };
      expect(formatToolMessage(toolInvocation)).toBe('Reverting changes...');
    });

    it('formats completed message', () => {
      const toolInvocation = {
        toolName: 'str_replace_editor',
        args: { command: 'undo_edit', path: '/Button.tsx' },
        state: 'result' as const,
      };
      expect(formatToolMessage(toolInvocation)).toBe('Reverted changes');
    });
  });
});

describe('formatToolMessage - file_manager', () => {
  describe('rename command', () => {
    it('formats in-progress message', () => {
      const toolInvocation = {
        toolName: 'file_manager',
        args: { command: 'rename', path: '/old.tsx', new_path: '/new.tsx' },
        state: 'call' as const,
      };
      expect(formatToolMessage(toolInvocation)).toBe('Renaming old.tsx...');
    });

    it('formats completed message', () => {
      const toolInvocation = {
        toolName: 'file_manager',
        args: { command: 'rename', path: '/old.tsx', new_path: '/new.tsx' },
        state: 'result' as const,
      };
      expect(formatToolMessage(toolInvocation)).toBe('Renamed old.tsx to new.tsx');
    });

    it('extracts filenames from nested paths', () => {
      const toolInvocation = {
        toolName: 'file_manager',
        args: {
          command: 'rename',
          path: '/src/components/OldButton.tsx',
          new_path: '/src/components/NewButton.tsx',
        },
        state: 'result' as const,
      };
      expect(formatToolMessage(toolInvocation)).toBe(
        'Renamed OldButton.tsx to NewButton.tsx'
      );
    });

    it('handles missing new_path', () => {
      const toolInvocation = {
        toolName: 'file_manager',
        args: { command: 'rename', path: '/old.tsx' },
        state: 'result' as const,
      };
      expect(formatToolMessage(toolInvocation)).toBe('Renamed old.tsx to file');
    });
  });

  describe('delete command', () => {
    it('formats in-progress message', () => {
      const toolInvocation = {
        toolName: 'file_manager',
        args: { command: 'delete', path: '/Button.tsx' },
        state: 'call' as const,
      };
      expect(formatToolMessage(toolInvocation)).toBe('Deleting Button.tsx...');
    });

    it('formats completed message', () => {
      const toolInvocation = {
        toolName: 'file_manager',
        args: { command: 'delete', path: '/src/components/Button.tsx' },
        state: 'result' as const,
      };
      expect(formatToolMessage(toolInvocation)).toBe('Deleted Button.tsx');
    });
  });
});

describe('formatToolMessage - edge cases', () => {
  it('returns tool name for unknown tool', () => {
    const toolInvocation = {
      toolName: 'unknown_tool',
      args: { command: 'create', path: '/App.tsx' },
      state: 'result' as const,
    };
    expect(formatToolMessage(toolInvocation)).toBe('unknown_tool');
  });

  it('returns tool name for unknown command', () => {
    const toolInvocation = {
      toolName: 'str_replace_editor',
      args: { command: 'unknown_command', path: '/App.tsx' },
      state: 'result' as const,
    };
    expect(formatToolMessage(toolInvocation)).toBe('str_replace_editor');
  });

  it('returns tool name for missing args', () => {
    const toolInvocation = {
      toolName: 'str_replace_editor',
      args: undefined as any,
      state: 'result' as const,
    };
    expect(formatToolMessage(toolInvocation)).toBe('str_replace_editor');
  });

  it('returns tool name for missing command', () => {
    const toolInvocation = {
      toolName: 'str_replace_editor',
      args: { path: '/App.tsx' },
      state: 'result' as const,
    };
    expect(formatToolMessage(toolInvocation)).toBe('str_replace_editor');
  });

  it('handles missing path in args', () => {
    const toolInvocation = {
      toolName: 'str_replace_editor',
      args: { command: 'create', path: '' },
      state: 'result' as const,
    };
    expect(formatToolMessage(toolInvocation)).toBe('Created file');
  });

  it('handles null values gracefully', () => {
    const toolInvocation = {
      toolName: 'str_replace_editor',
      args: { command: 'create', path: null as any },
      state: 'result' as const,
    };
    expect(formatToolMessage(toolInvocation)).toBe('Created file');
  });
});
