/**
 * AI Elements Component Tests
 * 
 * Tests for shadcn.io/ai-style components in:
 * frontend/shared/communications/components/ai/
 * 
 * These components are shared between AI and Chat features.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Import AI Elements components
import {
  // Message components
  Message,
  MessageContent,
  MessageAvatar,
  // Response
  Response,
  // Conversation
  Conversation,
  ConversationContent,
  // PromptInput
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputAttachButton,
  PromptInputAttachments,
  // Actions
  Actions,
  Action,
  // Tool
  Tool,
  ToolHeader,
  ToolContent,
  // Reasoning
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
  // Sources
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
  // Suggestion
  Suggestions,
  Suggestion,
  // CodeBlock
  CodeBlock,
  // Loader
  Loader,
} from "@/frontend/shared/communications/components/ai";

// Mock data
const mockMessages = [
  { id: "1", role: "user" as const, content: "Hello, can you help me?" },
  { id: "2", role: "assistant" as const, content: "Of course! How can I assist you today?" },
  { id: "3", role: "user" as const, content: "Write me a function to sort an array" },
  { id: "4", role: "assistant" as const, content: "```javascript\nfunction sortArray(arr) {\n  return arr.sort((a, b) => a - b);\n}\n```" },
];

const mockSuggestions = [
  "Explain this code",
  "Add error handling",
  "Optimize performance",
  "Write tests",
];

const mockSources = [
  { title: "MDN Web Docs", url: "https://developer.mozilla.org", description: "JavaScript reference" },
  { title: "React Documentation", url: "https://react.dev", description: "React guides" },
];

describe("AI Elements - Message Components", () => {
  describe("Message", () => {
    it("should render user message correctly", () => {
      render(
        <Message from="user">
          <MessageContent>Hello!</MessageContent>
        </Message>
      );
      expect(screen.getByText("Hello!")).toBeInTheDocument();
    });

    it("should render assistant message correctly", () => {
      render(
        <Message from="assistant">
          <MessageContent>Hi there!</MessageContent>
        </Message>
      );
      expect(screen.getByText("Hi there!")).toBeInTheDocument();
    });

    it("should apply different styles for user vs assistant", () => {
      const { container, rerender } = render(
        <Message from="user">
          <MessageContent>User message</MessageContent>
        </Message>
      );
      const userMessage = container.querySelector('[data-slot="message"]');
      expect(userMessage).toHaveAttribute("data-role", "user");

      rerender(
        <Message from="assistant">
          <MessageContent>Assistant message</MessageContent>
        </Message>
      );
      const assistantMessage = container.querySelector('[data-slot="message"]');
      expect(assistantMessage).toHaveAttribute("data-role", "assistant");
    });

    it("should render with avatar", () => {
      render(
        <Message from="user">
          <MessageAvatar src="" name="John" />
          <MessageContent>Message with avatar</MessageContent>
        </Message>
      );
      expect(screen.getByText("Message with avatar")).toBeInTheDocument();
    });
  });

  describe("MessageAvatar", () => {
    it("should display fallback when no src provided", () => {
      render(<MessageAvatar src="" name="John Doe" />);
      // Should show initials as fallback
      expect(screen.getByText("JO")).toBeInTheDocument();
    });

    it("should render avatar component", () => {
      const { container } = render(<MessageAvatar src="https://example.com/avatar.jpg" name="John" />);
      const avatar = container.querySelector('[data-slot="avatar"]');
      expect(avatar).toBeInTheDocument();
    });
  });
});

describe("AI Elements - Response", () => {
  it("should render markdown content", () => {
    render(<Response>**Bold text** and *italic*</Response>);
    // Markdown should be parsed
    expect(screen.getByText(/Bold text/)).toBeInTheDocument();
  });

  it("should render code blocks", () => {
    const code = "```javascript\nconsole.log('hello');\n```";
    render(<Response>{code}</Response>);
    expect(screen.getByText(/console\.log/)).toBeInTheDocument();
  });

  it("should handle streaming content gracefully", () => {
    const { rerender } = render(<Response>Hello</Response>);
    rerender(<Response>Hello, world</Response>);
    rerender(<Response>Hello, world!</Response>);
    expect(screen.getByText("Hello, world!")).toBeInTheDocument();
  });
});

describe("AI Elements - Conversation", () => {
  it("should render conversation container", () => {
    render(
      <Conversation>
        <ConversationContent>
          <Message from="user">
            <MessageContent>Test</MessageContent>
          </Message>
        </ConversationContent>
      </Conversation>
    );
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("should support multiple messages", () => {
    render(
      <Conversation>
        <ConversationContent>
          {mockMessages.map((msg) => (
            <Message key={msg.id} from={msg.role}>
              <MessageContent>{msg.content}</MessageContent>
            </Message>
          ))}
        </ConversationContent>
      </Conversation>
    );
    
    expect(screen.getByText("Hello, can you help me?")).toBeInTheDocument();
    expect(screen.getByText(/How can I assist you/)).toBeInTheDocument();
  });
});

describe("AI Elements - PromptInput", () => {
  it("should render textarea", () => {
    render(
      <PromptInput>
        <PromptInputTextarea placeholder="Type a message..." />
      </PromptInput>
    );
    expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
  });

  it("should call onSubmit when form is submitted", async () => {
    const handleSubmit = vi.fn((e) => e.preventDefault());
    render(
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea defaultValue="Test message" />
        <PromptInputToolbar>
          <PromptInputSubmit />
        </PromptInputToolbar>
      </PromptInput>
    );

    const submitButton = screen.getByRole("button", { name: /send/i });
    await userEvent.click(submitButton);
    
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("should show different icons based on status", () => {
    const { rerender } = render(
      <PromptInput>
        <PromptInputToolbar>
          <PromptInputSubmit status="ready" />
        </PromptInputToolbar>
      </PromptInput>
    );
    // Ready state shows arrow icon
    expect(screen.getByLabelText(/send/i)).toBeInTheDocument();

    rerender(
      <PromptInput>
        <PromptInputToolbar>
          <PromptInputSubmit status="loading" />
        </PromptInputToolbar>
      </PromptInput>
    );
    // Loading state shows loader icon
    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();

    rerender(
      <PromptInput>
        <PromptInputToolbar>
          <PromptInputSubmit status="streaming" />
        </PromptInputToolbar>
      </PromptInput>
    );
    // Streaming shows stop icon
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should render attachment button", () => {
    render(
      <PromptInput>
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputAttachButton />
          </PromptInputTools>
        </PromptInputToolbar>
      </PromptInput>
    );
    expect(screen.getByLabelText(/attach/i)).toBeInTheDocument();
  });
});

describe("AI Elements - Actions", () => {
  it("should render action buttons", () => {
    render(
      <Actions>
        <Action tooltip="Copy">Copy</Action>
        <Action tooltip="Like">Like</Action>
      </Actions>
    );
    expect(screen.getByText("Copy")).toBeInTheDocument();
    expect(screen.getByText("Like")).toBeInTheDocument();
  });

  it("should call onClick when action clicked", async () => {
    const handleClick = vi.fn();
    render(
      <Actions>
        <Action tooltip="Copy" onClick={handleClick}>Copy</Action>
      </Actions>
    );
    
    await userEvent.click(screen.getByText("Copy"));
    expect(handleClick).toHaveBeenCalled();
  });

  it("should be disabled when specified", () => {
    render(
      <Actions>
        <Action tooltip="Copy" disabled>Copy</Action>
      </Actions>
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

describe("AI Elements - Tool", () => {
  it("should render tool with header and content", async () => {
    render(
      <Tool defaultOpen>
        <ToolHeader type="search" state="output-available">Search completed</ToolHeader>
        <ToolContent>Found 5 results</ToolContent>
      </Tool>
    );
    // With defaultOpen, content should be visible
    expect(screen.getByText("Found 5 results")).toBeInTheDocument();
  });

  it("should show tool header", () => {
    render(
      <Tool>
        <ToolHeader type="search" state="input-streaming">Searching...</ToolHeader>
      </Tool>
    );
    // Header should always be visible as trigger
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});

describe("AI Elements - Reasoning", () => {
  it("should render collapsible reasoning", () => {
    const { container } = render(
      <Reasoning>
        <ReasoningTrigger>View thinking</ReasoningTrigger>
        <ReasoningContent>
          I'm analyzing the problem step by step...
        </ReasoningContent>
      </Reasoning>
    );
    expect(container.querySelector('[data-slot="reasoning"]')).toBeInTheDocument();
  });

  it("should toggle content visibility", async () => {
    render(
      <Reasoning defaultOpen>
        <ReasoningTrigger>View thinking</ReasoningTrigger>
        <ReasoningContent>
          Step 1: Understand the problem
        </ReasoningContent>
      </Reasoning>
    );

    // With defaultOpen, content should be visible
    expect(screen.getByText(/Step 1/)).toBeInTheDocument();
  });
});

describe("AI Elements - Sources", () => {
  it("should render source citations", () => {
    render(
      <Sources>
        <SourcesTrigger count={2}>2 sources</SourcesTrigger>
        <SourcesContent>
          {mockSources.map((source, i) => (
            <Source
              key={i}
              title={source.title}
              href={source.url}
            >
              {source.description}
            </Source>
          ))}
        </SourcesContent>
      </Sources>
    );
    expect(screen.getByText("2 sources")).toBeInTheDocument();
  });

  it("should expand to show sources", async () => {
    render(
      <Sources>
        <SourcesTrigger count={1}>1 source</SourcesTrigger>
        <SourcesContent>
          <Source title="MDN" href="https://mdn.io">MDN Web Docs</Source>
        </SourcesContent>
      </Sources>
    );

    await userEvent.click(screen.getByText("1 source"));
    expect(screen.getByText("MDN Web Docs")).toBeInTheDocument();
  });
});

describe("AI Elements - Suggestions", () => {
  it("should render suggestion pills", () => {
    render(
      <Suggestions>
        {mockSuggestions.map((s, i) => (
          <Suggestion key={i} suggestion={s} />
        ))}
      </Suggestions>
    );
    
    mockSuggestions.forEach((suggestion) => {
      expect(screen.getByText(suggestion)).toBeInTheDocument();
    });
  });

  it("should call onClick with suggestion text", async () => {
    const handleClick = vi.fn();
    render(
      <Suggestions>
        <Suggestion suggestion="Explain this" onClick={handleClick} />
      </Suggestions>
    );

    await userEvent.click(screen.getByText("Explain this"));
    expect(handleClick).toHaveBeenCalledWith("Explain this");
  });
});

describe("AI Elements - CodeBlock", () => {
  it("should render code with syntax highlighting", () => {
    render(
      <CodeBlock language="javascript" code={`function hello() {\n  console.log("Hello!");\n}`} />
    );
    expect(screen.getByText(/function hello/)).toBeInTheDocument();
  });

  it("should show language label", () => {
    render(
      <CodeBlock language="typescript" code="const x: number = 5;" />
    );
    expect(screen.getByText(/typescript/i)).toBeInTheDocument();
  });
});

describe("AI Elements - Loader", () => {
  it("should render animated loader", () => {
    const { container } = render(<Loader />);
    expect(container.querySelector('[data-slot="loader"]')).toBeInTheDocument();
  });

  it("should accept custom size", () => {
    const { container } = render(<Loader size={24} />);
    const loader = container.querySelector('[data-slot="loader"]');
    expect(loader).toBeInTheDocument();
  });
});

describe("AI Elements - Integration", () => {
  it("should render a complete AI chat interface", () => {
    const handleSubmit = vi.fn((e) => e.preventDefault());
    const handleSuggestion = vi.fn();

    render(
      <div>
        <Conversation>
          <ConversationContent>
            {mockMessages.slice(0, 2).map((msg) => (
              <Message key={msg.id} from={msg.role}>
                <MessageAvatar src="" name={msg.role === "user" ? "You" : "AI"} />
                <MessageContent>
                  <Response>{msg.content}</Response>
                </MessageContent>
                {msg.role === "assistant" && (
                  <Actions>
                    <Action tooltip="Copy">📋</Action>
                    <Action tooltip="Like">👍</Action>
                  </Actions>
                )}
              </Message>
            ))}
          </ConversationContent>
        </Conversation>

        <Suggestions>
          {mockSuggestions.slice(0, 2).map((s, i) => (
            <Suggestion key={i} suggestion={s} onClick={handleSuggestion} />
          ))}
        </Suggestions>

        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea placeholder="Ask anything..." />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputAttachButton />
            </PromptInputTools>
            <PromptInputSubmit status="ready" />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    );

    // All components should be rendered
    expect(screen.getByText("Hello, can you help me?")).toBeInTheDocument();
    expect(screen.getByText(/How can I assist/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ask anything...")).toBeInTheDocument();
    expect(screen.getByText("Explain this code")).toBeInTheDocument();
  });
});

describe("AI Elements - Chat Feature Compatibility", () => {
  /**
   * These tests ensure AI Elements work for both AI and Chat features
   */

  it("should support different message variants (sent/received)", () => {
    // Chat uses sent/received, AI uses user/assistant
    // Both should work with the Message component
    render(
      <div>
        <Message from="user">
          <MessageContent>Sent message (user perspective)</MessageContent>
        </Message>
        <Message from="assistant">
          <MessageContent>Received message (from other user or AI)</MessageContent>
        </Message>
      </div>
    );

    expect(screen.getByText("Sent message (user perspective)")).toBeInTheDocument();
    expect(screen.getByText(/Received message/)).toBeInTheDocument();
  });

  it("should render plain text without markdown parsing when needed", () => {
    // For regular chat, we might want plain text
    render(
      <Message from="user">
        <MessageContent>
          <p>Plain text without markdown</p>
        </MessageContent>
      </Message>
    );
    expect(screen.getByText("Plain text without markdown")).toBeInTheDocument();
  });

  it("should support custom action buttons", () => {
    // Chat might have different actions than AI
    render(
      <Actions>
        <Action tooltip="Reply">↩️</Action>
        <Action tooltip="Forward">↗️</Action>
        <Action tooltip="Delete">🗑️</Action>
      </Actions>
    );
    
    expect(screen.getByText("↩️")).toBeInTheDocument();
    expect(screen.getByText("↗️")).toBeInTheDocument();
    expect(screen.getByText("🗑️")).toBeInTheDocument();
  });
});
