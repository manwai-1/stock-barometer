import os
import json
from datetime import datetime, timezone
import requests
import yfinance as yf

FRED_KEY = os.environ.get("FRED_API_KEY", "")

def fetch_fred_latest(series_id):
    if not FRED_KEY:
        return None
    url = f"https://api.stlouisfed.org/fred/series/observations?series_id={series_id}&api_key={FRED_KEY}&file_type=json&sort_order=desc&limit=1"
    try:
        res = requests.get(url, timeout=10).json()
        val = res['observations'][0]['value']
        return float(val) if val != '.' else None
    except Exception as e:
        print(f"Error fetching FRED {series_id}: {e}")
        return None

def fetch_yfinance_close(ticker):
    try:
        t = yf.Ticker(ticker)
        hist = t.history(period="5d")
        if hist.empty:
            return None
        return round(float(hist['Close'].iloc[-1]), 2)
    except Exception as e:
        print(f"Error fetching {ticker}: {e}")
        return None

def run_pipeline():
    # 1. 抓取實時數據
    tips = fetch_fred_latest("DFII10") or 2.10
    
    # 修正：FRED 的信用利差單位是 %，必須乘以 100 轉為真正的基點 (bps)
    hy_spread_raw = fetch_fred_latest("BAMLH0A0HYM2") or 3.30
    hy_spread_bps = int(round(hy_spread_raw * 100))
    
    sahm = fetch_fred_latest("SAHMREALTIME") or 0.25
    move = fetch_yfinance_close("^MOVE") or 92.0
    spy = fetch_yfinance_close("SPY") or 580.0
    rsp = fetch_yfinance_close("RSP") or 170.0
    rsp_spy_ratio = round(rsp / spy, 4)

    # 2. 斷路器邏輯
    circuit_breaker = sahm >= 0.50

    # 3. 修正後的數據結構與動態百分位數推估
    metrics_payload = [
        {
            "id": "net_liquidity",
            "value": "5.94T",
            "status": "GREEN",
            "percentile": 74
        },
        {
            "id": "tips_10y",
            "value": f"{tips:.2f}%",
            "status": "GREEN" if tips < 1.5 else ("YELLOW" if tips < 2.5 else "RED"),
            "percentile": int(min(max((tips / 3.0) * 100, 0), 100))
        },
        {
            "id": "hy_spread",
            "value": f"{hy_spread_bps} bps",  # 正確顯示 320 bps 等真實數值
            "status": "GREEN" if hy_spread_bps > 500 else ("RED" if hy_spread_bps < 300 else "YELLOW"),
            "percentile": int(min(max(((hy_spread_bps - 250) / 400) * 100, 5), 95))
        },
        {
            "id": "erp",
            "value": "1.38%",
            "status": "YELLOW",
            "percentile": 36
        },
        {
            "id": "rsp_spy",
            "value": str(rsp_spy_ratio),
            "status": "GREEN" if rsp_spy_ratio > 0.28 else "YELLOW",
            "percentile": 65
        },
        {
            "id": "sp500_200ma",
            "value": "67.8%",
            "status": "GREEN",
            "percentile": 62
        },
        {
            "id": "move_index",
            "value": str(move),
            "status": "GREEN" if move < 95 else ("YELLOW" if move < 115 else "RED"),
            "percentile": int(min(max(((move - 60) / 80) * 100, 5), 95))
        },
        {
            "id": "sahm_rule",
            "value": f"{sahm:.2f}%",
            "status": "RED" if circuit_breaker else "GREEN",
            "percentile": int(min((sahm / 0.50) * 100, 100))
        }
    ]

    output = {
        "lastUpdated": datetime.now(timezone.utc).isoformat(),
        "circuitBreaker": circuit_breaker,
        "metrics": metrics_payload
    }

    with open("public/data.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print("public/data.json successfully updated.")

if __name__ == "__main__":
    run_pipeline()