// ---------------------------------------------------------------------------
// ChatBubble — single message, aligned by the `self` flag
// ---------------------------------------------------------------------------

export type ChatMessage = {
    id: string;
    text: string;
    self: boolean;
    timestamp: string;
};

type ChatBubbleProps = {
    message: string;
    self: boolean;
    timestamp?: string;
};
export function ChatBubble({ message, self, timestamp }: ChatBubbleProps) {
    return (
        <div 
            className={`flex w-full mb-3 ${self ? "justify-end" : "justify-start"}`}
            role="article"
            aria-label={`${self ? "Your message" : "Their message"}: ${message}${timestamp ? ` at ${timestamp}` : ""}`}
            tabIndex={0}
        >
            <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${self
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-linen text-black rounded-bl-sm border-2 border-border"}`}
            >
                <p className="text-sm whitespace-pre-wrap">{message}</p>
                {timestamp && (
                    <p className={`text-sm mt-1 text-right ${self ? "text-cream" : "text-charcoal"}`}>
                        {timestamp}
                    </p>
                )}
            </div>
        </div>
    );
}
