
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Radiograph, BoundingBox } from '../types';
import { storageService as db } from '../services/storageService';
import ImageCanvas from '../components/ImageCanvas';
import { IOU_THRESHOLD as DEFAULT_IOU } from '../constants';

interface PracticeViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onNavigate: (view: string) => void;
}

const PracticeView: React.FC<PracticeViewProps> = ({ user, onUpdateUser, onNavigate }) => {
  const [allImages, setAllImages] = useState<Radiograph[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [userDefects, setUserDefects] = useState<BoundingBox[]>([]);
  const [showResult, setShowResult] = useState<'none' | 'success' | 'fail'>('none');
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, seconds: 0 });
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast] = useState(1.0);
  const [iouThreshold, setIouThreshold] = useState(DEFAULT_IOU); 
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setAllImages(db.getImages());
  }, []);

  useEffect(() => {
    if (isStarted) {
      timerRef.current = window.setInterval(() => {
        setSessionStats(prev => ({ ...prev, seconds: prev.seconds + 1 }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isStarted]);

  const currentImage = allImages[currentImageIndex];

  const handleStart = () => {
    setIsStarted(true);
    setUserDefects([]);
    setShowResult('none');
  };

  const calculateIoU = (boxA: BoundingBox, boxB: BoundingBox) => {
    const x1 = Math.max(boxA.x - boxA.w/2, boxB.x - boxB.w/2);
    const y1 = Math.max(boxA.y - boxA.h/2, boxB.y - boxB.h/2);
    const x2 = Math.min(boxA.x + boxA.w/2, boxB.x + boxB.w/2);
    const y2 = Math.min(boxA.y + boxA.h/2, boxB.y + boxB.h/2);

    const interArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const boxAArea = boxA.w * boxA.h;
    const boxBArea = boxB.w * boxB.h;
    
    return interArea / (boxAArea + boxBArea - interArea);
  };

  const handleSubmit = () => {
    if (!currentImage) return;
    
    let isCorrect = true;
    
    // a. 缺陷数目一致
    if (userDefects.length !== currentImage.defects.length) {
      isCorrect = false;
    } else {
      // b. 每一个答案缺陷都能找到对应的用户缺陷，且类型一致、IOU 达标
      const usedUserIndices = new Set<number>();
      for (const truth of currentImage.defects) {
        let foundMatch = false;
        for (let i = 0; i < userDefects.length; i++) {
          if (usedUserIndices.has(i)) continue;
          
          const userDef = userDefects[i];
          const iou = calculateIoU(userDef, truth);
          
          if (userDef.type === truth.type && iou >= iouThreshold) {
            foundMatch = true;
            usedUserIndices.add(i);
            break;
          }
        }
        if (!foundMatch) {
          isCorrect = false;
          break;
        }
      }
    }

    const updatedUser = { ...user };
    updatedUser.stats.totalPracticed += 1;
    updatedUser.stats.totalTimeSeconds += sessionStats.seconds;

    if (isCorrect) {
      setShowResult('success');
      setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      updatedUser.stats.correctCount += 1;
      currentImage.defects.forEach(d => {
        if (!updatedUser.stats.defectAccuracy[d.type]) updatedUser.stats.defectAccuracy[d.type] = { correct: 0, total: 0 };
        updatedUser.stats.defectAccuracy[d.type].total += 1;
        updatedUser.stats.defectAccuracy[d.type].correct += 1;
      });
    } else {
      setShowResult('fail');
      setSessionStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      updatedUser.stats.wrongCount += 1;
      currentImage.defects.forEach(d => {
        if (!updatedUser.stats.defectAccuracy[d.type]) updatedUser.stats.defectAccuracy[d.type] = { correct: 0, total: 0 };
        updatedUser.stats.defectAccuracy[d.type].total += 1;
      });
    }
    
    onUpdateUser(updatedUser);
    db.updateUser(updatedUser);
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    setUserDefects([]);
    setShowResult('none');
    setBrightness(1.0);
    setContrast(1.0);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col gap-6">
        
        {/* Top Section: Radiograph Viewing Area */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-end mb-4 px-2">
            <div>
              <h3 className="text-2xl font-black text-gray-900 leading-tight">
                {isStarted ? `正在评定：${currentImage?.filename}` : `待命底片：${currentImage?.filename || '未载入'}`}
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-medium flex items-center">
                <span className="bg-gray-100 px-2 py-0.5 rounded mr-2">{currentImage?.tag}</span>
                <span>难度：{currentImage?.difficulty}星</span>
                <span className="mx-2">|</span>
                <span className="text-blue-500">提示：鼠标中心缩放，Alt+右键长按拖动</span>
              </p>
            </div>
            <div className="text-right">
              <span className="block text-3xl font-mono font-black text-blue-600 leading-none">{formatTime(sessionStats.seconds)}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Practice Clock</span>
            </div>
          </div>

          <div className="relative">
            {currentImage ? (
              <ImageCanvas 
                imageUrl={currentImage.imageUrl}
                onAddDefect={(box) => setUserDefects([...userDefects, box])}
                userDefects={userDefects}
                truthDefects={currentImage.defects}
                showTruth={showResult === 'fail'}
                disabled={showResult !== 'none'}
                isStarted={isStarted}
                brightness={brightness}
                contrast={contrast}
              />
            ) : (
              <div className="aspect-[21/9] bg-gray-50 rounded-2xl animate-pulse flex items-center justify-center border-2 border-dashed border-gray-200">
                 <p className="text-gray-400 font-bold">底片库加载中...</p>
              </div>
            )}
            
            {/* Image Adjustment Controls */}
            {isStarted && (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50/50 p-5 rounded-2xl border border-gray-200 shadow-inner">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                      <span className="text-sm font-bold">亮度</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">{Math.round(brightness * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.4" 
                    max="2.0" 
                    step="0.05" 
                    value={brightness} 
                    onChange={(e) => setBrightness(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                      <span className="text-sm font-bold">对比度</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">{Math.round(contrast * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.5" 
                    step="0.05" 
                    value={contrast} 
                    onChange={(e) => setContrast(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                      <span className="text-sm font-bold">IOU标准</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">{Math.round(iouThreshold * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="0.95" 
                    step="0.05" 
                    value={iouThreshold} 
                    onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                </div>
              </div>
            )}
          </div>

          {showResult === 'success' && (
            <div className="mt-5 p-5 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-between animate-bounce shadow-lg shadow-green-100">
              <div className="flex items-center text-green-700">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mr-4 shadow-md">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                   <p className="font-black text-lg leading-tight">评定成功！</p>
                   <p className="text-sm opacity-80">符合 IOU ≥ {Math.round(iouThreshold * 100)}% 判定基准。</p>
                </div>
              </div>
              <button onClick={handleNext} className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold transition-all shadow-md active:scale-95">
                推送下一张
              </button>
            </div>
          )}

          {showResult === 'fail' && (
            <div className="mt-5 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between shadow-lg shadow-red-100">
              <div className="flex items-center text-red-700">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white mr-4 shadow-md">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <div>
                   <p className="font-black text-lg leading-tight">评定有误</p>
                   <p className="text-sm opacity-80">请对比底片提示的红色标注区域。IOU要求为 {Math.round(iouThreshold * 100)}%</p>
                </div>
              </div>
              <button onClick={handleNext} className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold transition-all shadow-md active:scale-95">
                查看下一张
              </button>
            </div>
          )}
        </div>

        {/* Bottom Section: Controls & Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-5 text-center">Operation Panel</h4>
            <div className="flex flex-col gap-3">
              <button 
                disabled={isStarted}
                onClick={handleStart}
                className={`py-4 rounded-2xl font-black text-white transition-all shadow-xl text-lg ${isStarted ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}
              >
                开始评片
              </button>
              <button 
                disabled={!isStarted || showResult !== 'none'}
                onClick={handleSubmit}
                className={`py-4 rounded-2xl font-black text-white transition-all text-lg ${(!isStarted || showResult !== 'none') ? 'bg-gray-100 text-gray-300' : 'bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100'}`}
              >
                确定提交
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-5 text-center">Navigation</h4>
             <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setCurrentImageIndex(prev => (prev - 1 + allImages.length) % allImages.length)}
                    className="py-4 border border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    上一张
                  </button>
                  <button 
                    onClick={handleNext}
                    className="py-4 border border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    下一张
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
                <button 
                  onClick={() => onNavigate('analysis')}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl shadow-gray-200"
                >
                  个人能力报告
                </button>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2 text-center">Live Statistics</h4>
            <div className="flex items-center justify-around py-3">
              <div className="text-center">
                <p className="text-4xl font-black text-green-600 leading-none">{sessionStats.correct}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase mt-2 tracking-tighter">PASS</p>
              </div>
              <div className="w-px h-16 bg-gray-100"></div>
              <div className="text-center">
                <p className="text-4xl font-black text-red-500 leading-none">{sessionStats.wrong}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase mt-2 tracking-tighter">FAIL</p>
              </div>
              <div className="w-px h-16 bg-gray-100"></div>
              <div className="text-center">
                <p className="text-4xl font-black text-blue-600 leading-none">{user.stats.totalPracticed}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase mt-2 tracking-tighter">ALL</p>
              </div>
            </div>
            <div className="border-t border-gray-50 pt-3 mt-1">
               <p className="text-[9px] text-center text-gray-400 font-mono tracking-tighter uppercase">Standard: {Math.round(iouThreshold * 100)}% IOU | RT-AUTO-EVAL</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeView;
