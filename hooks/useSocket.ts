import { useEffect, useState, useCallback } from 'react';
import { socketManager } from '@/utils/socket';
import { Message } from '@/api/messageApi';

interface UseSocketProps {
    conversationId: string;
    onNewMessage?: (message: Message) => void;
    onTyping?: (data: any) => void;
    onStatusUpdate?: (data: any) => void;
    onFileMessage?: (data: any) => void;
}

export const useSocket = ({
    conversationId,
    onNewMessage,
    onTyping,
    onStatusUpdate,
    onFileMessage
}: UseSocketProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const maxReconnectAttempts = 5;

    // Connection status handler
    const handleConnectionChange = useCallback((connected: boolean) => {
        setIsConnected(connected);
        if (connected) {
            setReconnectAttempts(0);
            console.log('✅ Socket connected successfully');
        } else {
            console.log('❌ Socket disconnected');
        }
    }, []);

    // Auto-reconnect logic
    const attemptReconnect = useCallback(async () => {
        if (reconnectAttempts < maxReconnectAttempts) {
            console.log(`🔄 Attempting to reconnect... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
            try {
                await socketManager.connect();
                socketManager.joinConversation(conversationId);
            } catch (error) {
                console.error('❌ Reconnection failed:', error);
                setReconnectAttempts(prev => prev + 1);
            }
        } else {
            console.error('❌ Max reconnection attempts reached');
        }
    }, [conversationId, reconnectAttempts, maxReconnectAttempts]);

    // Setup socket connection and event listeners
    useEffect(() => {
        let reconnectTimer: ReturnType<typeof setTimeout>;

        const initializeSocket = async () => {
            try {
                if (!socketManager.isSocketConnected()) {
                    await socketManager.connect();
                }
                socketManager.joinConversation(conversationId);
                setIsConnected(true);
            } catch (error) {
                console.error('❌ Socket initialization failed:', error);
                setIsConnected(false);
                // Auto-retry connection
                reconnectTimer = setTimeout(attemptReconnect, 3000);
            }
        };

        // Add event listeners
        if (onNewMessage) {
            socketManager.onMessage(onNewMessage);
        }
        if (onTyping) {
            socketManager.onTyping(onTyping);
        }
        if (onStatusUpdate) {
            socketManager.onStatusUpdate(onStatusUpdate);
        }
        if (onFileMessage) {
            socketManager.onFileEvent(onFileMessage);
        }

        // Connection change listener
        socketManager.onConnectionChange(handleConnectionChange);

        // Initialize socket
        initializeSocket();

        // Cleanup function
        return () => {
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
            }

            socketManager.leaveConversation(conversationId);

            if (onNewMessage) {
                socketManager.offMessage(onNewMessage);
            }
            if (onTyping) {
                socketManager.offTyping(onTyping);
            }
            if (onStatusUpdate) {
                socketManager.offStatusUpdate(onStatusUpdate);
            }
            if (onFileMessage) {
                socketManager.offFileEvent(onFileMessage);
            }

            socketManager.offConnectionChange(handleConnectionChange);
        };
    }, [conversationId, onNewMessage, onTyping, onStatusUpdate, onFileMessage, handleConnectionChange, attemptReconnect]);

    // Monitor connection and auto-reconnect
    useEffect(() => {
        if (!isConnected && reconnectAttempts < maxReconnectAttempts) {
            const timer = setTimeout(attemptReconnect, 5000); // Try reconnecting every 5 seconds
            return () => clearTimeout(timer);
        }
    }, [isConnected, attemptReconnect, reconnectAttempts, maxReconnectAttempts]);

    // Public API
    const sendMessage = useCallback(async (messageData: any) => {
        if (!isConnected) {
            throw new Error('Socket not connected');
        }
        return socketManager.sendMessage(messageData);
    }, [isConnected]);

    const shareFile = useCallback((fileData: any) => {
        if (!isConnected) {
            throw new Error('Socket not connected');
        }
        return socketManager.quickShareFile(fileData);
    }, [isConnected]);

    const startTyping = useCallback(() => {
        if (isConnected) {
            socketManager.startTyping(conversationId);
        }
    }, [isConnected, conversationId]);

    const stopTyping = useCallback(() => {
        if (isConnected) {
            socketManager.stopTyping(conversationId);
        }
    }, [isConnected, conversationId]);

    const markAsRead = useCallback((messageIds: string[], userId: string) => {
        if (isConnected) {
            socketManager.markMessagesAsRead(conversationId, messageIds, userId);
        }
    }, [isConnected, conversationId]);

    return {
        isConnected,
        reconnectAttempts,
        maxReconnectAttempts,
        sendMessage,
        shareFile,
        startTyping,
        stopTyping,
        markAsRead,
        attemptReconnect
    };
};
