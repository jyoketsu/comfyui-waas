import axios from "axios";
import { ElMessage } from "element-plus";

const token = import.meta.env.VITE_TOKEN;

export const request = {
  get(path: string, params?: object) {
    return new Promise(async function (resolve, reject) {
      try {
        const response = await axios({
          method: "get",
          url: path,
          params: params,
          // headers: {
          //   "VERSION": "prewaas"
          // }
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  },
  post(path: string, params?: object) {
    return new Promise(async function (resolve, reject) {
      try {
        const response = await axios({
          method: "post",
          url: path,
          data: params,
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  },
  put(path: string, params: object) {
    return new Promise(async function (resolve, reject) {
      try {
        const response = await axios({
          method: "put",
          url: path,
          data: params,
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  },
  patch(path: string, params: object) {
    return new Promise(async function (resolve, reject) {
      try {
        const response = await axios({
          method: "patch",
          url: path,
          data: params,
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  },
  delete(path: string, params?: object) {
    return new Promise(async function (resolve, reject) {
      try {
        const response = await axios({
          method: "delete",
          url: path,
          data: params,
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  },
};

// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    if (token) {
      // 设置 Authorization 头部
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axios.interceptors.response.use(
  (response) => response, // 请求成功直接返回
  async (error) => {
    console.log('error', error);

    ElMessage.error(error.response && error.response.data
      ? error.response.data.msg
      : error.message
    );
    // 其他错误情况直接返回错误信息
    return Promise.reject(
      error.response && error.response.data
        ? error.response.data.msg
        : error.message
    );
  }
);
