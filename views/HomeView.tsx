
import React from 'react';
import { INITIAL_RADIOGRAPHS } from '../constants';

interface HomeViewProps {
  onLoginClick: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onLoginClick }) => {
  return (
    <div className="bg-white leading-[1.5]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl leading-[1.2]">
                <span className="block mb-2">数字化射线检测</span>
                <span className="block text-blue-600">评片能力训练系统</span>
              </h1>
              <p className="mt-6 text-base text-gray-600 sm:text-lg md:text-xl max-w-2xl leading-[1.5]">
                本系统专为无损检测人员设计，模拟真实的工业射线数字底片环境，提供交互式缺陷标定训练。
                采用上下分体式布局，支持高倍率缩放、拖动及亮度实时调节，助力专业水平进阶。
              </p>
              <div className="mt-10 flex gap-4">
                <button
                  onClick={onLoginClick}
                  className="px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1"
                >
                  立即登录训练
                </button>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-black rounded-2xl shadow-2xl overflow-hidden border-4 border-white h-[320px]">
                {/* 优化剪裁比例，使用 h-[320px] 配合 object-cover 达到最佳视觉效果 */}
                <img 
                  src={INITIAL_RADIOGRAPHS[0].imageUrl} 
                  alt="RT Preview" 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white text-sm flex items-center justify-between">
                   <span className="bg-blue-600 px-2 py-1 rounded text-xs">实战案例：{INITIAL_RADIOGRAPHS[0].tag}</span>
                   <span className="text-gray-300">工业级射线数字成像模拟</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Showcase */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">精准视觉还原</h3>
              <p className="text-gray-500 text-sm leading-[1.5]">
                支持无极缩放与局部拖动，通过算法增强边缘对比，模拟观片灯调节效果，确保每一个细微缺陷都清晰可见。
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">标准化评分体系</h3>
              <p className="text-gray-500 text-sm leading-[1.5]">
                根据《压力容器无损检测》标准，结合IoU重叠度计算，实时反馈缺陷类型及位置偏离度，纠正评片习惯。
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">大数据能力画像</h3>
              <p className="text-gray-500 text-sm leading-[1.5]">
                记录每一张底片的评定耗时与准确率，自动分析您对“裂纹”或“未焊透”等特定缺陷的识别敏感度。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
