import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { ChatMessage } from "../components/ChatBubble.tsx";
import type { ChatPreview } from "../components/ChatInbox.tsx";
import { ChatPageView } from "../components/ChatPageView.tsx";
import { disconnectChatSocket, publishChatText, subscribeToChat } from "../lib/chatSocket.ts";
import { describeMessageContent, toChatPreview } from "../lib/chatContent.ts";
import { useAuthStore } from "../stores/auth";
import { useGetPublicListing, useHistory, useListChats } from "../api/mira.ts";

export const Route = createFileRoute('/chat')({
    validateSearch: (search: Record<string, unknown>) => ({
        cid: typeof search.cid === "string" ? search.cid : undefined,
    }),
    component: () => <Chat/>
})


// Websocket message, with raw id for de-duping against history.
type LiveMessage = ChatMessage & { rawId: number };
// eslint-disable-next-line react-refresh/only-export-components
function Chat() {
    const { cid: cidFromLink } = Route.useSearch();
    const [selectedChatId, setSelectedChatId] = useState<string>("");
    const [messagesByChat, setMessagesByChat] = useState<Record<string, LiveMessage[]>>({});
    const [draft, setDraft] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const currentUserId = useAuthStore((s) => s.user?.userId);
    // Ref so the subscribe effect doesn't resubscribe everything on auth rehydration.
    const currentUserIdRef = useRef(currentUserId);
    useEffect(() => {
        currentUserIdRef.current = currentUserId;
    }, [currentUserId]);
    const [subscribeErrors, setSubscribeErrors] = useState<Set<string>>(new Set());
    const conversationRef = useRef<HTMLDivElement>(null);

    const { data: chatsResponse, isLoading: chatsLoading, isError: chatsErrored } = useListChats(
        { user: currentUserId ?? "", sortby: "latest" },
        { query: { enabled: !!currentUserId } },
    );
    // Live message overrides the inbox preview line.
    const chats: ChatPreview[] = chatsResponse?.status === 200
        ? chatsResponse.data.map(toChatPreview).map((preview) => {
            const live = messagesByChat[preview.id];
            const latestLive = live?.[live.length - 1];
            return latestLive
                ? { ...preview, lastMessage: latestLive.text, timestamp: latestLive.timestamp }
                : preview;
        })
        : [];
    const chatIdsKey = chats.map((c) => c.id).join(",");
    // Search just filters the display list; subscriptions stay on the full set.
    const visibleChats = searchQuery.trim()
        ? chats.filter((c) => {
            const q = searchQuery.trim().toLowerCase();
            return (
                `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
                c.lastMessage.toLowerCase().includes(q)
            );
        })
        : chats;

    // Deep link (e.g. from a listing's "Message" button) wins, then manual pick, then the first chat.
    const activeChatId = selectedChatId || cidFromLink || chats[0]?.id || "";
    const selectedChat = chats.find((c) => c.id === activeChatId);

    const { data: historyResponse, isLoading: historyLoading, isError: historyErrored } = useHistory(
        activeChatId,
        undefined,
        { query: { enabled: !!activeChatId } },
    );

    // Backend returns newest-first; reverse for display.
    const historyMessages: ChatMessage[] = historyResponse?.status === 200
        ? historyResponse.data.items
            .slice()
            .reverse()
            .map((m) => ({
                id: `h-${m.id}`,
                text: describeMessageContent(m.content),
                self: m.sender.id === currentUserId,
                timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }))
        : [];
    const historyRawIds = new Set(
        historyResponse?.status === 200 ? historyResponse.data.items.map((m) => m.id) : [],
    );
    // Drop live messages already covered by history (avoids dupes on refetch).
    const liveMessages = (messagesByChat[activeChatId] ?? []).filter((m) => !historyRawIds.has(m.rawId));
    const messages: ChatMessage[] = [...historyMessages, ...liveMessages];

    const { data: listingResponse, isError: listingIsError } = useGetPublicListing(
        selectedChat?.listingId ?? "",
        { query: { enabled: !!selectedChat?.listingId } },
    );
    const listing = listingResponse?.status === 200 ? listingResponse.data : undefined;

    // Subscribe to every chat's topic, not just the open one.
    useEffect(() => {
        if (!chatIdsKey) return;

        const ids = chatIdsKey.split(",");
        let cancelled = false;
        const unsubscribes: Array<() => void> = [];

        ids.forEach((cid) => {
            subscribeToChat(cid, (incoming) => {
                const newMessage: LiveMessage = {
                    id: `ws-${incoming.id}`,
                    rawId: incoming.id,
                    text: describeMessageContent(incoming.content),
                    self: incoming.sender.id === currentUserIdRef.current,
                    timestamp: new Date(incoming.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                };

                setMessagesByChat((prev) => ({
                    ...prev,
                    [incoming.cid]: [...(prev[incoming.cid] ?? []), newMessage],
                }));
            })
                .then((unsub) => {
                    if (cancelled) {
                        unsub();
                        return;
                    }
                    unsubscribes.push(unsub);
                    setSubscribeErrors((prev) => {
                        if (!prev.has(cid)) return prev;
                        const next = new Set(prev);
                        next.delete(cid);
                        return next;
                    });
                })
                .catch((err) => {
                    console.error("Failed to subscribe to chat", cid, err);
                    if (!cancelled) {
                        setSubscribeErrors((prev) => new Set(prev).add(cid));
                    }
                });
        });

        return () => {
            cancelled = true;
            unsubscribes.forEach((unsub) => unsub());
        };
    }, [chatIdsKey]);

    // Tear down the shared socket when leaving the chat page entirely.
    useEffect(() => {
        return () => {
            disconnectChatSocket();
        };
    }, []);

    function handleSend() {
        const text = draft.trim();
        if (!text || !activeChatId) return;

        publishChatText(activeChatId, text).catch((err) => {
            console.error("Failed to send message", err);
        });
        setDraft("");
    }

    function handleTextareaKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <ChatPageView
            chats={chats}
            visibleChats={visibleChats}
            chatsLoading={chatsLoading}
            chatsErrored={chatsErrored}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeChatId={activeChatId}
            selectedChat={selectedChat}
            onSelectChat={setSelectedChatId}
            hasSubscribeError={!!activeChatId && subscribeErrors.has(activeChatId)}
            conversationRef={conversationRef}
            messages={messages}
            historyLoading={historyLoading}
            historyErrored={historyErrored}
            draft={draft}
            onDraftChange={setDraft}
            onTextareaKeyDown={handleTextareaKeyDown}
            onSend={handleSend}
            listing={listing}
            listingIsError={listingIsError}
        />
    )
}