import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

interface UseSecureTranslationResult {
  t: (key: string, options?: any) => string;
  ready: boolean;
  error: string | null;
  language: string;
  changeLanguage: (lng: string) => Promise<void>;
  isLoading: boolean;
}

export const useSecureTranslation = (namespace?: string): UseSecureTranslationResult => {
  const { t, ready, i18n } = useTranslation(namespace || 'common');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!ready);

  useEffect(() => {
    if (ready) {
      setIsLoading(false);
      setError(null);
    } else {
      setIsLoading(true);
    }
  }, [ready]);

  // Enhanced t function with fallback
  const secureT = (key: string, options?: any): string => {
    try {
      if (!ready) {
        console.warn(`Translation not ready for key: ${key}`);
        return key; // Return key as fallback
      }

      const result = t(key, options);
      
      // Ensure result is string
      const resultString = typeof result === 'string' ? result : String(result);
      
      // Check if translation is missing (i18next returns key when translation not found)
      if (resultString === key && !i18n.hasResourceBundle(i18n.language, namespace || 'common')) {
        console.warn(`Missing translation for key: ${key} in namespace: ${namespace || 'common'}`);
        return getDefaultTranslation(key);
      }
      
      return resultString;
    } catch (err) {
      console.error(`Translation error for key: ${key}`, err);
      setError(`Translation error: ${err}`);
      return getDefaultTranslation(key);
    }
  };

  // Enhanced language change with error handling
  const changeLanguage = async (lng: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await i18n.changeLanguage(lng);
    } catch (err) {
      console.error('Language change error:', err);
      setError(`Không thể chuyển đổi ngôn ngữ: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    t: secureT,
    ready,
    error,
    language: i18n.language,
    changeLanguage,
    isLoading
  };
};

// Fallback translations cho các key quan trọng
const getDefaultTranslation = (key: string): string => {
  const defaultTranslations: Record<string, string> = {
    // Dashboard
    'title': 'Bảng Điều Khiển HR',
    'stats.candidates': 'Tổng Ứng Viên',
    'stats.assessments': 'Đánh Giá Đang Thực Hiện',
    'stats.positions': 'Vị Trí Tuyển Dụng',
    'quickActions.title': 'Bắt Đầu Đánh Giá',
    'quickActions.startButton': 'Bắt Đầu',
    'quickActions.numerology.title': 'Thần Số Học',
    'quickActions.numerology.description': 'Phân tích tính cách qua Pythagoras',
    'quickActions.disc.title': 'Đánh Giá DISC',
    'quickActions.disc.description': 'Đánh giá phong cách hành vi',
    'quickActions.mbti.title': 'Phân Loại MBTI',
    'quickActions.mbti.description': 'Phân loại tính cách Myers-Briggs',
    'assessments.numerology.title': 'Thần Số Học Nâng Cao',
    'assessments.numerology.description': 'Tìm hiểu con số định mệnh và đặc điểm cá nhân',
    'recentActivity.title': 'Hoạt Động Gần Đây',
    'recentActivity.noData': 'Không có hoạt động gần đây để hiển thị.',
    
    // Common
    'loading': 'Đang tải...',
    'error': 'Lỗi',
    'success': 'Thành công',
    'retry': 'Thử lại'
  };

  return defaultTranslations[key] || key;
};