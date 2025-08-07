import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons, Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView as SafeAreaContext } from "react-native-safe-area-context"; // Thêm để xử lý notch
import Header from "@/components/Header";

const { width } = Dimensions.get("window");

const data = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    phone: "0909123456",
    address: "123 Lê Lợi, Q.1, TP.HCM",
    description: "Mất mạng liên tục",
    status: "Đang xử lý",
    createdAt: "07/08/2025 10:30",
  },
  {
    id: "2",
    name: "Trần Thị B",
    phone: "0912345678",
    address: "456 Nguyễn Trãi, Q.5, TP.HCM",
    description: "Camera không hoạt động",
    status: "Chờ xử lý",
    createdAt: "07/08/2025 09:00",
  },
];

// Hàm định dạng ngày giờ
const formatDateTime = (dateTime: string) => {
  const [date, time] = dateTime.split(" ");
  const [day, month, year] = date.split("/");
  return `${day}/${month}/${year.slice(-2)}, ${time}`; // Ví dụ: 7/8/25, 10:30
};

const CustomerItem = ({ item }: { item: (typeof data)[0] }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.85}>
    <LinearGradient colors={["#ffffff", "#f9fafb"]} style={styles.cardGradient}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={["#3B82F6", "#10B981"]}
            style={styles.avatarBorder}
          >
            <Image
              source={require("@/assets/images/vnpt.jpg")} // Thay bằng vnpt.jpg nếu có
              style={styles.avatar}
            />
          </LinearGradient>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                item.status === "Đang xử lý"
                  ? styles.statusProcessing
                  : styles.statusPending,
              ]}
            >
              <Ionicons
                name={
                  item.status === "Đang xử lý"
                    ? "time-outline"
                    : "hourglass-outline"
                }
                size={14}
                color={item.status === "Đang xử lý" ? "#F59E0B" : "#EF4444"}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color: item.status === "Đang xử lý" ? "#F59E0B" : "#EF4444",
                  },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Ionicons name="call-outline" size={18} color="#6B7280" />
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
            {item.phone}
          </Text>
        </View>
        <View style={styles.row}>
          <Entypo name="location-pin" size={18} color="#6B7280" />
          <Text style={styles.value} numberOfLines={2} ellipsizeMode="tail">
            {item.address}
          </Text>
        </View>
        <View style={styles.row}>
          <MaterialIcons name="report-problem" size={18} color="#6B7280" />
          <Text style={styles.value} numberOfLines={2} ellipsizeMode="tail">
            {item.description}
          </Text>
        </View>
        <View style={styles.row}>
          <MaterialIcons name="access-time" size={18} color="#6B7280" />
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
            {formatDateTime(item.createdAt)}
          </Text>
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

export default function CustomerListScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Header />
      <SafeAreaContext
        style={styles.container}
        edges={["left", "right", "bottom"]}
      >
        <FlatList
          data={data}
          renderItem={({ item }) => <CustomerItem item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaContext>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 16,
  },
  listContent: {
    paddingTop: 20, // Tăng paddingTop để tránh thanh trạng thái
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 1,
  },
  cardGradient: {
    padding: 16,
    borderRadius: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarBorder: {
    padding: 2,
    borderRadius: 24,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E5E7EB",
  },
  headerText: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  statusProcessing: {
    backgroundColor: "#FEF3C7",
  },
  statusPending: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  infoContainer: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  value: {
    marginLeft: 8,
    color: "#4B5563",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
