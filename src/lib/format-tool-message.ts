type StrReplaceEditorArgs = {
  command: 'view' | 'create' | 'str_replace' | 'insert' | 'undo_edit';
  path: string;
  file_text?: string;
  old_str?: string;
  new_str?: string;
  insert_line?: number;
  view_range?: number[];
};

type FileManagerArgs = {
  command: 'rename' | 'delete';
  path: string;
  new_path?: string;
};

type ToolInvocation = {
  toolName: string;
  args: any;
  state: 'partial-call' | 'call' | 'result';
  result?: any;
};

export function extractFilename(path: string): string {
  if (!path) return 'file';
  const normalized = path.replace(/\\/g, '/').replace(/\/$/, '');
  const parts = normalized.split('/');
  return parts[parts.length - 1] || 'file';
}

const TOOL_MESSAGE_CONFIG: Record<
  string,
  Record<
    string,
    (args: StrReplaceEditorArgs | FileManagerArgs, isComplete: boolean) => string
  >
> = {
  str_replace_editor: {
    view: (args: StrReplaceEditorArgs, isComplete: boolean) =>
      isComplete
        ? `Viewed ${extractFilename(args.path)}`
        : `Viewing ${extractFilename(args.path)}...`,
    create: (args: StrReplaceEditorArgs, isComplete: boolean) =>
      isComplete
        ? `Created ${extractFilename(args.path)}`
        : `Creating ${extractFilename(args.path)}...`,
    str_replace: (args: StrReplaceEditorArgs, isComplete: boolean) =>
      isComplete
        ? `Edited ${extractFilename(args.path)}`
        : `Editing ${extractFilename(args.path)}...`,
    insert: (args: StrReplaceEditorArgs, isComplete: boolean) =>
      isComplete
        ? `Edited ${extractFilename(args.path)}`
        : `Editing ${extractFilename(args.path)}...`,
    undo_edit: (args: StrReplaceEditorArgs, isComplete: boolean) =>
      isComplete ? `Reverted changes` : `Reverting changes...`,
  },
  file_manager: {
    rename: (args: FileManagerArgs, isComplete: boolean) => {
      const oldName = extractFilename(args.path);
      const newName = args.new_path ? extractFilename(args.new_path) : 'file';
      return isComplete
        ? `Renamed ${oldName} to ${newName}`
        : `Renaming ${oldName}...`;
    },
    delete: (args: FileManagerArgs, isComplete: boolean) =>
      isComplete
        ? `Deleted ${extractFilename(args.path)}`
        : `Deleting ${extractFilename(args.path)}...`,
  },
};

export function formatToolMessage(toolInvocation: ToolInvocation): string {
  const { toolName, args, state } = toolInvocation;
  const isComplete = state === 'result';

  if (!TOOL_MESSAGE_CONFIG[toolName]) {
    return toolName;
  }

  const command = args?.command;
  const messageGenerator = TOOL_MESSAGE_CONFIG[toolName]?.[command];

  if (!messageGenerator || !command) {
    return toolName;
  }

  try {
    return messageGenerator(args, isComplete);
  } catch (error) {
    return toolName;
  }
}
