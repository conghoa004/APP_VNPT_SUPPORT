// services/authService.js
import { auth } from "../config/firebaseConfig";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
} from "firebase/auth";

// Đăng nhập
export async function login(email, password) {
    try {
        console.log("[AuthService] Bắt đầu đăng nhập với email:", email);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("[AuthService] Đăng nhập thành công:", userCredential.user.email);
        return userCredential;
    } catch (error) {
        console.error("[AuthService] Lỗi đăng nhập:", error.code, error.message);
        throw error; // đẩy lỗi lên để component gọi có thể xử lý
    }
};

// Kiểm tra trạng thái đăng nhập
export function getCurrentUser() {
  return auth.currentUser;  // Trả về user nếu đã đăng nhập, hoặc null nếu chưa
}

// Đăng ký tài khoản mới
export async function register(email, password) {
    try {
        console.log("[AuthService] Bắt đầu đăng ký với email:", email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("[AuthService] Đăng ký thành công:", userCredential.user.email);
        return userCredential;
    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            console.log("Email đã tồn tại!");
        } else {
            console.error("Lỗi khác:", error.message);
        }
    }
}

// Đăng xuất
export async function logout() {
    try {
        console.log("[AuthService] Bắt đầu đăng xuất");
        await signOut(auth);
        console.log("[AuthService] Đăng xuất thành công");
    } catch (error) {
        console.error("[AuthService] Lỗi đăng xuất:", error.code, error.message);
        throw error;
    }
}
