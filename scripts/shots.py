"""Render each Sujood screen at 390x845 @3x and save to /workspace/sujood-work/shots."""
import json, sys, urllib.request, re
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8098"
OUT = Path("/workspace/sujood-work/shots")
OUT.mkdir(parents=True, exist_ok=True)

STATE = {
    "schema": 1,
    "onboardingComplete": True,
    "onboardingStep": 3,
    "location": {
        "latitude": 24.8607,
        "longitude": 67.0011,
        "label": "Karachi",
        "country": "Pakistan",
        "timezone": "Asia/Karachi",
        "source": "gps",
    },
    "method": "Karachi",
    "madhab": "Hanafi",
    "offsets": {"fajr": 0, "dhuhr": 0, "asr": 0, "maghrib": 0, "isha": 0},
    "alerts": {
        "azanEnabled": True,
        "perPrayer": {
            "fajr": {"enabled": True, "sound": "dawn"},
            "dhuhr": {"enabled": True, "sound": "classic"},
            "asr": {"enabled": True, "sound": "classic"},
            "maghrib": {"enabled": True, "sound": "dusk"},
            "isha": {"enabled": True, "sound": "classic"},
        },
        "preReminder": True,
        "preReminderMinutes": 15,
        "dailyAyah": True,
        "dailyHadith": True,
        "jumuah": True,
        "suhoor": False,
        "iftar": False,
    },
    "tasbih": {
        "phraseIndex": 0,
        "count": 12,
        "target": 33,
        "marks": {"date": "2026-11-12", "fajr": True, "dhuhr": False, "asr": False, "maghrib": False, "isha": False},
    },
    "translationOn": True,
}

CLOCK = "2026-11-12T04:52:00+05:00"

SCREENS = [
    ("splash", "/?stay=1", 900, False),
    ("onboarding", "/onboarding?step=2", 1400, False),
    ("home", "/home", 1600, True),
    ("azan", "/azan?prayer=fajr", 1600, True),
    ("month", "/times", 1800, True),
    ("qibla", "/times/qibla", 1600, True),
    ("tasbih", "/home/tasbih", 1600, True),
    ("quran-list", "/quran", 1600, True),
    ("quran-reader", "/quran/1", 1600, True),
    ("hadith", "/library/hadith", 1600, True),
    ("books", "/library", 1600, True),
    ("books-reader", "/library/book/pickthall", 1600, True),
    ("names", "/home/names", 1600, True),
    ("mosques", "/home/mosques", 5000, True),
    ("notifications", "/settings/alerts", 1600, True),
    ("settings", "/settings", 1600, True),
]

def proxy_overpass(route):
    url = route.request.url
    if "overpass" in url and "interpreter" in url:
        try:
            data = route.request.post_data
            body = data.encode("utf-8") if isinstance(data, str) else (data or b"")
            req = urllib.request.Request(
                "https://overpass.openstreetmap.fr/api/interpreter",
                data=body,
                method="POST",
                headers={
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "Accept": "application/json",
                    "User-Agent": "Sujood/1.0 (Codixr software agency)",
                },
            )
            with urllib.request.urlopen(req, timeout=18) as resp:
                payload = resp.read()
            route.fulfill(status=200, content_type="application/json", body=payload, headers={"Access-Control-Allow-Origin": "*"})
        except Exception as exc:
            print("OVERPASS PROXY FAIL", type(exc).__name__, str(exc)[:200])
            route.abort()
        return
    route.continue_()


def main():
    which = sys.argv[2].split(",") if len(sys.argv) > 2 else [s[0] for s in SCREENS]
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        for name, path, wait_ms, onboarded in SCREENS:
            if name not in which:
                continue
            ctx = browser.new_context(viewport={"width": 390, "height": 845}, device_scale_factor=3)
            page = ctx.new_page()
            page.on("pageerror", lambda e: print("PAGEERR", str(e)[:400]))
            page.on("console", lambda m: print("CONSOLE", m.type, m.text[:300]) if m.type == "error" else None)
            page.route(re.compile(r".*overpass.*"), proxy_overpass)
            state = dict(STATE)
            state["onboardingComplete"] = onboarded
            state["onboardingStep"] = 2 if name == "onboarding" else 3
            page.add_init_script(
                """
                (() => {
                  localStorage.setItem('sujood.state.v1', %s);
                  localStorage.setItem('sujood.clock', %s);
                })();
                """
                % (json.dumps(json.dumps(state)), json.dumps(CLOCK))
            )
            page.goto(BASE + path, wait_until="networkidle", timeout=60000)
            page.wait_for_timeout(wait_ms)
            dest = OUT / f"{name}.png"
            page.screenshot(path=str(dest), full_page=False)
            print("saved", dest, dest.stat().st_size)
            ctx.close()
        browser.close()

if __name__ == "__main__":
    main()
