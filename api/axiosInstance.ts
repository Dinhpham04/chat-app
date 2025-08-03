import { getAccount } from "@/utils/secureStore";
import axios from "axios";
//http://192.168.1.16:3000/api/v1
//http://172.20.10.3:3000/api/v1
const axiosInstance = axios.create({
  baseURL: "http://192.168.1.16:3000/api/v1", // Thay đổi URL này cho phù hợp
  timeout: 10000, // 10 giây
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor cho request (ví dụ: thêm token nếu có)
axiosInstance.interceptors.request.use(
  async (config) => {
    // Lấy thông tin tài khoản từ SecureStore
    const account = await getAccount();
    if (account) {
      try {
        if ((account as any).accessToken) {
          config.headers["Authorization"] = `Bearer ${(account as any).accessToken
            }`;
        }
      } catch (error) {
        console.error("Lỗi khi parse account data:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho response (xử lý lỗi chung)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Có thể xử lý lỗi chung ở đây
    return Promise.reject(error);
  }
);

export default axiosInstance;
