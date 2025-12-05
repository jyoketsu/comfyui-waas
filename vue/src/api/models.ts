import { request } from "@/api/index";

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