// STOMP-over-SockJS client for chat. Connects to /v1/chats/ws, JWT goes on the CONNECT frame.

import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { get_access_token } from "../stores/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

export type ChatTopicMessage = {
  id: number;
  cid: string;
  sender: {
    id: string;
    username: string;
  };
  content: unknown;
  createdAt: string;
};

let client: Client | null = null;
let connectPromise: Promise<Client> | null = null;
let connectGeneration = 0;
let connectedToken: string | null = null;

function createClient(token: string): Client {
  return new Client({
    webSocketFactory: () => new SockJS(`${API_BASE_URL}/v1/chats/ws`),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
  });
}

export async function connectChatSocket(): Promise<Client> {
  // Re-check token freshness even if a client already exists.
  const token = await get_access_token();
  if (!token) {
    throw new Error("Cannot open chat socket: no access token available");
  }

  if (client?.connected && connectedToken === token) return client;
  if (connectPromise) return connectPromise;

  const generation = ++connectGeneration;

  connectPromise = (async () => {
    if (client) {
      client.deactivate();
      client = null;
      connectedToken = null;
    }

    const newClient = createClient(token);

    await new Promise<void>((resolve, reject) => {
      newClient.onConnect = () => resolve();
      newClient.onStompError = (frame) => {
        reject(new Error(frame.headers["message"] ?? "STOMP connection error"));
      };
      newClient.activate();
    });

    // superseded by a disconnect/newer connect while this was in flight
    if (generation !== connectGeneration) {
      newClient.deactivate();
      throw new Error("Chat socket connection superseded");
    }

    client = newClient;
    connectedToken = token;
    return newClient;
  })();

  try {
    return await connectPromise;
  } finally {
    connectPromise = null;
  }
}

export function disconnectChatSocket(): void {
  connectGeneration++;
  client?.deactivate();
  client = null;
  connectedToken = null;
  connectPromise = null;
}

// Returns an unsubscribe function; call it on chat switch.
export async function subscribeToChat(
  cid: string,
  onMessage: (message: ChatTopicMessage) => void,
): Promise<() => void> {
  const activeClient = await connectChatSocket();

  const subscription: StompSubscription = activeClient.subscribe(
    `/topic/${cid}`,
    (frame: IMessage) => {
      try {
        onMessage(JSON.parse(frame.body) as ChatTopicMessage);
      } catch {
        // ignore malformed payload
      }
    },
  );

  return () => subscription.unsubscribe();
}

// Fire-and-forget - server echoes the saved message back on the topic.
export async function publishChatText(
  cid: string,
  content: string,
): Promise<void> {
  const activeClient = await connectChatSocket();
  activeClient.publish({
    destination: `/app/${cid}/text`,
    body: JSON.stringify({ content }),
  });
}
