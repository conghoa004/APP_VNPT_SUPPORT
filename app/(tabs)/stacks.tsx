import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons, Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView as SafeAreaContext } from "react-native-safe-area-context";
import Header from "@/components/Header";

const { width } = Dimensions.get("window");

const initialData = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    phone: "0909123456",
    address: "123 Lê Lợi, Q.1, TP.HCM",
    description: "Mất mạng liên tục",
    status: "Chờ xử lý",
    createdAt: "07/08/2025 10:30",
  },
  {
    id: "2",
    name: "Trần Thị B",
    phone: "0912345678",
    address: "456 Nguyễn Trãi, Q.5, TP.HCM",
    description: "Camera không hoạt động",
    status: "Đã tiếp nhận",
    createdAt: "07/08/2025 09:00",
  },
  {
    id: "3",
    name: "Lê Văn C",
    phone: "0932123456",
    address: "789 Phạm Văn Đồng, Q.Gò Vấp, TP.HCM",
    description: "Yêu cầu hủy dịch vụ",
    status: "Đã hủy",
    createdAt: "07/08/2025 08:00",
  },
  {
    id: "4",
    name: "Phạm Thị D",
    phone: "0945678901",
    address: "321 Trần Phú, Q.7, TP.HCM",
    description: "Lỗi kết nối wifi",
    status: "Đang xử lý",
    createdAt: "07/08/2025 07:30",
  },
  {
    id: "5",
    name: "Hoàng Văn E",
    phone: "0956789012",
    address: "654 Nguyễn Huệ, Q.1, TP.HCM",
    description: "Hoàn tất kiểm tra",
    status: "Hoàn thành",
    createdAt: "07/08/2025 06:00",
  },
];

// Hàm định dạng ngày giờ
const formatDateTime = (dateTime: string) => {
  const [date, time] = dateTime.split(" ");
  const [day, month, year] = date.split("/");
  return `${day}/${month}/${year.slice(-2)}, ${time}`;
};

// Định nghĩa các chuyển trạng thái hợp lệ
const validTransitions: { [key: string]: string[] } = {
  "Chờ xử lý": ["Đã tiếp nhận", "Đã hủy"],
  "Đã tiếp nhận": ["Đang xử lý", "Đã hủy"],
  "Đang xử lý": ["Hoàn thành", "Đã hủy"],
  "Hoàn thành": [],
  "Đã hủy": [],
};

const CustomerItem = ({
  item,
  onAction,
}: {
  item: (typeof initialData)[0];
  onAction: (id: string, action: string) => void;
}) => {
  // Hàm hiển thị hộp thoại xác nhận
  const confirmAction = (action: string) => {
    Alert.alert(
      "Xác nhận hành động",
      `Bạn có chắc chắn muốn chuyển trạng thái sang ${action}?`,
      [
        {
          text: "Hủy bỏ",
          style: "cancel",
        },
        {
          text: "Xác nhận",
          onPress: () => onAction(item.id, action),
        },
      ],
      { cancelable: true }
    );
  };

  // Lấy các hành động hợp lệ dựa trên trạng thái hiện tại
  const allowedActions = validTransitions[item.status] || [];

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <LinearGradient
        colors={["#ffffff", "#f1f5f9"]}
        style={styles.cardGradient}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={["#3b82f6", "#10b981"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarBorder}
            >
              <Image
                source={
                  require("@/assets/images/vnpt.jpg") || {
                    uri: "https://via.placeholder.com/48",
                  }
                }
                style={styles.avatar}
                onError={() => console.log("Lỗi tải hình ảnh cho", item.name)}
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
                  item.status === "Chờ xử lý"
                    ? styles.statusPending
                    : item.status === "Đã tiếp nhận"
                    ? styles.statusReceived
                    : item.status === "Đang xử lý"
                    ? styles.statusProcessing
                    : item.status === "Hoàn thành"
                    ? styles.statusCompleted
                    : styles.statusCancelled,
                ]}
              >
                <Ionicons
                  name={
                    item.status === "Chờ xử lý"
                      ? "hourglass-outline"
                      : item.status === "Đã tiếp nhận"
                      ? "person-outline"
                      : item.status === "Đang xử lý"
                      ? "time-outline"
                      : item.status === "Hoàn thành"
                      ? "checkmark-circle-outline"
                      : "close-circle-outline"
                  }
                  size={16}
                  color={
                    item.status === "Chờ xử lý"
                      ? "#dc2626"
                      : item.status === "Đã tiếp nhận"
                      ? "#ea580c"
                      : item.status === "Đang xử lý"
                      ? "#d97706"
                      : item.status === "Hoàn thành"
                      ? "#059669"
                      : "#4b5563"
                  }
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        item.status === "Chờ xử lý"
                          ? "#dc2626"
                          : item.status === "Đã tiếp nhận"
                          ? "#ea580c"
                          : item.status === "Đang xử lý"
                          ? "#d97706"
                          : item.status === "Hoàn thành"
                          ? "#059669"
                          : "#4b5563",
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
            <Ionicons name="call-outline" size={20} color="#4b5563" />
            <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
              {item.phone}
            </Text>
          </View>
          <View style={styles.row}>
            <Entypo name="location-pin" size={20} color="#4b5563" />
            <Text style={styles.value} numberOfLines={2} ellipsizeMode="tail">
              {item.address}
            </Text>
          </View>
          <View style={styles.row}>
            <MaterialIcons name="report-problem" size={20} color="#4b5563" />
            <Text style={styles.value} numberOfLines={2} ellipsizeMode="tail">
              {item.description}
            </Text>
          </View>
          <View style={styles.row}>
            <MaterialIcons name="access-time" size={20} color="#4b5563" />
            <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
              {formatDateTime(item.createdAt)}
            </Text>
          </View>
        </View>

        {allowedActions.length > 0 && (
          <View style={styles.buttonContainer}>
            {allowedActions.includes("Đã tiếp nhận") && (
              <LinearGradient
                colors={["#fb923c", "#f97316"]}
                style={[styles.actionButton, styles.receivedButton]}
              >
                <TouchableOpacity onPress={() => confirmAction("Đã tiếp nhận")}>
                  <Text style={styles.buttonText}>Tiếp nhận</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
            {allowedActions.includes("Đang xử lý") && (
              <LinearGradient
                colors={["#60a5fa", "#3b82f6"]}
                style={[styles.actionButton, styles.processButton]}
              >
                <TouchableOpacity onPress={() => confirmAction("Đang xử lý")}>
                  <Text style={styles.buttonText}>Xử lý</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
            {allowedActions.includes("Hoàn thành") && (
              <LinearGradient
                colors={["#34d399", "#059669"]}
                style={[styles.actionButton, styles.completeButton]}
              >
                <TouchableOpacity onPress={() => confirmAction("Hoàn thành")}>
                  <Text style={styles.buttonText}>Hoàn thành</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
            {allowedActions.includes("Đã hủy") && (
              <LinearGradient
                colors={["#ef4444", "#b91c1c"]}
                style={[styles.actionButton, styles.cancelButton]}
              >
                <TouchableOpacity onPress={() => confirmAction("Đã hủy")}>
                  <Text style={styles.buttonText}>Hủy</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function CustomerListScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState(initialData);
  const [filteredData, setFilteredData] = useState(initialData);

  // Hàm xử lý tìm kiếm
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered =
      query.trim() === ""
        ? data
        : data.filter(
            (item) =>
              item.name.toLowerCase().includes(query.toLowerCase()) ||
              item.phone.includes(query) ||
              item.address.toLowerCase().includes(query.toLowerCase())
          );
    setFilteredData(filtered);
  };

  // Hàm xử lý hành động cập nhật trạng thái
  const handleAction = (id: string, action: string) => {
    const item = data.find((entry) => entry.id === id);
    if (!item || !validTransitions[item.status].includes(action)) {
      Alert.alert("Lỗi", "Hành động không hợp lệ!");
      return;
    }

    const newData = data.map((entry) =>
      entry.id === id ? { ...entry, status: action } : entry
    );

    setData(newData);
    setFilteredData(
      searchQuery.trim() === ""
        ? newData
        : newData.filter(
            (item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.phone.includes(searchQuery) ||
              item.address.toLowerCase().includes(searchQuery.toLowerCase())
          )
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <SafeAreaContext
        style={styles.container}
        edges={["left", "right", "bottom"]}
      >
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={22}
            color="#4b5563"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên, số điện thoại, địa chỉ..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <FlatList
          data={filteredData}
          renderItem={({ item }) => (
            <CustomerItem item={item} onAction={handleAction} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          extraData={searchQuery}
        />
      </SafeAreaContext>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 20,
  },
  listContent: {
    // paddingTop: 16,
    // paddingBottom: 120,
  },
  card: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d0d0d0ff",
  },
  cardGradient: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarBorder: {
    padding: 3,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e5e7eb",
  },
  headerText: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  statusPending: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
  },
  statusReceived: {
    backgroundColor: "#ffedd5",
    borderColor: "#fed7aa",
  },
  statusProcessing: {
    backgroundColor: "#fef3c7",
    borderColor: "#fde68a",
  },
  statusCompleted: {
    backgroundColor: "#d1fae5",
    borderColor: "#a7f3d0",
  },
  statusCancelled: {
    backgroundColor: "#e5e7eb",
    borderColor: "#d1d5db",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  infoContainer: {
    gap: 8,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  value: {
    marginLeft: 10,
    color: "#374151",
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#111827",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  receivedButton: {},
  processButton: {},
  completeButton: {},
  cancelButton: {},
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
