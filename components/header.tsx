import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SearchInput from "./searchInput";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  showNewMessage?: boolean;
  showAddButton?: boolean;
  searchValue?: string;
  showFriendRequest?: boolean;
  onSearchChange?: (text: string) => void;
  onSearchPress?: () => void;
  totalFriendRequest?: number;
  onNewMessagePress?: () => void;
  onAddPress?: () => void;
  isSearchMode?: boolean;
  onSearchClose?: () => void;
  className?: string;
  translateY?: Animated.Value;
}

const Header: React.FC<HeaderProps> = ({
  title = "Johan",
  subtitle = "Hello,",
  showSearch = false,
  showNewMessage = false,
  showAddButton = false,
  searchValue = "",
  isSearchMode = false,
  totalFriendRequest = 0,
  onSearchChange,
  onSearchPress,
  showFriendRequest = false,
  onNewMessagePress,
  onAddPress,
  translateY,
  onSearchClose,
  className = "",
}) => {
  const [animation] = useState({
    headerOpacity: new Animated.Value(1),
    inputTranslateY: new Animated.Value(0),
    inputScale: new Animated.Value(1),
    cancelOpacity: new Animated.Value(0),
  });

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isSearchMode && inputRef.current) {
      (inputRef.current as TextInput).focus();
    }
    if (!isSearchMode && inputRef.current) {
      (inputRef.current as TextInput).blur();
    }
  }, [isSearchMode]);

  const handleSearchPress = () => {
    // Tạo hiệu ứng scale thu nhỏ và dịch chuyển lên trên
    Animated.parallel([
      // 1. Ẩn Header
      Animated.timing(animation.headerOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),

      // 2. Dịch chuyển và scale Input
      ...(translateY
        ? [
          Animated.timing(translateY, {
            toValue: -70,
            duration: 200,
            useNativeDriver: true,
          }),
        ]
        : []),
      Animated.timing(animation.inputScale, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),

      // 3. Hiện nút Hủy
      Animated.timing(animation.cancelOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onSearchPress?.();
    });
  };
  const handleSearchClose = () => {
    Animated.parallel([
      Animated.timing(animation.headerOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      ...(translateY
        ? [
          Animated.timing(translateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]
        : []),
      Animated.timing(animation.inputScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animation.cancelOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onSearchClose?.();
    });
  };
  return (
    <View className={`bg-white px-6 py-4 shadow-sm ${className} `}>
      <Animated.View
        style={{ transform: [{ translateY: animation.inputTranslateY }] }}
      >
        <Animated.View style={{ opacity: animation.headerOpacity }}>
          <View className="flex  flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-gray-500 text-sm font-roboto">
                {subtitle}
              </Text>
              <Text className="text-2xl font-bold text-gray-800 font-manrope">
                {title}
              </Text>
            </View>
            <View className="flex flex-row space-x-2">
              {showNewMessage && (
                <TouchableOpacity
                  className="p-2 bg-gray-100 rounded-full"
                  onPress={onNewMessagePress}
                >
                  <Entypo name="new-message" size={20} color="#a855f7" />
                </TouchableOpacity>
              )}
              {showAddButton && (
                <TouchableOpacity
                  className="p-2 bg-gray-100 rounded-full"
                  onPress={onAddPress}
                >
                  <Ionicons name="add" size={20} color="#a855f7" />
                </TouchableOpacity>
              )}
              {showFriendRequest && (
                <LinearGradient
                  colors={["#f9c0e4", "#6e00ff"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={{ borderRadius: 9999 }}
                >
                  <TouchableOpacity
                    className="p-2 rounded-full"
                    onPress={() => router.push("/contact/friendRequests")}
                  >
                    <View className="flex flex-row">
                      <Text className="text-white font-roboto  font-bold px-2">
                        {totalFriendRequest || 0}
                      </Text>
                      <Text className="font-roboto text-white">
                        Lời mời kết bạn
                      </Text>
                    </View>
                  </TouchableOpacity>
                </LinearGradient>
              )}
            </View>
          </View>
        </Animated.View>
        {showSearch && (
          <View className=" flex flex-row items-center">
            {isSearchMode && (
              <TouchableOpacity onPress={handleSearchClose} className="p-1">
                <Text className="text-blue-500 font-semibold">Hủy</Text>
              </TouchableOpacity>
            )}

            <View className="px-4 w-full">
              <Animated.View
                style={{
                  transform: [{ scale: animation.inputScale }],
                }}
              >
                <TouchableOpacity
                  className=" bg-gray-50 rounded-full flex flex-row items-center  border-gray-200 border-[0.25px]"
                  onPress={isSearchMode ? undefined : handleSearchPress}
                  activeOpacity={0.8}
                >
                  <SearchInput
                    value={searchValue}
                    pointEvents={isSearchMode ? "auto" : "none"}
                    onChangeText={onSearchChange || (() => { })}
                    placeholder="Tìm kiếm tin nhắn, nhóm"
                    className="flex-1"
                    inputRef={inputRef}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

export default Header;
