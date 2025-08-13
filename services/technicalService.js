import { db } from '../config/firebaseConfig';
import { ref, onValue, set, update, remove, push } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hàm tạo dữ liệu khi nhân viên đăng nhập
export async function createDataWhenLogin() {
    // Lấy ID nhan viên trong bộ nhớ
    const userString = await AsyncStorage.getItem("user");
    if (!userString) throw new Error("Không tìm thấy user trong AsyncStorage");

    const user = JSON.parse(userString); // Parse chuỗi JSON thành object

    const userRef = ref(db, 'technical/' + user.id_nhanvien);
    await set(userRef, {
        ...user,
        loai: "employee",
    });
}

// Hàm cập nhật vị trí
export async function updateLocation(lat, lng) {
    // Lấy ID nhan viên trong bộ nhớ
    const userString = await AsyncStorage.getItem("user");
    if (!userString) throw new Error("Không tìm thấy user trong AsyncStorage");

    const user = JSON.parse(userString); // Parse chuỗi JSON thành object

    const userRef = ref(db, 'technical/' + user.id_nhanvien);
    await update(userRef, {
        kinh_do: lng,
        vi_do: lat,
    });
}

// Cập nhật trạng thái 
export async function updateStatusFirebase(isOnline) {
    // Lấy ID nhan viên trong bộ nhớ
    const userString = await AsyncStorage.getItem("user");
    if (!userString) throw new Error("Không tìm thấy user trong AsyncStorage");

    const user = JSON.parse(userString); // Parse chuỗi JSON thông tin người dùng

    let status = '';

    if (isOnline) {
        status = 'Trực tuyến';
    } else {
        status = 'Không trực tuyến';
    }

    const userRef = ref(db, 'technical/' + user.id_nhanvien);
    await update(userRef, {
        trang_thai: status,
    });
}