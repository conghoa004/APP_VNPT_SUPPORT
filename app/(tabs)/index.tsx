// Import các hook và component cần thiết từ React và React Native
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Lấy URL của API từ biến môi trường trong app.json
const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function Index() {
  // State để kiểm tra quá trình đang check đăng nhập
  const [checking, setChecking] = useState(true);

  // State để xác định người dùng đã đăng nhập hay chưa
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // Hàm kiểm tra trạng thái đăng nhập từ server
    const checkAuth = async () => {
      try {
        // Gửi yêu cầu GET đến API kiểm tra trạng thái đăng nhập
        const res = await fetch(`${API_URL}/api/check-login`, {
          credentials: "include", // Cho phép gửi kèm cookie session
        });

        // Chuyển dữ liệu từ response thành JSON
        const data = await res.json();

        // Nếu phản hồi thành công và có thông tin người dùng
        if (res.status === 200 && data.user !== null) {
          // Lưu thông tin người dùng vào bộ nhớ cục bộ (AsyncStorage)
          await AsyncStorage.setItem("user", JSON.stringify(data.user));

          // Cập nhật trạng thái đã đăng nhập
          setLoggedIn(true);

          // Lấy token session
          // Gọi API để lấy CSRF token
          const csrfRes = await fetch(`${API_URL}/api/csrf-token`, {
            credentials: "include",
          });
          const csrfData = await csrfRes.json();
          const csrfToken = csrfData.csrf_token;

          // Lưu CSRF token vào bộ nhớ
          await AsyncStorage.setItem("csrf_token", csrfToken);
        } else {
          // Nếu không đăng nhập thì xóa thông tin người dùng khỏi bộ nhớ
          await AsyncStorage.removeItem("user");
        }
      } catch (error) {
        // Nếu có lỗi khi gọi API, in ra lỗi để debug
        console.log("Không thể kiểm tra đăng nhập:", error);
      }

      // Kết thúc quá trình kiểm tra đăng nhập
      setChecking(false);
    };

    // Gọi hàm kiểm tra đăng nhập khi component được mount
    checkAuth();
  }, []);

  // Nếu đang kiểm tra, hiển thị vòng tròn loading
  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Nếu đã đăng nhập, chuyển hướng đến trang chính (home)
  // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
  return loggedIn ? (
    <Redirect href="/(tabs)/home" />
  ) : (
    <Redirect href="../login" />
  );
}