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

def test_endpoint(name, method, path, token=None, payload=None, content_type="application/json"):
    url = f"{BASE_URL}{path}"
    headers = {
        "User-Agent": "UADA-GroupChat-Tester/1.0",
        "Accept": "application/json"
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if content_type and payload is not None:
        headers["Content-Type"] = content_type

    data = None
    if payload is not None:
        if isinstance(payload, (dict, list)):
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
            print(f"✅ [{resp.status}] {method} {path} ({duration_ms}ms) - {name}")
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
        print(f"⚠️ [{e.code}] {method} {path} ({duration_ms}ms) - {name} -> {err_json}")
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
        print(f"❌ [ERR] {method} {path} - {name} -> {str(e)}")
        return res

def run():
    print("=" * 70)
    print("🧪 EXECUTING COMPREHENSIVE ENDPOINT TEST SUITE FOR BACKEND 07_FILES")
    print("=" * 70)

    # 1. SETUP USERS
    print("\n--- [Step 0: Setup 4 Test Users] ---")
    u1_res = test_endpoint("Login Leader", "POST", "/api/signuproute/auth/social", payload={
        "provider": "google", "provider_id": "gc-leader-test-01", "email": "gcleader@uada.play", "name": "Group Leader", "gender": "male", "age": 25
    })
    token1 = u1_res.get("data", {}).get("token")
    user1 = u1_res.get("data", {}).get("user", {})
    user1_id = user1.get("id")

    u2_res = test_endpoint("Login Member 1", "POST", "/api/signuproute/auth/social", payload={
        "provider": "apple", "provider_id": "gc-member-test-02", "email": "gcmember1@uada.play", "name": "Squad Member 1", "gender": "female", "age": 22
    })
    token2 = u2_res.get("data", {}).get("token")
    user2 = u2_res.get("data", {}).get("user", {})
    user2_id = user2.get("id")

    u3_res = test_endpoint("Login Member 2", "POST", "/api/signuproute/auth/social", payload={
        "provider": "facebook", "provider_id": "gc-member-test-03", "email": "gcmember2@uada.play", "name": "Squad Member 2", "gender": "male", "age": 23
    })
    token3 = u3_res.get("data", {}).get("token")
    user3 = u3_res.get("data", {}).get("user", {})
    user3_id = user3.get("id")

    u4_res = test_endpoint("Login Invitee", "POST", "/api/signuproute/auth/social", payload={
        "provider": "google", "provider_id": "gc-invitee-test-04", "email": "gcinvitee@uada.play", "name": "Guest Invitee", "gender": "female", "age": 21
    })
    token4 = u4_res.get("data", {}).get("token")
    user4 = u4_res.get("data", {}).get("user", {})
    user4_id = user4.get("id")

    if not token1 or not user2_id:
        print("Failed to authenticate test users. Exiting.")
        return

    print(f"\nUser 1 (Owner): ID {user1_id} ({user1.get('name')})")
    print(f"User 2 (Member): ID {user2_id} ({user2.get('name')})")
    print(f"User 3 (Member): ID {user3_id} ({user3.get('name')})")
    print(f"User 4 (Invitee): ID {user4_id} ({user4.get('name')})")

    # 2. CREATE GROUP
    print("\n--- [Step 1: Create Group Chat] ---")
    create_res = test_endpoint(
        "POST /api/groupchat/create", "POST", "/api/groupchat/create",
        token=token1,
        payload={
            "name": "Alpha Strike Squad",
            "description": "High stakes Ludo and voice lobby team",
            "member_ids": [user2_id]
        }
    )
    group_data = create_res.get("data", {}).get("group", {})
    group_id = group_data.get("id")
    invite_code = group_data.get("invite_code")
    print(f"Created Group ID: {group_id}, Invite Code: {invite_code}")

    if not group_id:
        print("Cannot continue without valid group_id.")
        return

    # 3. VIEW MY GROUPS
    print("\n--- [Step 2: View My Groups] ---")
    test_endpoint("GET /api/groupchat/my-groups (Owner)", "GET", "/api/groupchat/my-groups", token=token1)
    test_endpoint("GET /api/groupchat/my-groups (Member)", "GET", "/api/groupchat/my-groups", token=token2)

    # 4. VIEW GROUP INFO & DETAILS
    print("\n--- [Step 3: View Group Details & Roster] ---")
    test_endpoint(f"GET /api/groupchat/{group_id}", "GET", f"/api/groupchat/{group_id}", token=token1)

    # 5. UPDATE GROUP INFO
    print("\n--- [Step 4: Update Group Info / Settings] ---")
    test_endpoint(
        f"PUT /api/groupchat/{group_id}/update", "PUT", f"/api/groupchat/{group_id}/update",
        token=token1,
        payload={
            "name": "Alpha Strike Squad Elite",
            "description": "Verified elite gaming squad",
            "only_admins_can_send": False,
            "only_admins_can_edit_info": True
        }
    )

    # 6. ADD MEMBER TO GROUP
    print("\n--- [Step 5: Add Member To Group] ---")
    test_endpoint(
        f"POST /api/groupchat/{group_id}/members", "POST", f"/api/groupchat/{group_id}/members",
        token=token1,
        payload={
            "user_ids": [user3_id]
        }
    )

    # 7. CHANGE MEMBER ROLE (PROPER ROLE PROMOTION)
    print("\n--- [Step 6: Change Member Role] ---")
    test_endpoint(
        f"PUT /api/groupchat/{group_id}/members/{user2_id}/role", "PUT", f"/api/groupchat/{group_id}/members/{user2_id}/role",
        token=token1,
        payload={
            "role": "admin"
        }
    )

    # 8. SEND GROUP MESSAGES
    print("\n--- [Step 7: Send Group Messages] ---")
    msg1_res = test_endpoint(
        f"POST /api/groupchat/{group_id}/send (Msg 1 - Owner)", "POST", f"/api/groupchat/{group_id}/send",
        token=token1,
        payload={
            "message_type": "text",
            "content": "Welcome to Alpha Strike Squad Elite! Let's conquer the board."
        }
    )
    msg1_id = msg1_res.get("data", {}).get("data", {}).get("id") or msg1_res.get("data", {}).get("id")

    msg2_res = test_endpoint(
        f"POST /api/groupchat/{group_id}/send (Msg 2 - Member)", "POST", f"/api/groupchat/{group_id}/send",
        token=token2,
        payload={
            "message_type": "text",
            "content": "Ready when you are! Dice are warmed up 🎲"
        }
    )
    msg2_id = msg2_res.get("data", {}).get("data", {}).get("id") or msg2_res.get("data", {}).get("id")

    # 9. VIEW GROUP HISTORY
    print("\n--- [Step 8: View Group Message History] ---")
    test_endpoint(f"GET /api/groupchat/{group_id}/messages", "GET", f"/api/groupchat/{group_id}/messages", token=token2)

    # 10. MARK GROUP MESSAGES READ
    print("\n--- [Step 9: Mark Group Messages Read] ---")
    test_endpoint(f"PUT /api/groupchat/{group_id}/read", "PUT", f"/api/groupchat/{group_id}/read", token=token2)

    # 11. SEARCH GROUP MESSAGES
    print("\n--- [Step 10: Search Group Messages] ---")
    test_endpoint(f"GET /api/groupchat/{group_id}/search?q=Dice", "GET", f"/api/groupchat/{group_id}/search?q=Dice", token=token1)

    # 12. REACT TO GROUP MESSAGE
    if msg1_id:
        print("\n--- [Step 11: React To Group Message] ---")
        test_endpoint(
            f"PUT /api/groupchat/message/{msg1_id}/react", "PUT", f"/api/groupchat/message/{msg1_id}/react",
            token=token2,
            payload={
                "emoji": "🔥"
            }
        )

    # 13. EDIT GROUP MESSAGE
    if msg1_id:
        print("\n--- [Step 12: Edit Group Message] ---")
        test_endpoint(
            f"PUT /api/groupchat/message/{msg1_id}/edit", "PUT", f"/api/groupchat/message/{msg1_id}/edit",
            token=token1,
            payload={
                "content": "Welcome to Alpha Strike Squad Elite! (Edited by Captain)"
            }
        )

    # 14. PIN GROUP MESSAGE
    if msg1_id:
        print("\n--- [Step 13: Pin Group Message] ---")
        test_endpoint(
            f"PUT /api/groupchat/message/{msg1_id}/pin", "PUT", f"/api/groupchat/message/{msg1_id}/pin",
            token=token1
        )

    # 15. JOIN GROUP VIA INVITE CODE (USER 4)
    if invite_code:
        print("\n--- [Step 14: Join Group Via Invite Code] ---")
        test_endpoint(
            f"POST /api/groupchat/join/{invite_code}", "POST", f"/api/groupchat/join/{invite_code}",
            token=token4
        )

    # 16. DELETE GROUP MESSAGE
    if msg2_id:
        print("\n--- [Step 15: Delete Group Message] ---")
        test_endpoint(
            f"DELETE /api/groupchat/message/{msg2_id}", "DELETE", f"/api/groupchat/message/{msg2_id}",
            token=token2
        )

    # 17. REMOVE MEMBER FROM GROUP (ADMIN/OWNER REMOVES USER 3)
    print("\n--- [Step 16: Remove Member From Group] ---")
    test_endpoint(
        f"DELETE /api/groupchat/{group_id}/members/{user3_id}", "DELETE", f"/api/groupchat/{group_id}/members/{user3_id}",
        token=token1
    )

    # 18. LEAVE GROUP (USER 4 LEAVES ON THEIR OWN)
    print("\n--- [Step 17: Leave Group (Self Leave)] ---")
    test_endpoint(
        f"POST /api/groupchat/{group_id}/leave", "POST", f"/api/groupchat/{group_id}/leave",
        token=token4
    )

    # 19. FINAL VERIFICATION OF GROUP STATE
    print("\n--- [Step 18: Final Group Info Verification] ---")
    test_endpoint(f"GET /api/groupchat/{group_id}", "GET", f"/api/groupchat/{group_id}", token=token1)

    # SUMMARY
    print("\n" + "=" * 70)
    print("📊 TEST SUMMARY REPORT")
    print("=" * 70)
    total = len(test_results)
    passed = sum(1 for t in test_results if t["success"])
    failed = total - passed
    print(f"Total Endpoints Tested: {total}")
    print(f"Passed: {passed}")
    print(f"Failed / Warnings: {failed}")
    print(f"Success Rate: {(passed / total) * 100:.1f}%\n")

    with open("groupchat_test_results.json", "w") as f:
        json.dump(test_results, f, indent=2)
    print("Detailed test results written to groupchat_test_results.json")

if __name__ == "__main__":
    run()
