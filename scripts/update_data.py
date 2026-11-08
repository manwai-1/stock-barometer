import os
import json
from datetime import datetime, timezone
import requests
import yfinance as yf
import pandas as pd
import numpy as np

FRED_KEY = os.environ.get("FRED_API_KEY", "")

def fetch_fred_history(series_id, limit=40):
    if not FRED_KEY:
        return [], True
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
        if len(vals) > 0:
            return vals, False
        return [], True
    except Exception as e:
        print(f"Warning: FRED {series_id} fetch failed: {e}")
        return [], True

def fetch_series(ticker, period="6mo"):
    try:
        t = yf.Ticker(ticker)
        hist = t.history(period=period)
        if hist.empty or 'Close' not in hist or len(hist['Close'].dropna()) == 0:
            return pd.Series(dtype=float), True
        return hist['Close'].dropna(), False
    except Exception as e:
        print(f"Warning: yfinance fetch {ticker} failed: {e}")
        return pd.Series(dtype=float), True

def get_sparkline_and_latest(series, fallback_val, is_failed, round_digits=2, length=30):
    if is_failed or series is None or series.empty or len(series) == 0:
        return fallback_val, [fallback_val] * length, True
    
    vals = [round(float(v), round_digits) for v in series.tail(length).tolist()]
    if len(vals) < length:
        vals = [vals[0]] * (length - len(vals)) + vals
    latest = vals[-1]
    return latest, vals, False

def run_pipeline():
    print("Executing pipeline with Live/Fallback Provenance Tracking...")

    # 1. 抓取 FRED 數據與標記
    tips_raw, tips_failed = fetch_fred_history("DFII10", 35)
    tips_hist = tips_raw or [2.50 + i * 0.003 for i in range(30)]
    tips_latest = round(tips_hist[-1], 2)
    tips_sparkline = [round(v, 2) for v in tips_hist[-30:]]

    hy_raw, hy_failed = fetch_fred_history("BAMLH0A0HYM2", 35)
    hy_hist = hy_raw or [3.40 + i * 0.003 for i in range(30)]
    hy_spread_bps = int(round(hy_hist[-1] * 100))
    hy_sparkline = [int(round(v * 100)) for v in hy_hist[-30:]]

    sahm_raw, sahm_failed = fetch_fred_history("SAHMREALTIME", 12)
    sahm_hist = sahm_raw or [0.25]
    sahm_latest = round(sahm_hist[-1], 2)
    sahm_sparkline = [sahm_latest] * 30

    dgs10_raw, dgs10_failed = fetch_fred_history("DGS10", 35)
    dgs10_hist = dgs10_raw or [4.40] * 30
    dgs10_latest = round(dgs10_hist[-1], 2)

    # 聯準會淨流動性
    walcl_raw, walcl_failed = fetch_fred_history("WALCL", 10)
    tga_raw, tga_failed = fetch_fred_history("WTREGEN", 35)
    rrp_raw, rrp_failed = fetch_fred_history("RRPONTSYD", 35)
    net_liq_failed = walcl_failed or tga_failed or rrp_failed

    walcl = walcl_raw or [6800000.0]
    tga = tga_raw or [800000.0]
    rrp = rrp_raw or [300.0]
    latest_net_liq = round((walcl[-1] - tga[-1] - (rrp[-1] * 1000.0)) / 1000000.0, 2)
    
    min_len = min(len(tga), len(rrp), 30)
    net_liq_sparkline = []
    for i in range(-min_len, 0):
        val = (walcl[-1] - tga[i] - (rrp[i] * 1000.0)) / 1000000.0
        net_liq_sparkline.append(round(val, 2))
    if len(net_liq_sparkline) < 30:
        net_liq_sparkline = [latest_net_liq] * 30

    # 2. 抓取 Yahoo Finance 系列
    spy_s, spy_fail = fetch_series("SPY")
    rsp_s, rsp_fail = fetch_series("RSP")
    smh_s, smh_fail = fetch_series("SMH")
    xly_s, xly_fail = fetch_series("XLY")
    xlp_s, xlp_fail = fetch_series("XLP")
    cper_s, cper_fail = fetch_series("CPER")
    gld_s, gld_fail = fetch_series("GLD")
    vix_s, vix_fail = fetch_series("^VIX")
    vix3m_s, vix3m_fail = fetch_series("^VIX3M")
    move_s, move_fail = fetch_series("^MOVE")

    # SPY PE 與 ERP
    pe_failed = False
    cur_pe = 26.2
    try:
        spy_ticker = yf.Ticker("SPY")
        p = spy_ticker.info.get("trailingPE") or spy_ticker.info.get("forwardPE")
        if p:
            cur_pe = round(float(p), 1)
        else:
            pe_failed = True
    except Exception:
        pe_failed = True

    erp_failed = pe_failed or dgs10_failed
    earnings_yield = round(100.0 / cur_pe, 2)
    erp_latest = round(earnings_yield - dgs10_latest, 2)
    fair_pe_cap = round(100.0 / (dgs10_latest + 1.5), 1)
    erp_sparkline = [round(earnings_yield - d, 2) for d in dgs10_hist[-30:]]

    # 等權重比率 RSP / SPY
    rsp_spy_s = (rsp_s / spy_s).dropna() if not (rsp_fail or spy_fail) else pd.Series(dtype=float)
    rsp_spy_latest, rsp_spy_sparkline, rsp_spy_failed = get_sparkline_and_latest(rsp_spy_s, 0.2938, rsp_fail or spy_fail, round_digits=4)

    # 半導體比率 SMH / SPY
    smh_spy_s = (smh_s / spy_s).dropna() if not (smh_fail or spy_fail) else pd.Series(dtype=float)
    smh_spy_latest, smh_spy_sparkline, smh_spy_failed = get_sparkline_and_latest(smh_spy_s, 0.631, smh_fail or spy_fail, round_digits=3)

    # 銅金比 (CPER / GLD * 1000)
    copper_gold_s = ((cper_s / gld_s) * 1000.0).dropna() if not (cper_fail or gld_fail) else pd.Series(dtype=float)
    copper_gold_latest, copper_gold_sparkline, copper_gold_failed = get_sparkline_and_latest(copper_gold_s, 101.1, cper_fail or gld_fail, round_digits=1)

    # VIX 期限結構 (VIX / VIX3M)
    vix_ratio_s = (vix_s / vix3m_s).dropna() if not (vix_fail or vix3m_fail) else pd.Series(dtype=float)
    vix_ratio_latest, vix_sparkline, vix_failed = get_sparkline_and_latest(vix_ratio_s, 1.042, vix_fail or vix3m_fail, round_digits=3)

    # MOVE 指數
    move_latest, move_sparkline, move_failed = get_sparkline_and_latest(move_s, 92.77, move_fail, round_digits=2)

    # XLY / XLP 50MA 偏離度
    disp_failed = xly_fail or xlp_fail
    if not disp_failed:
        ratio_s = (xly_s / xlp_s).dropna()
        if len(ratio_s) >= 50:
            sma50 = ratio_s.rolling(window=50).mean()
            disp_s = (((ratio_s - sma50) / sma50) * 100.0).dropna()
            disparity_latest, disparity_sparkline, disp_failed = get_sparkline_and_latest(disp_s, 1.8, False, round_digits=2)
        else:
            disparity_latest, disparity_sparkline, disp_failed = 1.8, [1.8] * 30, True
    else:
        disparity_latest, disparity_sparkline = 1.8, [1.8] * 30

    # 標普權值廣度
    core_tickers = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "BRK-B", "JPM", "V", "UNH", "XOM", "COST", "HD", "PG"]
    breadth_failed = False
    try:
        data = yf.download(core_tickers, period="1y", interval="1d", progress=False)['Close']
        above = (data > data.rolling(200).mean()).dropna(how='all')
        breadth_s = (above.sum(axis=1) / len(core_tickers) * 100.0).dropna()
        sp_latest, sp_sparkline, breadth_failed = get_sparkline_and_latest(breadth_s, 66.7, False, round_digits=1)
    except Exception:
        sp_latest, sp_sparkline, breadth_failed = 66.7, [66.7] * 30, True

    circuit_breaker = sahm_latest >= 0.50

    # 4. 組裝 Payload，每個指標均帶有 isFallback 旗標
    metrics_payload = [
        {
            "id": "net_liquidity",
            "value": f"{latest_net_liq}T",
            "subValue": None,
            "status": "GREEN" if latest_net_liq > 6.0 else ("YELLOW" if latest_net_liq >= 5.4 else "RED"),
            "percentile": int(min(max(((latest_net_liq - 4.5) / 2.5) * 100, 5), 95)),
            "sparkline": net_liq_sparkline,
            "isFallback": bool(net_liq_failed)
        },
        {
            "id": "tips_10y",
            "value": f"{tips_latest:.2f}%",
            "subValue": None,
            "status": "GREEN" if tips_latest < 1.5 else ("YELLOW" if tips_latest <= 2.2 else "RED"),
            "percentile": int(min(max((1.0 - (tips_latest / 3.0)) * 100, 5), 95)),
            "sparkline": tips_sparkline,
            "isFallback": bool(tips_failed)
        },
        {
            "id": "hy_spread",
            "value": f"{hy_spread_bps} bps",
            "subValue": None,
            "status": "GREEN" if hy_spread_bps > 500 else ("RED" if hy_spread_bps < 300 else "YELLOW"),
            "percentile": int(min(max(((hy_spread_bps - 260) / 300) * 100, 10), 90)),
            "sparkline": hy_sparkline,
            "isFallback": bool(hy_failed)
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
            "sparkline": erp_sparkline,
            "isFallback": bool(erp_failed)
        },
        {
            "id": "rsp_spy",
            "value": str(rsp_spy_latest),
            "subValue": None,
            "status": "GREEN" if rsp_spy_latest > 0.28 else "YELLOW",
            "percentile": int(min(max(((rsp_spy_latest - 0.26) / 0.06) * 100, 10), 90)),
            "sparkline": rsp_spy_sparkline,
            "isFallback": bool(rsp_spy_failed)
        },
        {
            "id": "sp100_200ma",
            "value": f"{sp_latest}%",
            "subValue": {
                "zh": "核心權值樣本庫",
                "en": "Mega-Cap Universe"
            },
            "status": "GREEN" if sp_latest >= 60.0 else ("YELLOW" if sp_latest >= 40.0 else "RED"),
            "percentile": int(sp_latest),
            "sparkline": sp_sparkline,
            "isFallback": bool(breadth_failed)
        },
        {
            "id": "smh_spy",
            "value": str(smh_spy_latest),
            "subValue": None,
            "status": "GREEN" if smh_spy_latest > 0.42 else ("YELLOW" if smh_spy_latest >= 0.36 else "RED"),
            "percentile": int(min(max(((smh_spy_latest - 0.30) / 0.20) * 100, 10), 90)),
            "sparkline": smh_spy_sparkline,
            "isFallback": bool(smh_spy_failed)
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
            "sparkline": disparity_sparkline,
            "isFallback": bool(disp_failed)
        },
        {
            "id": "copper_gold",
            "value": str(copper_gold_latest),
            "subValue": None,
            "status": "GREEN" if copper_gold_ratio > 115 else ("YELLOW" if copper_gold_ratio >= 95 else "RED"),
            "percentile": int(min(max(((copper_gold_latest - 85) / 50) * 100, 10), 90)),
            "sparkline": copper_gold_sparkline,
            "isFallback": bool(copper_gold_failed)
        },
        {
            "id": "vix_structure",
            "value": str(vix_ratio_latest),
            "subValue": None,
            "status": "GREEN" if vix_ratio_latest < 0.88 else ("YELLOW" if vix_ratio_latest <= 1.02 else "RED"),
            "percentile": int(min(max((1.0 - ((vix_ratio_latest - 0.75) / 0.40)) * 100, 5), 95)),
            "sparkline": vix_sparkline,
            "isFallback": bool(vix_failed)
        },
        {
            "id": "move_index",
            "value": str(move_latest),
            "subValue": None,
            "status": "GREEN" if move_latest < 95 else ("YELLOW" if move_latest < 115 else "RED"),
            "percentile": int(min(max((1.0 - ((move_latest - 60) / 80)) * 100, 5), 95)),
            "sparkline": move_sparkline,
            "isFallback": bool(move_failed)
        },
        {
            "id": "sahm_rule",
            "value": f"{sahm_latest:.2f}%",
            "subValue": None,
            "status": "RED" if circuit_breaker else "GREEN",
            "percentile": int(min(max((1.0 - (sahm_latest / 0.50)) * 100, 5), 95)),
            "sparkline": sahm_sparkline,
            "isFallback": bool(sahm_failed)
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
    print("public/data.json updated successfully with fallback audit flags.")

if __name__ == "__main__":
    run_pipeline()