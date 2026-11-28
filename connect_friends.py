import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "https://72-61-235-208.sslip.io"

def do_req(url, method="POST", payload=None, token=None):
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=12) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return json.loads(body)
        except:
            return {"status": e.code, "err": body}

with open("test_accounts_credentials.json") as f:
    creds = json.load(f)

u1 = creds["users"][0]
u2 = creds["users"][1]
u3 = creds["users"][2]

t1 = do_req(f"{BASE_URL}/api/signuproute/auth/login", "POST", {"unique_id": u1["uada_id"], "password": u1["password"]})["token"]
t2 = do_req(f"{BASE_URL}/api/signuproute/auth/login", "POST", {"unique_id": u2["uada_id"], "password": u2["password"]})["token"]
t3 = do_req(f"{BASE_URL}/api/signuproute/auth/login", "POST", {"unique_id": u3["uada_id"], "password": u3["password"]})["token"]

# 1. Alex -> Maya follow request
r1 = do_req(f"{BASE_URL}/api/follow/request/{u2['user_id']}", "POST", None, t1)
print("Alex -> Maya Follow Request:", r1)

# Check Maya's pending requests & accept
pending_maya = do_req(f"{BASE_URL}/api/follow/requests", "GET", None, t2)
print("Maya Pending Requests:", pending_maya)
for req in pending_maya.get("requests", []):
    rid = req.get("request_id") or req.get("id")
    if rid:
        acc = do_req(f"{BASE_URL}/api/follow/accept/{rid}", "PUT", None, t2)
        print(f"Maya accepted request {rid}:", acc)

# 2. Maya -> Alex follow request
r2 = do_req(f"{BASE_URL}/api/follow/request/{u1['user_id']}", "POST", None, t2)
print("Maya -> Alex Follow Request:", r2)
pending_alex = do_req(f"{BASE_URL}/api/follow/requests", "GET", None, t1)
print("Alex Pending Requests:", pending_alex)
for req in pending_alex.get("requests", []):
    rid = req.get("request_id") or req.get("id")
    if rid:
        acc = do_req(f"{BASE_URL}/api/follow/accept/{rid}", "PUT", None, t1)
        print(f"Alex accepted request {rid}:", acc)

# 3. Alex <-> Sam
r3 = do_req(f"{BASE_URL}/api/follow/request/{u3['user_id']}", "POST", None, t1)
pending_sam = do_req(f"{BASE_URL}/api/follow/requests", "GET", None, t3)
for req in pending_sam.get("requests", []):
    rid = req.get("request_id") or req.get("id")
    if rid:
        acc = do_req(f"{BASE_URL}/api/follow/accept/{rid}", "PUT", None, t3)
        print(f"Sam accepted request {rid}:", acc)

r4 = do_req(f"{BASE_URL}/api/follow/request/{u1['user_id']}", "POST", None, t3)
pending_alex2 = do_req(f"{BASE_URL}/api/follow/requests", "GET", None, t1)
for req in pending_alex2.get("requests", []):
    rid = req.get("request_id") or req.get("id")
    if rid:
        acc = do_req(f"{BASE_URL}/api/follow/accept/{rid}", "PUT", None, t1)
        print(f"Alex accepted Sam's request {rid}:", acc)

# Check Alex following and followers
alex_following = do_req(f"{BASE_URL}/api/follow/following", "GET", None, t1)
alex_followers = do_req(f"{BASE_URL}/api/follow/followers", "GET", None, t1)
print(f"Alex Following Count: {len(alex_following.get('following', []))}")
print(f"Alex Followers Count: {len(alex_followers.get('followers', []))}")
