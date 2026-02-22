import type { RadixAddress } from '$core/types/identity';

export interface Message {
    id: string;
    sender: RadixAddress;
    recipient: RadixAddress;
    content: string;
    createdAt: Date;
    delivered: boolean;
    read: boolean;
    isOutgoing: boolean; // Computed on frontend
}

export interface ChatState {
    activeProfileId: RadixAddress | null;
    messages: Record<string, Message[]>;
    peers: string[];
}
