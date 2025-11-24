import React from 'react';
import { Trash2, BoxSelect } from 'lucide-react';
import { TileInput, TileConfig } from '../types';
import { calculateItem } from '../services/calculatorService';

interface ResultsListProps {
  items: TileInput[];
  config: TileConfig;
  onRemoveItem: (id: string) => void;
}

export const ResultsList: React.FC<ResultsListProps> = ({ items, config, onRemoveItem }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
        <BoxSelect className="mx-auto h-12 w-12 text-slate-300" />
        <h3 className="mt-2 text-sm font-medium text-slate-900">暂无数据</h3>
        <p className="mt-1 text-sm text-slate-500">请在上方的表单中添加瓷砖加工尺寸。</p>
      </div>
    );
  }

  const results = items.map(item => calculateItem(item, config));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">尺寸与数量</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">切割计算</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">修边计算 (米)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">内倒计算</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">小计</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {results.map((res, idx) => {
              const input = items.find(i => i.id === res.id)!;
              return (
                <tr key={res.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="bg-slate-100 text-slate-500 text-xs font-mono py-0.5 px-2 rounded mr-3">#{idx + 1}</span>
                      <div>
                        <div className="text-sm font-bold text-slate-900 font-mono">
                          {input.width} × {input.height}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {input.quantity} 片
                          {(input.bevelWidth || input.bevelHeight) && (
                             <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                               含内倒
                             </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Cutting */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          res.cutType === '单刀' ? 'bg-blue-100 text-blue-800' :
                          res.cutType === '双刀' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {res.cutType}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {res.cutCount}刀 × {config.cutRate}元 = <span className="font-semibold text-slate-700">{res.cutFee.toFixed(0)}元</span>
                      </div>
                    </div>
                  </td>

                  {/* Trimming */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col max-w-xs">
                       <div className="text-xs text-slate-500 truncate" title={res.trimDetails}>
                        {res.trimDetails}
                      </div>
                      <div className="mt-1 text-sm text-slate-900 font-mono">
                        {res.trimLength.toFixed(2)}m <span className="text-slate-400">× {config.trimRate} = </span>
                        <span className="font-semibold text-slate-700">{res.trimFee.toFixed(2)}元</span>
                      </div>
                    </div>
                  </td>

                  {/* Beveling */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {res.bevelLength > 0 ? (
                      <div className="flex flex-col">
                         <div className="text-xs text-slate-500">
                            {input.bevelWidth && `${input.width}cm `}
                            {input.bevelWidth && input.bevelHeight && '+ '}
                            {input.bevelHeight && `${input.height}cm `}
                         </div>
                         <div className="mt-1 text-sm text-slate-900 font-mono">
                           {res.bevelLength.toFixed(2)}m <span className="text-slate-400">× {config.bevelRate} = </span>
                           <span className="font-semibold text-slate-700">{res.bevelFee.toFixed(2)}元</span>
                         </div>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">-</span>
                    )}
                  </td>

                  {/* Subtotal */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-base font-bold text-blue-600">
                      ¥{res.totalFee.toFixed(2)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => onRemoveItem(res.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};