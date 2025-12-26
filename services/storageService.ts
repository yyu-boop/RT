
import { User, UserRole, Radiograph } from '../types';
import { INITIAL_RADIOGRAPHS as MOCK_IMAGES } from '../constants';

const USERS_KEY = 'rt_training_users';
const IMAGES_KEY = 'rt_training_images';

export const storageService = {
  init() {
    if (!localStorage.getItem(USERS_KEY)) {
      const defaultUsers: User[] = [
        {
          id: '1',
          username: 'Guest',
          password: '123',
          email: 'guest@example.com',
          role: UserRole.TRAINEE,
          hasCertificate: false,
          hasKnowledge: true,
          stats: { totalPracticed: 0, correctCount: 0, wrongCount: 0, totalTimeSeconds: 0, defectAccuracy: {} }
        },
        {
          id: '2',
          username: 'expert',
          password: '123456',
          email: 'expert@example.com',
          role: UserRole.EXPERT,
          hasCertificate: true,
          hasKnowledge: true,
          stats: { totalPracticed: 0, correctCount: 0, wrongCount: 0, totalTimeSeconds: 0, defectAccuracy: {} }
        },
        {
          id: '3',
          username: 'Admin',
          password: '12345678',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
          hasCertificate: true,
          hasKnowledge: true,
          stats: { totalPracticed: 0, correctCount: 0, wrongCount: 0, totalTimeSeconds: 0, defectAccuracy: {} }
        }
      ];
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem(IMAGES_KEY)) {
      localStorage.setItem(IMAGES_KEY, JSON.stringify(MOCK_IMAGES));
    }
  },

  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  },

  updateUser(updatedUser: User) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  getImages(): Radiograph[] {
    return JSON.parse(localStorage.getItem(IMAGES_KEY) || '[]');
  },

  addImage(image: Radiograph) {
    const images = this.getImages();
    images.push(image);
    localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
  },

  deleteImage(id: string) {
    const images = this.getImages().filter(img => img.id !== id);
    localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
  }
};