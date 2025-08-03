import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

interface ConnectionStatusProps {
    isConnected: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
    onRetry: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
    isConnected,
    reconnectAttempts,
    maxReconnectAttempts,
    onRetry
}) => {
    if (isConnected) {
        return (
            <Text className="text-sm font-nunito text-green-600">
                🟢 Online (Real-time)
            </Text>
        );
    }

    if (reconnectAttempts > 0 && reconnectAttempts < maxReconnectAttempts) {
        return (
            <View className="flex-row items-center">
                <Text className="text-sm font-nunito text-yellow-600">
                    🟡 Reconnecting... ({reconnectAttempts}/{maxReconnectAttempts})
                </Text>
            </View>
        );
    }

    if (reconnectAttempts >= maxReconnectAttempts) {
        return (
            <TouchableOpacity
                onPress={onRetry}
                className="flex-row items-center"
            >
                <Text className="text-sm font-nunito text-red-600 mr-2">
                    🔴 Offline (Tap to retry)
                </Text>
                <AntDesign name="reload1" size={14} color="#dc2626" />
            </TouchableOpacity>
        );
    }

    return (
        <Text className="text-sm font-nunito text-red-600">
            🔴 Offline (API only)
        </Text>
    );
};
