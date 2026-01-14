import { test, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ToolInvocationBadge } from '../ToolInvocationBadge';

afterEach(() => {
  cleanup();
});

test('shows spinner for call state', () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: 'str_replace_editor',
        args: { command: 'create', path: '/App.tsx' },
        state: 'call',
      }}
    />
  );

  const spinner = screen.getByLabelText('In progress');
  expect(spinner).toBeDefined();
});

test('shows spinner for partial-call state', () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: 'str_replace_editor',
        args: { command: 'create', path: '/App.tsx' },
        state: 'partial-call',
      }}
    />
  );

  const spinner = screen.getByLabelText('In progress');
  expect(spinner).toBeDefined();
});

test('shows green dot for result state', () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: 'str_replace_editor',
        args: { command: 'create', path: '/App.tsx' },
        state: 'result',
      }}
    />
  );

  const completedIndicator = screen.getByLabelText('Completed');
  expect(completedIndicator).toBeDefined();
  expect(completedIndicator.className).toContain('bg-emerald-500');
});

test('displays create operation message in progress', () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: 'str_replace_editor',
        args: { command: 'create', path: '/Button.jsx' },
        state: 'call',
      }}
    />
  );

  expect(screen.getByText('Creating Button.jsx...')).toBeDefined();
});

test('displays create operation message completed', () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: 'str_replace_editor',
        args: { command: 'create', path: '/Button.jsx' },
        state: 'result',
      }}
    />
  );

  expect(screen.getByText('Created Button.jsx')).toBeDefined();
});

test('displays edit operation message', () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: 'str_replace_editor',
        args: { command: 'str_replace', path: '/Card.tsx' },
        state: 'result',
      }}
    />
  );

  expect(screen.getByText('Edited Card.tsx')).toBeDefined();
});

test('displays delete operation message', () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: 'file_manager',
        args: { command: 'delete', path: '/OldFile.tsx' },
        state: 'result',
      }}
    />
  );

  expect(screen.getByText('Deleted OldFile.tsx')).toBeDefined();
});

test('displays rename operation message', () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: 'file_manager',
        args: {
          command: 'rename',
          path: '/Old.tsx',
          new_path: '/New.tsx',
        },
        state: 'result',
      }}
    />
  );

  expect(screen.getByText('Renamed Old.tsx to New.tsx')).toBeDefined();
});

test('has correct CSS classes for container', () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: 'str_replace_editor',
        args: { command: 'create', path: '/App.tsx' },
        state: 'result',
      }}
    />
  );

  const badge = container.firstChild as HTMLElement;
  expect(badge.className).toContain('inline-flex');
  expect(badge.className).toContain('items-center');
  expect(badge.className).toContain('gap-2');
  expect(badge.className).toContain('px-3');
  expect(badge.className).toContain('py-1.5');
  expect(badge.className).toContain('bg-neutral-50');
  expect(badge.className).toContain('rounded-lg');
  expect(badge.className).toContain('text-xs');
  expect(badge.className).toContain('border');
  expect(badge.className).toContain('border-neutral-200');
});

test('does NOT have font-mono class', () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: 'str_replace_editor',
        args: { command: 'create', path: '/App.tsx' },
        state: 'result',
      }}
    />
  );

  const badge = container.firstChild as HTMLElement;
  expect(badge.className).not.toContain('font-mono');
});

test('uses formatToolMessage utility correctly', () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: 'str_replace_editor',
        args: { command: 'create', path: '/src/components/ui/Button.tsx' },
        state: 'result',
      }}
    />
  );

  expect(screen.getByText('Created Button.tsx')).toBeDefined();
});

test('handles unknown tools gracefully', () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: 'unknown_tool',
        args: { command: 'test', path: '/App.tsx' },
        state: 'result',
      }}
    />
  );

  expect(screen.getByText('unknown_tool')).toBeDefined();
});

test('has proper aria-label for spinner', () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: 'str_replace_editor',
        args: { command: 'create', path: '/App.tsx' },
        state: 'call',
      }}
    />
  );

  const spinner = screen.getByLabelText('In progress');
  expect(spinner).toBeDefined();
});

test('has proper aria-label for completed indicator', () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: 'str_replace_editor',
        args: { command: 'create', path: '/App.tsx' },
        state: 'result',
      }}
    />
  );

  const completedIndicator = screen.getByLabelText('Completed');
  expect(completedIndicator).toBeDefined();
});
