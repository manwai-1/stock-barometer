import React, { useState, useEffect } from 'react';
import { dict } from './locales';
import { Info, Globe, AlertTriangle, ShieldCheck, Activity, AlertCircle } from 'lucide-react';

// 純 SVG 輕量化 30 天走勢折線圖組件
function Sparkline({ data = [], status = 'GREEN', width = 84, height = 26 }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const padding = 3;
  const h = height - padding * 2;

  const colorMap = {
    GREEN: '#10b981',
    YELLOW: '#f59e0b',
    RED: '#f43f5e'
  };
  const strokeColor = colorMap[status] || '#94a3b8';

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - padding - ((val - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const lastVal = data[data.length - 1];
  const lastX = width;
  const lastY = height - padding - ((lastVal - min) / range) * h;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <circle cx={lastX} cy={lastY} r="2.5" fill={strokeColor} />
    </svg>
  );
}

export default function App() {
  const [lang, setLang] = useState('zh');
  const [data, setData] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const t = dict[lang];

  useEffect(() => {
    fetch('./data.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to load metrics data:", err));
  }, []);

  const formatPercentile = (n) => {
    if (lang === 'zh') return `${n}% 分位`;
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return `${n}${s[(v - 20) % 10] || s[v] || s[0]} %`;
  };

  const getRegimeStatus = () => {
    if (!data) return { text: "Loading...", style: "bg-slate-800 text-slate-400", icon: Activity };
    if (data.circuitBreaker) {
      return { text: t.regimes.RECESSION, style: "bg-rose-500/20 border-rose-500 text-rose-300", icon: AlertTriangle };
    }
    const redCount = data.metrics.filter(m => m.status === 'RED').length;
    const greenCount = data.metrics.filter(m => m.status === 'GREEN').length;

    if (redCount >= 3) {
      return { text: t.regimes.STRAIN, style: "bg-amber-500/15 border-amber-500/80 text-amber-300", icon: AlertCircle };
    }
    if (greenCount >= 7) {
      return { text: t.regimes.EXPANSION, style: "bg-emerald-500/15 border-emerald-500/80 text-emerald-300", icon: ShieldCheck };
    }
    return { text: t.regimes.NEUTRAL, style: "bg-slate-800/60 border-slate-700 text-slate-300", icon: ShieldCheck };
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'GREEN': return 'bg-emerald-500/10 border-emerald-500 text-emerald-400';
      case 'YELLOW': return 'bg-amber-500/10 border-amber-500 text-amber-400';
      case 'RED': return 'bg-rose-500/10 border-rose-500 text-rose-400';
      default: return 'bg-slate-800 border-slate-700 text-slate-400';
    }
  };

  const getBarColor = (status) => {
    switch (status) {
      case 'GREEN': return 'bg-emerald-500';
      case 'YELLOW': return 'bg-amber-500';
      case 'RED': return 'bg-rose-500';
      default: return 'bg-slate-600';
    }
  };

  const regime = getRegimeStatus();
  const RegimeIcon = regime.icon;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col justify-between font-sans">
      <div>
        {/* 頂部導航 */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-800 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Activity className="text-emerald-400" /> {t.title}
            </h1>
            <p className="text-sm text-slate-400 mt-1">{t.subtitle}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">
              {t.lastUpdated}: {data ? new Date(data.lastUpdated).toLocaleDateString() : 'Syncing...'}
            </span>
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition"
            >
              <Globe size={14} />
              {lang === 'zh' ? 'English' : '繁體中文'}
            </button>
          </div>
        </header>

        {/* 動態宏觀情境 Banner */}
        <div className={`my-6 p-4 rounded-xl border flex items-center gap-3 text-sm font-medium transition ${regime.style}`}>
          <RegimeIcon className="flex-shrink-0" size={20} />
          <p>{regime.text}</p>
        </div>

        {/* 12 項指標網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          {data && data.metrics.map((item) => {
            const meta = t.metrics[item.id] || {};
            const tagText = t.statusMap[meta.type]?.[item.status] || item.status;
            const subText = typeof item.subValue === 'object' && item.subValue !== null ? item.subValue[lang] : item.subValue;

            return (
              <div 
                key={item.id} 
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{meta.category}</span>
                      {/* 數據血統稽核標籤：當檢測到預設值時亮起警示 */}
                      {item.isFallback && (
                        <span 
                          title={t.fallbackHint || "Fallback value in use"}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5 animate-pulse"
                        >
                          ⚠️ {t.fallbackBadge || (lang === 'zh' ? '離線預設值' : 'Fallback Base')}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => setActiveModal(item.id)}
                      className="text-slate-400 hover:text-white transition p-1"
                      aria-label={t.explainBtn}
                    >
                      <Info size={16} />
                    </button>
                  </div>
                  
                  <h3 className="text-base font-semibold text-slate-100">{meta.name}</h3>
                  
                  {/* 數值 + 30 天微型走勢折線圖並排 */}
                  <div className="flex items-center justify-between my-2.5">
                    <div>
                      <span className="text-2xl font-bold tracking-tight text-white">{item.value}</span>
                      {subText && (
                        <span className="block text-[11px] text-amber-400 font-mono mt-0.5">{subText}</span>
                      )}
                    </div>
                    <div className="pl-2" title={t.sparklineLabel}>
                      <Sparkline data={item.sparkline} status={item.status} width={82} height={26} />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full ${getBarColor(item.status)}`} 
                      style={{ width: `${Math.min(item.percentile, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${getStatusBg(item.status)}`}>
                      {tagText}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">{formatPercentile(item.percentile)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 教育彈窗 */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-1">
              {t.metrics[activeModal]?.name}
            </h2>
            <p className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-4">
              {t.metrics[activeModal]?.category}
            </p>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  💡 {lang === 'zh' ? '核心本質' : 'Core Intuition'}
                </h4>
                <p>{t.metrics[activeModal]?.intuition}</p>
              </div>

              {activeModal === 'erp' && (
                <div className="bg-slate-800/80 p-3 rounded-lg border border-amber-500/40">
                  <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
                    📊 {lang === 'zh' ? '實戰 PE 估值尺規 (當前利率環境下)' : 'Practical PE Valuation Benchmarks'}
                  </h4>
                  <ul className="text-xs space-y-1 text-slate-300">
                    <li>• <strong className="text-emerald-400">PE &le; 16x</strong>: {lang === 'zh' ? '高安全邊際，股票相對於國債具備超額補償' : 'High safety margin; solid equity compensation'}</li>
                    <li>• <strong className="text-amber-400">PE 16x ~ 18.5x</strong>: {lang === 'zh' ? '合理估值區間，承擔波動能獲合理收益' : 'Fair valuation range'}</li>
                    <li>• <strong className="text-rose-400">PE &gt; 22.7x</strong>: {lang === 'zh' ? '估值透支，收益率劣於無風險美國國債' : 'Overvalued; bond yield strictly beats earnings yield'}</li>
                  </ul>
                </div>
              )}

              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  🎯 {lang === 'zh' ? '燈號觸發條件' : 'Trigger Rules'}
                </h4>
                <p>{t.metrics[activeModal]?.rule}</p>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  ⚠️ {lang === 'zh' ? '常見認知盲點' : 'Common Pitfalls'}
                </h4>
                <p className="text-rose-200/90">{t.metrics[activeModal]?.pitfall}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition"
              >
                {t.modalClose}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-12 pt-6 border-t border-slate-800/60 text-center text-xs text-slate-500 font-mono">
        12-Factor Tactical Matrix • 30D Trend Sparklines • Powered by GitHub Actions & Vercel
      </footer>
    </div>
  );
}