import requests
from dotenv import dotenv_values

config = dotenv_values(".env")


def send_simple_message():
    return requests.post(
        "https://api.mailgun.net/v3/mg.ophtalmologiste.be/messages",
        auth=("api", f"{config['MG_API_KEY']}"),
        data={
            "from": "mailgun@ophtalmologiste.be",
            "to": f"{config['TEST_EMAIL']}",
            "subject": "Hello!",
            "text": "Congratulations, you just sent an email! You are truly awesome!",
        },
    )
