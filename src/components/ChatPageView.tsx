import type { KeyboardEvent, RefObject } from "react";
import { ArrowRight } from "lucide-react";
import { Navbar } from "./Navbar";
import { Button } from "./Button";
import { AvatarIcon } from "./AvatarIcon";
import { Input } from "./Input.tsx";
import { Textarea } from "@headlessui/react";
import { ServiceCardChat } from "./ServiceCardChat.tsx";
import { ChatBubble, type ChatMessage } from "./ChatBubble.tsx";
import { ChatInbox, type ChatPreview } from "./ChatInbox.tsx";
import { mediaUrl } from "../lib/mediaUrl";
import type { PublicListingDetails } from "../api/model";

export interface ChatPageViewProps {
    chats: ChatPreview[];
    visibleChats: ChatPreview[];
    chatsLoading: boolean;
    chatsErrored: boolean;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    activeChatId: string;
    selectedChat: ChatPreview | undefined;
    onSelectChat: (id: string) => void;
    hasSubscribeError: boolean;
    conversationRef: RefObject<HTMLDivElement | null>;
    messages: ChatMessage[];
    historyLoading: boolean;
    historyErrored: boolean;
    draft: string;
    onDraftChange: (value: string) => void;
    onTextareaKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
    onSend: () => void;
    listing: PublicListingDetails | undefined;
    listingIsError: boolean;
}

// Presentational view for the chat route 
export function ChatPageView({
    chats,
    visibleChats,
    chatsLoading,
    chatsErrored,
    searchQuery,
    onSearchChange,
    activeChatId,
    selectedChat,
    onSelectChat,
    hasSubscribeError,
    conversationRef,
    messages,
    historyLoading,
    historyErrored,
    draft,
    onDraftChange,
    onTextareaKeyDown,
    onSend,
    listing,
    listingIsError,
}: ChatPageViewProps) {
    return (
        <>
            <Navbar/>
            <main id="main-content">
                <section className=" mt-30">
                    <div className="container mx-auto -mt-20 lg:h-200 bg bg-linen rounded-2xl border-2 border-border flex flex-col lg:flex-row">
                        {/* Inbox */}
                        <section className="w-full lg:w-1/4 border-b-2 lg:border-b-0 lg:border-r-2 border-border" aria-labelledby="inbox-heading">
                            <div className="border-b-2 border-border">
                                <h1 id="inbox-heading" className="mt-10 mx-10">Inbox</h1>
                                <div className="mx-9 mb-3 mt-5">
                                    <Input
                                        placeholder="Search Chat"
                                        aria-label="Search chats"
                                        size="lg"
                                        className="m-1 bg-cream"
                                        value={searchQuery}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="max-h-72 overflow-y-auto lg:max-h-none lg:overflow-visible">
                                {chatsLoading && <p role="status" className="m-5 text-black/60">Loading chats…</p>}
                                {chatsErrored && (
                                    <p role="alert" className="m-5 text-black/60">Couldn't reach the chat server. Make sure the backend is running, then try again.</p>
                                )}
                                {!chatsLoading && !chatsErrored && chats.length === 0 && (
                                    <p role="status" className="m-5 text-black/60">No conversations yet.</p>
                                )}
                                {!chatsLoading && !chatsErrored && chats.length > 0 && visibleChats.length === 0 && (
                                    <p role="status" className="m-5 text-black/60">No conversations match your search.</p>
                                )}
                                {!chatsLoading && !chatsErrored && visibleChats.length > 0 && (
                                    <ChatInbox
                                        chats={visibleChats}
                                        selectedChatId={activeChatId}
                                        onSelectChat={onSelectChat}
                                    />
                                )}
                            </div>
                        </section>
                        <section className="w-full lg:w-2/4 bg-cream" aria-label="Conversation">
                            <div className="border-b-2 border-border flex flex-row bg-linen">
                                <div className=" flex flex-row items-center m-2 w-full">
                                    {selectedChat ? (
                                        <>
                                            <AvatarIcon firstName={selectedChat.firstName} lastName={selectedChat.lastName} size={60}/>
                                            <h2 className="text-2xl font-bold ml-2">{selectedChat.firstName} {selectedChat.lastName}</h2>
                                        </>
                                    ) : (
                                        <h2 className="text-2xl font-bold ml-2 text-black/60">
                                            {chatsLoading ? "Loading…" : chatsErrored ? "Chat unavailable" : "No conversations yet"}
                                        </h2>
                                    )}
                                </div>
                            </div>
                            <div className="m-2">
                                {hasSubscribeError && (
                                    <p role="status" className="mx-1 mb-2 text-sm text-amber-700">
                                        Live updates aren't connected for this conversation. New messages may not appear until you refresh.
                                    </p>
                                )}
                                {/* Chat Field */}
                                <div ref={conversationRef} tabIndex={-1} className="h-96 lg:h-140 overflow-y-auto px-4 py-3 flex flex-col" role="log" aria-live="polite" aria-label="Conversation messages">
                                    {activeChatId && historyLoading && <p role="status" className="text-black/60">Loading messages…</p>}
                                    {activeChatId && historyErrored && <p role="alert" className="text-black/60">Couldn't load this conversation's messages.</p>}
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
                                        onChange={(e) => onDraftChange(e.target.value)}
                                        onKeyDown={onTextareaKeyDown}
                                    />
                                    <Button
                                        className="my-auto mr-5 ml-2 shrink-0"
                                        onClick={onSend}
                                        disabled={!draft.trim()}
                                    >
                                        Send Message
                                    </Button>
                                </div>
                            </div>
                        </section>
                        <section className="hidden lg:block lg:w-1/4 border-l-2 border-border" aria-labelledby="about-service-heading">
                            <h2 id="about-service-heading" className="text-primary text-xl font-semibold-xl m-5">ABOUT THIS SERVICE</h2>
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
                                    <p role="status" className="text-black/60">Loading service…</p>
                                ) : (
                                    <p className="text-black/60">No service linked to this conversation.</p>
                                )}
                            </div>
                            <div className="border-t-2 border-border">
                                <div className="m-4">
                                    <h3 className="text-primary font-bold"> About {selectedChat?.firstName ?? "this contact"}</h3>
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
    );
}
