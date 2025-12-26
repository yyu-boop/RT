
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { storageService as db } from '../services/storageService';

interface AuthViewProps {
  onLoginSuccess: (user: any) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: UserRole.TRAINEE,
    hasCertificate: false,
    hasKnowledge: false,
    regCode: '' // 注册授权码
  });
  const [error, setError] = useState('');

  const REG_CODES: Record<UserRole, string> = {
    [UserRole.TRAINEE]: '01',
    [UserRole.EXPERT]: '2202',
    [UserRole.ADMIN]: '2203'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const users = db.getUsers();

    if (isLogin) {
      const user = users.find(u => u.username === formData.username && u.password === formData.password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('用户名或密码错误');
      }
    } else {
      // 注册类型校验
      if (formData.regCode !== REG_CODES[formData.role]) {
        setError(`授权码验证失败！${formData.role === UserRole.TRAINEE ? '评片用户' : formData.role === UserRole.EXPERT ? '专家用户' : '管理员'}的正确授权码不匹配。`);
        return;
      }

      if (users.some(u => u.username === formData.username)) {
        setError('用户名已存在');
        return;
      }

      const newUser: any = {
        id: Date.now().toString(),
        username: formData.username,
        password: formData.password,
        email: formData.email,
        role: formData.role,
        hasCertificate: formData.hasCertificate,
        hasKnowledge: formData.hasKnowledge,
        stats: { totalPracticed: 0, correctCount: 0, wrongCount: 0, totalTimeSeconds: 0, defectAccuracy: {} }
      };
      const allUsers = [...users, newUser];
      localStorage.setItem('rt_training_users', JSON.stringify(allUsers));
      onLoginSuccess(newUser);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <div className="flex justify-center mb-4">
             <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">R</div>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 leading-[1.5]">
            {isLogin ? '登录评片系统' : '新用户注册'}
          </h2>
          <p className="mt-4 text-center text-sm text-gray-600 leading-[1.5]">
            {isLogin ? '还没有账号？' : '已有账号？'}{' '}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="font-bold text-blue-600 hover:text-blue-500 transition-colors"
            >
              {isLogin ? '立即注册' : '返回登录'}
            </button>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm font-medium text-center bg-red-50 border border-red-100 py-3 rounded-lg animate-pulse">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">用户名</label>
              <input
                type="text"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                placeholder="请输入用户名"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
            
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">密码</label>
              <input
                type="password"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                placeholder="请输入密码"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {!isLogin && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">用户身份类型</label>
                  <select
                    className="block w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                  >
                    <option value={UserRole.TRAINEE}>评片用户 (训练权限)</option>
                    <option value={UserRole.EXPERT}>专家用户 (底片管理)</option>
                    <option value={UserRole.ADMIN}>管理员 (系统管理)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">注册授权码</label>
                  <input
                    type="text"
                    required
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-blue-50/30"
                    placeholder="请输入相应身份的授权码"
                    value={formData.regCode}
                    onChange={(e) => setFormData({...formData, regCode: e.target.value})}
                  />
                  <p className="text-[10px] text-gray-400 mt-1 italic">提示：评片01 / 专家2202 / 管理2203</p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center">
                    <input
                      id="cert"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.hasCertificate}
                      onChange={(e) => setFormData({...formData, hasCertificate: e.target.checked})}
                    />
                    <label htmlFor="cert" className="ml-2 block text-sm text-gray-900">
                      持有射线II/III证书
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="knowledge"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.hasKnowledge}
                      onChange={(e) => setFormData({...formData, hasKnowledge: e.target.checked})}
                    />
                    <label htmlFor="knowledge" className="ml-2 block text-sm text-gray-900">
                      具有射线评片知识
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-200"
            >
              {isLogin ? '立即登录' : '提交注册'}
            </button>
          </div>
          
          <div className="text-[11px] text-gray-400 text-center mt-6 border-t pt-4">
            <span className="block mb-1">测试专用内置账号</span>
            Guest:123 | expert:123456 | Admin:12345678
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthView;
