import { firestore } from '../config/firebaseConfig';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hàm tạo dữ liệu khi nhân viên đăng nhập
export async function createDataWhenLogin() {
    // Lấy ID nhân viên trong bộ nhớ
    const userString = await AsyncStorage.getItem("user");
    if (!userString) throw new Error("Không tìm thấy user trong AsyncStorage");

    const user = JSON.parse(userString); // Parse chuỗi JSON thành object

    const userDocRef = doc(firestore, 'technical', user.id_nhanvien + ""); // ID phịa là chuỗi
    await setDoc(userDocRef, {
        ...user,
        loai: "employee",
    });
}

// Hàm cập nhật vị trí
export async function updateLocation(lat, lng) {
    // Lấy ID nhân viên trong bộ nhớ
    const userString = await AsyncStorage.getItem("user");
    if (!userString) throw new Error("Không tìm thấy user trong AsyncStorage");

    const user = JSON.parse(userString); // Parse chuỗi JSON thành object

    const userDocRef = doc(firestore, 'technical', user.id_nhanvien + ""); // ID phỉa là chuỗi
    await updateDoc(userDocRef, {
        kinh_do: lng,
        vi_do: lat,
    });
}

// Cập nhật trạng thái
export async function updateStatusFirebase(isOnline) {
    // Lấy ID nhân viên trong bộ nhớ
    const userString = await AsyncStorage.getItem("user");
    if (!userString) throw new Error("Không tìm thấy user trong AsyncStorage");

    const user = JSON.parse(userString); // Parse chuỗi JSON thông tin người dùng

    let status = isOnline ? 'Trực tuyến' : 'Không trực tuyến';

    const userDocRef = doc(firestore, 'technical', user.id_nhanvien + ""); // ID phịa là chuỗi
    await updateDoc(userDocRef, {
        trang_thai: status,
    });
}