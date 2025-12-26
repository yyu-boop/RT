
import React, { useState, useEffect } from 'react';
import { User, Radiograph, UserRole, BoundingBox } from '../types';
import { storageService as db } from '../services/storageService';

interface AdminViewProps {
  initialMode: 'users' | 'images';
  currentUser: User;
}

const AdminView: React.FC<AdminViewProps> = ({ initialMode, currentUser }) => {
  const [mode, setMode] = useState(initialMode);
  const [users, setUsers] = useState<User[]>([]);
  const [images, setImages] = useState<Radiograph[]>([]);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    setUsers(db.getUsers());
    setImages(db.getImages());
  }, []);

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileMap: Record<string, { img?: File; txt?: File }> = {};

    // Cast Array.from(files) to File[] to ensure the 'file' parameter in forEach is typed as File
    (Array.from(files) as File[]).forEach(file => {
      const nameParts = file.name.split('.');
      const ext = nameParts.pop()?.toLowerCase();
      const baseName = nameParts.join('.');

      if (!fileMap[baseName]) {
        fileMap[baseName] = { img: undefined, txt: undefined };
      }
      
      if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
        fileMap[baseName].img = file;
      } else if (ext === 'txt') {
        fileMap[baseName].txt = file;
      }
    });

    let successCount = 0;
    let failCount = 0;

    const promises = Object.keys(fileMap).map(async (baseName) => {
      const entry = fileMap[baseName];
      if (entry.img && entry.txt) {
        // Mocking the upload process
        const txtContent = await entry.txt.text();
        const defects: BoundingBox[] = txtContent.split('\n').filter(line => line.trim()).map(line => {
          const [type, x, y, w, h] = line.trim().split(/\s+/).map(Number);
          return { type, x, y, w, h };
        });

        const newImage: Radiograph = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          filename: entry.img.name,
          imageUrl: URL.createObjectURL(entry.img),
          defects,
          difficulty: 3,
          tag: '批量上传'
        };
        db.addImage(newImage);
        successCount++;
      } else {
        failCount++;
      }
    });

    Promise.all(promises).then(() => {
      setUploadStatus(`导入完成: 成功 ${successCount} 个, 失败 ${failCount} 个 (需同名配对)`);
      setImages(db.getImages());
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex space-x-4 mb-8">
        {currentUser.role === UserRole.ADMIN && (
          <button 
            onClick={() => setMode('users')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${mode === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          >
            用户管理
          </button>
        )}
        <button 
          onClick={() => setMode('images')}
          className={`px-6 py-2 rounded-full font-bold transition-all ${mode === 'images' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
        >
          射线底片管理
        </button>
      </div>

      {mode === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">身份</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">练习数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">正确率</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总时长</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.stats.totalPracticed}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.stats.totalPracticed > 0 ? Math.round((user.stats.correctCount / user.stats.totalPracticed) * 100) : 0}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Math.round(user.stats.totalTimeSeconds / 60)} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mode === 'images' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">批量上传射线底片</h3>
              <p className="text-sm text-gray-500">请选择包含 .jpg 底片与同名 .txt 标注文件的文件夹</p>
            </div>
            <div className="relative">
              <input 
                type="file" 
                // @ts-ignore
                webkitdirectory="" 
                directory="" 
                multiple 
                onChange={handleFolderUpload}
                className="hidden"
                id="folder-upload"
              />
              <label 
                htmlFor="folder-upload"
                className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                上传文件夹
              </label>
            </div>
          </div>
          
          {uploadStatus && <div className="text-sm font-medium text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-100">{uploadStatus}</div>}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">序号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预览</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">文件名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">缺陷数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标签</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {images.map((img, idx) => (
                  <tr key={img.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img src={img.imageUrl} alt="RT" className="w-12 h-12 object-cover rounded border" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{img.filename}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{img.defects.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{img.tag}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => {
                          db.deleteImage(img.id);
                          setImages(db.getImages());
                        }}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;