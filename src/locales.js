export const dict = {
  zh: {
    title: "美股戰術配置晴雨表",
    subtitle: "基於總體流動性、估值性價比、籌碼極值與跨市場動能的客觀決策看板",
    lastUpdated: "最後數據更新",
    explainBtn: "指標解讀",
    modalClose: "關閉",
    regimes: {
      RECESSION: "🚨 衰退斷路已啟動：薩姆指標超標，建議凍結所有權益增配，轉向純防禦。",
      STRAIN: "⚠️ 結構失衡預警：實質利率高企且 ERP 轉負，估值透支，建議維持基底底倉但暫緩戰術追高。",
      EXPANSION: "🚀 全面積極擴張：宏觀流動性充沛且股票具備高性價比，適合積極增配。",
      NEUTRAL: "⚖️ 中性平穩期：市場各項因子處於均衡區間，建議按既定節奏定期定額。"
    },
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
      },
      momentum: {
        GREEN: "動能強勁",
        YELLOW: "中性輪動",
        RED: "動能衰竭"
      }
    },
    metrics: {
      net_liquidity: {
        name: "聯準會淨流動性",
        category: "流動性水庫",
        type: "valuation",
        intuition: "金融市場的真正美元水庫，由 Fed 總資產扣除財政部一般帳戶 (TGA) 與隔夜逆回購 (RRP) 計算而得。",
        rule: "> 6.0T 為寬鬆（綠燈）；5.4T~6.0T 為中性（黃燈）；< 5.4T 為實質抽水（紅燈）。",
        pitfall: "若財政部在 TGA 帳戶大量發債抽水，即便降息也可能引發流動性緊縮。"
      },
      tips_10y: {
        name: "10年期實質利率 (TIPS)",
        category: "貼現率錨點",
        type: "valuation",
        intuition: "扣除通膨預期後的真實無風險借貸成本，是科技股與長久期資產的折現定價錨點。",
        rule: "< 1.5% 折現壓力小（綠燈）；1.5%~2.2% 常態（黃燈）；> 2.2% 嚴重壓抑高估值資產（紅燈）。",
        pitfall: "實質利率高於 2% 時，若非由極端強勁的獲利成長支撐，高 PE 股票極易遭遇估值殺戮。"
      },
      hy_spread: {
        name: "高收益債信用利差",
        category: "信用違約風險",
        type: "risk",
        intuition: "體質較弱企業借款時需額外支付的風險利差，對實體企業信貸健康度最為敏感。",
        rule: "< 300 bps 代表盲目自滿（紅燈）；300~450 bps 常態（黃燈）；破 500 bps 後見頂回落為黃金買點（綠燈）。",
        pitfall: "美股創歷史新高但信用利差反向走闊時，通常預告著聰明錢正在暗中撤退。"
      },
      erp: {
        name: "股權風險溢價 (ERP)",
        category: "資產性價比",
        type: "valuation",
        intuition: "股票盈餘殖利率 (1/PE) 減去 10 年期美債利率。衡量承擔股票風險相較於無風險國債能獲得多少超額報酬。",
        rule: "> 2.0% 具備巨大安全邊際（綠燈）；0%~2.0% 中性（黃燈）；< 0% 倒掛（紅燈），代表買股票性價比倒輸國債。",
        pitfall: "負 ERP 不代表股市明天立刻崩盤，但代表當前估值完全不具備容錯率，長期複合回報將極為平庸。"
      },
      rsp_spy: {
        name: "等權重/市值加權比率",
        category: "市場內部廣度",
        type: "momentum",
        intuition: "檢驗漲勢是否只靠少數科技巨頭掩護，還是由廣大實體企業普漲推動。",
        rule: "> 0.28 且回升為健康普漲（綠燈）；< 0.28 代表市場廣度極度狹窄脆弱（黃燈）。",
        pitfall: "標普 500 指數創新高但 RSP/SPY 破底時，代表市場結構已極端脆弱。"
      },
      sp100_200ma: {
        name: "S&P 100 站上 200 日線",
        category: "高靈敏權值廣度",
        type: "momentum",
        intuition: "美股前 100 大核心權值股中，股價處於長期 200 日均線多頭架構的真實比例，解析度達 1%。",
        rule: "> 60% 為健康多頭（綠燈）；40%~60% 為輪動震盪（黃燈）；< 40% 為空頭主導（紅燈）。",
        pitfall: "指數在高位橫盤，但站上均線比例急速滑落時，為強烈的機構派發出貨訊號。"
      },
      smh_spy: {
        name: "半導體 vs 標普比率",
        category: "科技牛市轉速",
        type: "momentum",
        intuition: "半導體晶片板塊 (SMH) 相對於標普 (SPY) 的強弱，是科技資本支出與 AI 浪潮的先行金絲雀。",
        rule: "> 0.42 為科技主升浪（綠燈）；0.36~0.42 為常態（黃燈）；< 0.36 代表科技動能衰竭（紅燈）。",
        pitfall: "半導體比率若跌破半年線支撐，通常領先納斯達克大盤 1~2 個月出現波段回檔。"
      },
      xly_xlp: {
        name: "奢侈 vs 求生消費比率",
        category: "真實風險偏好",
        type: "momentum",
        intuition: "非必需消費 (XLY) 除以必需消費 (XLP)。衡量市場是在定價「跑車奢華消費」還是「囤積牙膏麵包」。",
        rule: "> 2.6 為高度樂觀 Risk-On（綠燈）；2.3~2.6 為均衡（黃燈）；< 2.3 顯示全面防禦（紅燈）。",
        pitfall: "大盤創新高但可選消費比率持續背離走低，代表中產階級消費力道出現隱性疲態。"
      },
      copper_gold: {
        name: "銅金比 (Copper/Gold)",
        category: "宏觀經濟預言",
        type: "momentum",
        intuition: "實體景氣博士（銅 CPER）除以避險貨幣（黃金 GLD）。反映實體製造增長預期 vs 終極避險需求。",
        rule: "> 115 代表實體強勁擴張（綠燈）；95~115 為常態（黃燈）；< 95 預示製造業衰退或地緣避險（紅燈）。",
        pitfall: "銅金比持續下行時，往往預告全球長天期公債殖利率即將見頂下行。"
      },
      vix_structure: {
        name: "VIX 期限結構比率",
        category: "期權踩踏計",
        type: "risk",
        intuition: "即期恐慌指數 (^VIX) 除以 3 個月遠期 (^VIX3M)。衡量避險市場是處於安穩狀態還是恐慌擠兌。",
        rule: "< 0.88 正價差安穩（綠燈）；0.88~1.02 常態（黃燈）；> 1.02 倒掛踩踏（紅燈）。",
        pitfall: "當比率飆破 1.15 極端倒掛時，往往不是逃命點，而是恐慌定價耗盡的波段反彈買點。"
      },
      move_index: {
        name: "美債波動率指數 (MOVE)",
        category: "債市定價之錨",
        type: "risk",
        intuition: "美國公債市場的隱含波動率，為全球固定收益市場的定價錨點。",
        rule: "< 95 平穩安全（綠燈）；95~115 警惕（黃燈）；> 115 顯示債市定價失錨（紅燈）。",
        pitfall: "公債市場容量遠超股市，MOVE 指數通常比股市 VIX 提早數週亮起流動性預警。"
      },
      sahm_rule: {
        name: "薩姆規則衰退指標",
        category: "一票否決斷路器",
        type: "risk",
        intuition: "以全國失業率 3 個月移動平均相較於過去 12 個月低點的變動幅度，判定實體經濟是否硬著陸。",
        rule: "< 0.50% 為正常擴張期（綠燈）；>= 0.50% 觸發強制防禦（紅燈）。",
        pitfall: "此指標是宏觀經濟防禦斷路器，不可用於抄底短期市場技術性回檔。"
      }
    }
  },
  en: {
    title: "US Equities Tactical Barometer",
    subtitle: "Objective 12-factor tactical asset allocation radar based on liquidity, valuation, internals, and macro cross-assets",
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
      },
      momentum: {
        GREEN: "Strong Momentum",
        YELLOW: "Neutral Rotation",
        RED: "Momentum Decay"
      }
    },
    metrics: {
      net_liquidity: {
        name: "Fed Net Liquidity",
        category: "Macro Liquidity",
        type: "valuation",
        intuition: "Actual USD base liquidity: Fed Total Assets minus Treasury General Account (TGA) and Reverse Repo (RRP).",
        rule: "> 6.0T represents expansion (Green); 5.4T~6.0T is neutral (Yellow); < 5.4T is tightening (Red).",
        pitfall: "Aggressive Treasury TGA cash replenishment drains market liquidity even amidst rate cuts."
      },
      tips_10y: {
        name: "10Y Real Rate (TIPS)",
        category: "Discount Rate Anchor",
        type: "valuation",
        intuition: "True risk-free borrowing cost adjusted for inflation; the valuation anchor for equities.",
        rule: "< 1.5% supportive (Green); 1.5%~2.2% neutral (Yellow); > 2.2% compresses equity multiples (Red).",
        pitfall: "Real yields above 2% present severe structural headwinds to high-multiple tech unless offset by massive EPS growth."
      },
      hy_spread: {
        name: "High Yield Credit Spread",
        category: "Credit Risk Premium",
        type: "risk",
        intuition: "Default risk premium demanded by lenders; the most sensitive barometer for corporate credit stress.",
        rule: "< 300 bps marks complacency (Red); 300~450 bps is normal (Yellow); spike > 500 bps reversing down is a generational buy (Green).",
        pitfall: "Widening credit spreads alongside new equity highs signals stealth institutional distribution."
      },
      erp: {
        name: "Equity Risk Premium (ERP)",
        category: "Relative Valuation",
        type: "valuation",
        intuition: "Earnings yield (1/PE) minus 10Y Treasury yield. Quantifies the excess return reward for holding stocks.",
        rule: "> 2.0% offers strong safety buffer (Green); 0%~2.0% is neutral (Yellow); < 0% represents negative ERP (Red) where cash beats equities.",
        pitfall: "Negative ERP does not trigger immediate crashes, but leaves zero margin of safety for unexpected earnings misses."
      },
      rsp_spy: {
        name: "Equal vs Cap-Weighted Ratio",
        category: "Market Breadth",
        type: "momentum",
        intuition: "Tests whether market advance is broad-based across average companies or held up by megacaps alone.",
        rule: "> 0.28 confirms healthy participation (Green); < 0.28 reflects fragile concentration (Yellow).",
        pitfall: "A new SPY high alongside a crashing RSP/SPY ratio indicates extreme structural divergence."
      },
      sp100_200ma: {
        name: "S&P 100 Above 200-Day SMA",
        category: "Granular Breadth",
        type: "momentum",
        intuition: "Proportion of top 100 US megacaps sustaining long-term 200-day moving average uptrends, sampled at 1% precision.",
        rule: "> 60% confirms bull durability (Green); 40%~60% reflects rotational divergence (Yellow); < 40% is bear territory (Red).",
        pitfall: "Plateauing indices paired with rapid breakdown in this ratio signals institutional liquidation."
      },
      smh_spy: {
        name: "Semis vs S&P Ratio (SMH/SPY)",
        category: "Tech Capex Engine",
        type: "momentum",
        intuition: "Semiconductors relative to S&P 500; the canary in the coalmine for AI capex and global tech cycles.",
        rule: "> 0.42 confirms tech bull leadership (Green); 0.36~0.42 is normal (Yellow); < 0.36 indicates leadership fatigue (Red).",
        pitfall: "A breakdown in chip leadership regularly front-runs Nasdaq index corrections by 4 to 8 weeks."
      },
      xly_xlp: {
        name: "Luxury vs Survival Ratio",
        category: "Risk-On Sentiment",
        type: "momentum",
        intuition: "Consumer Discretionary (XLY) divided by Consumer Staples (XLP). Gauges appetite for luxury versus defensive staples.",
        rule: "> 2.6 reflects robust Risk-On (Green); 2.3~2.6 is neutral (Yellow); < 2.3 signals risk-off capital preservation (Red).",
        pitfall: "Market index gains divergence against falling XLY/XLP highlights weakening underlying consumer health."
      },
      copper_gold: {
        name: "Copper / Gold Ratio",
        category: "Macro Growth Barometer",
        type: "momentum",
        intuition: "Doctor Copper (CPER) divided by safe-haven Gold (GLD). Measures physical cyclical demand vs monetary debasement hedge.",
        rule: "> 115 indicates cyclical expansion (Green); 95~115 is normal (Yellow); < 95 warns of growth slowdown (Red).",
        pitfall: "A persistent downward trend in the copper/gold ratio reliably precedes declines in benchmark 10-year yields."
      },
      vix_structure: {
        name: "VIX Term Structure Ratio",
        category: "Options Panic Meter",
        type: "risk",
        intuition: "Spot VIX divided by 3-Month VIX (VIX3M). Indicates whether hedging demand is calm or in structural panic inversion.",
        rule: "< 0.88 is stable contango (Green); 0.88~1.02 is neutral (Yellow); > 1.02 marks panic backwardation (Red).",
        pitfall: "Ratios spiking above 1.15 often represent panic climax and generational mean-reversion buying opportunities."
      },
      move_index: {
        name: "Bond Volatility (MOVE)",
        category: "Pricing Stability",
        type: "risk",
        intuition: "Implied volatility in US Treasuries; early warning radar for systemic credit market dislocations.",
        rule: "< 95 is benign (Green); 95~115 indicates alert (Yellow); > 115 implies bond repricing turmoil (Red).",
        pitfall: "Bond market instability invariably spills over to trigger sharp equity repricing."
      },
      sahm_rule: {
        name: "Sahm Rule Recession Metric",
        category: "Circuit Breaker",
        type: "risk",
        intuition: "Empirical indicator measuring 3-month unemployment momentum to identify economic recessions in real time.",
        rule: "< 0.50% denotes economic expansion (Green); >= 0.50% triggers mandatory capital preservation (Red).",
        pitfall: "This is a hard stop-loss trigger, not a timing signal for shallow dips."
      }
    }
  }
};