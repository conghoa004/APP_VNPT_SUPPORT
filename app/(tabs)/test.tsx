// import React, { useEffect, useState } from "react";
// import { View } from "react-native";
// import { db } from "../../config/firebaseConfig";
// import { ref, onValue, set, update, remove, push } from "firebase/database";
// import { getCurrentUser } from "@/services/authService";

// // Lấy dữ liệu
// function getDta() {
//   const data = ref(db, "technical"); // lấy ra tham chiếu link á

//   onValue(data, (snapshot) => {
//     const data = snapshot.val();
//     console.log(data);
//   });
// }

// getDta();

// // Du lieu thêm
// const technical = {
//   id_nhanvien: 76462,
//   ho_ten: "Văn Tuấn Cảnh",
//   email: "conghoa247@gmail.com",
//   id_taikhoan: 24,
//   anh_dai_dien: "assets/img/user.png",
// };

// // Hàm thêm dữ liệu
// async function addData() {
//   const dataRef = ref(db, "technical/" + technical.id_nhanvien);

//   try {
//     await update(dataRef, {
//       email: "8989",
//     });
//     console.log("Data added successfully");
//   } catch (error) {
//     console.error("Error adding data:", error);
//   }
// }

// // Gọi hàm async
// if(getCurrentUser() != null) {
//   addData();
// }

// export default function EmployeeManager() {
//   return <View></View>;
// }
