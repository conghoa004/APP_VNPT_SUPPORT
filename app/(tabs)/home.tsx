// 🔹 Các import cần thiết
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router"; // Điều hướng
import { LinearGradient } from "expo-linear-gradient"; // Nền gradient
import Feather from "react-native-vector-icons/Feather"; // Icon
import * as Location from "expo-location"; // Lấy vị trí
import * as TaskManager from "expo-task-manager"; // Background Task
import Constants from "expo-constants"; // Lấy biến môi trường
import AsyncStorage from "@react-native-async-storage/async-storage"; // Lưu dữ liệu cục bộ
import Toast from "react-native-toast-message"; // Hiển thị thông báo dạng toast
import Header from "@/components/Header";

// 🔹 Định nghĩa các hằng số
const API_URL = Constants.expoConfig?.extra?.API_URL; // Lấy URL API từ file app.config.js
const LOCATION_TASK_NAME = "background-location-task"; // Tên background task

// 🔹 Định nghĩa Background Task để gửi vị trí về server
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("❌ Lỗi trong background task:", error);
    return;
  }

  if (data) {
    const { locations } = data as any;
    if (locations.length > 0) {
      const { latitude, longitude } = locations[0].coords;

      try {
        // Lấy vị trí trước đó từ AsyncStorage
        // const lastLocationStr = await AsyncStorage.getItem("last_location");
        // const lastLocation = lastLocationStr
        //   ? JSON.parse(lastLocationStr)
        //   : null;

        // // Nếu đã có vị trí cũ thì so sánh
        // if (
        //   lastLocation &&
        //   Math.abs(lastLocation.latitude - latitude) < 0.0001 &&
        //   Math.abs(lastLocation.longitude - longitude) < 0.0001
        // ) {
        //   console.log("⚠️  Vị trí không thay đổi, không gửi");
        //   return;
        // }

        // // Cập nhật vị trí mới vào AsyncStorage
        // await AsyncStorage.setItem(
        //   "last_location",
        //   JSON.stringify({ latitude, longitude })
        // );

        // Lấy token và gửi vị trí mới
        const storedCsrfToken = await AsyncStorage.getItem("csrf_token");

        await fetch(`${API_URL}/api/update-location`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": storedCsrfToken || "",
          },
          credentials: "include",
          body: JSON.stringify({ latitude, longitude }),
        });

        console.log("📍 Gửi vị trí mới:", latitude, longitude);
      } catch (err) {
        console.log("❌ Lỗi gửi vị trí:", err);
        Alert.alert(
          "Lỗi",
          "Không thể gửi vị trí.\nVui lòng kiểm tra kết nối mạng.",
          [{ text: "OK" }]
        );
      }
    }
  }
});

// 🔹 Component chính
export default function HomeScreen() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false); // Trạng thái online/offline
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading khi chuyển online/offline
  const [user, setUser] = useState<any>(null); // Thông tin người dùng
  const scaleAnim = useState(new Animated.Value(1))[0]; // Hiệu ứng bấm nút

  // 🔸 Kiểm tra GPS có bật không
  const checkIfLocationIsEnabled = async () => {
    const isEnabled = await Location.hasServicesEnabledAsync();
    if (!isEnabled) {
      Alert.alert(
        "GPS bị tắt",
        "Vui lòng bật GPS để ứng dụng có thể gửi vị trí.",
        [{ text: "OK" }]
      );
    }
    return isEnabled;
  };

  // 🔸 Bắt đầu gửi vị trí nền
  const startBackgroundLocation = async () => {
    const isEnabled = await checkIfLocationIsEnabled();
    if (!isEnabled) return;

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Cần cấp quyền vị trí để tiếp tục.");
      return;
    }

    const bgStatus = await Location.requestBackgroundPermissionsAsync();
    if (bgStatus.status !== "granted") {
      Alert.alert("Cần cấp quyền chạy nền để gửi vị trí.");
      return;
    }

    const isTaskRunning = await TaskManager.isTaskRegisteredAsync(
      LOCATION_TASK_NAME
    );
    if (!isTaskRunning) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // gửi mỗi 5 giây
        distanceInterval: 0,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Ứng dụng VNPT",
          notificationBody: "Đang gửi vị trí trong nền...",
        },
      });
      console.log("🚀 Bắt đầu gửi vị trí nền");
    }
  };

  // 🔸 Dừng gửi vị trí nền
  const stopBackgroundLocation = async () => {
    const isTaskRunning = await TaskManager.isTaskRegisteredAsync(
      LOCATION_TASK_NAME
    );
    if (isTaskRunning) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log("⛔ Đã dừng gửi vị trí nền");
    }
  };

  // Hàm cập nhật trạng thái nhân viên bên server
  async function updateStatusEmployee(isOnline: boolean) {
    await fetch(`${API_URL}/api/update-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": (await AsyncStorage.getItem("csrf_token")) || "",
      },
      credentials: "include",
      body: JSON.stringify({
        trang_thai: isOnline, // Trạng thái sau khi đổi
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("🔸 Cập nhật trạng thái nhân viên: ", data);
      });
  }

  // 🔸 Khi bấm nút chuyển trạng thái Online/Offline
  const handleToggleStatus = async () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsLoading(true);

    try {
      if (!isOnline) {
        // 🔸 Kiểm tra GPS có bật không
        const isEnabled = await Location.hasServicesEnabledAsync();
        if (!isEnabled) {
          Alert.alert(
            "GPS chưa bật",
            "Vui lòng bật GPS để chuyển sang trực tuyến."
          );
          return;
        }

        // 🔸 Yêu cầu quyền truy cập vị trí foreground
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Chưa cấp quyền vị trí",
            "Bạn cần cấp quyền vị trí để chuyển sang trực tuyến."
          );
          return;
        }

        // 🔸 Yêu cầu quyền chạy nền (background)
        const bgStatus = await Location.requestBackgroundPermissionsAsync();
        if (bgStatus.status !== "granted") {
          Alert.alert(
            "Chưa cấp quyền nền",
            "Bạn cần cấp quyền chạy nền để ứng dụng gửi vị trí."
          );
          return;
        }

        // Nếu đã đầy đủ điều kiện thì bắt đầu gửi vị trí và cập nhật trạng thái
        await startBackgroundLocation();
        setIsOnline(true);

        await updateStatusEmployee(true); // Cập nhật trạng thái online
        await AsyncStorage.setItem("isOnline", "true");
      } else {
        // Nếu đang online thì cho phép chuyển offline
        await stopBackgroundLocation();
        setIsOnline(false);

        await updateStatusEmployee(false); // Cập nhật trạng thái offline
        await AsyncStorage.setItem("isOnline", "false");
      }
    } catch (error) {
      console.log("❌ Lỗi chuyển trạng thái:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔸 Khi người dùng bấm nút đăng xuất
  const handleLogout = async () => {
    try {
      // Chuyển trạng thái offline
      await updateStatusEmployee(false); // Trạng thái offline

      // Gọi API logout
      const res = await fetch(`${API_URL}/api/logout`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (data.status === 200) {
        await stopBackgroundLocation(); // dừng gửi vị trí khi logout
        await AsyncStorage.clear(); // xóa dữ liệu local

        Toast.show({
          type: "success",
          text1: "Đăng xuất thành công!",
        });

        router.replace("/login"); // chuyển về trang đăng nhập
      } else {
        Toast.show({
          type: "error",
          text1: "Đăng xuất thất bại",
          text2: data.message || "Vui lòng thử lại sau.",
        });
      }
    } catch (error) {
      console.error("Lỗi logout:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi kết nối",
        text2: "Không thể kết nối máy chủ.",
      });
    }
  };

  // 🔸 Khi mở lại ứng dụng
  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      const storedOnline = await AsyncStorage.getItem("isOnline");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      if (storedOnline === "true") {
        setIsOnline(true);
        const isEnabled = await checkIfLocationIsEnabled();
        if (isEnabled) await startBackgroundLocation();
      }
    };

    fetchUser();
  }, []);

  // 🔸 Nếu đang trực tuyến thì kiểm tra GPS có bị tắt không (mỗi 5s)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isOnline) {
        const isEnabled = await Location.hasServicesEnabledAsync();
        if (!isEnabled) {
          Alert.alert(
            "GPS bị tắt",
            "Bạn đang trực tuyến nhưng GPS đã bị tắt. Vui lòng bật lại GPS."
          );
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOnline]);

  // 🖼️ Giao diện
  return (
    <View style={{ flex: 1 }}>
      <Header />
      <LinearGradient colors={["#1F7ED0", "#1F7ED0"]} style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.centerContainer}>
          <View style={styles.card}>
            <Image
              source={require("@/assets/images/vnpt.jpg")}
              style={styles.avatar}
            />
            {/* <Text style={styles.welcomeText}>Chào mừng trở lại</Text> */}
            <Text style={styles.nameText}>
              {user?.ho_ten || "Kỹ thuật viên VNPT"}
            </Text>
            <Text style={styles.subInfoText}>{user?.email || ""}</Text>

            <View style={styles.statusCard}>
              <Feather
                name="globe"
                size={20}
                color={isOnline ? "#22C55E" : "#9CA3AF"}
              />

              <Text
                style={[
                  styles.statusText,
                  { color: isOnline ? "#22C55E" : "#9CA3AF" },
                ]}
              >
                {isOnline ? "Đang trực tuyến" : "Đang ngoại tuyến"}
              </Text>
            </View>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  isOnline ? styles.onlineBtn : styles.offlineBtn,
                ]}
                onPress={handleToggleStatus}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Feather
                      name="globe"
                      size={20}
                      color={isOnline ? "#22C55E" : "#9CA3AF"}
                    />
                    <Text style={styles.buttonText}>
                      {isOnline ? "Chuyển ngoại tuyến" : "Chuyển trực tuyến"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Feather name="log-out" size={18} color="#fff" />
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#007BFF",
    marginBottom: 16,
  },
  welcomeText: { fontSize: 16, color: "#555", marginBottom: 4 },
  nameText: { fontSize: 20, fontWeight: "700", color: "#333", marginBottom: 4 },
  subInfoText: { fontSize: 14, color: "#666", marginBottom: 16 },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 20,
    gap: 8,
  },
  statusText: { fontSize: 16, fontWeight: "600" },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  onlineBtn: { backgroundColor: "#22C55E" },
  offlineBtn: { backgroundColor: "#9CA3AF" },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "500", marginLeft: 8 },
});
