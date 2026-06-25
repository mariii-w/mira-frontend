import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowRight,
} from 'lucide-react'
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from '../components/Navbar'
import { Button } from '../components/Button'
import { AvatarIcon } from '../components/AvatarIcon'
import { Input } from '../components/Input.tsx';
import { Textarea } from "@headlessui/react";
import { ServiceCardChat } from "../components/ServiceCardChat.tsx";
import { ChatBubble, type ChatMessage } from "../components/ChatBubble.tsx";
import { ChatInbox, type ChatPreview } from "../components/ChatInbox.tsx";
import { disconnectChatSocket, publishChatText, subscribeToChat } from "../lib/chatSocket.ts";
import { describeMessageContent, toChatPreview } from "../lib/chatContent.ts";
import { useAuthStore } from "../stores/auth";
import { useGetPublicListing, useHistory, useListChats } from "../api/mira.ts";
import { mediaUrl } from "../lib/mediaUrl";

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

    const { data: listingResponse } = useGetPublicListing(
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
                    self: incoming.sender.id === currentUserId,
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
                    } else {
                        unsubscribes.push(unsub);
                    }
                })
                .catch((err) => {
                    console.error("Failed to subscribe to chat", cid, err);
                });
        });

        return () => {
            cancelled = true;
            unsubscribes.forEach((unsub) => unsub());
        };
    }, [chatIdsKey, currentUserId]);

    // Tear down the shared socket when leaving the chat page entirely.
    useEffect(() => {
        return () => {
            disconnectChatSocket();
        };
    }, []);

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

    const { data: listingResponse } = useGetPublicListing(
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
                    self: incoming.sender.id === currentUserId,
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
                    } else {
                        unsubscribes.push(unsub);
                    }
                })
                .catch((err) => {
                    console.error("Failed to subscribe to chat", cid, err);
                });
        });

        return () => {
            cancelled = true;
            unsubscribes.forEach((unsub) => unsub());
        };
    }, [chatIdsKey, currentUserId]);

    // Tear down the shared socket when leaving the chat page entirely.
    useEffect(() => {
        return () => {
            disconnectChatSocket();
        };
    }, []);

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

    const { data: listingResponse } = useGetPublicListing(
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
                    self: incoming.sender.id === currentUserId,
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
                    } else {
                        unsubscribes.push(unsub);
                    }
                })
                .catch((err) => {
                    console.error("Failed to subscribe to chat", cid, err);
                });
        });

        return () => {
            cancelled = true;
            unsubscribes.forEach((unsub) => unsub());
        };
    }, [chatIdsKey, currentUserId]);

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
        <>
            <Navbar/>
            <main id="main-content">
                <section className=" mt-30">
                    <div className="container mx-auto -mt-20 lg:h-200 bg bg-linen rounded-2xl border-2 border-border flex flex-col lg:flex-row">
                        {/* Inbox */}
                        <section className="w-full lg:w-1/4 border-b-2 lg:border-b-0 lg:border-r-2 border-border">
                            <div className="border-b-2 border-border">
                                <h1 className="mt-10 mx-10">Inbox</h1>
                                <div className="mx-9 mb-3 mt-5">
                                    <Input
                                        placeholder="Search Chat"
                                        aria-label="Search chats"
                                        size="lg"
                                        className="m-1 bg-cream"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="max-h-72 overflow-y-auto lg:max-h-none lg:overflow-visible">
                                {chatsLoading && <p className="m-5 text-black/60">Loading chats…</p>}
                                {chatsErrored && (
                                    <p className="m-5 text-black/60">Couldn't reach the chat server. Make sure the backend is running, then try again.</p>
                                )}
                                {!chatsLoading && !chatsErrored && chats.length === 0 && (
                                    <p className="m-5 text-black/60">No conversations yet.</p>
                                )}
                                {!chatsLoading && !chatsErrored && chats.length > 0 && visibleChats.length === 0 && (
                                    <p className="m-5 text-black/60">No conversations match your search.</p>
                                )}
                                {!chatsLoading && !chatsErrored && visibleChats.length > 0 && (
                                    <ChatInbox
                                        chats={visibleChats}
                                        selectedChatId={activeChatId}
                                        onSelectChat={setSelectedChatId}
                                    />
                                )}
                            </div>
                        </section>
                        <section className="w-full lg:w-2/4 bg-cream">
                            <div className="border-b-2 border-border flex flex-row bg-linen">
                                <div className=" flex flex-row items-center m-2 w-full">
                                    {selectedChat ? (
                                        <>
                                            <AvatarIcon firstName={selectedChat.firstName} lastName={selectedChat.lastName} size={60}/>
                                            <p className="text-2xl font-bold ml-2">{selectedChat.firstName} {selectedChat.lastName}</p>
                                        </>
                                    ) : (
                                        <p className="text-2xl font-bold ml-2 text-black/60">
                                            {chatsLoading ? "Loading…" : chatsErrored ? "Chat unavailable" : "No conversations yet"}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="m-2">
                                {activeChatId && subscribeErrors.has(activeChatId) && (
                                    <p role="status" className="mx-1 mb-2 text-sm text-amber-700">
                                        Live updates aren't connected for this conversation. New messages may not appear until you refresh.
                                    </p>
                                )}
                                {/* Chat Field */}
                                <div ref={conversationRef} tabIndex={-1} className="h-96 lg:h-140 overflow-y-auto px-4 py-3 flex flex-col" role="log" aria-live="polite" aria-label="Conversation messages">
                                    {activeChatId && historyLoading && <p className="text-black/60">Loading messages…</p>}
                                    {activeChatId && historyErrored && <p className="text-black/60">Couldn't load this conversation's messages.</p>}
                                    {messages.map((msg) => (
                                        <ChatBubble key={msg.id} message={msg.text} self={msg.self} timestamp={msg.timestamp} />
                                    ))}
                                </div>
                                {/* Input Field */}
                                <div className="flex flex-row w-auto h-30 mx-3 lg:mx-10 m-auto border-2 border-border rounded-3xl shadow-md bg-linen shadow-linen">
                                    <Textarea
                                        className=" m-5 flex-1 h-20 resize-none"
                                        placeholder="Send a message"
                                        aria-label="Type a message"
                                        value={draft}
                                        onChange={(e) => setDraft(e.target.value)}
                                        onKeyDown={handleTextareaKeyDown}
                                    />
                                    <Button
                                        className="my-auto mr-5 ml-2 shrink-0"
                                        onClick={handleSend}
                                        disabled={!draft.trim()}
                                    >
                                        Send Message
                                    </Button>
                                </div>
                            </div>
                        </section>
                        <section className="hidden lg:block lg:w-1/4 border-l-2 border-border">
                            <p className="text-primary text-xl font-semibold-xl m-5">ABOUT THIS SERVICE</p>
                            <div className="m-4  border-border">
                                {listing ? (
                                    <ServiceCardChat
                                        pictureLink={listing.media[0] ? mediaUrl(listing.media[0].url) : undefined}
                                        link={`/listings/${listing.listingId}`}
                                        label={listing.title}
                                        tags={listing.tags}
                                        hourRate={listing.price}
                                    />
                                ) : selectedChat?.listingId && !listingIsError ? (
                                    <p className="text-black/60">Loading service…</p>
                                ) : (
                                    <p className="text-black/60">No service linked to this conversation.</p>
                                )}
                            </div>
                            <div className="border-t-2 border-border">
                                <div className="m-4">
                                    <p className="text-primary font-bold"> About {selectedChat?.firstName ?? "this contact"}</p>
                                    <div className="mt-3">
                                        <Button variant ='secondary' trailingIcon={<ArrowRight/>}>View Full Profile </Button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </section>
            </main>
        </>
    )
}