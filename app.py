import json
import re
import random
import requests
import os
import shutil
import time
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from playwright.async_api import async_playwright
try:
    from playwright_stealth import Stealth
except ImportError:
    Stealth = None
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Meta Ads Tool", version="2.1")

SECURE_MODE = os.getenv("SECURE_MODE", "True").lower() == "true"
CARDS_SOURCE = os.getenv("CARDS_SOURCE_URL", "")

Path("templates").mkdir(exist_ok=True)
templates = Jinja2Templates(directory="templates")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def normalize_cookie(c: Dict) -> Dict:
    if "domain" not in c or not c.get("domain"):
        c["domain"] = ".facebook.com"
    if not c["domain"].startswith("."):
        c["domain"] = "." + c["domain"]
    if "path" not in c or not c.get("path"):
        c["path"] = "/"
    allowed = {"name", "value", "domain", "path", "expires", "httpOnly", "secure", "sameSite"}
    return {k: v for k, v in c.items() if k in allowed and v is not None}


def parse_cookies(cookies_input: str | list | dict) -> List[Dict]:
    try:
        if isinstance(cookies_input, str):
            stripped = cookies_input.strip()
            if stripped.startswith('['):
                raw = json.loads(stripped)
            elif stripped.startswith('{'):
                obj = json.loads(stripped)
                raw = [{"name": k, "value": str(v)} for k, v in obj.items()]
            else:
                raw = []
                for pair in stripped.split(';'):
                    if '=' in pair:
                        k, v = pair.strip().split('=', 1)
                        if k.strip():
                            raw.append({"name": k.strip(), "value": v.strip()})
        elif isinstance(cookies_input, dict):
            raw = [{"name": k, "value": str(v)} for k, v in cookies_input.items()]
        elif isinstance(cookies_input, list):
            raw = cookies_input
        else:
            raw = []
        return [normalize_cookie(c) for c in raw if c.get("name")]
    except Exception as e:
        raise ValueError(f"صيغة الكوكيز غير صحيحة: {str(e)}")


def extract_act_id(ad_account_input: str) -> str:
    """استخرج رقم الحساب من أي صيغة (URL، act_xxx، أو رقم مجرد)"""
    s = ad_account_input.strip()
    m = re.search(r'act[_=](\d+)', s)
    if m:
        return m.group(1)
    m = re.search(r'(\d{8,})', s)
    if m:
        return m.group(1)
    return s.replace('act_', '').strip()


async def get_stealth_browser(playwright, cookies: List[Dict], proxy: Optional[str] = None, headless: bool = True):
    proxy_cfg = None
    if proxy:
        parts = proxy.split(':')
        if len(parts) == 4:
            proxy_cfg = {'server': f'http://{parts[0]}:{parts[1]}', 'username': parts[2], 'password': parts[3]}
        elif len(parts) == 2:
            proxy_cfg = {'server': f'http://{parts[0]}:{parts[1]}'}

    system_chromium = shutil.which("chromium") or shutil.which("chromium-browser")
    launch_kwargs = dict(
        headless=headless,
        args=[
            '--no-sandbox', '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-features=ChromeWhatsNewUI,ChromeWhatsNewUI2024',
            '--disable-gpu', '--lang=ar-EG', '--window-size=1280,900',
            '--disable-extensions', '--disable-default-apps'
        ],
        ignore_default_args=['--enable-automation']
    )
    if system_chromium:
        launch_kwargs['executable_path'] = system_chromium

    browser = await playwright.chromium.launch(**launch_kwargs)
    ctx = await browser.new_context(
        proxy=proxy_cfg,
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport={'width': 1280, 'height': 900},
        locale='ar-EG',
        timezone_id='Africa/Cairo',
        accept_downloads=True,
        ignore_https_errors=True
    )
    if cookies:
        await ctx.add_cookies(cookies)
    if Stealth:
        await Stealth().apply_stealth_async(ctx)
    return browser, ctx


# ======================= API: التحقق واستخراج التوكن =======================
@app.post("/api/verify_and_extract")
async def verify_and_extract(request: Request):
    data = await request.json()
    cookies_raw = data.get("cookies", "")
    proxy = data.get("proxy", "").strip() or None
    ad_account_raw = data.get("ad_account", "").strip()

    try:
        cookies = parse_cookies(cookies_raw)
    except ValueError as e:
        return {"ok": False, "reason": str(e)}

    # بناء رابط الصفحة المستهدفة — دائماً Ads Manager لأنه يحتوي على التوكن
    if ad_account_raw:
        act_id = extract_act_id(ad_account_raw)
        target_url = f'https://www.facebook.com/ads/manager/?act={act_id}'
        resolved_account = f"act_{act_id}"
    else:
        target_url = 'https://www.facebook.com/ads/manager/'
        resolved_account = None

    try:
        async with async_playwright() as p:
            browser, ctx = await get_stealth_browser(p, cookies, proxy, headless=True)
            page = await ctx.new_page()

            await page.goto(target_url, wait_until='domcontentloaded', timeout=30000)
            await page.wait_for_timeout(4000)

            if 'login' in page.url or 'checkpoint' in page.url:
                await browser.close()
                return {"ok": False, "reason": "كوكيز منتهية أو حساب محظور أو طلب تحقق"}

            token = await page.evaluate('''() => {
                try {
                    const scripts = document.querySelectorAll('script');
                    for(let s of scripts){
                        const m = s.textContent.match(/"accessToken":"([^"]+)"/);
                        if(m) return m[1];
                    }
                    return localStorage.getItem('token') || null;
                } catch(e) { return null; }
            }''')

            content = await page.content()
            name_match = re.search(r'<title>([^<]+)</title>', content)
            name = name_match.group(1).replace('Facebook', '').strip() if name_match else 'مستخدم'

            # إذا لم يُعطَ حساب، استخرجه من الصفحة
            if not resolved_account:
                found = list(set(re.findall(r'act_(\d+)', content)))
                resolved_account = f"act_{found[0]}" if found else ""

            await browser.close()
            return {
                "ok": True,
                "name": name,
                "token": token,
                "ad_account": resolved_account
            }
    except Exception as e:
        return {"ok": False, "reason": f"خطأ: {str(e)[:100]}"}


# ======================= API: استخراج معلومات المنشور =======================
@app.post("/api/extract_post_info")
async def extract_post_info(request: Request):
    data = await request.json()
    url = data.get("url", "").strip()
    token = data.get("token", "")

    if not url:
        return {"ok": False, "reason": "الرجاء إدخال رابط المنشور"}

    post_id = None
    page_id = None
    page_slug = None

    patterns = [
        (r'story_fbid=(\d+).*?[&?]id=(\d+)', (1, 2)),
        (r'facebook\.com/(?:groups/\d+/)?([^/]+)/(?:posts|videos|photos)/(\d+)', (1, 2, True)),
        (r'[?&]fbid=(\d+)', (1,)),
        (r'/reel/(\d+)', (1,)),
    ]

    for pattern, groups in patterns:
        m = re.search(pattern, url)
        if m:
            if len(groups) == 2:
                post_id, page_id = m.group(groups[0]), m.group(groups[1])
            elif len(groups) == 3:
                page_slug, post_id = m.group(groups[0]), m.group(groups[1])
            else:
                post_id = m.group(groups[0])
            break

    if not post_id:
        return {"ok": False, "reason": "لم يتم التعرف على صيغة الرابط"}

    if page_slug and not page_id and token:
        try:
            res = requests.get(f"https://graph.facebook.com/v18.0/{page_slug}",
                               params={"fields": "id,name", "access_token": token}, timeout=10).json()
            if "id" in res:
                page_id = res["id"]
        except:
            pass

    return {"ok": True, "post_id": post_id, "page_id": page_id or "", "page_slug": page_slug or ""}


# ======================= API: إضافة البطاقات =======================
@app.post("/api/add_cards")
async def add_cards(request: Request):
    data = await request.json()
    cookies_raw = data.get("cookies", "")
    proxy = data.get("proxy", "").strip() or None
    ad_account = data.get("ad_account", "")
    mode = data.get("mode", "manual")
    cards_text = data.get("cards_text", "").strip()
    billing_url = data.get("billing_url", "").strip()

    try:
        cookies = parse_cookies(cookies_raw)
    except ValueError as e:
        return {"ok": False, "reason": str(e)}

    if mode == "auto":
        if not CARDS_SOURCE:
            return {"ok": False, "reason": "لم يتم تكوين مصدر البطاقات"}
        try:
            resp = requests.get(CARDS_SOURCE, timeout=10)
            if resp.status_code != 200:
                return {"ok": False, "reason": f"فشل جلب البطاقات: {resp.status_code}"}
            lines = [l.strip() for l in resp.text.strip().splitlines() if l.strip()]
            if not lines:
                return {"ok": False, "reason": "قائمة البطاقات فارغة"}
            cards_text = random.choice(lines)
        except Exception as e:
            return {"ok": False, "reason": f"خطأ جلب البطاقات: {str(e)[:50]}"}

    if not cards_text:
        return {"ok": False, "reason": "لا توجد بطاقات للربط"}

    if not billing_url and ad_account:
        act_id = ad_account.replace('act_', '').strip()
        billing_url = f'https://www.facebook.com/ads/manager/account_settings/account_billing/?act={act_id}'

    if not billing_url:
        return {"ok": False, "reason": "لم يتم تحديد حساب إعلاني"}

    results = []
    try:
        async with async_playwright() as p:
            browser, ctx = await get_stealth_browser(p, cookies, proxy, headless=True)
            page = await ctx.new_page()
            try:
                await page.goto(billing_url, wait_until='networkidle', timeout=45000)
                await page.wait_for_timeout(5000)

                for line in cards_text.strip().split('\n'):
                    line = line.strip()
                    if not line:
                        continue
                    parts = line.split('|')
                    if len(parts) < 4:
                        results.append({"card": line[:20], "status": "❌ صيغة خاطئة (card|mm|yyyy|cvv)"})
                        continue

                    card_num = parts[0].strip()
                    mm = parts[1].strip()
                    yyyy = parts[2].strip()
                    cvv = parts[3].strip()
                    name_on_card = parts[4].strip() if len(parts) >= 5 else "Card Holder"

                    try:
                        # كل بطاقة تفتح الفورم من جديد
                        add_btn = page.get_by_role("button", name="Add payment method")
                        await add_btn.click(timeout=15000)
                        await page.wait_for_timeout(3000)

                        next_btn = page.get_by_role("button", name="Next")
                        await next_btn.click(timeout=10000)
                        await page.wait_for_timeout(4000)

                        name_input = page.get_by_role("textbox", name="Name on card")
                        await name_input.wait_for(timeout=8000)
                        await name_input.fill(name_on_card)

                        card_input = page.get_by_role("textbox", name="Card number")
                        await card_input.wait_for(timeout=5000)
                        await card_input.fill(card_num)

                        expiry_input = page.get_by_role("textbox", name="MM/YY")
                        await expiry_input.wait_for(timeout=5000)
                        await expiry_input.fill(f"{mm}/{yyyy[-2:]}")

                        cvv_input = page.get_by_role("textbox", name="CVV")
                        await cvv_input.wait_for(timeout=5000)
                        await cvv_input.fill(cvv)

                        save_btn = page.get_by_role("button", name="Save")
                        await save_btn.click(timeout=5000)
                        await page.wait_for_timeout(6000)

                        page_content = await page.content()
                        if "تمت إضافة البطاقة" in page_content or "Card added" in page_content:
                            results.append({"card": f"{card_num[:6]}****{card_num[-4:]}", "status": "✅ تمت الإضافة بنجاح"})
                        elif "Invalid" in page_content or "غير صالح" in page_content or "declined" in page_content.lower():
                            results.append({"card": f"{card_num[:6]}****{card_num[-4:]}", "status": "❌ البطاقة مرفوضة"})
                        else:
                            results.append({"card": f"{card_num[:6]}****{card_num[-4:]}", "status": "⚠️ يرجى التحقق يدوياً"})

                        # العودة لصفحة الفوترة للبطاقة التالية
                        await page.goto(billing_url, wait_until='networkidle', timeout=30000)
                        await page.wait_for_timeout(4000)

                    except Exception as e:
                        results.append({"card": card_num[:10], "status": f"❌ فشل: {str(e)[:60]}"})
                        try:
                            await page.goto(billing_url, wait_until='networkidle', timeout=30000)
                            await page.wait_for_timeout(4000)
                        except:
                            pass

                await browser.close()
                return {"ok": True, "results": results}

            except Exception as e:
                await browser.close()
                return {"ok": False, "reason": f"خطأ عام: {str(e)[:200]}"}
    except Exception as e:
        return {"ok": False, "reason": f"خطأ: {str(e)[:100]}"}


# ======================= API: إنشاء الإعلان =======================
@app.post("/api/create_ad")
async def create_ad(request: Request):
    data = await request.json()
    token = data.get("token", "")
    ad_account = data.get("ad_account", "")
    page_id = data.get("page_id", "")
    post_id = data.get("post_id", "")
    daily_budget = float(data.get("budget", 10))
    days = int(data.get("days", 0))
    objective = data.get("objective", "OUTCOME_ENGAGEMENT")
    traffic_url = data.get("traffic_url", "")

    if not all([token, ad_account, page_id, post_id]):
        return {"ok": False, "reason": "بيانات ناقصة"}

    headers = {"Authorization": f"Bearer {token}"}
    act_id = ad_account.replace('act_', '')
    base = f"https://graph.facebook.com/v18.0/act_{act_id}"
    ts = datetime.now().strftime('%H%M%S')

    goal_map = {
        "OUTCOME_TRAFFIC": "LINK_CLICKS",
        "OUTCOME_ENGAGEMENT": "POST_ENGAGEMENT",
        "OUTCOME_AWARENESS": "REACH",
        "OUTCOME_LEADS": "LEAD_GENERATION",
        "OUTCOME_SALES": "OFFSITE_CONVERSIONS",
    }
    opt_goal = goal_map.get(objective, "POST_ENGAGEMENT")

    try:
        camp_res = requests.post(f"{base}/campaigns", headers=headers, data={
            "name": f"Camp_{ts}",
            "objective": objective,
            "status": "PAUSED",
            "special_ad_categories": "[]"
        }, timeout=15).json()

        if "id" not in camp_res:
            return {"ok": False, "reason": f"خطأ الحملة: {camp_res.get('error',{}).get('message',str(camp_res))}"}
        camp_id = camp_res["id"]

        targeting = data.get("targeting", {})
        if not targeting:
            targeting = {"geo_locations": {"countries": ["EG"]}}
        targeting_json = json.dumps(targeting)

        adset_data = {
            "name": f"AdSet_{ts}",
            "campaign_id": camp_id,
            "billing_event": "IMPRESSIONS",
            "optimization_goal": opt_goal,
            "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
            "targeting": targeting_json,
            "status": "PAUSED"
        }
        if days > 0:
            adset_data["lifetime_budget"] = int(daily_budget * days * 100)
            adset_data["end_time"] = (datetime.now() + timedelta(days=days)).strftime('%Y-%m-%dT%H:%M:%S+0000')
        else:
            adset_data["daily_budget"] = int(daily_budget * 100)

        adset_res = requests.post(f"{base}/adsets", headers=headers, data=adset_data, timeout=15).json()
        if "id" not in adset_res:
            return {"ok": False, "reason": f"خطأ المجموعة: {adset_res.get('error',{}).get('message',str(adset_res))}"}
        adset_id = adset_res["id"]

        creative = json.dumps(
            {"object_story_id": f"{page_id}_{post_id}", "link_url": traffic_url}
            if traffic_url else {"object_story_id": f"{page_id}_{post_id}"}
        )
        ad_res = requests.post(f"{base}/ads", headers=headers, data={
            "name": f"Ad_{ts}",
            "adset_id": adset_id,
            "creative": creative,
            "status": "PAUSED"
        }, timeout=15).json()

        if "id" not in ad_res:
            return {"ok": False, "reason": f"خطأ الإعلان: {ad_res.get('error',{}).get('message',str(ad_res))}"}

        return {
            "ok": True,
            "campaign_id": camp_id,
            "adset_id": adset_id,
            "ad_id": ad_res["id"],
            "message": "✅ تم إنشاء الإعلان متوقفاً"
        }
    except Exception as e:
        return {"ok": False, "reason": f"خطأ: {str(e)[:100]}"}


# ======================= API: تنشيط الإعلان =======================
@app.post("/api/activate_ad")
async def activate_ad(request: Request):
    data = await request.json()
    token = data.get("token", "")
    ad_id = data.get("ad_id", "")
    campaign_id = data.get("campaign_id", "")
    adset_id = data.get("adset_id", "")

    if not token or not ad_id:
        return {"ok": False, "reason": "بيانات ناقصة"}

    headers = {"Authorization": f"Bearer {token}"}
    base = "https://graph.facebook.com/v18.0"

    try:
        if campaign_id:
            r = requests.post(f"{base}/{campaign_id}", headers=headers, data={"status": "ACTIVE"}, timeout=10).json()
            if "error" in r:
                return {"ok": False, "reason": f"خطأ الحملة: {r['error'].get('message','')}"}
        if adset_id:
            r = requests.post(f"{base}/{adset_id}", headers=headers, data={"status": "ACTIVE"}, timeout=10).json()
            if "error" in r:
                return {"ok": False, "reason": f"خطأ المجموعة: {r['error'].get('message','')}"}
        r = requests.post(f"{base}/{ad_id}", headers=headers, data={"status": "ACTIVE"}, timeout=10).json()
        if "error" in r:
            return {"ok": False, "reason": f"خطأ الإعلان: {r['error'].get('message','')}"}
        return {"ok": True, "message": "✅ تم تنشيط الإعلان"}
    except Exception as e:
        return {"ok": False, "reason": f"خطأ: {str(e)[:100]}"}


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 5000))
    uvicorn.run(app, host=host, port=port)
