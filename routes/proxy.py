import aiohttp
from aiohttp import web

# todo生产
# BASE_URL = "https://waas.cloudmind.cc/api"
BASE_URL = "https://waas.aigate.cc/api"

FORWARD_HEADER_WHITELIST = {
    "authorization",
    "accept",
    "accept-language",
    "content-type",
    "user-agent",
}

async def api_proxy(request: web.Request):
    tail = request.match_info.get("tail", "")
    url = f"{BASE_URL}/{tail}"
    if request.query_string:
        url += f"?{request.query_string}"

    print("[Proxy] >", request.method, url)

    # 过滤 headers
    in_headers = {k.lower(): v for k, v in request.headers.items()}
    norm = {}
    for k, v in in_headers.items():
        if k not in FORWARD_HEADER_WHITELIST:
            continue
        if k == "authorization":
            norm["Authorization"] = v
        elif k == "content-type":
            norm["Content-Type"] = v
        elif k == "accept-language":
            norm["Accept-Language"] = v
        elif k == "user-agent":
            norm["User-Agent"] = v
        else:
            norm[k] = v

    method = request.method

    # body 处理
    body = None
    send_json = False
    if method in ("POST", "PUT", "PATCH"):
        try:
            body = await request.json()
            send_json = True
        except:
            body = await request.read()
            send_json = False

    async with aiohttp.ClientSession(trust_env=False) as session:
        try:
            async with session.request(
                method,
                url,
                headers=norm,
                json=body if send_json else None,
                data=None if send_json else body,
                ssl=False,
                timeout=aiohttp.ClientTimeout(total=30),
            ) as resp:

                raw = await resp.read()
                print("[Proxy] Response Status:", resp.status)

                out_headers = dict(resp.headers)

                # ❗ 必须移除，否则前端拿不到 body
                out_headers.pop("Content-Encoding", None)
                out_headers.pop("Transfer-Encoding", None)
                out_headers.pop("Content-Length", None)

                # Content-Type 去掉 charset
                ctype = resp.headers.get("Content-Type", "application/json")
                ctype = ctype.split(";")[0]
                out_headers["Content-Type"] = ctype

                return web.Response(
                    status=resp.status,
                    body=raw,
                    headers=out_headers,
                )

        except Exception as e:
            print("[Proxy] Exception:", repr(e))
            return web.Response(
                status=502,
                text=f"proxy error: {repr(e)}"
            )
