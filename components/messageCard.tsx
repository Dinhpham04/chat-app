import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useRef, useState } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

interface MessageCardProps {
  chat: {
    id: number;
    name: string;
    lastMessage: string;
    lastMessageSenderId?: string; // ID của người gửi tin nhắn cuối
    lastMessageSenderName?: string; // Tên người gửi tin nhắn cuối
    time: string;
    avatar: string;
    online?: boolean;
    pinned?: boolean;
    typing?: boolean;
    hasVoice?: boolean;
    unreadCount?: number;
    type?: 'direct' | 'group'; // Loại conversation
  };
  currentUserId?: string; // ID của user hiện tại
  onPress: (id: number) => void;
  onDelete?: (id: number) => void;
  onPin?: (id: number) => void;
  openRow: number | null;
  setOpenRow: (id: number | null) => void;
  isSwipingId: number | null;
  setIsSwipingId: (id: number | null) => void;
  swipeRef: React.MutableRefObject<Map<number, Swipeable>>;
}

const MessageCard: React.FC<MessageCardProps> = ({
  chat,
  currentUserId,
  onPress,
  onDelete,
  onPin,
  openRow,
  setOpenRow,
  isSwipingId,
  setIsSwipingId,
  swipeRef,
}) => {
  const pressStart = useRef(0);
  const [imageError, setImageError] = useState(false);

  // Tạo display message với logic hiển thị tên người gửi
  const getDisplayMessage = () => {
    const { lastMessage, lastMessageSenderId, lastMessageSenderName, type } = chat;

    console.log(`💬 getDisplayMessage for ${chat.id}:`, {
      lastMessage,
      lastMessageSenderId,
      lastMessageSenderName,
      type,
      currentUserId,
      typing: chat.typing,
    });

    // Nếu đang typing, hiển thị message typing
    if (chat.typing) {
      console.log(`💬 ${chat.id}: Showing typing message`);
      return lastMessage;
    }

    // Nếu không có thông tin người gửi, chỉ hiển thị message
    if (!lastMessageSenderId) {
      console.log(`💬 ${chat.id}: No sender ID, showing message only`);
      return `${chat.hasVoice ? "🎵 " : ""}${lastMessage}`;
    }

    // Nếu là tin nhắn của user hiện tại
    if (lastMessageSenderId === currentUserId) {
      console.log(`💬 ${chat.id}: Message from current user, showing "Bạn:"`);
      return `Bạn: ${chat.hasVoice ? "🎵 " : ""}${lastMessage}`;
    }

    // Nếu là conversation direct (1-on-1), không hiển thị tên người gửi
    if (type === 'direct') {
      console.log(`💬 ${chat.id}: Direct conversation, hiding sender name`);
      return `${chat.hasVoice ? "🎵 " : ""}${lastMessage}`;
    }

    // Nếu là conversation group, hiển thị tên người gửi
    if (type === 'group' && lastMessageSenderName) {
      console.log(`💬 ${chat.id}: Group conversation, showing sender name: ${lastMessageSenderName}`);
      return `${lastMessageSenderName}: ${chat.hasVoice ? "🎵 " : ""}${lastMessage}`;
    }

    // Fallback: chỉ hiển thị message
    console.log(`💬 ${chat.id}: Fallback, showing message only`);
    return `${chat.hasVoice ? "🎵 " : ""}${lastMessage}`;
  };
  // console.log("openRow", openRow);
  // console.log("isSwipingId", isSwipingId);
  const renderRightActions = (progress: any, dragX: any) => {
    const transDelete = dragX.interpolate({
      inputRange: [-60, 0],
      outputRange: [0, 60],
      extrapolate: "clamp",
    });
    const opacityDelete = dragX.interpolate({
      inputRange: [-60, 0],
      outputRange: [1, 0.3],
      extrapolate: "clamp",
    });

    const transPin = dragX.interpolate({
      inputRange: [-60, 0],
      outputRange: [0, 60],
      extrapolate: "clamp",
    });
    const opacityPin = dragX.interpolate({
      inputRange: [-60, 0],
      outputRange: [1, 0.3],
      extrapolate: "clamp",
    });

    return (
      <View style={{ flexDirection: "row", width: 120 }}>
        <Animated.View
          style={{
            transform: [{ translateX: transDelete }],
            opacity: opacityDelete,
            width: 60,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#ef4444",
              justifyContent: "center",
              alignItems: "center",
              width: 60,
              height: "100%",
            }}
            onPress={() => onDelete?.(chat.id)}
          >
            <AntDesign name="delete" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          style={{
            transform: [{ translateX: transPin }],
            opacity: opacityPin,
            width: 60,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#facc15",
              justifyContent: "center",
              alignItems: "center",
              width: 60,
              height: "100%",
            }}
            onPress={() => onPin?.(chat.id)}
          >
            <AntDesign name="pushpin" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={(ref) => {
        if (ref) {
          swipeRef.current.set(chat.id, ref);
        }
      }}
      renderRightActions={renderRightActions}
      overshootRight={false}
      onSwipeableWillOpen={() => {
        if (openRow && openRow !== chat.id) {
          const prevRef = swipeRef.current.get(openRow);
          prevRef?.close();
        }
        setOpenRow(chat.id);
      }}
      onSwipeableClose={() => {
        if (openRow === chat.id) {
          setOpenRow(null);
        }
      }}
    >
      <TouchableOpacity
        onLongPress={() => {
          const prevRef = swipeRef.current.get(chat.id);
          prevRef?.close();
        }}
        onPressIn={() => {
          pressStart.current = Date.now();
        }}
        onPress={() => {
          const duration = Date.now() - pressStart.current;
          const currentRef = swipeRef.current.get(chat.id);

          if (openRow && openRow !== chat.id) {
            // Nếu có dòng đang mở và khác dòng hiện tại → đóng dòng đang mở
            const openRef = swipeRef.current.get(openRow);
            openRef?.close();
          }

          if (duration < 200 && openRow === null && isSwipingId === null) {
            // Nếu là click ngắn → xử lý mở nội dung tin nhắn
            onPress(chat.id);
          } else {
            // Nếu giữ lâu → đóng dòng hiện tại (nếu đang mở)
            currentRef?.close();
          }
        }}
        className="flex-row items-center px-6 py-4 border-b border-gray-100"
      >
        <View className="relative ">
          <Image
            source={
              typeof chat.avatar === "string"
                ? { uri: chat.avatar }
                : chat.avatar
            }
            className="w-14 h-14 rounded-full"
            resizeMode="cover"
            onError={() => setImageError(true)}
            style={{ width: 56, height: 56, marginRight: 12 }}
          />
          {chat.online && (
            <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></View>
          )}
          {chat.pinned && (
            <View className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <Text className="text-white text-xs">📌</Text>
            </View>
          )}
        </View>

        <View className="flex-1 ml-6">
          <View className="flex flex-row items-start justify-between">
            {/* Left side - Name and message with constrained width */}
            <View className="flex-1 mr-3">
              <Text
                className="font-semibold text-gray-800 text-base font-manrope"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {chat.name}
              </Text>
              {chat.typing ? (
                <Text
                  className="text-blue-500 text-sm italic font-roboto"
                  style={{ color: "#3b82f6" }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {getDisplayMessage()}
                </Text>
              ) : (
                <Text
                  className="text-gray-600 text-sm font-nunito"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {getDisplayMessage()}
                </Text>
              )}
            </View>

            {/* Right side - Time and unread count with fixed width */}
            <View className="flex items-end justify-start" style={{ minWidth: 60 }}>
              <Text className="text-gray-500 text-sm font-nunito">
                {chat.time}
              </Text>
              {chat.unreadCount && chat.unreadCount > 0 && (
                <View className="mt-1 bg-red-500 rounded-full px-2 py-1 min-w-[20px] items-center">
                  <Text className="text-white text-xs font-bold">
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

export default MessageCard;
