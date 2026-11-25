import urllib.request
import json
import ssl
import time
import sys

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "https://72-61-235-208.sslip.io"

test_results = []

def test_endpoint(name, method, path, token=None, payload=None, is_form=False, content_type="application/json"):
    url = f"{BASE_URL}{path}"
    headers = {"User-Agent": "UADA-API-Crawler/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if content_type and not is_form:
        headers["Content-Type"] = content_type

    data = None
    if payload:
        if is_form:
            data = payload
        elif isinstance(payload, (dict, list)):
            data = json.dumps(payload).encode("utf-8")
        elif isinstance(payload, str):
            data = payload.encode("utf-8")

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    start_time = time.time()
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=12) as resp:
            duration_ms = round((time.time() - start_time) * 1000)
            raw = resp.read().decode("utf-8")
            try:
                res_json = json.loads(raw)
            except:
                res_json = raw[:200]
            res = {
                "name": name,
                "method": method,
                "path": path,
                "status": resp.status,
                "duration_ms": duration_ms,
                "success": True,
                "data": res_json
            }
            test_results.append(res)
            print(f"✅ [{resp.status}] {method} {path} ({duration_ms}ms)")
            return res
    except urllib.error.HTTPError as e:
        duration_ms = round((time.time() - start_time) * 1000)
        err_body = e.read().decode("utf-8")
        try:
            err_json = json.loads(err_body)
        except:
            err_json = err_body[:200]
        res = {
            "name": name,
            "method": method,
            "path": path,
            "status": e.code,
            "duration_ms": duration_ms,
            "success": False,
            "error": err_json
        }
        test_results.append(res)
        print(f"⚠️ [{e.code}] {method} {path} ({duration_ms}ms) -> {err_json}")
        return res
    except Exception as e:
        duration_ms = round((time.time() - start_time) * 1000)
        res = {
            "name": name,
            "method": method,
            "path": path,
            "status": "ERR",
            "duration_ms": duration_ms,
            "success": False,
            "error": str(e)
        }
        test_results.append(res)
        print(f"❌ [ERR] {method} {path} -> {str(e)}")
        return res

print("="*60)
print("🚀 RUNNING UADA BACKEND API CRAWLER & TEST SUITE")
print("="*60)

# 1. AUTHENTICATION & LOGIN
print("\n--- 1. Auth & User Profile Tests ---")
login_res = test_endpoint(
    "Social Login (Bot Player 1)", "POST", "/api/signuproute/auth/social",
    payload={
        "provider": "google",
        "provider_id": "uada-crawler-bot-01",
        "email": "bot01@uada.play",
        "name": "Crawler Bot 1",
        "gender": "male",
        "age": 22
    }
)

token1 = login_res.get("data", {}).get("token")
user1 = login_res.get("data", {}).get("user", {})
user1_id = user1.get("id")

# Create a second user for 1-on-1 interaction
login_res2 = test_endpoint(
    "Social Login (Bot Player 2)", "POST", "/api/signuproute/auth/social",
    payload={
        "provider": "apple",
        "provider_id": "uada-crawler-bot-02",
        "email": "bot02@uada.play",
        "name": "Crawler Bot 2",
        "gender": "female",
        "age": 24
    }
)
token2 = login_res2.get("data", {}).get("token")
user2 = login_res2.get("data", {}).get("user", {})
user2_id = user2.get("id")

if not token1 or not token2:
    print("FATAL: Failed to obtain tokens. Aborting test suite.")
    sys.exit(1)

test_endpoint("Get My Profile (Bot 1)", "GET", "/api/signuproute/auth/users/me", token=token1)
all_users_res = test_endpoint("View All Users", "GET", "/api/signuproute/all_user", token=token1)
test_endpoint("Update Profile", "PUT", f"/api/signuproute/auth/users/update/{user1_id}", token=token1, payload={
    "name": "Crawler Bot 1 Verified",
    "gender": "male",
    "age": 23
})

# 2. FOLLOW & FRIENDS
print("\n--- 2. Follow & Friends Tests ---")
test_endpoint("Send Follow Request (Bot 1 -> Bot 2)", "POST", f"/api/follow/request/{user2_id}", token=token1)
requests_res = test_endpoint("View Pending Follow Requests (Bot 2)", "GET", "/api/follow/requests", token=token2)
pending = requests_res.get("data", {}).get("requests", [])
if pending:
    req_id = pending[0].get("id") or pending[0].get("request_id")
    if req_id:
        test_endpoint("Accept Follow Request (Bot 2 accepts Bot 1)", "PUT", f"/api/follow/accept/{req_id}", token=token2)

test_endpoint("Get Followers (Bot 2)", "GET", f"/api/follow/followers/{user2_id}", token=token1)
test_endpoint("Get Following (Bot 1)", "GET", f"/api/follow/following/{user1_id}", token=token1)
test_endpoint("Get Follow Stats (Bot 1)", "GET", f"/api/follow/stats/{user1_id}", token=token1)
test_endpoint("Check Follow Status (Bot 1 <-> Bot 2)", "GET", f"/api/follow/status/{user2_id}", token=token1)

# 3. BLOCKS
print("\n--- 3. Block System Tests ---")
test_endpoint("Block User (Bot 1 blocks Bot 2 temporarily)", "POST", f"/api/blockroute/{user2_id}", token=token1)
test_endpoint("View Blocked List", "GET", "/api/blockroute/list", token=token1)
test_endpoint("View Blocked Count", "GET", "/api/blockroute/count", token=token1)
test_endpoint("Check Block Status", "GET", f"/api/blockroute/status/{user2_id}", token=token1)
test_endpoint("Unblock User", "DELETE", f"/api/blockroute/{user2_id}", token=token1)

# 4. REPORTS
print("\n--- 4. Reports System Tests ---")
test_endpoint("Submit Report Against User", "POST", f"/api/report/report/{user2_id}", token=token1, payload={
    "reason": "Test Report",
    "description": "Automated verification test of report filing."
})
test_endpoint("View My Reports", "GET", "/api/report/report/my-reports", token=token1)

# 5. BANNER
print("\n--- 5. Promo Banner Tests ---")
test_endpoint("Get Promotional Banners", "GET", "/api/banner", token=token1)

# 6. PRIVATE CHAT
print("\n--- 6. Private Chat System Tests ---")
inbox_res = test_endpoint("View Inbox (Bot 1)", "GET", "/api/chatroute/inbox", token=token1)
start_chat_res = test_endpoint("Start or Get 1-on-1 Chat (Bot 1 <-> Bot 2)", "POST", f"/api/chatroute/start/{user2_id}", token=token1)
chat_room = start_chat_res.get("data", {}).get("chat", {})
chat_id = chat_room.get("id")

if chat_id:
    # Send text message
    send_res = test_endpoint("Send Chat Message (Text from Bot 1)", "POST", f"/api/chatroute/{chat_id}/send", token=token1, payload={
        "message_type": "text",
        "content": "Hello Bot 2! Ready for an arena board match?"
    })
    msg_id = send_res.get("data", {}).get("data", {}).get("id")

    # Send voice simulation message
    test_endpoint("Send Chat Message (Voice from Bot 2)", "POST", f"/api/chatroute/{chat_id}/send", token=token2, payload={
        "message_type": "voice",
        "content": "🎤 Voice note (0:04)",
        "media_duration": 4
    })

    # View messages
    test_endpoint("Get Chat History", "GET", f"/api/chatroute/{chat_id}/messages?limit=50&offset=0", token=token1)

    # Mark as read
    test_endpoint("Mark Messages as Read", "PUT", f"/api/chatroute/{chat_id}/read", token=token2)

    # React to message
    if msg_id:
        test_endpoint("React to Message", "PUT", f"/api/chatroute/message/{msg_id}/react", token=token2, payload={"emoji": "🔥"})
        test_endpoint("Edit Message (Bot 1)", "PUT", f"/api/chatroute/message/{msg_id}/edit", token=token1, payload={"content": "Hello Bot 2! Match confirmed."})

    # Search in chat
    test_endpoint("Search Messages in Chat", "GET", f"/api/chatroute/{chat_id}/search?q=Match", token=token1)

# 7. MOMENTS
print("\n--- 7. Moments Feed Tests ---")
moments_res = test_endpoint("Get All Moments Feed", "GET", "/api/momentroute/moments?limit=20&offset=0", token=token1)
moments_list = moments_res.get("data", {}).get("moments", [])

# Post a test moment (simulate multipart boundary)
boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
body_parts = [
    f"--{boundary}\r\n".encode("utf-8"),
    f"Content-Disposition: form-data; name=\"caption\"\r\n\r\n".encode("utf-8"),
    f"UADA Automated Tournament Victory!\r\n".encode("utf-8"),
    f"--{boundary}\r\n".encode("utf-8"),
    f"Content-Disposition: form-data; name=\"image\"; filename=\"test_moment.png\"\r\n".encode("utf-8"),
    f"Content-Type: image/png\r\n\r\n".encode("utf-8"),
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82\r\n",
    f"--{boundary}--\r\n".encode("utf-8"),
]
body_bytes = b"".join(body_parts)

post_moment_res = test_endpoint(
    "Post New Moment (Photo + Caption)", "POST", "/api/momentroute/moments",
    token=token1, payload=body_bytes, is_form=True, content_type=f"multipart/form-data; boundary={boundary}"
)

moment_id = post_moment_res.get("data", {}).get("moment", {}).get("id")
if not moment_id and moments_list:
    moment_id = moments_list[0].get("id")

if moment_id:
    test_endpoint("React to Moment (Bot 2 reacts 'love')", "POST", f"/api/momentroute/moments/{moment_id}/react", token=token2, payload={"reaction_type": "love"})
    test_endpoint("View Moment Reactions", "GET", f"/api/momentroute/moments/{moment_id}/reactions", token=token1)

test_endpoint("Get User Moments (Bot 1)", "GET", f"/api/momentroute/moments/user/{user1_id}", token=token1)

print("\n" + "="*60)
print("📊 TEST SUITE RUN SUMMARY")
print("="*60)
passed = sum(1 for r in test_results if r["success"] and (r["status"] in (200, 201)))
failed = len(test_results) - passed
print(f"Total Endpoints Tested: {len(test_results)}")
print(f"Passed / Success:      {passed}")
print(f"Failed / Issues:       {failed}")
print("="*60)

with open("test_results_summary.json", "w", encoding="utf-8") as f:
    json.dump(test_results, f, indent=2)
