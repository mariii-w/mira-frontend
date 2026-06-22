import { useEffect, useState, type KeyboardEvent } from "react";
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
import { useAuthStore } from "../stores/auth";

// content shape unconfirmed against a live backend response 
function extractMessageText(content: unknown): string {
    if (typeof content === "string") return content;
    if (content && typeof content === "object") {
        const obj = content as Record<string, unknown>;
        if (typeof obj.content === "string") return obj.content;
        const wrapped = obj.Text as Record<string, unknown> | undefined;
        if (wrapped && typeof wrapped.content === "string") return wrapped.content;
    }
    return "[unsupported message type]";
}

export const Route = createFileRoute('/chat')({
    component: () => <Chat/>
})

// ---------------------------------------------------------------------------
// Dummy data — swap for real API data later
// ---------------------------------------------------------------------------

const DUMMY_CHATS: ChatPreview[] = [
    { id: "1", firstName: "Rudi", lastName: "Kerol", lastMessage: "Sure, I can fix that for you tomorrow.", timestamp: "10:24", unread: true },
    { id: "2", firstName: "Mara", lastName: "Voss", lastMessage: "Thanks, talk soon!", timestamp: "Yesterday" },
    { id: "3", firstName: "Tobi", lastName: "Lang", lastMessage: "Can you send the invoice?", timestamp: "Mon" },
    { id: "4", firstName: "Elena", lastName: "Brandt", lastMessage: "Looks great, approved.", timestamp: "Sun" },
];

const DUMMY_MESSAGES: Record<string, ChatMessage[]> = {
    "1": [
        { id: "m1", text: "Hi! I saw your listing for PC support, is the slot tomorrow still free?", self: true, timestamp: "10:01" },
        { id: "m2", text: "Hey! Yes it is, what time works for you?", self: false, timestamp: "10:03" },
        { id: "m3", text: "10am would be perfect.", self: true, timestamp: "10:05" },
        { id: "m4", text: "Sure, I can fix that for you tomorrow.", self: false, timestamp: "10:24" },
        { id: "m5", text: "Great! Should I bring anything specific?", self: true, timestamp: "10:26" },
        { id: "m6", text: "Just bring your laptop and any external drives if you have them.", self: false, timestamp: "10:28" },
        { id: "m7", text: "Perfect, will do. See you tomorrow!", self: true, timestamp: "10:30" },
        { id: "m8", text: "See you then! Looking forward to it.", self: false, timestamp: "10:31" },
        { id: "m9", text: "One more thing - do you accept card payments?", self: true, timestamp: "10:33" },
        { id: "m10", text: "Yes, I accept all major cards and also cash if that works better for you.", self: false, timestamp: "10:35" },
        { id: "m11", text: "Card is fine, thanks!", self: true, timestamp: "10:36" },
    ],
    "2": [
        { id: "m1", text: "The laptop is running again, thank you so much!", self: true, timestamp: "Yesterday" },
        { id: "m2", text: "Glad to hear it. Let me know if anything else comes up.", self: false, timestamp: "Yesterday" },
        { id: "m3", text: "Thanks, talk soon!", self: true, timestamp: "Yesterday" },
    ],
    "3": [
        { id: "m1", text: "Job's done, everything is set up on your end.", self: false, timestamp: "Mon" },
        { id: "m2", text: "Can you send the invoice?", self: true, timestamp: "Mon" },
    ],
    "4": [
        { id: "m1", text: "Here is the revised draft, let me know what you think.", self: false, timestamp: "Sun" },
        { id: "m2", text: "Looks great, approved.", self: true, timestamp: "Sun" },
    ],
};

// eslint-disable-next-line react-refresh/only-export-components
function Chat() {
    // First chat pre-selected
    const [selectedChatId, setSelectedChatId] = useState<string>(DUMMY_CHATS[0].id);
    const [messagesByChat, setMessagesByChat] = useState<Record<string, ChatMessage[]>>(DUMMY_MESSAGES);
    const [draft, setDraft] = useState("");

    const currentUserId = useAuthStore((s) => s.user?.userId);

    const selectedChat = DUMMY_CHATS.find((c) => c.id === selectedChatId) ?? DUMMY_CHATS[0];
    const messages = messagesByChat[selectedChatId] ?? [];

    // Subscribe to the selected chat's topic; swap subscription on chat switch.
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        let cancelled = false;

        subscribeToChat(selectedChatId, (incoming) => {
            const newMessage: ChatMessage = {
                id: `ws-${incoming.id}`,
                text: extractMessageText(incoming.content),
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
                    unsubscribe = unsub;
                }
            })
            .catch((err) => {
                console.error("Failed to subscribe to chat", selectedChatId, err);
            });

        return () => {
            cancelled = true;
            unsubscribe?.();
        };
    }, [selectedChatId, currentUserId]);

    // Tear down the shared socket when leaving the chat page entirely.
    useEffect(() => {
        return () => {
            disconnectChatSocket();
        };
    }, []);

    function handleSend() {
        const text = draft.trim();
        if (!text) return;

        publishChatText(selectedChatId, text).catch((err) => {
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
                                    <Input placeholder="Search Chat" aria-label="Search chats" size="lg" className="m-1 bg-cream"/>
                                </div>
                            </div>
                            <div className="max-h-72 overflow-y-auto lg:max-h-none lg:overflow-visible">
                                <ChatInbox
                                    chats={DUMMY_CHATS}
                                    selectedChatId={selectedChatId}
                                    onSelectChat={setSelectedChatId}
                                />
                            </div>
                        </section>
                        <section className="w-full lg:w-2/4 bg-cream">
                            <div className="border-b-2 border-border flex flex-row bg-linen">
                                <div className=" flex flex-row m-2 w-full">
                                    <AvatarIcon firstName={selectedChat.firstName} lastName={selectedChat.lastName} size={60}/>
                                    <p className="text-2xl font-bold my-auto ml-2">{selectedChat.firstName} {selectedChat.lastName}</p>
                                </div>
                            </div>
                            <div className="m-2">
                                {/* Chat Field */}
                                <div className="h-96 lg:h-140 overflow-y-auto px-4 py-3 flex flex-col" role="log" aria-live="polite" aria-label="Conversation messages">
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
                                        className=" mt-auto mb-2 mx-auto shrink-0"
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
                                <ServiceCardChat pictureLink="./pic/ServiceExample1.png" link="" label={"PC Support & Laptop Help"} tags={[]} hourRate={0} />
                            </div>
                            <div className="border-t-2 border-border">
                                <div className="m-4">
                                    <p className="text-primary font-bold"> About {selectedChat.firstName}</p>
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