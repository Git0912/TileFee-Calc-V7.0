import React from 'react';
import { TileInput, TileConfig } from '../types';
import { calculateItem } from '../services/calculatorService';

interface TotalCardProps {
  items: TileInput[];
  config: TileConfig;
}

export const TotalCard: React.FC<TotalCardProps> = ({ items, config }) => {
  const results = items.map(item => calculateItem(item, config));
  
  const totalCutFee = results.reduce((sum, r) => sum + r.cutFee, 0);
  const totalTrimFee = results.reduce((sum, r) => sum + r.trimFee, 0);
  const totalBevelFee = results.reduce((sum, r) => sum + r.bevelFee, 0);
  const grandTotal = totalCutFee + totalTrimFee + totalBevelFee;

  return (
    <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">费用总览</h2>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-blue-50/50 rounded-lg border border-blue-100">
          <span className="text-sm text-slate-600 font-medium">切割费用</span>
          <div className="text-right">
            <span className="block font-bold text-slate-800">¥{totalCutFee.toFixed(0)}</span>
            <span className="text-[10px] text-slate-400">@ {config.cutRate}元/刀</span>
          </div>
        </div>

        <div className="flex justify-between items-center p-3 bg-purple-50/50 rounded-lg border border-purple-100">
          <span className="text-sm text-slate-600 font-medium">修边费用</span>
          <div className="text-right">
            <span className="block font-bold text-slate-800">¥{totalTrimFee.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400">@ {config.trimRate}元/米</span>
          </div>
        </div>

        <div className="flex justify-between items-center p-3 bg-amber-50/50 rounded-lg border border-amber-100">
          <span className="text-sm text-slate-600 font-medium">内倒费用</span>
          <div className="text-right">
            <span className="block font-bold text-slate-800">¥{totalBevelFee.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400">@ {config.bevelRate}元/米</span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex justify-between items-end">
          <span className="text-base font-bold text-slate-900">最终总计</span>
          <span className="text-3xl font-extrabold text-blue-600 tracking-tight">
            ¥{grandTotal.toFixed(2)}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-400 text-right">
          * 基于 V7.0 严谨逻辑计算 ({config.baseWidth}x{config.baseHeight})
        </div>
      </div>
    </div>
  );
};