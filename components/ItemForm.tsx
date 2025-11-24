import React, { useState, useEffect } from 'react';
import { Plus, Tag, X, Save } from 'lucide-react';
import { TileInput } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ItemFormProps {
  onAddItem: (item: TileInput) => void;
}

// Ensure defaults are empty as requested
const DEFAULT_PRESETS: {w: number, h: number, label: string}[] = [];
// Updated storage key to V2 to clear out old legacy presets from user's local storage
const STORAGE_KEY = 'tileCalc_presets_v2';

export const ItemForm: React.FC<ItemFormProps> = ({ onAddItem }) => {
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [bevelWidth, setBevelWidth] = useState(false);
  const [bevelHeight, setBevelHeight] = useState(false);

  // Load presets from localStorage or use empty defaults
  const [presets, setPresets] = useState<{w: number, h: number, label: string}[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse presets", e);
      }
    }
    return DEFAULT_PRESETS;
  });

  // Persist presets whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  }, [presets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(width);
    const h = parseFloat(height);
    const q = parseInt(quantity);

    if (w > 0 && h > 0 && q > 0) {
      onAddItem({
        id: uuidv4(),
        width: w,
        height: h,
        quantity: q,
        bevelWidth,
        bevelHeight
      });
      // Reset meaningful fields but keep quantity as user often inputs series
      setWidth('');
      setHeight('');
      setBevelWidth(false);
      setBevelHeight(false);
    }
  };

  const applyPreset = (w: number, h: number) => {
    setWidth(w.toString());
    setHeight(h.toString());
    setBevelWidth(false);
    setBevelHeight(false);
  };

  const handleAddPreset = () => {
    const w = parseFloat(width);
    const h = parseFloat(height);
    if (!w || !h) return;

    // Check for duplicates
    if (presets.some(p => p.w === w && p.h === h)) {
      alert('该尺寸已存在于预设列表中');
      return;
    }

    const newPreset = { w, h, label: `${w} × ${h}` };
    setPresets([...presets, newPreset]);
  };

  const handleRemovePreset = (index: number, e: React.MouseEvent) => {
    // CRITICAL FIX: Stop propagation immediately to prevent parent clicks
    e.stopPropagation(); 
    e.preventDefault();
    
    // Remove confirmation dialog for instant deletion
    const newPresets = presets.filter((_, i) => i !== index);
    setPresets(newPresets);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-500" />
          添加加工项目
        </h2>
      </div>

      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              常用尺寸预设
            </span>
          </div>
          <span className="text-[10px] text-slate-400">点击应用 / 点击 X 删除</span>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          {presets.length === 0 && (
            <span className="text-xs text-slate-400 italic py-1">暂无预设，输入尺寸后点击保存添加</span>
          )}

          {presets.map((preset, index) => (
            <div
              key={`${preset.w}-${preset.h}-${index}`}
              className="flex items-center text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md shadow-sm transition-all hover:border-blue-300 hover:shadow-md active:scale-95"
            >
              <button
                type="button"
                onClick={() => applyPreset(preset.w, preset.h)}
                className="px-3 py-1.5 hover:text-blue-600 border-r border-slate-100"
              >
                {preset.label}
              </button>
              <button
                type="button"
                onClick={(e) => handleRemovePreset(index, e)}
                className="px-2 py-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors rounded-r-md"
                title="删除预设"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </div>
          ))}

          {/* Add Preset Button */}
          <button
            type="button"
            onClick={handleAddPreset}
            disabled={!width || !height}
            className={`px-3 py-1.5 text-xs font-medium border border-dashed rounded-md transition-all flex items-center gap-1 group
              ${width && height 
                ? 'border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer' 
                : 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed opacity-60'
              }`}
            title={width && height ? "将当前输入尺寸保存为预设" : "输入长宽后可保存"}
          >
            <Save size={12} className={width && height ? "text-blue-500" : "text-slate-300"} />
            <span>保存当前</span>
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 pt-2 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        
        {/* Width Input */}
        <div className="md:col-span-3 space-y-2">
          <label className="block text-sm font-medium text-slate-700">长度 A (cm)</label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              required
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="如 60"
              className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 border transition-colors"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={bevelWidth}
              onChange={(e) => setBevelWidth(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 border-slate-300" 
            />
            <span className="text-xs text-slate-500 group-hover:text-slate-700">此边做内倒 ()</span>
          </label>
        </div>

        <div className="md:col-span-1 flex justify-center pb-8 text-slate-400">
          ×
        </div>

        {/* Height Input */}
        <div className="md:col-span-3 space-y-2">
          <label className="block text-sm font-medium text-slate-700">宽度 B (cm)</label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              required
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="如 30"
              className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 border transition-colors"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={bevelHeight}
              onChange={(e) => setBevelHeight(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 border-slate-300" 
            />
            <span className="text-xs text-slate-500 group-hover:text-slate-700">此边做内倒 ()</span>
          </label>
        </div>

        {/* Quantity Input */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-slate-700">数量 (片)</label>
          <input
            type="number"
            min="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 border transition-colors text-center font-mono"
          />
          <div className="h-5"></div> {/* Spacer to align with checkbox area */}
        </div>

        {/* Submit Button */}
        <div className="md:col-span-3 pb-7">
          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-95"
          >
            <Plus size={18} />
            加入清单
          </button>
        </div>
      </form>
    </div>
  );
};