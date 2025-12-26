
import { Radiograph, DefectType } from './types';

export const INITIAL_RADIOGRAPHS: Radiograph[] = [
  {
    id: '1',
    filename: 'image_01.jpg',
    imageUrl: 'https://youke2.picui.cn/s1/2025/12/22/6948a2067b397.jpg',
    tag: '管道焊缝',
    difficulty: 2,
    defects: [
      { type: 3, x: 0.267635, y: 0.482277, w: 0.036744, h: 0.053957 },
      { type: 0, x: 0.506803, y: 0.479509, w: 0.017875, h: 0.051190 },
      { type: 3, x: 0.794410, y: 0.447046, w: 0.016882, h: 0.156799 }
    ]
  },
  {
    id: '2',
    filename: 'image_02.jpg',
    imageUrl: 'https://youke2.picui.cn/s1/2025/12/22/6948a25423936.jpg',
    tag: '容器环缝',
    difficulty: 3,
    defects: [
      { type: 3, x: 0.184862, y: 0.527171, w: 0.101857, h: 0.049248 },
      { type: 1, x: 0.578005, y: 0.539787, w: 0.107571, h: 0.015023 }
    ]
  },
  {
    id: '3',
    filename: 'image_03.jpg',
    imageUrl: 'https://youke2.picui.cn/s1/2025/12/22/6948a258b5370.jpg',
    tag: '钢结构焊点',
    difficulty: 2,
    defects: [
      { type: 3, x: 0.262302, y: 0.538344, w: 0.033139, h: 0.077253 },
      { type: 0, x: 0.498499, y: 0.501681, w: 0.016570, h: 0.058922 },
      { type: 3, x: 0.786979, y: 0.506992, w: 0.011255, h: 0.174046 }
    ]
  },
  {
    id: '4',
    filename: 'image_04.jpg',
    imageUrl: 'https://youke2.picui.cn/s1/2025/12/22/6948a25bb65bc.jpg',
    tag: '精密铸件',
    difficulty: 4,
    defects: [
      { type: 4, x: 0.204558, y: 0.550959, w: 0.106359, h: 0.060059 },
      { type: 0, x: 0.636185, y: 0.524570, w: 0.020822, h: 0.069159 }
    ]
  },
  {
    id: '5',
    filename: 'image_05.jpg',
    imageUrl: 'https://youke2.picui.cn/s1/2025/12/22/6948a25cdb509.jpg',
    tag: '航空铝材',
    difficulty: 5,
    defects: [
      { type: 3, x: 0.152453, y: 0.522464, w: 0.115619, h: 0.051583 },
      { type: 4, x: 0.502890, y: 0.535360, w: 0.097202, h: 0.042986 },
      { type: 2, x: 0.863560, y: 0.475179, w: 0.103341, h: 0.039547 }
    ]
  }
];

export const IOU_THRESHOLD = 0.8; // 判定正确要求的 IOU 阈值提升至 80%
