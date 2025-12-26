
import React from 'react';
import { User, DefectLabels } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface AnalysisViewProps {
  user: User;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ user }) => {
  const defectData = Object.entries(DefectLabels).map(([key, label]) => {
    const stats = user.stats.defectAccuracy[parseInt(key)] || { correct: 0, total: 0 };
    return {
      name: label,
      correct: stats.correct,
      wrong: stats.total - stats.correct,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
    };
  });

  const overallAccuracy = user.stats.totalPracticed > 0 
    ? Math.round((user.stats.correctCount / user.stats.totalPracticed) * 100) 
    : 0;

  const getPerformanceLevel = (acc: number) => {
    if (acc >= 90) return '专家级评片员';
    if (acc >= 75) return '资深评片员';
    if (acc >= 60) return '合格评片员';
    return '见习评片员';
  };

  const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">个人评片能力分析报告</h2>
        <p className="text-gray-500">基于您累计练习的 {user.stats.totalPracticed} 张底片生成的数据报告</p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h4 className="text-blue-700 font-bold mb-1">总体评级</h4>
            <div className="text-3xl font-black text-blue-900">{getPerformanceLevel(overallAccuracy)}</div>
            <p className="text-blue-600 text-sm mt-2">总体正确率: {overallAccuracy}%</p>
          </div>
          <div className="bg-green-50 p-6 rounded-xl border border-green-100">
            <h4 className="text-green-700 font-bold mb-1">擅长领域</h4>
            <div className="text-3xl font-black text-green-900">
              {defectData.sort((a, b) => b.accuracy - a.accuracy)[0]?.name || '尚未开始'}
            </div>
            <p className="text-green-600 text-sm mt-2">最高单项正确率: {defectData.sort((a, b) => b.accuracy - a.accuracy)[0]?.accuracy || 0}%</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
            <h4 className="text-purple-700 font-bold mb-1">平均耗时</h4>
            <div className="text-3xl font-black text-purple-900">
              {user.stats.totalPracticed > 0 ? Math.round(user.stats.totalTimeSeconds / user.stats.totalPracticed) : 0}s
            </div>
            <p className="text-purple-600 text-sm mt-2">每张底片平均评定时间</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6">各缺陷类型正确率 (%)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defectData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis unit="%" />
                <Tooltip />
                <Bar dataKey="accuracy" name="正确率">
                  {defectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6">正误统计分布</h3>
          <div className="h-80 flex flex-col items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={[
                     { name: '正确', value: user.stats.correctCount },
                     { name: '错误', value: user.stats.wrongCount }
                   ]}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   <Cell fill="#10B981" />
                   <Cell fill="#EF4444" />
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
             <div className="text-center mt-4 space-y-2">
                <div className="flex items-center justify-center space-x-4">
                  <span className="flex items-center text-xs"><span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>正确: {user.stats.correctCount}</span>
                  <span className="flex items-center text-xs"><span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>错误: {user.stats.wrongCount}</span>
                </div>
                <p className="text-sm text-gray-500 italic">"每一张错片都是通往专家之路的基石。"</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
