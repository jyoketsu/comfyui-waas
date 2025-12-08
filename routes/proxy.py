import aiohttp
from aiohttp import web

BASE_URL = "https://waas.cloudmind.cc/api"


async def api_proxy(request: web.Request):
    # 拿到路径，例如 /admin/product/comfyuiModel/list
    tail_path = request.match_info.get("tail", "")

    # 拼完整 URL
    target_url = f"{BASE_URL}/{tail_path}"

    # query 参数 ?path=xxx 原样带过去
    if request.query_string:
        target_url += f"?{request.query_string}"

    print("[Proxy] →", target_url)

    method = request.method

    # body（POST/PUT 才有）
    try:
        body = await request.json()
    except:
        body = None

    headers = dict(request.headers)
    headers.pop("Host", None)

    async with aiohttp.ClientSession() as session:
        async with session.request(
            method, target_url, headers=headers, json=body if body else None, ssl=False
        ) as resp:
            data = await resp.read()

            # 返回原始数据
            return web.Response(
                status=resp.status,
                body=data,
                content_type=resp.headers.get("Content-Type", "application/json"),
            )
