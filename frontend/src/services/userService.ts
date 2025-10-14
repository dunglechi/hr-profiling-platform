import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  company?: string;
  position?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AssessmentHistory {
  id: string;
  user_id: string;
  assessment_type: 'numerology' | 'disc' | 'mbti' | 'cv_analysis';
  results: any;
  completed_at: string;
  score?: number;
  notes?: string;
}

class UserService {
  // Authentication Methods
  async signUp(email: string, password: string, userData?: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;

      // Create user profile if signup successful
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          email,
          full_name: userData?.full_name,
          company: userData?.company,
          position: userData?.position
        });
      }

      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      throw error;
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
    } catch (error) {
      console.error('Lỗi reset mật khẩu:', error);
      throw error;
    }
  }

  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
    } catch (error) {
      console.error('Lỗi cập nhật mật khẩu:', error);
      throw error;
    }
  }

  // Session Management
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Lỗi lấy thông tin user:', error);
      return null;
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Lỗi lấy session:', error);
      return null;
    }
  }

  // User Profile Management
  async createUserProfile(userId: string, profileData: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Lỗi tạo profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, return null
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Lỗi lấy profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Lỗi cập nhật profile:', error);
      throw error;
    }
  }

  // Assessment History Management
  async saveAssessmentResult(
    userId: string, 
    assessmentType: AssessmentHistory['assessment_type'], 
    results: any,
    score?: number,
    notes?: string
  ) {
    try {
      const { data, error } = await supabase
        .from('assessment_history')
        .insert({
          user_id: userId,
          assessment_type: assessmentType,
          results,
          score,
          notes,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Lỗi lưu kết quả đánh giá:', error);
      throw error;
    }
  }

  async getUserAssessmentHistory(userId: string, assessmentType?: string): Promise<AssessmentHistory[]> {
    try {
      let query = supabase
        .from('assessment_history')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (assessmentType) {
        query = query.eq('assessment_type', assessmentType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Lỗi lấy lịch sử đánh giá:', error);
      return [];
    }
  }

  async getLatestAssessment(userId: string, assessmentType: string): Promise<AssessmentHistory | null> {
    try {
      const { data, error } = await supabase
        .from('assessment_history')
        .select('*')
        .eq('user_id', userId)
        .eq('assessment_type', assessmentType)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No assessment found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Lỗi lấy đánh giá mới nhất:', error);
      return null;
    }
  }

  async deleteAssessment(assessmentId: string) {
    try {
      const { error } = await supabase
        .from('assessment_history')
        .delete()
        .eq('id', assessmentId);

      if (error) throw error;
    } catch (error) {
      console.error('Lỗi xóa đánh giá:', error);
      throw error;
    }
  }

  // Statistics and Analytics
  async getUserStats(userId: string) {
    try {
      const assessments = await this.getUserAssessmentHistory(userId);
      
      const stats = {
        totalAssessments: assessments.length,
        assessmentTypes: {
          numerology: assessments.filter(a => a.assessment_type === 'numerology').length,
          disc: assessments.filter(a => a.assessment_type === 'disc').length,
          mbti: assessments.filter(a => a.assessment_type === 'mbti').length,
          cv_analysis: assessments.filter(a => a.assessment_type === 'cv_analysis').length
        },
        latestAssessment: assessments[0]?.completed_at || null,
        averageScore: assessments
          .filter(a => a.score !== null)
          .reduce((sum, a) => sum + (a.score || 0), 0) / 
          assessments.filter(a => a.score !== null).length || 0
      };

      return stats;
    } catch (error) {
      console.error('Lỗi lấy thống kê user:', error);
      return null;
    }
  }

  // Auth State Listener
  onAuthStateChange(callback: (user: User | null, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null, session);
    });
  }
}

export const userService = new UserService();
export default userService;