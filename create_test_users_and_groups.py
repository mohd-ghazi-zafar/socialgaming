import urllib.request
import json
import ssl
import time
import uuid

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "https://72-61-235-208.sslip.io"

def post_json(path, payload, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=12) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"HTTPError {e.code} on {path}: {body}")
        try:
            return json.loads(body)
        except:
            return {"error": body, "status": e.code}

def put_json(path, payload, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="PUT")
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=12) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"HTTPError {e.code} on {path}: {body}")
        try:
            return json.loads(body)
        except:
            return {"error": body, "status": e.code}

def register_user(phone, name, gender, age, password):
    # 1. Send OTP
    otp_res = post_json("/api/signuproute/auth/phone/send-otp", {"phone_number": phone})
    otp = otp_res.get("otp")
    if not otp:
        print(f"Failed to get OTP for {phone}: {otp_res}")
        return None

    # 2. Signup
    signup_payload = {
        "phone_number": phone,
        "otp": otp,
        "password": password,
        "confirm_password": password,
        "name": name,
        "gender": gender,
        "age": age,
        "role": "user"
    }

    # Use multipart form-data for /auth/phone/signup as backend expects upload.single('profile')
    boundary = "----WebKitFormBoundary" + uuid.uuid4().hex
    body_parts = []
    for k, v in signup_payload.items():
        body_parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n")
    body_parts.append(f"--{boundary}--\r\n")
    body_bytes = "".join(body_parts).encode("utf-8")

    req = urllib.request.Request(
        f"{BASE_URL}/api/signuproute/auth/phone/signup",
        data=body_bytes,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}", "Accept": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, context=ctx, timeout=12) as r:
            res = json.loads(r.read().decode("utf-8"))
            return res
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"Signup error for {phone}: {body}")
        return None

def test_login(unique_id, password):
    return post_json("/api/signuproute/auth/login", {"unique_id": unique_id, "password": password})

def main():
    print("=" * 60)
    print("CREATING TEST USERS & ACTIVE GROUP CHATS FOR MANUAL VERIFICATION")
    print("=" * 60)

    password = "Password123!"
    rand_suffix = str(int(time.time()))[-4:]

    # User 1: Captain Alex
    u1_phone = f"+919811{rand_suffix}01"
    print(f"\nRegistering User 1 (Captain Alex) with phone {u1_phone}...")
    u1_reg = register_user(u1_phone, "Captain Alex", "male", "25", password)
    if not u1_reg or "token" not in u1_reg:
        print("User 1 registration failed.")
        return
    u1_token = u1_reg["token"]
    u1_user = u1_reg["user"]
    u1_uid = u1_reg.get("unique_id") or u1_user.get("user_uid")
    u1_id = u1_user.get("id")
    print(f"✅ User 1 Created: ID={u1_id}, UADA_ID={u1_uid}, Name={u1_user.get('name')}")

    # User 2: Pro Gamer Maya
    u2_phone = f"+919811{rand_suffix}02"
    print(f"\nRegistering User 2 (Pro Gamer Maya) with phone {u2_phone}...")
    u2_reg = register_user(u2_phone, "Pro Gamer Maya", "female", "23", password)
    if not u2_reg or "token" not in u2_reg:
        print("User 2 registration failed.")
        return
    u2_token = u2_reg["token"]
    u2_user = u2_reg["user"]
    u2_uid = u2_reg.get("unique_id") or u2_user.get("user_uid")
    u2_id = u2_user.get("id")
    print(f"✅ User 2 Created: ID={u2_id}, UADA_ID={u2_uid}, Name={u2_user.get('name')}")

    # User 3: Sam Champion
    u3_phone = f"+919811{rand_suffix}03"
    print(f"\nRegistering User 3 (Sam Champion) with phone {u3_phone}...")
    u3_reg = register_user(u3_phone, "Sam Champion", "male", "24", password)
    if not u3_reg or "token" not in u3_reg:
        print("User 3 registration failed.")
        return
    u3_token = u3_reg["token"]
    u3_user = u3_reg["user"]
    u3_uid = u3_reg.get("unique_id") or u3_user.get("user_uid")
    u3_id = u3_user.get("id")
    print(f"✅ User 3 Created: ID={u3_id}, UADA_ID={u3_uid}, Name={u3_user.get('name')}")

    # Verify ID login for User 1 & User 2
    print("\nVerifying ID login endpoint with UADA ID and Password...")
    login1_check = test_login(u1_uid, password)
    print(f"User 1 Login Check: {'SUCCESS' if 'token' in login1_check else 'FAILED'}")
    login2_check = test_login(u2_uid, password)
    print(f"User 2 Login Check: {'SUCCESS' if 'token' in login2_check else 'FAILED'}")

    # Connect them as mutual friends (Follow / Friend Requests)
    print("\nConnecting Users as Mutual Friends...")
    # Alex follows Maya
    f1 = post_json(f"/api/follow/send_request/{u2_id}", {}, u1_token)
    req1_id = f1.get("request", {}).get("id") or f1.get("request_id")
    if req1_id:
        post_json(f"/api/follow/accept/{req1_id}", {}, u2_token)
    # Maya follows Alex
    f2 = post_json(f"/api/follow/send_request/{u1_id}", {}, u2_token)
    req2_id = f2.get("request", {}).get("id") or f2.get("request_id")
    if req2_id:
        post_json(f"/api/follow/accept/{req2_id}", {}, u1_token)

    # Alex follows Sam & Sam follows Alex
    f3 = post_json(f"/api/follow/send_request/{u3_id}", {}, u1_token)
    req3_id = f3.get("request", {}).get("id") or f3.get("request_id")
    if req3_id:
        post_json(f"/api/follow/accept/{req3_id}", {}, u3_token)
    f4 = post_json(f"/api/follow/send_request/{u1_id}", {}, u3_token)
    req4_id = f4.get("request", {}).get("id") or f4.get("request_id")
    if req4_id:
        post_json(f"/api/follow/accept/{req4_id}", {}, u1_token)

    print("✅ Mutual Friendship established between users!")

    # 1. CREATE GROUP 1: TopTop Champions Squad
    print("\nCreating Group 1: '🔥 TopTop Champions Squad'...")
    g1_res = post_json("/api/groupchat/create", {
        "name": "🔥 TopTop Champions Squad",
        "description": "Official gaming team for voice lobbies and tournament matches",
        "member_ids": [u2_id, u3_id]
    }, u1_token)
    g1 = g1_res.get("group", {})
    g1_id = g1.get("id")
    g1_invite = g1.get("invite_code")
    print(f"✅ Group 1 Created: ID={g1_id}, Invite={g1_invite}")

    # Promote Maya to Admin in Group 1
    if g1_id:
        put_json(f"/api/groupchat/{g1_id}/members/{u2_id}/role", {"role": "admin"}, u1_token)
        # Send initial chat messages
        post_json(f"/api/groupchat/{g1_id}/send", {
            "message_type": "text",
            "content": "Welcome champions! Tournament bracket begins this evening. 🏆"
        }, u1_token)
        post_json(f"/api/groupchat/{g1_id}/send", {
            "message_type": "text",
            "content": "Ready Captain! Strategy is set and dice are loaded. 🔥"
        }, u2_token)
        post_json(f"/api/groupchat/{g1_id}/send", {
            "message_type": "text",
            "content": "Let's bring home the win team! 🎲"
        }, u3_token)

    # 2. CREATE GROUP 2: Weekend Ludo Masters
    print("\nCreating Group 2: '🎲 Weekend Ludo Masters'...")
    g2_res = post_json("/api/groupchat/create", {
        "name": "🎲 Weekend Ludo Masters",
        "description": "Casual 4-player Ludo lounge and voice chat",
        "member_ids": [u2_id]
    }, u1_token)
    g2 = g2_res.get("group", {})
    g2_id = g2.get("id")
    g2_invite = g2.get("invite_code")
    print(f"✅ Group 2 Created: ID={g2_id}, Invite={g2_invite}")

    if g2_id:
        post_json(f"/api/groupchat/{g2_id}/send", {
            "message_type": "text",
            "content": "Who is ready for a quick match? 🎲"
        }, u1_token)
        post_json(f"/api/groupchat/{g2_id}/send", {
            "message_type": "text",
            "content": "Count me in! Starting table now."
        }, u2_token)

    # Save credentials summary to file
    credentials = {
        "users": [
            {
                "name": "Captain Alex",
                "role_in_group": "Group Owner / Leader",
                "user_id": u1_id,
                "uada_id": u1_uid,
                "phone": u1_phone,
                "password": password
            },
            {
                "name": "Pro Gamer Maya",
                "role_in_group": "Group Admin / Co-Lead",
                "user_id": u2_id,
                "uada_id": u2_uid,
                "phone": u2_phone,
                "password": password
            },
            {
                "name": "Sam Champion",
                "role_in_group": "Squad Member",
                "user_id": u3_id,
                "uada_id": u3_uid,
                "phone": u3_phone,
                "password": password
            }
        ],
        "groups": [
            {
                "id": g1_id,
                "name": "🔥 TopTop Champions Squad",
                "invite_code": g1_invite,
                "members": ["Captain Alex (Owner)", "Pro Gamer Maya (Admin)", "Sam Champion (Member)"]
            },
            {
                "id": g2_id,
                "name": "🎲 Weekend Ludo Masters",
                "invite_code": g2_invite,
                "members": ["Captain Alex (Owner)", "Pro Gamer Maya (Member)"]
            }
        ]
    }

    with open("test_accounts_credentials.json", "w") as f:
        json.dump(credentials, f, indent=2)

    print("\n" + "=" * 60)
    print("ALL TEST USERS & GROUPS SETUP COMPLETE!")
    print("=" * 60)
    print(json.dumps(credentials, indent=2))

if __name__ == "__main__":
    main()
