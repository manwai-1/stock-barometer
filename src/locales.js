export const dict = {
  zh: {
    title: "美股戰術配置晴雨表",
    subtitle: "基於總體流動性、估值性價比與籌碼極值的客觀決策看板",
    lastUpdated: "最後數據更新",
    circuitAlert: "⚠️ 警告：薩姆衰退斷路器已啟動，建議凍結戰術增配！",
    healthy: "總體環境健康：具備正常配置價值",
    explainBtn: "指標解讀",
    modalClose: "關閉",
    statusMap: {
      GREEN: "積極 / 具備性價比",
      YELLOW: "中性 / 常規維持",
      RED: "過熱 / 緊縮防禦"
    },
    metrics: {
      net_liquidity: {
        name: "聯準會淨流動性",
        category: "流動性",
        intuition: "金融市場的真正美元水庫，由 Fed 總資產扣除財政部帳戶與逆回購資金計算而得。",
        rule: "30 日均線向上且年增率翻正時標記為綠燈，代表資金面推動力充沛。",
        pitfall: "不要單看美聯儲是否降息，若財政部在 TGA 帳戶大量抽水，降息也可能引發流動性緊縮。"
      },
      tips_10y: {
        name: "10年期實質利率 (TIPS)",
        category: "流動性",
        intuition: "扣除通膨預期後的真實無風險借貸成本，是美股估值的定價錨點。",
        rule: "實質利率由頂部拐點向下或處於低位時為綠燈，代表股票折現率壓力減輕。",
        pitfall: "實質利率高於 2% 時，高估值科技股容易遭遇強烈的估值殺跌。"
      },
      hy_spread: {
        name: "高收益債信用利差",
        category: "流動性 / 風險",
        intuition: "企業借貸的違約風險補償，被視為市場上對企業體質最敏感的嗅覺指標。",
        rule: "利差突破 500 bps 後轉向回落為黃金買點；低於 300 bps 則代表市場定價過度盲目樂觀。",
        pitfall: "股市創新高但信用利差擴大時，通常預告著 1~2 個月內的頂部背離。"
      },
      erp: {
        name: "股權風險溢價 (ERP)",
        category: "資產性價比",
        intuition: "股票盈利回報率相較於無風險公債利率的超額報酬補償。",
        rule: "高於歷史 5 年均值 1 個標準差以上為綠燈，股票具備極高性價比。",
        pitfall: "在無風險利率超過 4.5% 的環境下，傳統低 ERP 會大幅壓抑股票的戰略加碼誘因。"
      },
      rsp_spy: {
        name: "等權重/市值加權比率 (RSP/SPY)",
        category: "市場內部廣度",
        intuition: "衡量漲勢是全面普漲，還是僅靠少數科技巨頭掩護指數。",
        rule: "比率向上回升代表漲勢擴散至週期與中小型股票，牛市基礎健全。",
        pitfall: "當 SPY 創高但此比率崩跌破底，代表市場脆弱度達到臨界點。"
      },
      sp500_200ma: {
        name: "站上 200 日線比例",
        category: "市場內部廣度",
        intuition: "標普 500 成分股中，股價處於長期上升趨勢的個股比例。",
        rule: "低於 20% 為極端超跌買點；高於 70% 為健康牛市；低於 50% 且持續下滑為預警。",
        pitfall: "注意指數震盪但比例急跌的背離訊號。"
      },
      move_index: {
        name: "美債波動率指數 (MOVE)",
        category: "債市之錨",
        intuition: "公債市場的隱含波動率，被稱作全球資產真正的灰犀牛探測器。",
        rule: "MOVE 指數低於 90 為平穩安全；突破 120 顯示債券定價失錨，必波及股市。",
        pitfall: "千萬別只看股市 VIX，MOVE 指數通常比 VIX 提早數週亮起紅燈。"
      },
      sahm_rule: {
        name: "薩姆規則衰退指標",
        category: "斷路器",
        intuition: "以失業率移動平均增幅為基準的實體經濟衰退判定法。",
        rule: "數值達到或超過 0.50% 時強制觸發警報，歷史驗證衰退機率極高。",
        pitfall: "該指標是用於確認硬著陸風險的一票否決工具，不可用於捕捉短期反彈。"
      }
    }
  },
  en: {
    title: "US Equities Allocation Barometer",
    subtitle: "Objective tactical framework based on liquidity, valuation, and extreme sentiment",
    lastUpdated: "Last Synced",
    circuitAlert: "⚠️ Alert: Sahm Rule recession breaker triggered! Tactical buying suspended.",
    healthy: "Macro Regime Normal: Allocation rules active",
    explainBtn: "Explain",
    modalClose: "Close",
    statusMap: {
      GREEN: "Bullish / High Margin of Safety",
      YELLOW: "Neutral / Maintain Baseline",
      RED: "Overheated / Tightening"
    },
    metrics: {
      net_liquidity: {
        name: "Fed Net Liquidity",
        category: "Liquidity",
        intuition: "Actual USD liquidity calculated as Fed Assets minus TGA and Reverse Repo.",
        rule: "Bullish when 30-day moving average turns positive year-over-year.",
        pitfall: "Rate cuts do not imply liquidity expansion if Treasury aggressively rebuilds cash."
      },
      tips_10y: {
        name: "10Y Real Interest Rate (TIPS)",
        category: "Liquidity",
        intuition: "True risk-free borrowing cost adjusted for inflation; valuation discount anchor.",
        rule: "Bullish when real yields peak and decline, reducing equity valuation discount pressure.",
        pitfall: "Real yields above 2% present severe structural headwinds to high-multiple tech."
      },
      hy_spread: {
        name: "High Yield Credit Spread",
        category: "Liquidity / Risk",
        intuition: "Credit risk premium demanded by lenders; the most sensitive credit barometer.",
        rule: "Spike above 500 bps reversing downward marks bottom; <300 bps marks complacency.",
        pitfall: "Widening spreads while S&P hits highs signals severe topping divergence."
      },
      erp: {
        name: "Equity Risk Premium (ERP)",
        category: "Valuation",
        intuition: "Excess earnings return of equities over risk-free long-term Treasuries.",
        rule: "Bullish when ERP sits 1 standard deviation above its 5-year average.",
        pitfall: "When cash yields > 4.5%, low ERP disincentivizes tactical equity overweights."
      },
      rsp_spy: {
        name: "Equal vs Cap-Weighted Ratio",
        category: "Breadth",
        intuition: "Tests whether market advance is broad-based or held up by megacaps alone.",
        rule: "Rebounding ratio shows healthy rotational breadth into cyclical and smaller caps.",
        pitfall: "A new SPY high alongside a crashing RSP/SPY ratio indicates extreme structural fragility."
      },
      sp500_200ma: {
        name: "% Stocks Above 200-Day SMA",
        category: "Breadth",
        intuition: "Proportion of individual S&P 500 components in long-term uptrends.",
        rule: "<20% represents extreme capitulation; >70% reflects a mature, healthy trend.",
        pitfall: "A plateauing index paired with deteriorating breadth indicates stealth distribution."
      },
      move_index: {
        name: "Bond Volatility (MOVE Index)",
        category: "Anchor of Pricing",
        intuition: "Implied volatility in US Treasuries; true early indicator of systemic credit stress.",
        rule: "<90 represents calm markets; >120 implies bond repricing turmoil that spreads to equities.",
        pitfall: "Never rely solely on VIX; MOVE regularly front-runs equity volatility spikes."
      },
      sahm_rule: {
        name: "Sahm Rule Recession Indicator",
        category: "Circuit Breaker",
        intuition: "Empirical indicator measuring momentum in national unemployment to flag recessions.",
        rule: "Reaching or exceeding 0.50% triggers emergency protocol, signaling high recession odds.",
        pitfall: "This is a hard stop-loss trigger, not a timing signal for shallow dips."
      }
    }
  }
};