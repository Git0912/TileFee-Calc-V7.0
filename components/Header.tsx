import React, { useState, useRef, useEffect } from 'react';
import { Calculator, ChevronDown, Settings2, X } from 'lucide-react';
import { TileConfig, PRESET_CONFIGS } from '../types';

interface HeaderProps {
  currentConfig: TileConfig;
  onConfigChange: (config: TileConfig) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentConfig, onConfigChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [tempConfig, setTempConfig] = useState<TileConfig>(currentConfig);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCustomMode(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePresetSelect = (preset: TileConfig) => {
    onConfigChange(preset);
    setTempConfig(preset);
    setIsOpen(false);
    setIsCustomMode(false);
  };

  const toggleCustomMode = () => {
    setTempConfig(currentConfig);
    setIsCustomMode(true);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigChange({
      ...tempConfig,
      id: 'custom',
      name: '自定义尺寸'
    });
    setIsOpen(false);
    setIsCustomMode(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
              <Calculator size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">瓷砖加工费精算专家</h1>
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">V7.0 核心算法</span>
                <span className="text-slate-400">|</span>
                <span>Adaptive Python Logic</span>
              </p>
            </div>
          </div>
          
          {/* Interactive Config Display */}
          <div className="hidden md:flex items-center gap-6" ref={dropdownRef}>
            <div className="relative">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex flex-col items-end group px-3 py-1.5 rounded-lg border border-transparent transition-all ${isOpen ? 'bg-slate-50 border-slate-200 shadow-sm' : 'hover:bg-slate-50'}`}
              >
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1">
                  原始尺寸 <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </span>
                <span className="font-mono font-medium text-slate-700">{currentConfig.baseWidth} × {currentConfig.baseHeight} cm</span>
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30 ring-1 ring-black ring-opacity-5">
                  {!isCustomMode ? (
                    <div className="p-2">
                      <div className="text-xs font-semibold text-slate-400 px-3 py-2 uppercase tracking-wider">选择预设尺寸</div>
                      {PRESET_CONFIGS.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => handlePresetSelect(preset)}
                          className={`w-full text-left px-3 py-3 rounded-lg flex justify-between items-center text-sm transition-colors ${
                            currentConfig.id === preset.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="font-medium">{preset.name}</span>
                          {currentConfig.id === preset.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                        </button>
                      ))}
                      <div className="h-px bg-slate-100 my-1"></div>
                      <button
                        onClick={toggleCustomMode}
                        className="w-full text-left px-3 py-3 rounded-lg flex items-center gap-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                         <Settings2 size={16} />
                         <span>手动修改参数...</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-800">自定义参数</h3>
                        <button onClick={() => setIsCustomMode(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={16} />
                        </button>
                      </div>
                      <form onSubmit={handleCustomSubmit} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                             <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">宽 (cm)</label>
                             <input 
                               type="number" 
                               value={tempConfig.baseWidth}
                               onChange={e => setTempConfig({...tempConfig, baseWidth: parseFloat(e.target.value) || 0})}
                               className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-1"
                             />
                           </div>
                           <div>
                             <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">长 (cm)</label>
                             <input 
                               type="number" 
                               value={tempConfig.baseHeight}
                               onChange={e => setTempConfig({...tempConfig, baseHeight: parseFloat(e.target.value) || 0})}
                               className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-1"
                             />
                           </div>
                        </div>
                        
                        <div className="space-y-2 pt-2 border-t border-slate-200">
                           <div className="flex items-center justify-between">
                             <label className="text-xs text-slate-600">切割 (元/刀)</label>
                             <input 
                               type="number" 
                               value={tempConfig.cutRate}
                               onChange={e => setTempConfig({...tempConfig, cutRate: parseFloat(e.target.value) || 0})}
                               className="w-20 text-right text-xs border-slate-300 rounded py-1"
                             />
                           </div>
                           <div className="flex items-center justify-between">
                             <label className="text-xs text-slate-600">修边 (元/米)</label>
                             <input 
                               type="number" 
                               value={tempConfig.trimRate}
                               onChange={e => setTempConfig({...tempConfig, trimRate: parseFloat(e.target.value) || 0})}
                               className="w-20 text-right text-xs border-slate-300 rounded py-1"
                             />
                           </div>
                           <div className="flex items-center justify-between">
                             <label className="text-xs text-slate-600">内倒 (元/米)</label>
                             <input 
                               type="number" 
                               value={tempConfig.bevelRate}
                               onChange={e => setTempConfig({...tempConfig, bevelRate: parseFloat(e.target.value) || 0})}
                               className="w-20 text-right text-xs border-slate-300 rounded py-1"
                             />
                           </div>
                        </div>

                        <button 
                          type="submit" 
                          className="w-full mt-2 bg-blue-600 text-white text-xs font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          应用参数
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200"></div>
            
            <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-xs">
               <div><span className="text-slate-400">切割:</span> {currentConfig.cutRate}元/刀</div>
               <div><span className="text-slate-400">修边:</span> {currentConfig.trimRate}元/米</div>
               <div><span className="text-slate-400">内倒:</span> {currentConfig.bevelRate}元/米</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};