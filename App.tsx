import React, { useState, useCallback } from 'react';
import { Download, Copy, Trash2, FileText } from 'lucide-react';
import { Header } from './components/Header';
import { ItemForm } from './components/ItemForm';
import { ResultsList } from './components/ResultsList';
import { TotalCard } from './components/TotalCard';
import { TileInput, TileConfig, DEFAULT_CONFIG } from './types';
import { calculateItem } from './services/calculatorService';

const App: React.FC = () => {
  const [items, setItems] = useState<TileInput[]>([]);
  const [config, setConfig] = useState<TileConfig>(DEFAULT_CONFIG);

  const handleAddItem = useCallback((newItem: TileInput) => {
    setItems(prev => [...prev, newItem]);
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleReset = () => {
    // Instant clear without confirmation to ensure responsiveness
    setItems([]);
  };

  const generateReportText = () => {
    if (items.length === 0) return '';
    
    const results = items.map(item => calculateItem(item, config));
    const totalCutFee = results.reduce((sum, r) => sum + r.cutFee, 0);
    const totalTrimFee = results.reduce((sum, r) => sum + r.trimFee, 0);
    const totalBevelFee = results.reduce((sum, r) => sum + r.bevelFee, 0);
    const grandTotal = totalCutFee + totalTrimFee + totalBevelFee;
    const dateStr = new Date().toLocaleString('zh-CN');

    let text = `Tile Processing Fee Calculator V7.0 - 清单明细\n`;
    text += `生成时间: ${dateStr}\n`;
    text += `--------------------------------------------------\n`;
    text += `原始尺寸配置: ${config.baseWidth} x ${config.baseHeight} cm\n`;
    text += `费率标准: 切割${config.cutRate}元/刀, 修边${config.trimRate}元/米, 内倒${config.bevelRate}元/米\n\n`;
    text += `[项目列表]\n`;

    results.forEach((res, index) => {
      const input = items.find(i => i.id === res.id)!;
      text += `${index + 1}. ${input.width} x ${input.height} cm | ${input.quantity}片\n`;
      text += `   - 切割: ${res.cutType} (${res.cutCount}刀) -> ¥${res.cutFee.toFixed(0)}\n`;
      text += `   - 修边: ${res.trimDetails} (${res.trimLength.toFixed(2)}m) -> ¥${res.trimFee.toFixed(2)}\n`;
      if(res.bevelLength > 0) {
        text += `   - 内倒: ${res.bevelLength.toFixed(2)}m -> ¥${res.bevelFee.toFixed(2)}\n`;
      }
      text += `   - 小计: ¥${res.totalFee.toFixed(2)}\n\n`;
    });

    text += `--------------------------------------------------\n`;
    text += `费用汇总:\n`;
    text += `切割费用: ¥${totalCutFee.toFixed(0)}\n`;
    text += `修边费用: ¥${totalTrimFee.toFixed(2)}\n`;
    text += `内倒费用: ¥${totalBevelFee.toFixed(2)}\n`;
    text += `\n最终总计: ¥${grandTotal.toFixed(2)}\n`;
    text += `--------------------------------------------------`;

    return text;
  };

  const handleExport = () => {
    const text = generateReportText();
    if (!text) {
      alert('没有可导出的数据');
      return;
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `加工清单_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const text = generateReportText();
    if (!text) {
      alert('没有可复制的数据');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      alert('清单明细已复制到剪贴板！');
    }).catch(err => {
      console.error('Copy failed', err);
      alert('复制失败，请手动尝试');
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header currentConfig={config} onConfigChange={setConfig} />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input and List (Takes up 8 columns on LG) */}
          <div className="lg:col-span-8 space-y-8">
            <section>
              <ItemForm onAddItem={handleAddItem} />
            </section>
            
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 px-1 gap-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    加工清单明细
                  </h3>
                  <span className="text-xs text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 font-mono">
                    {items.length} Items
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                   {/* Action Buttons */}
                   {items.length > 0 && (
                     <>
                      <button 
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        title="复制到剪贴板"
                      >
                        <Copy size={14} />
                        <span className="hidden sm:inline">复制</span>
                      </button>
                      
                      <button 
                        onClick={handleExport}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        title="导出为文本文件"
                      >
                        <Download size={14} />
                        <span className="hidden sm:inline">导出</span>
                      </button>

                      <div className="w-px h-6 bg-slate-200 mx-1"></div>

                      <button 
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={14} />
                        <span>清空数据</span>
                      </button>
                     </>
                   )}
                </div>
              </div>
              <ResultsList items={items} config={config} onRemoveItem={handleRemoveItem} />
            </section>
          </div>

          {/* Right Column: Summary (Takes up 4 columns on LG) */}
          <div className="lg:col-span-4">
            <TotalCard items={items} config={config} />
            
            {/* Quick Reference */}
            <div className="mt-6 bg-slate-100 rounded-lg p-4 text-xs text-slate-500 space-y-2">
              <p className="font-bold text-slate-700">计费逻辑提示 (V7.0)</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>当前原始尺寸: {config.baseWidth} × {config.baseHeight} cm。</li>
                <li>单/双刀判定基于成品尺寸是否保留了原边。</li>
                <li>修边费根据切割类型实行阶梯倍率 (窄板溢价)。</li>
                <li>阈值 (30%/50%) 会根据原始尺寸自动调整。</li>
                <li>内倒费用仅计算勾选了内倒的边长。</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-8">
         <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-400">
           &copy; {new Date().getFullYear()} Tile Processing Calculator V7.0. Internal Use Only.
         </div>
      </footer>
    </div>
  );
};

export default App;