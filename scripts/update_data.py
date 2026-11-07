import os
import json
from datetime import datetime, timezone
import requests
import yfinance as yf

FRED_KEY = os.environ.get("FRED_API_KEY", "")

# S&P 100 前百大權值股名單（單次批次下載，無封鎖風險）
SP100_TICKERS = [
    "AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "BRK-B", "TSLA", "LLY", "AVGO",
    "JPM", "V", "UNH", "XOM", "MA", "PG", "HD", "COST", "JNJ", "ABBV",
    "MRK", "NFLX", "AMD", "CRM", "BAC", "WMT", "CVX", "KO", "PEP", "LIN",
    "QCOM", "TMO", "CSCO", "ACN", "MCD", "ABT", "ORCL", "WFC", "GE", "INTU",
    "IBM", "CAT", "AMAT", "TXN", "DIS", "PM", "DHR", "NOW", "VZ", "AMGN",
    "COP", "MS", "UNP", "NEE", "RTX", "LOW", "GS", "SPGI", "HON", "BA",
    "BLK", "ELV", "PLTR", "BMY", "BKNG", "ISRG", "TJX", "ETN", "MDT", "SBUX",
    "VRTX", "DE", "ADP", "LMT", "GILD", "CI", "CB", "MMC", "PGR", "CVS",
    "REGN", "SYK", "BSX", "MDLZ", "SCHW", "ZTS", "AMT", "MO", "ADI", "SO",
    "DUK", "SLB", "EOG", "CL", "BDX", "CME", "ITW", "NOC", "CSX", "WM"
]

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

def calculate_net_liquidity():
    walcl = fetch_fred_latest("WALCL") or 6800000.0
    tga = fetch_fred_latest("WTREGEN") or 800000.0
    rrp = fetch_fred_latest("RRPONTSYD") or 300.0
    net_liq_trillion = (walcl - tga - (rrp * 1000.0)) / 1000000.0
    return round(net_liq_trillion, 2)

def calculate_erp_and_pe():
    dgs10 = fetch_fred_latest("DGS10") or 4.40
    current_pe = 26.2
    try:
        spy = yf.Ticker("SPY")
        current_pe = spy.info.get("trailingPE") or spy.info.get("forwardPE") or 26.2
    except Exception:
        pass
    current_pe = round(float(current_pe), 1)
    earnings_yield = round((100.0 / current_pe), 2)
    erp = round(earnings_yield - dgs10, 2)
    
    # 計算在當前利率下，要求正向溢價 (ERP >= +1.5%) 時的合理 PE 上限門檻
    fair_pe_cap = round(100.0 / (dgs10 + 1.5), 1)
    return erp, current_pe, fair_pe_cap

def calculate_sp100_breadth():
    try:
        data = yf.download(SP100_TICKERS, period="1y", interval="1d", progress=False)['Close']
        above_count = 0
        valid_count = 0
        for t in SP100_TICKERS:
            if t in data and len(data[t].dropna()) >= 200:
                s = data[t].dropna()
                if s.iloc[-1] > s.rolling(200).mean().iloc[-1]:
                    above_count += 1
                valid_count += 1
        if valid_count > 0:
            return round((above_count / valid_count) * 100, 1)
        return 65.0
    except Exception as e:
        print(f"Error SP100 breadth: {e}")
        return 65.0

def run_pipeline():
    print("Executing upgraded 12-factor tactical pipeline...")
    
    # 1. 宏觀與基礎利率
    tips = fetch_fred_latest("DFII10") or 2.10
    hy_spread_raw = fetch_fred_latest("BAMLH0A0HYM2") or 3.30
    hy_spread_bps = int(round(hy_spread_raw * 100))
    sahm = fetch_fred_latest("SAHMREALTIME") or 0.25
    circuit_breaker = sahm >= 0.50

    # 2. 流動性、ERP 與高精度 S&P 100 廣度
    net_liq = calculate_net_liquidity()
    erp, cur_pe, fair_pe = calculate_erp_and_pe()
    sp100_breadth = calculate_sp100_breadth()

    # 3. 市場內部比率與新戰術指標
    spy = fetch_yfinance_close("SPY") or 580.0
    rsp = fetch_yfinance_close("RSP") or 170.0
    rsp_spy_ratio = round(rsp / spy, 4)
    move = fetch_yfinance_close("^MOVE") or 92.0

    # 新增 4 項指標數據抓取
    xly = fetch_yfinance_close("XLY") or 200.0
    xlp = fetch_yfinance_close("XLP") or 80.0
    xly_xlp_ratio = round(xly / xlp, 3)

    cper = fetch_yfinance_close("CPER") or 28.5
    gld = fetch_yfinance_close("GLD") or 245.0
    copper_gold_ratio = round((cper / gld) * 1000, 1)

    vix = fetch_yfinance_close("^VIX") or 15.0
    vix3m = fetch_yfinance_close("^VIX3M") or 18.0
    vix_ratio = round(vix / vix3m, 3)

    smh = fetch_yfinance_close("SMH") or 250.0
    smh_spy_ratio = round(smh / spy, 4)

    # 4. 12 項指標 Payload（進度條全面統一為「股票吸引力得分」0~100）
    metrics_payload = [
        # --- 模組一：總體流動性與定價錨 ---
        {
            "id": "net_liquidity",
            "value": f"{net_liq}T",
            "subValue": None,
            "status": "GREEN" if net_liq > 6.0 else ("YELLOW" if net_liq >= 5.4 else "RED"),
            "percentile": int(min(max(((net_liq - 4.5) / 2.5) * 100, 5), 95))
        },
        {
            "id": "tips_10y",
            "value": f"{tips:.2f}%",
            "subValue": None,
            "status": "GREEN" if tips < 1.5 else ("YELLOW" if tips <= 2.2 else "RED"),
            "percentile": int(min(max((1.0 - (tips / 3.0)) * 100, 5), 95))
        },
        {
            "id": "hy_spread",
            "value": f"{hy_spread_bps} bps",
            "subValue": None,
            "status": "GREEN" if hy_spread_bps > 500 else ("RED" if hy_spread_bps < 300 else "YELLOW"),
            "percentile": int(min(max(((hy_spread_bps - 260) / 300) * 100, 10), 90))
        },
        {
            "id": "erp",
            "value": f"{erp:.2f}%",
            "subValue": f"PE: {cur_pe}x (上限: {fair_pe}x)",
            "status": "GREEN" if erp > 2.0 else ("YELLOW" if erp >= 0.0 else "RED"),
            "percentile": int(min(max(((erp + 1.0) / 4.0) * 100, 5), 95))
        },
        # --- 模組二：內部廣度與動能 ---
        {
            "id": "rsp_spy",
            "value": str(rsp_spy_ratio),
            "subValue": None,
            "status": "GREEN" if rsp_spy_ratio > 0.28 else "YELLOW",
            "percentile": int(min(max(((rsp_spy_ratio - 0.26) / 0.06) * 100, 10), 90))
        },
        {
            "id": "sp100_200ma",
            "value": f"{sp100_breadth}%",
            "subValue": "S&P 100 樣本庫",
            "status": "GREEN" if sp100_breadth >= 60.0 else ("YELLOW" if sp100_breadth >= 40.0 else "RED"),
            "percentile": int(sp100_breadth)
        },
        {
            "id": "smh_spy",
            "value": str(smh_spy_ratio),
            "subValue": None,
            "status": "GREEN" if smh_spy_ratio > 0.42 else ("YELLOW" if smh_spy_ratio >= 0.36 else "RED"),
            "percentile": int(min(max(((smh_spy_ratio - 0.30) / 0.20) * 100, 10), 90))
        },
        {
            "id": "xly_xlp",
            "value": str(xly_xlp_ratio),
            "subValue": None,
            "status": "GREEN" if xly_xlp_ratio > 2.6 else ("YELLOW" if xly_xlp_ratio >= 2.3 else "RED"),
            "percentile": int(min(max(((xly_xlp_ratio - 2.0) / 1.0) * 100, 10), 90))
        },
        # --- 模組三：跨資產預警與斷路器 ---
        {
            "id": "copper_gold",
            "value": str(copper_gold_ratio),
            "subValue": None,
            "status": "GREEN" if copper_gold_ratio > 115 else ("YELLOW" if copper_gold_ratio >= 95 else "RED"),
            "percentile": int(min(max(((copper_gold_ratio - 85) / 50) * 100, 10), 90))
        },
        {
            "id": "vix_structure",
            "value": str(vix_ratio),
            "subValue": None,
            "status": "GREEN" if vix_ratio < 0.88 else ("YELLOW" if vix_ratio <= 1.02 else "RED"),
            "percentile": int(min(max((1.0 - ((vix_ratio - 0.75) / 0.40)) * 100, 5), 95))
        },
        {
            "id": "move_index",
            "value": str(move),
            "subValue": None,
            "status": "GREEN" if move < 95 else ("YELLOW" if move < 115 else "RED"),
            "percentile": int(min(max((1.0 - ((move - 60) / 80)) * 100, 5), 95))
        },
        {
            "id": "sahm_rule",
            "value": f"{sahm:.2f}%",
            "subValue": None,
            "status": "RED" if circuit_breaker else "GREEN",
            "percentile": int(min(max((1.0 - (sahm / 0.50)) * 100, 5), 95))
        }
    ]

    output = {
        "lastUpdated": datetime.now(timezone.utc).isoformat(),
        "circuitBreaker": circuit_breaker,
        "metrics": metrics_payload
    }

    os.makedirs("public", exist_ok=True)
    with open("public/data.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print("public/data.json successfully updated with 12 tactical metrics.")

if __name__ == "__main__":
    run_pipeline()