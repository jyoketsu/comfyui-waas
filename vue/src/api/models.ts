import { request } from "@/api/index";
const isDev = import.meta.env.DEV

export function getModels(path: string, name?: string, isNew?: string) {
  return request.get(isDev ? '/api/product/comfyuiModel/list' : "/browser/proxy/product/comfyuiModel/list", {
    path,
    name,
    isNew,
  });
}

export function getNewModelList() {
  return request.get(isDev ? '/api/product/comfyuiModel/listNew' : "/browser/proxy/product/comfyuiModel/listNew");
}

export function searchModels(name: string) {
  return request.get(isDev ? '/api/product/comfyuiModel/search' : "/browser/proxy/product/comfyuiModel/search", {
    name,
  });
}

export function sync(rootPath: string, models: string[], dstPath: string) {
  return request.post("/browser/models/sync", {
    rootPath,
    models,
    dstPath,
  });
}

export function getInEffectiveModels(rootPaths: string[]) {
  return request.post("/browser/models/ineffective", {
    rootPaths,
  });
}

export function clear(paths: string[]) {
  return request.post("/browser/models/clear", {
    paths,
  });
}