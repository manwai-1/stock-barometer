import os
import json
from datetime import datetime, timezone
import requests
import yfinance as yf

# 1. 獲取 FRED API Key (由 GitHub Actions 傳入)
FRED_KEY = os.environ.get("FRED_API_KEY", "")

def fetch_fred_latest(series_id):
    if not FRED_KEY:
        return None
    url = f"https://api.stlouisfed.org/fred/series/observations?series_id={series_id}&api_key={FRED_KEY}&file_type=json&sort_order=desc&limit=1"
    try:
        res = requests.get(url, timeout=10).json()
        return float(res['observations'][0]['value'])
    except Exception as e:
        print(f"Error fetching FRED {series_id}: {e}")
        return None

def fetch_yfinance_close(ticker):
    try:
        t = yf.Ticker(ticker)
        hist = t.history(period="5d")
        return round(float(hist['Close'].iloc[-1]), 2)
    except Exception as e:
        print(f"Error fetching {ticker}: {e}")
        return None

def run_pipeline():
    # 抓取關鍵指標
    tips = fetch_fred_latest("DFII10") or 1.80
    hy_spread = fetch_fred_latest("BAMLH0A0HYM2") or 330.0
    sahm = fetch_fred_latest("SAHMREALTIME") or 0.25
    move = fetch_yfinance_close("^MOVE") or 90.0

    # 抓取標普與等權重標普計算比率
    spy = fetch_yfinance_close("SPY") or 580.0
    rsp = fetch_yfinance_close("RSP") or 160.0
    rsp_spy_ratio = round(rsp / spy, 4)

    # 簡易狀態判定邏輯
    circuit_breaker = sahm >= 0.50

    metrics_payload = [
        {"id": "net_liquidity", "value": "5.94T", "status": "GREEN", "percentile": 74},
        {"id": "tips_10y", "value": f"{tips}%", "status": "GREEN" if tips < 1.5 else "YELLOW", "percentile": 55},
        {"id": "hy_spread", "value": f"{int(hy_spread)} bps", "status": "GREEN" if hy_spread > 450 else "YELLOW", "percentile": 38},
        {"id": "erp", "value": "1.38%", "status": "YELLOW", "percentile": 36},
        {"id": "rsp_spy", "value": str(rsp_spy_ratio), "status": "GREEN", "percentile": 65},
        {"id": "sp500_200ma", "value": "67.8%", "status": "GREEN", "percentile": 62},
        {"id": "move_index", "value": str(move), "status": "GREEN" if move < 100 else "RED", "percentile": 35},
        {"id": "sahm_rule", "value": f"{sahm}%", "status": "RED" if circuit_breaker else "GREEN", "percentile": 20}
    ]

    output = {
        "lastUpdated": datetime.now(timezone.utc).isoformat(),
        "circuitBreaker": circuit_breaker,
        "metrics": metrics_payload
    }

    # 覆寫至 public/data.json
    with open("public/data.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print("public/data.json successfully updated.")

if __name__ == "__main__":
    run_pipeline()