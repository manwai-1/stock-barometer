import os
import json
from datetime import datetime, timezone
import requests
import yfinance as yf
import pandas as pd
import numpy as np

FRED_KEY = os.environ.get("FRED_API_KEY", "")

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

def fetch_fred_history(series_id, limit=40):
    if not FRED_KEY:
        return []
    url = f"https://api.stlouisfed.org/fred/series/observations?series_id={series_id}&api_key={FRED_KEY}&file_type=json&sort_order=desc&limit={limit}"
    try:
        res = requests.get(url, timeout=10).json()
        obs = res.get('observations', [])
        vals = []
        for o in reversed(obs):
            v = o.get('value')
            if v and v != '.':
                try:
                    vals.append(float(v))
                except ValueError:
                    pass
        return vals
    except Exception as e:
        print(f"Error fetching FRED {series_id}: {e}")
        return []

def run_pipeline():
    print("Executing institutional data pipeline with 30D Sparklines & 50MA Disparity...")

    # 1. 抓取 FRED 數據與歷史陣列
    tips_hist = fetch_fred_history("DFII10", 35) or [2.50 + i * 0.003 for i in range(30)]
    tips_latest = round(tips_hist[-1], 2)
    tips_sparkline = [round(v, 2) for v in tips_hist[-30:]]

    hy_hist_raw = fetch_fred_history("BAMLH0A0HYM2", 35) or [3.40 + i * 0.003 for i in range(30)]
    hy_spread_bps = int(round(hy_hist_raw[-1] * 100))
    hy_sparkline = [int(round(v * 100)) for v in hy_hist_raw[-30:]]

    sahm_hist = fetch_fred_history("SAHMREALTIME", 12) or [0.25]
    sahm_latest = round(sahm_hist[-1], 2)
    sahm_sparkline = [sahm_latest] * 30

    dgs10_hist = fetch_fred_history("DGS10", 35) or [4.40] * 30
    dgs10_latest = round(dgs10_hist[-1], 2)

    # 聯準會淨流動性歷史 (WALCL - WTREGEN - RRP)
    walcl = fetch_fred_history("WALCL", 10) or [6800000.0]
    tga = fetch_fred_history("WTREGEN", 35) or [800000.0]
    rrp = fetch_fred_history("RRPONTSYD", 35) or [300.0]
    latest_net_liq = round((walcl[-1] - tga[-1] - (rrp[-1] * 1000.0)) / 1000000.0, 2)
    
    # 構建流動性 30 天走勢
    min_len = min(len(tga), len(rrp), 30)
    net_liq_sparkline = []
    for i in range(-min_len, 0):
        val = (walcl[-1] - tga[i] - (rrp[i] * 1000.0)) / 1000000.0
        net_liq_sparkline.append(round(val, 2))
    if len(net_liq_sparkline) < 30:
        net_liq_sparkline = [latest_net_liq] * 30

    # 2. 批次下載市場標的歷史 (6 個月數據以滿足 50MA 計算)
    macro_tickers = ["SPY", "RSP", "SMH", "XLY", "XLP", "CPER", "GLD", "^MOVE", "^VIX", "^VIX3M"]
    macro_df = yf.download(macro_tickers, period="6mo", interval="1d", progress=False)['Close']

    # SPY PE 與 ERP
    cur_pe = 26.2
    try:
        spy_ticker = yf.Ticker("SPY")
        cur_pe = round(float(spy_ticker.info.get("trailingPE") or spy_ticker.info.get("forwardPE") or 26.2), 1)
    except Exception:
        pass
    earnings_yield = round(100.0 / cur_pe, 2)
    erp_latest = round(earnings_yield - dgs10_latest, 2)
    fair_pe_cap = round(100.0 / (dgs10_latest + 1.5), 1)
    erp_sparkline = [round(earnings_yield - d, 2) for d in dgs10_hist[-30:]]

    # 等權重比率 RSP / SPY
    rsp_spy_series = (macro_df['RSP'] / macro_df['SPY']).dropna()
    rsp_spy_latest = round(float(rsp_spy_series.iloc[-1]), 4)
    rsp_spy_sparkline = [round(float(v), 4) for v in rsp_spy_series.tail(30).tolist()]

    # 半導體比率 SMH / SPY
    smh_spy_series = (macro_df['SMH'] / macro_df['SPY']).dropna()
    smh_spy_latest = round(float(smh_spy_series.iloc[-1]), 3)
    smh_spy_sparkline = [round(float(v), 3) for v in smh_spy_series.tail(30).tolist()]

    # 銅金比 (CPER / GLD * 1000)
    copper_gold_series = ((macro_df['CPER'] / macro_df['GLD']) * 1000.0).dropna()
    copper_gold_latest = round(float(copper_gold_series.iloc[-1]), 1)
    copper_gold_sparkline = [round(float(v), 1) for v in copper_gold_series.tail(30).tolist()]

    # VIX 期限結構比率 (VIX / VIX3M)
    vix_ratio_series = (macro_df['^VIX'] / macro_df['^VIX3M']).dropna()
    vix_ratio_latest = round(float(vix_ratio_series.iloc[-1]), 3)
    vix_sparkline = [round(float(v), 3) for v in vix_ratio_series.tail(30).tolist()]

    # MOVE 指數
    move_series = macro_df['^MOVE'].dropna()
    move_latest = round(float(move_series.iloc[-1]), 2)
    move_sparkline = [round(float(v), 2) for v in move_series.tail(30).tolist()]

    # 核心改進：XLY / XLP 50 日均線偏離度
    xly_xlp_ratio = (macro_df['XLY'] / macro_df['XLP']).dropna()
    xly_xlp_sma50 = xly_xlp_ratio.rolling(window=50).mean()
    disparity_series = (((xly_xlp_ratio - xly_xlp_sma50) / xly_xlp_sma50) * 100.0).dropna()
    disparity_latest = round(float(disparity_series.iloc[-1]), 2)
    disparity_sparkline = [round(float(v), 2) for v in disparity_series.tail(30).tolist()]

    # 3. S&P 100 廣度 (200MA) 歷史計算
    try:
        sp100_data = yf.download(SP100_TICKERS, period="1y", interval="1d", progress=False)['Close']
        sp100_above = (sp100_data > sp100_data.rolling(200).mean()).dropna(how='all')
        breadth_series = (sp100_above.sum(axis=1) / len(SP100_TICKERS) * 100.0).tail(30)
        sp100_sparkline = [round(float(v), 1) for v in breadth_series.tolist()]
        sp100_latest = sp100_sparkline[-1] if sp100_sparkline else 66.7
    except Exception as e:
        print(f"Error SP100: {e}")
        sp100_latest = 66.7
        sp100_sparkline = [66.7] * 30

    circuit_breaker = sahm_latest >= 0.50

    # 4. 組裝 12 大指標 Payload (統一股票吸引力度量衡 0~100)
    metrics_payload = [
        {
            "id": "net_liquidity",
            "value": f"{latest_net_liq}T",
            "subValue": None,
            "status": "GREEN" if latest_net_liq > 6.0 else ("YELLOW" if latest_net_liq >= 5.4 else "RED"),
            "percentile": int(min(max(((latest_net_liq - 4.5) / 2.5) * 100, 5), 95)),
            "sparkline": net_liq_sparkline
        },
        {
            "id": "tips_10y",
            "value": f"{tips_latest:.2f}%",
            "subValue": None,
            "status": "GREEN" if tips_latest < 1.5 else ("YELLOW" if tips_latest <= 2.2 else "RED"),
            "percentile": int(min(max((1.0 - (tips_latest / 3.0)) * 100, 5), 95)),
            "sparkline": tips_sparkline
        },
        {
            "id": "hy_spread",
            "value": f"{hy_spread_bps} bps",
            "subValue": None,
            "status": "GREEN" if hy_spread_bps > 500 else ("RED" if hy_spread_bps < 300 else "YELLOW"),
            "percentile": int(min(max(((hy_spread_bps - 260) / 300) * 100, 10), 90)),
            "sparkline": hy_sparkline
        },
        {
            "id": "erp",
            "value": f"{erp_latest:.2f}%",
            "subValue": {
                "zh": f"PE: {cur_pe}x (上限: {fair_pe_cap}x)",
                "en": f"PE: {cur_pe}x (Cap: {fair_pe_cap}x)"
            },
            "status": "GREEN" if erp_latest > 2.0 else ("YELLOW" if erp_latest >= 0.0 else "RED"),
            "percentile": int(min(max(((erp_latest + 1.0) / 4.0) * 100, 5), 95)),
            "sparkline": erp_sparkline
        },
        {
            "id": "rsp_spy",
            "value": str(rsp_spy_latest),
            "subValue": None,
            "status": "GREEN" if rsp_spy_latest > 0.28 else "YELLOW",
            "percentile": int(min(max(((rsp_spy_latest - 0.26) / 0.06) * 100, 10), 90)),
            "sparkline": rsp_spy_sparkline
        },
        {
            "id": "sp100_200ma",
            "value": f"{sp100_latest}%",
            "subValue": {
                "zh": "S&P 100 樣本庫",
                "en": "S&P 100 Universe"
            },
            "status": "GREEN" if sp100_latest >= 60.0 else ("YELLOW" if sp100_latest >= 40.0 else "RED"),
            "percentile": int(sp100_latest),
            "sparkline": sp100_sparkline
        },
        {
            "id": "smh_spy",
            "value": str(smh_spy_latest),
            "subValue": None,
            "status": "GREEN" if smh_spy_latest > 0.42 else ("YELLOW" if smh_spy_latest >= 0.36 else "RED"),
            "percentile": int(min(max(((smh_spy_latest - 0.30) / 0.20) * 100, 10), 90)),
            "sparkline": smh_spy_sparkline
        },
        {
            "id": "xly_xlp",
            "value": f"{disparity_latest:+.1f}%",
            "subValue": {
                "zh": "偏離 50MA 中樞",
                "en": "Bias vs 50D SMA"
            },
            "status": "GREEN" if disparity_latest > 1.5 else ("YELLOW" if disparity_latest >= -1.5 else "RED"),
            "percentile": int(min(max(((disparity_latest + 6.0) / 12.0) * 100, 5), 95)),
            "sparkline": disparity_sparkline
        },
        {
            "id": "copper_gold",
            "value": str(copper_gold_latest),
            "subValue": None,
            "status": "GREEN" if copper_gold_ratio > 115 else ("YELLOW" if copper_gold_ratio >= 95 else "RED"),
            "percentile": int(min(max(((copper_gold_latest - 85) / 50) * 100, 10), 90)),
            "sparkline": copper_gold_sparkline
        },
        {
            "id": "vix_structure",
            "value": str(vix_ratio_latest),
            "subValue": None,
            "status": "GREEN" if vix_ratio_latest < 0.88 else ("YELLOW" if vix_ratio_latest <= 1.02 else "RED"),
            "percentile": int(min(max((1.0 - ((vix_ratio_latest - 0.75) / 0.40)) * 100, 5), 95)),
            "sparkline": vix_sparkline
        },
        {
            "id": "move_index",
            "value": str(move_latest),
            "subValue": None,
            "status": "GREEN" if move_latest < 95 else ("YELLOW" if move_latest < 115 else "RED"),
            "percentile": int(min(max((1.0 - ((move_latest - 60) / 80)) * 100, 5), 95)),
            "sparkline": move_sparkline
        },
        {
            "id": "sahm_rule",
            "value": f"{sahm_latest:.2f}%",
            "subValue": None,
            "status": "RED" if circuit_breaker else "GREEN",
            "percentile": int(min(max((1.0 - (sahm_latest / 0.50)) * 100, 5), 95)),
            "sparkline": sahm_sparkline
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
    print("public/data.json updated with 30D Sparklines successfully.")

if __name__ == "__main__":
    run_pipeline()