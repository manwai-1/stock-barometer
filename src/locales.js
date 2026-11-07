export const dict = {
  zh: {
    title: "美股戰術配置晴雨表",
    subtitle: "基於總體流動性、估值性價比與籌碼極值的客觀決策看板",
    lastUpdated: "最後數據更新",
    explainBtn: "指標解讀",
    modalClose: "關閉",
    regimes: {
      RECESSION: "🚨 衰退斷路已啟動：薩姆指標超標，建議凍結所有權益增配，轉向純防禦。",
      STRAIN: "⚠️ 結構失衡預警：實質利率高企且 ERP 轉負，估值透支，建議維持基底底倉但暫緩戰術追高。",
      EXPANSION: "🚀 全面積極擴張：宏觀流動性充沛且股票具備高性價比，適合積極增配。",
      NEUTRAL: "⚖️ 中性平穩期：市場各項因子處於均衡區間，建議按既定節奏定期定額。"
    },
    // 分流語意標籤
    statusMap: {
      valuation: {
        GREEN: "極具性價比",
        YELLOW: "估值中性",
        RED: "估值透支"
      },
      risk: {
        GREEN: "平穩安全",
        YELLOW: "常態波動",
        RED: "高度預警"
      }
    },
    metrics: {
      net_liquidity: {
        name: "聯準會淨流動性",
        category: "流動性水庫",
        type: "valuation",
        intuition: "金融市場的真正美元水庫，由 Fed 總資產扣除財政部帳戶與逆回購資金計算而得。",
        rule: "高於 6.0T 為寬鬆（綠燈）；5.5T~6.0T 為中性（黃燈）；低於 5.5T 為抽水（紅燈）。",
        pitfall: "若財政部在 TGA 帳戶大量發債抽水，即便降息也可能引發流動性緊縮。"
      },
      tips_10y: {
        name: "10年期實質利率 (TIPS)",
        category: "貼現率錨點",
        type: "valuation",
        intuition: "扣除通膨預期後的真實無風險借貸成本，是美股估值的定價錨點。",
        rule: "低於 1.5% 折現壓力小（綠燈）；1.5%~2.2% 為常態（黃燈）；高於 2.2% 壓抑估值（紅燈）。",
        pitfall: "實質利率超過 2% 時，高本益比科技股極易遭遇無差別估值修正。"
      },
      hy_spread: {
        name: "高收益債信用利差",
        category: "信用違約風險",
        type: "risk",
        intuition: "企業借貸的違約風險補償，被視為市場上對企業體質最敏感的嗅覺指標。",
        rule: "低於 300 bps 代表盲目樂觀自滿（紅燈）；300~450 bps 常態（黃燈）；突破 500 bps 後轉向回落為黃金買點（綠燈）。",
        pitfall: "股市創高但信用利差反向走闊時，通常預告著 1~2 個月內的頂部背離。"
      },
      erp: {
        name: "股權風險溢價 (ERP)",
        category: "資產性價比",
        type: "valuation",
        intuition: "股票盈餘收益率減去 10 年期美債利率。衡量承擔股票風險能賺取多少超額利潤。",
        rule: "高於 2.0% 具備巨大安全邊際（綠燈）；0%~2.0% 為中性（黃燈）；小於 0% 為負溢價（紅燈），代表買股票性價比不如買國債。",
        pitfall: "負 ERP 不代表股市明天立刻暴跌，但代表長期持有回報率將嚴重跑輸歷史均值。"
      },
      rsp_spy: {
        name: "等權重/市值加權比率",
        category: "市場內部廣度",
        type: "risk",
        intuition: "檢驗漲勢是否只靠少數科技巨頭掩護，還是由實體產業普漲推動。",
        rule: "比率高於 0.28 且回升為健康普漲（綠燈）；低於 0.28 代表市場極度集中脆弱（黃燈）。",
        pitfall: "當 SPY 創歷史新高但此比率崩跌破底，代表市場脆弱度達到臨界點。"
      },
      sp500_200ma: {
        name: "板塊站上 200 日線比例",
        category: "市場內部廣度",
        type: "risk",
        intuition: "標普 11 大核心板塊中，處於長期多頭架構的比例。",
        rule: "高於 60% 為健康牛市（綠燈）；40%~60% 為分化震盪（黃燈）；低於 40% 為空頭主導（紅燈）。",
        pitfall: "指數在高位橫盤，但站上均線比例急跌時為強烈的隱性派發訊號。"
      },
      move_index: {
        name: "美債波動率指數 (MOVE)",
        category: "債市定價之錨",
        type: "risk",
        intuition: "美國國債市場的隱含波動率，被譽為全球金融市場的灰犀牛預警機。",
        rule: "低於 95 為平靜安全（綠燈）；95~115 為警惕（黃燈）；高於 115 顯示債市定價失錨（紅燈）。",
        pitfall: "債市規模大於股市，MOVE 指數通常比美股 VIX 提早數週亮起警訊。"
      },
      sahm_rule: {
        name: "薩姆規則衰退指標",
        category: "一票否決斷路器",
        type: "risk",
        intuition: "以失業率 3 個月均值相較於過去 12 個月低點的變動幅度，判定實體經濟是否衰退。",
        rule: "低於 0.50% 為正常擴張期（綠燈）；達到或超過 0.50% 觸發強制防禦（紅燈）。",
        pitfall: "此指標是總體經濟斷路器，不可用於捕捉市場短期技術性反彈。"
      }
    }
  },
  en: {
    title: "US Equities Tactical Barometer",
    subtitle: "Objective tactical asset allocation dashboard based on macro liquidity, valuation, and market internals",
    lastUpdated: "Last Synced",
    explainBtn: "Explain",
    modalClose: "Close",
    regimes: {
      RECESSION: "🚨 Recession Breaker Triggered: Sahm Rule breached. Freeze all equity additions; rotate to capital preservation.",
      STRAIN: "⚠️ Valuation Strain: Real yields elevated and ERP inverted. Retain baseline holdings; suspend tactical overweights.",
      EXPANSION: "🚀 Broad Expansion: Abundant macro liquidity paired with high equity margin of safety. Favor risk-on.",
      NEUTRAL: "⚖️ Neutral Regime: Macro inputs in equilibrium. Maintain scheduled dollar-cost averaging."
    },
    statusMap: {
      valuation: {
        GREEN: "Highly Attractive",
        YELLOW: "Fair Valuation",
        RED: "Strained / Overvalued"
      },
      risk: {
        GREEN: "Calm & Stable",
        YELLOW: "Normal Volatility",
        RED: "Elevated Risk"
      }
    },
    metrics: {
      net_liquidity: {
        name: "Fed Net Liquidity",
        category: "Macro Liquidity",
        type: "valuation",
        intuition: "Actual USD base liquidity: Fed Total Assets minus Treasury General Account (TGA) and Reverse Repo (RRP).",
        rule: "> 6.0T represents expansion (Green); 5.5T~6.0T is neutral (Yellow); < 5.5T is tightening (Red).",
        pitfall: "Aggressive Treasury TGA cash replenishment drains market liquidity even amidst rate cuts."
      },
      tips_10y: {
        name: "10Y Real Rate (TIPS)",
        category: "Discount Rate Anchor",
        type: "valuation",
        intuition: "True risk-free borrowing cost adjusted for inflation; the valuation anchor for equities.",
        rule: "<1.5% is supportive (Green); 1.5%~2.2% is neutral (Yellow); >2.2% severely compresses equity multiples (Red).",
        pitfall: "Real yields above 2% present severe structural headwinds to high-multiple tech."
      },
      hy_spread: {
        name: "High Yield Credit Spread",
        category: "Credit Risk Premium",
        type: "risk",
        intuition: "Default risk premium demanded by lenders; the most sensitive credit barometer.",
        rule: "<300 bps marks complacency (Red); 300~450 bps is normal (Yellow); spike >500 bps reversing down is a generational buy (Green).",
        pitfall: "Widening credit spreads alongside new equity highs signals stealth institutional distribution."
      },
      erp: {
        name: "Equity Risk Premium (ERP)",
        category: "Relative Valuation",
        type: "valuation",
        intuition: "Equity earnings yield minus 10Y Treasury yield. Quantifies the excess reward for holding stocks.",
        rule: "> 2.0% offers strong safety buffer (Green); 0%~2.0% is neutral (Yellow); < 0% represents negative ERP (Red) where cash beats equities.",
        pitfall: "Negative ERP does not trigger immediate crashes, but portends weak multi-year forward returns."
      },
      rsp_spy: {
        name: "Equal vs Cap-Weighted Ratio",
        category: "Market Breadth",
        type: "risk",
        intuition: "Tests whether market advance is broad-based or held up by megacaps alone.",
        rule: "> 0.28 and rising confirms healthy participation (Green); < 0.28 reflects fragility (Yellow).",
        pitfall: "A new SPY high alongside a crashing RSP/SPY ratio indicates extreme structural fragility."
      },
      sp500_200ma: {
        name: "Sectors Above 200-Day SMA",
        category: "Market Breadth",
        type: "risk",
        intuition: "Proportion of the 11 primary S&P sectors sustaining long-term bull market structures.",
        rule: "> 60% confirms bull durability (Green); 40%~60% reflects rotational divergence (Yellow); < 40% is bear territory (Red).",
        pitfall: "Plateauing indices paired with rapid sector breakdown signal distribution."
      },
      move_index: {
        name: "Bond Volatility (MOVE)",
        category: "Pricing Stability",
        type: "risk",
        intuition: "Implied volatility in US Treasuries; early indicator of structural credit stress.",
        rule: "< 95 is benign (Green); 95~115 indicates alert (Yellow); > 115 implies bond repricing turmoil (Red).",
        pitfall: "Never rely solely on VIX; MOVE regularly front-runs equity volatility spikes."
      },
      sahm_rule: {
        name: "Sahm Rule Recession Metric",
        category: "Circuit Breaker",
        type: "risk",
        intuition: "Empirical indicator measuring national unemployment momentum to identify economic recessions.",
        rule: "< 0.50% denotes economic expansion (Green); >= 0.50% triggers mandatory defense (Red).",
        pitfall: "This is a hard stop-loss trigger, not a timing signal for shallow dips."
      }
    }
  }
};