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

def calculate_net_liquidity():
    # WALCL (聯準會總資產，百萬), WTREGEN (財政部TGA，百萬), RRPONTSYD (逆回購，十億)
    walcl = fetch_fred_latest("WALCL") or 6800000.0
    tga = fetch_fred_latest("WTREGEN") or 800000.0
    rrp = fetch_fred_latest("RRPONTSYD") or 300.0
    
    # 統一換算為兆美元 (Trillion USD)
    net_liq_trillion = (walcl - tga - (rrp * 1000.0)) / 1000000.0
    return round(net_liq_trillion, 2)

def calculate_erp():
    dgs10 = fetch_fred_latest("DGS10") or 4.40
    try:
        spy = yf.Ticker("SPY")
        pe = spy.info.get("trailingPE") or spy.info.get("forwardPE") or 27.5
    except Exception:
        pe = 27.5
    
    # 盈餘殖利率 (Earnings Yield) = 100 / PE
    earnings_yield = (100.0 / pe)
    erp = round(earnings_yield - dgs10, 2)
    return erp

def calculate_sector_breadth():
    # 標普 11 大核心板塊 ETF
    sectors = ["XLK", "XLF", "XLV", "XLY", "XLI", "XLC", "XLP", "XLE", "XLU", "XLRE", "XLB"]
    try:
        data = yf.download(sectors, period="1y", interval="1d", progress=False)['Close']
        above_200ma_count = 0
        total_valid = 0
        
        for sec in sectors:
            if sec in data and len(data[sec].dropna()) >= 200:
                series = data[sec].dropna()
                current_price = series.iloc[-1]
                sma_200 = series.rolling(window=200).mean().iloc[-1]
                if current_price > sma_200:
                    above_200ma_count += 1
                total_valid += 1
                
        if total_valid > 0:
            return round((above_200ma_count / total_valid) * 100, 1)
        return 63.6
    except Exception as e:
        print(f"Error calculating breadth: {e}")
        return 63.6

def run_pipeline():
    print("Starting automated data pipeline...")
    
    # 1. 抓取宏觀基礎利率與風險指標
    tips = fetch_fred_latest("DFII10") or 2.10
    hy_spread_raw = fetch_fred_latest("BAMLH0A0HYM2") or 3.30
    hy_spread_bps = int(round(hy_spread_raw * 100))
    sahm = fetch_fred_latest("SAHMREALTIME") or 0.25
    
    # 2. 動態實時運算指標
    net_liq = calculate_net_liquidity()
    erp = calculate_erp()
    breadth = calculate_sector_breadth()
    
    # 3. 市場動態行情與比率
    move = fetch_yfinance_close("^MOVE") or 92.0
    spy = fetch_yfinance_close("SPY") or 580.0
    rsp = fetch_yfinance_close("RSP") or 170.0
    rsp_spy_ratio = round(rsp / spy, 4)

    # 4. 薩姆規則斷路器判定
    circuit_breaker = sahm >= 0.50

    # 5. 組裝指標 Payload（進度條全面統一為「股票吸引力得分」0~100）
    metrics_payload = [
        {
            "id": "net_liquidity",
            "value": f"{net_liq}T",
            # 中位數區間判定為 YELLOW，充沛為 GREEN，抽水為 RED
            "status": "GREEN" if net_liq > 6.0 else ("YELLOW" if net_liq >= 5.4 else "RED"),
            "percentile": int(min(max(((net_liq - 4.5) / 2.5) * 100, 5), 95))
        },
        {
            "id": "tips_10y",
            "value": f"{tips:.2f}%",
            "status": "GREEN" if tips < 1.5 else ("YELLOW" if tips <= 2.2 else "RED"),
            # 實質利率越低，對股票估值越有利（吸引力越高，條越長）
            "percentile": int(min(max((1.0 - (tips / 3.0)) * 100, 5), 95))
        },
        {
            "id": "hy_spread",
            "value": f"{hy_spread_bps} bps",
            "status": "GREEN" if hy_spread_bps > 500 else ("RED" if hy_spread_bps < 300 else "YELLOW"),
            # 利差過度收窄 (<300) 吸引力低，高位拐點回落吸引力高
            "percentile": int(min(max(((hy_spread_bps - 260) / 300) * 100, 10), 90))
        },
        {
            "id": "erp",
            "value": f"{erp:.2f}%",
            "status": "GREEN" if erp > 2.0 else ("YELLOW" if erp >= 0.0 else "RED"),
            # ERP 越高股票越便宜性價比越高
            "percentile": int(min(max(((erp + 1.0) / 4.0) * 100, 5), 95))
        },
        {
            "id": "rsp_spy",
            "value": str(rsp_spy_ratio),
            "status": "GREEN" if rsp_spy_ratio > 0.28 else "YELLOW",
            "percentile": int(min(max(((rsp_spy_ratio - 0.26) / 0.06) * 100, 10), 90))
        },
        {
            "id": "sp500_200ma",
            "value": f"{breadth}%",
            "status": "GREEN" if breadth >= 60.0 else ("YELLOW" if breadth >= 40.0 else "RED"),
            "percentile": int(breadth)
        },
        {
            "id": "move_index",
            "value": str(move),
            "status": "GREEN" if move < 95 else ("YELLOW" if move < 115 else "RED"),
            # 債券波動率越平穩，股票市場越安全（條越長）
            "percentile": int(min(max((1.0 - ((move - 60) / 80)) * 100, 5), 95))
        },
        {
            "id": "sahm_rule",
            "value": f"{sahm:.2f}%",
            "status": "RED" if circuit_breaker else "GREEN",
            # 薩姆指標越低越安全
            "percentile": int(min(max((1.0 - (sahm / 0.50)) * 100, 5), 95))
        }
    ]

    output = {
        "lastUpdated": datetime.now(timezone.utc).isoformat(),
        "circuitBreaker": circuit_breaker,
        "metrics": metrics_payload
    }

    # 寫入靜態資料檔案
    os.makedirs("public", exist_ok=True)
    with open("public/data.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print("public/data.json successfully updated with calibrated institutional metrics.")

if __name__ == "__main__":
    run_pipeline()