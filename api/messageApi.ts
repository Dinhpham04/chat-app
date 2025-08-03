import axiosInstance from "./axiosInstance";

export interface MessageSender {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeen: string;
}

export interface Message {
  id: string;
  messageType?: string; // "text", "image", "video", etc.
  localId?: string;
  conversationId: string;
  senderId: string;
  sender: MessageSender;
  content: string | undefined;
  type:
  | "text"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "location"
  | "contact"
  | "sticker"
  | "system";
  attachments?: Array<{
    fileId?: string;
    fileName?: string;
    originalName?: string;
    fileSize?: number;
    mimeType?: string;
    downloadUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    dimensions?: string;
  }>;
  fileInfo?: Array<{
    fileId?: string;
    fileName?: string;
    originalName?: string;
    fileSize?: number;
    mimeType?: string;
    downloadUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    dimensions?: string;
  }>;
  replyToMessageId?: string;
  mentions?: string[];
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  localId?: string;
  conversationId: string;
  content?: string;
  type?:
  | "text"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "location"
  | "contact"
  | "sticker"
  | "system";
  attachments?: Array<{
    fileId: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    duration?: number;
  }>;
  replyToMessageId?: string;
  mentions?: string[];
  timestamp?: number;
}

export interface GetMessagesResponse {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}

// Send message via REST API (fallback when Socket.IO fails)
export const sendMessage = async (
  messageData: SendMessageRequest
): Promise<Message> => {
  const response = await axiosInstance.post("/messages", messageData);
  return response.data;
};

// Get conversation messages
export const getConversationMessages = async (
  conversationId: string,
  page: number = 1,
  limit: number = 20,
  cursor?: string
): Promise<GetMessagesResponse> => {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  if (cursor) params.append("cursor", cursor);

  const response = await axiosInstance.get(
    `/messages/conversation/${conversationId}?${params.toString()}`
  );
  return response.data;
};

// Mark message as read
export const markMessageAsRead = async (messageId: string): Promise<void> => {
  await axiosInstance.post(`/messages/${messageId}/read`);
};

// Delete message
export const deleteMessage = async (messageId: string): Promise<void> => {
  await axiosInstance.delete(`/messages/${messageId}`);
};

// Edit message
export const editMessage = async (
  messageId: string,
  content: string,
  attachments?: Array<any>
): Promise<Message> => {
  const response = await axiosInstance.put(`/messages/${messageId}`, {
    content,
    attachments,
  });
  return response.data;
};

// Search messages
export const searchMessages = async (
  conversationId: string,
  query: string,
  type?: string,
  senderId?: string,
  fromDate?: string,
  toDate?: string
): Promise<GetMessagesResponse> => {
  const params = new URLSearchParams({ query });
  if (type) params.append("type", type);
  if (senderId) params.append("senderId", senderId);
  if (fromDate) params.append("fromDate", fromDate);
  if (toDate) params.append("toDate", toDate);

  const response = await axiosInstance.get(
    `/messages/conversation/${conversationId}/search?${params.toString()}`
  );
  return response.data;
};
