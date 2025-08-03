import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Tab {
  id: string;
  label: string;
  active?: boolean;
}

interface TabNavigationProps {
  tabs: Tab[];
  onTabPress: (tabId: string) => void;
  className?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  onTabPress,
  className = "",
}) => {
  return (
    <View className={`flex justify-center ${className}`}>
      <View className="flex flex-row justify-center space-x-1 rounded-full w-auto">
        {tabs.map((tab) =>
          tab.active ? (
            <LinearGradient
              colors={["#f9c0e4", "#6e00ff"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ borderRadius: 9999 }}
              key={tab.id}
            >
              <TouchableOpacity
                className={`px-6 py-2 rounded-full`}
                onPress={() => onTabPress(tab.id)}
              >
                <Text
                  className={`font-roboto ${tab.active ? "text-white" : "text-gray-600 font-nunito"
                    }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <TouchableOpacity
              key={tab.id}
              className={`px-6 py-2 rounded-full`}
              onPress={() => onTabPress(tab.id)}
            >
              <Text
                className={`font-roboto ${tab.active ? "text-white" : "text-gray-600 font-nunito"
                  }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
};

export default TabNavigation;
