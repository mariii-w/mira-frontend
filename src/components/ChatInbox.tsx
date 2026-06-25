import { AvatarIcon } from "./AvatarIcon";

export type ChatPreview = {
    id: string;
    listingId: string;
    firstName: string;
    lastName: string;
    lastMessage: string;
    timestamp: string;
    unread?: boolean;
};

type ChatInboxProps = {
    chats: ChatPreview[];
    selectedChatId: string;
    onSelectChat: (id: string) => void;
};
export function ChatInbox({ chats, selectedChatId, onSelectChat }: ChatInboxProps) {
    return (
        <div>
            {chats.map((chat) => {
                const isSelected = chat.id === selectedChatId;
                return (
                    <button
                        key={chat.id}
                        type="button"
                        onClick={() => onSelectChat(chat.id)}
                        className={`w-full text-left flex flex-row items-center gap-3 px-5 py-3 border-b border-border cursor-pointer transition-colors ${isSelected ? "bg-mint" : "hover:bg-cream/60"}`}
                    >
                        <AvatarIcon firstName={chat.firstName} lastName={chat.lastName} size={45} />
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-row justify-between items-baseline">
                                <p className={`truncate ${chat.unread ? "font-bold" : "font-medium"}`}>
                                    {chat.firstName} {chat.lastName}
                                </p>
                                <span className="text-xs text-black/50 shrink-0 ml-2">{chat.timestamp}</span>
                            </div>
                            <p className={`text-sm truncate ${chat.unread ? "font-semibold text-black" : "text-black/60"}`}>
                                {chat.lastMessage}
                            </p>
                        </div>
                        {chat.unread && (
                            <span className="shrink-0 inline-flex items-center">
                                <span className="sr-only">Unread</span>
                                <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-primary" />
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
