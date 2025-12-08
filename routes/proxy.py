import aiohttp
from aiohttp import web

BASE_URL = "https://waas.cloudmind.cc/api"


async def api_proxy(request: web.Request):
    tail_path = request.match_info.get("tail", "")
    target_url = f"{BASE_URL}/{tail_path}"

    if request.query_string:
        target_url += f"?{request.query_string}"

    print("[Proxy] →", target_url)

    method = request.method

    # Body（仅 JSON 有效）
    body = None
    if method in ["POST", "PUT", "PATCH"]:
        try:
            body = await request.json()
        except:
            body = await request.read()

    # 原请求 headers
    headers = dict(request.headers)
    headers.pop("Host", None)

    async with aiohttp.ClientSession() as session:
        async with session.request(
            method,
            target_url,
            headers=headers,
            json=body if isinstance(body, dict) else None,
            data=body if isinstance(body, (bytes, str)) else None,
            ssl=False,
        ) as resp:

            data = await resp.read()

            # 被代理服务器返回的 headers
            resp_headers = dict(resp.headers)

            # 去掉 aiohttp 不允许的 header
            resp_headers.pop("Content-Length", None)

            # ❗最关键：aiohttp 不允许 charset 出现在 content_type
            # 所以不能用 content_type 参数，必须用 headers
            return web.Response(
                status=resp.status,
                body=data,
                headers=resp_headers,
            )
