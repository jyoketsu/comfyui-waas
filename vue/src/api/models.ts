import { request } from "@/api/index";
const waasApiUrl = import.meta.env.VITE_WAAS_API_URL;

export function getModels(path: string) {
  return request.get("/browser/proxy/admin/product/comfyuiModel/list", {
    path,
  });
}

export function sync(username: string) {
  return request.post("/browser/models/sync", {
    username,
  });
}

export function getInEffectiveModels(username: string) {
  return request.post("/browser/models/ineffective", {
    username,
  });
}

export function clear(username: string) {
  return request.post("/browser/models/clear", {
    username,
  });
}