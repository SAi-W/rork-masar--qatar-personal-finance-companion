import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { COLORS } from "@/constants/colors";
import { useLanguage } from "@/hooks/useLanguageStore";
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  FileText,
  Settings
} from "lucide-react-native";

export default function TabLayout() {
  const { t } = useLanguage();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.maroon,
        tabBarInactiveTintColor: COLORS.darkGray,
        headerShown: false,
        tabBarStyle: { backgroundColor: COLORS.white, height: 66, borderTopWidth: 4, borderTopColor: COLORS.black },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '800', paddingBottom: Platform.OS === 'ios' ? 6 : 4 },
      }}
    >
      {/* Keep a single dashboard at index route */}
      <Tabs.Screen
        name="index"
        options={{
          title: t.dashboard,
          tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: t.accounts,
          tabBarIcon: ({ color }) => <Wallet size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: t.expenses,
          tabBarIcon: ({ color }) => <Receipt size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="receipts"
        options={{
          title: "Receipts",
          tabBarIcon: ({ color }) => <FileText size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.settings,
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}