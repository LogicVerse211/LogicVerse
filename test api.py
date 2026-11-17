
import requests

# Login
login_url = "http://127.0.0.1:8000/accounts/login/"

login_data = {
    "username": "s-muntasir",
    "password": "1234sajid"
}

login_response = requests.post(login_url, json=login_data)

print("Login Status:", login_response.status_code)

if login_response.status_code == 200:

    token = login_response.json()["access"]

    # Get Mission List
    headers = {
        "Authorization": f"Bearer {token}"
    }

    mission_url = "http://127.0.0.1:8000/api/missions/"

    mission_response = requests.get(
        mission_url,
        headers=headers
    )

    print("Mission API Status:", mission_response.status_code)
    print("Mission Data:", mission_response.json())

else:
    print("Login Failed:", login_response.json())
