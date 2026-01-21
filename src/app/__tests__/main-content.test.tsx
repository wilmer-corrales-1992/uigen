import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MainContent } from "../main-content";

vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div>Chat Interface</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div>File Tree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div>Code Editor</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div>Preview Frame</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div>Header Actions</div>,
}));

describe("MainContent", () => {
  it("should render with preview tab active by default", () => {
    render(<MainContent />);

    expect(screen.getByText("Preview Frame")).toBeInTheDocument();
    expect(screen.queryByText("File Tree")).not.toBeInTheDocument();
    expect(screen.queryByText("Code Editor")).not.toBeInTheDocument();
  });

  it("should toggle to code tab when clicked", async () => {
    const user = userEvent.setup();
    render(<MainContent />);

    const codeButton = screen.getByRole("tab", { name: /code/i });
    await user.click(codeButton);

    expect(screen.getByText("File Tree")).toBeInTheDocument();
    expect(screen.getByText("Code Editor")).toBeInTheDocument();
    expect(screen.queryByText("Preview Frame")).not.toBeInTheDocument();
  });

  it("should toggle back to preview tab when clicked", async () => {
    const user = userEvent.setup();
    render(<MainContent />);

    const codeButton = screen.getByRole("tab", { name: /code/i });
    await user.click(codeButton);

    expect(screen.getByText("File Tree")).toBeInTheDocument();

    const previewButton = screen.getByRole("tab", { name: /preview/i });
    await user.click(previewButton);

    expect(screen.getByText("Preview Frame")).toBeInTheDocument();
    expect(screen.queryByText("File Tree")).not.toBeInTheDocument();
    expect(screen.queryByText("Code Editor")).not.toBeInTheDocument();
  });

  it("should handle multiple rapid toggle clicks", async () => {
    const user = userEvent.setup();
    render(<MainContent />);

    const previewButton = screen.getByRole("tab", { name: /preview/i });
    const codeButton = screen.getByRole("tab", { name: /code/i });

    await user.click(codeButton);
    await user.click(previewButton);
    await user.click(codeButton);
    await user.click(previewButton);

    expect(screen.getByText("Preview Frame")).toBeInTheDocument();
    expect(screen.queryByText("File Tree")).not.toBeInTheDocument();
  });
});
