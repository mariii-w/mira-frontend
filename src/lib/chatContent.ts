import type { ChatOverviewResponse } from "../api/model";
import type { ChatPreview } from "../components/features/chat/ChatInbox.tsx";

// ChatMessageContent has no discriminant field; variants are told apart by which fields exist.
export function describeMessageContent(content: unknown): string {
    if (!content || typeof content !== "object") return "[unsupported message type]";

    const obj = content as Record<string, unknown>;

    if (typeof obj.content === "string") return obj.content;
    if (typeof obj.imgId === "string") return "📷 Image";
    if (typeof obj.offerId === "string" && typeof obj.price === "number") {
        if (typeof obj.status === "string") {
            return `Offer ${obj.status.toLowerCase()}: €${obj.price}`;
        }
        return `Offer: €${obj.price}`;
    }

    return "[unsupported message type]";
}

// Backend only sends a combined `name`; split it for components expecting firstName/lastName.
export function splitDisplayName(fullName: string): { firstName: string; lastName: string } {
    const trimmed = fullName.trim();
    if (!trimmed) return { firstName: "", lastName: "" };

    const [firstName, ...rest] = trimmed.split(/\s+/);
    return { firstName, lastName: rest.join(" ") };
}

// Today -> time only, otherwise a short date. Good enough for inbox previews.
export function formatChatTimestamp(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    return isToday
        ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function toChatPreview(overview: ChatOverviewResponse): ChatPreview {
    const { firstName, lastName } = splitDisplayName(overview.participant.name);

    return {
        id: overview.cid,
        listingId: overview.listingId,
        firstName,
        lastName,
        lastMessage: overview.latestMessage ? describeMessageContent(overview.latestMessage) : "No messages yet",
        timestamp: overview.latestMessageCreatedAt ? formatChatTimestamp(overview.latestMessageCreatedAt) : "",
    };
}
