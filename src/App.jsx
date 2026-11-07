import React, { useState, useEffect } from 'react';
import { dict } from './locales';
import { Info, Globe, AlertTriangle, ShieldCheck, Activity, AlertCircle } from 'lucide-react';

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

  // 格式化英文序數 (51st, 62nd, 63rd, 74th)
  const formatPercentile = (n) => {
    if (lang === 'zh') return `${n}% 分位`;
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return `${n}${s[(v - 20) % 10] || s[v] || s[0]} %`;
  };

  // 動態判定當前宏觀情境 (Regime)
  const getRegimeStatus = () => {
    if (!data) return { text: "Loading...", style: "bg-slate-800 text-slate-400", icon: Activity };
    if (data.circuitBreaker) {
      return { text: t.regimes.RECESSION, style: "bg-rose-500/20 border-rose-500 text-rose-300", icon: AlertTriangle };
    }
    const redCount = data.metrics.filter(m => m.status === 'RED').length;
    const greenCount = data.metrics.filter(m => m.status === 'GREEN').length;

    if (redCount >= 2) {
      return { text: t.regimes.STRAIN, style: "bg-amber-500/15 border-amber-500/80 text-amber-300", icon: AlertCircle };
    }
    if (greenCount >= 5) {
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
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto flex flex-col justify-between font-sans">
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
            <span className="text-xs text-slate-500">
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

        {/* 指標網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {data && data.metrics.map((item) => {
            const meta = t.metrics[item.id] || {};
            const tagText = t.statusMap[meta.type]?.[item.status] || item.status;

            return (
              <div 
                key={item.id} 
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{meta.category}</span>
                    <button 
                      onClick={() => setActiveModal(item.id)}
                      className="text-slate-400 hover:text-white transition p-1"
                      aria-label={t.explainBtn}
                    >
                      <Info size={16} />
                    </button>
                  </div>
                  <h3 className="text-base font-semibold text-slate-100">{meta.name}</h3>
                  <div className="flex items-baseline gap-2 my-2">
                    <span className="text-2xl font-bold tracking-tight text-white">{item.value}</span>
                  </div>
                </div>

                <div>
                  {/* 吸引力進度條 */}
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
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

      <footer className="mt-12 pt-6 border-t border-slate-800/60 text-center text-xs text-slate-500">
        Decoupled GitOps Architecture • Data pulled via FRED & Yahoo Finance
      </footer>
    </div>
  );
}