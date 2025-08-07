import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface HeaderProps {
  showBack?: boolean;
  rightIcon?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ showBack = false, rightIcon }) => {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#005baa" />
      <View style={styles.container}>
        {/* Logo */}
        <Image
          source={require("@/assets/images/vnpt.jpg")}
          style={styles.logo}
        />

        {/* Back + Brand text */}
        <View style={styles.brandSection}>
          {showBack && (
            <TouchableOpacity onPress={() => router.back()} style={styles.icon}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          <Text style={styles.brandText}>
            <Text style={styles.vnpt}>VNPT</Text>
            <Text style={styles.support}>Support</Text>
          </Text>
        </View>

        {/* Right icon */}
        <View style={styles.icon}>{rightIcon ?? null}</View>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#005baa",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 30 : 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#fff",
    resizeMode: "contain",
    marginRight: 10,
  },
  brandSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  vnpt: {
    color: "#00b4f0",
  },
  support: {
    color: "#FFC107",
  },
});