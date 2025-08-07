// Import các hook và component cần thiết
import { useState } from "react";
import {
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
  ActivityIndicator, // Hiển thị loading
} from "react-native";

import { Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient"; // Nền gradient
import Constants from "expo-constants"; // Lấy biến môi trường từ app.json
import Toast from "react-native-toast-message"; // Hiển thị toast thông báo
import Feather from "react-native-vector-icons/Feather"; // Icon con mắt trong ô mật khẩu
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Lấy API_URL từ biến môi trường (app.json → extra)
const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function LoginScreen() {
  // State để lưu thông tin người dùng nhập
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Ẩn/hiện mật khẩu
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false); // Trạng thái loading khi đăng nhập

  // Hàm kiểm tra định dạng email
  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const router = useRouter();

  // Xử lý đăng nhập
  const handleLogin = async () => {
    let hasError = false;

    // Validate email
    if (!email) {
      setEmailError("Vui lòng nhập email");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Email không hợp lệ");
      hasError = true;
    } else {
      setEmailError("");
    }

    // Validate mật khẩu
    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Mật khẩu tối thiểu 6 ký tự");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) return;

    setLoading(true); // Bắt đầu loading

    try {
      // Gọi API để lấy CSRF token
      const csrfRes = await fetch(`${API_URL}/api/csrf-token`, {
        credentials: "include",
      });
      let csrfData = await csrfRes.json();
      let csrfToken = csrfData.csrf_token;

      await AsyncStorage.setItem("csrf_token", csrfToken);

      // Gửi yêu cầu đăng nhập
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken, // Bảo mật với CSRF token
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      console.log("Data:", data);

      // Đăng nhập thành công
      if (res.status === 200 && data.status === "success") {
        Toast.show({
          type: "success",
          text1: "Đăng nhập thành công!",
        });

        // Gán lại token mới
        const csrfRes = await fetch(`${API_URL}/api/csrf-token`, {
          credentials: "include",
        });
        csrfData = await csrfRes.json();
        csrfToken = csrfData.csrf_token;

        await AsyncStorage.setItem("csrf_token", csrfToken);

        // TODO: Chuyển trang sau khi login hoặc lưu session
        router.replace("/(tabs)/home");
        // Lưu user vào bộ nhớ
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      }
      // Lỗi validate đầu vào từ backend (422)
      else if (res.status === 422) {
        setEmailError(data.email?.[0] || "");
        setPasswordError(data.password?.[0] || "");
      }
      // Sai tài khoản hoặc không được phép
      else if (res.status === 401 || res.status === 403) {
        const message = data.auth_failed || "Email hoặc mật khẩu không đúng.";
        setEmailError(message);
        setPasswordError(message);
      }
      // Bị giới hạn số lần đăng nhập
      else if (res.status === 429) {
        Toast.show({
          type: "error",
          text1: "Quá nhiều lần đăng nhập",
          text2: data.auth_failed || "Hãy thử lại sau ít phút.",
        });
      }
      // Lỗi không xác định
      else {
        Toast.show({
          type: "error",
          text1: "Lỗi đăng nhập",
          text2: data["error-login"] || "Lỗi không xác định.",
        });
      }
    } catch (error) {
      // Không thể kết nối tới server
      console.error("Lỗi khi đăng nhập:", error);
      Toast.show({
        type: "error",
        text1: "Không thể kết nối máy chủ",
        text2: "Vui lòng thử lại sau.",
      });

      // Nếu chưa đăng nhập thì xóa user khỏi bộ nhớ (nếu có)
      await AsyncStorage.removeItem("user");
    }

    setLoading(false); // Kết thúc loading
  };

  return (
    <LinearGradient
      colors={["#007BFF", "#005BAC"]} // Nền xanh gradient
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/vnpt.jpg")}
                style={styles.logo}
              />
              <Text style={styles.brandText}>
                <Text style={styles.vnpt}>VNPT</Text>
                <Text style={styles.support}>Support</Text>
              </Text>
            </View>

            <Text style={styles.subtitle}>Đăng nhập để sử dụng hệ thống</Text>

            <View style={styles.form}>
              {/* Email input */}
              <View style={{ marginBottom: 16 }}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#9AB3CC"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError("");
                  }}
                  autoCapitalize="none"
                />
                {!!emailError && <Text style={styles.error}>{emailError}</Text>}
              </View>

              {/* Mật khẩu có icon ẩn/hiện */}
              <View style={{ marginBottom: 16 }}>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Mật khẩu"
                    placeholderTextColor="#9AB3CC"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setPasswordError("");
                    }}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Feather
                      name={showPassword ? "eye" : "eye-off"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {!!passwordError && (
                  <Text style={styles.error}>{passwordError}</Text>
                )}
              </View>

              {/* Nút đăng nhập */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Đăng nhập</Text>
                )}
              </TouchableOpacity>

              {/* Link quên mật khẩu */}
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL("https://spkt.gcs.id.vn/auth/forgot-password")
                }
              >
                <Text style={styles.forgot}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// Styles giao diện
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#005BAC",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 24,
  },
  form: {
    width: "100%",
  },
  input: {
    backgroundColor: "#F1F6FB",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#D3E2F0",
    color: "#003366",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  eyeIcon: {
    paddingHorizontal: 10,
    position: "absolute",
    right: 10,
    top: 14,
  },
  error: {
    color: "#FF3B30",
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 5,
  },
  button: {
    backgroundColor: "#007BFF",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#005BAC",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  forgot: {
    textAlign: "center",
    color: "#005BAC",
    fontSize: 14,
    marginTop: 16,
    textDecorationLine: "underline",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3, // Cho Android
    justifyContent: "center",
    alignItems: "center",
  },
  brandText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  vnpt: {
    color: "#00b4f0",
  },
  support: {
    color: "#FFC107",
  },
});
