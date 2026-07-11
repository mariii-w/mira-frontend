import "@testing-library/jest-dom/vitest";
import { createRef } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChatPageView, type ChatPageViewProps } from "../components/features/chat/ChatPageView";
import type { ChatPreview } from "../components/features/chat/ChatInbox";
import type { ChatMessage } from "../components/features/chat/ChatBubble";
import type { PublicListingDetails, VerifiedCredentialResponse } from "../api/model";
import { CredentialType, PublicationStatus } from "../api/model";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    className,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode; to: string }) => (
    <a href={to} className={className} {...props}>{children}</a>
  ),
}));

function makeChat(overrides: Partial<ChatPreview> = {}): ChatPreview {
  return {
    id: "chat-1",
    listingId: "listing-1",
    userId: "user-2",
    firstName: "Anna",
    lastName: "Muster",
    lastMessage: "Sounds good!",
    timestamp: "10:30",
    ...overrides,
  };
}

function makeListing(overrides: Partial<PublicListingDetails> = {}): PublicListingDetails {
  return {
    listingId: "listing-1",
    tags: [],
    title: "PC Repair",
    description: "Fixing computers",
    price: 40,
    publicationStatus: PublicationStatus.ACTIVE,
    author: { userId: "user-2", name: "Anna", surname: "Muster" },
    publishedAt: null,
    location: { city: "Hof", postalCode: "95028", serviceRadiusKm: 10 },
    createdAt: "2026-06-01T10:00:00Z",
    updatedAt: "2026-06-01T10:00:00Z",
    media: [],
    ...overrides,
  };
}

function makeVerifiedCredential(
  overrides: Partial<VerifiedCredentialResponse> = {},
): VerifiedCredentialResponse {
  return {
    credentialType: CredentialType.STUDENT_VERIFIED,
    name: "Student status",
    description: "Verified student status",
    expiresAt: null,
    verifiedAt: "2026-06-01T10:00:00Z",
    ...overrides,
  };
}

function makeProps(overrides: Partial<ChatPageViewProps> = {}): ChatPageViewProps {
  const chats = [makeChat()];
  return {
    chats,
    visibleChats: chats,
    chatsLoading: false,
    chatsErrored: false,
    searchQuery: "",
    onSearchChange: vi.fn(),
    activeChatId: "",
    selectedChat: undefined,
    onSelectChat: vi.fn(),
    hasSubscribeError: false,
    conversationRef: createRef<HTMLDivElement>(),
    messages: [] as ChatMessage[],
    historyLoading: false,
    historyErrored: false,
    draft: "",
    onDraftChange: vi.fn(),
    onTextareaKeyDown: vi.fn(),
    onSend: vi.fn(),
    listing: undefined,
    listingIsError: false,
    contactVerifiedCredentials: [],
    onViewProfile: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("<ChatPageView /> mobile view switching", () => {
  it("shows the inbox and hides the conversation region on initial render", () => {
    render(<ChatPageView {...makeProps()} />);
    expect(screen.getByRole("region", { name: "Inbox" }).className).not.toMatch(/\bhidden\b/);
    expect(screen.getByRole("region", { name: "Conversation" }).className).toMatch(/\bhidden\b/);
  });

  it("does not steal focus on initial mount", () => {
    render(<ChatPageView {...makeProps()} />);
    expect(document.activeElement).not.toBe(screen.getByRole("heading", { name: "Inbox" }));
  });

  it("selecting a chat calls onSelectChat and switches to the conversation view", () => {
    const onSelectChat = vi.fn();
    render(<ChatPageView {...makeProps({ onSelectChat })} />);

    fireEvent.click(screen.getByText("Anna Muster"));

    expect(onSelectChat).toHaveBeenCalledWith("chat-1");
    expect(screen.getByRole("region", { name: "Conversation" }).className).not.toMatch(/\bhidden\b/);
    expect(screen.getByRole("region", { name: "Inbox" }).className).toMatch(/\bhidden\b/);
  });

  it("moves focus to the conversation log after selecting a chat", async () => {
    const conversationRef = createRef<HTMLDivElement>();
    render(<ChatPageView {...makeProps({ conversationRef })} />);

    fireEvent.click(screen.getByText("Anna Muster"));

    await waitFor(() => expect(document.activeElement).toBe(conversationRef.current));
  });

  it("back button returns to the inbox view and moves focus to the Inbox heading", async () => {
    render(<ChatPageView {...makeProps()} />);

    fireEvent.click(screen.getByText("Anna Muster"));
    fireEvent.click(screen.getByRole("button", { name: "Back to inbox" }));

    expect(screen.getByRole("region", { name: "Inbox" }).className).not.toMatch(/\bhidden\b/);
    expect(screen.getByRole("region", { name: "Conversation" }).className).toMatch(/\bhidden\b/);
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Inbox" })));
  });
});

describe("<ChatPageView /> about-service disclosure", () => {
  it("does not render the mobile about-service disclosure without a selected chat", () => {
    render(<ChatPageView {...makeProps({ selectedChat: undefined })} />);
    expect(screen.queryByText("About this service")).not.toBeInTheDocument();
  });

  it("renders the mobile about-service disclosure once a chat is selected", () => {
    render(<ChatPageView {...makeProps({ selectedChat: makeChat() })} />);
    expect(screen.getByText("About this service")).toBeInTheDocument();
  });

  it("shows listing info in the disclosure when a listing is linked", () => {
    render(
      <ChatPageView
        {...makeProps({ selectedChat: makeChat(), listing: makeListing() })}
      />,
    );
    expect(screen.getAllByText("PC Repair").length).toBeGreaterThan(0);
  });
});

describe("<ChatPageView /> conversation header", () => {
  it("shows the counterpart's name when a chat is selected", () => {
    render(<ChatPageView {...makeProps({ selectedChat: makeChat() })} />);
    expect(screen.getByRole("heading", { name: "Anna Muster" })).toBeInTheDocument();
  });

  it("shows verified credentials on focus", () => {
    render(
      <ChatPageView
        {...makeProps({
          selectedChat: makeChat(),
          contactVerifiedCredentials: [makeVerifiedCredential({ name: "Student status" })],
        })}
      />,
    );
    fireEvent.focus(screen.getByText("Verified"));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Student status");
  });
});

describe("<ChatPageView /> search and message input", () => {
  it("calls onSearchChange when typing in the search field", () => {
    const onSearchChange = vi.fn();
    render(<ChatPageView {...makeProps({ onSearchChange })} />);
    fireEvent.change(screen.getByLabelText("Search chats"), { target: { value: "Anna" } });
    expect(onSearchChange).toHaveBeenCalledWith("Anna");
  });

  it("disables the send button when the draft is empty", () => {
    render(<ChatPageView {...makeProps({ draft: "" })} />);
    expect(screen.getByRole("button", { name: "Send Message" })).toBeDisabled();
  });

  it("calls onSend when the draft has content and the button is clicked", () => {
    const onSend = vi.fn();
    render(<ChatPageView {...makeProps({ draft: "Hello there", onSend })} />);
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));
    expect(onSend).toHaveBeenCalled();
  });
});
