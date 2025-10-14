import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      numerology_results: {
        Row: {
          id: string
          user_name: string
          birth_date: string
          calculation_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_name: string
          birth_date: string
          calculation_data: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_name?: string
          birth_date?: string
          calculation_data?: any
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          updated_at?: string
        }
      }
      assessment_results: {
        Row: {
          id: string
          user_id: string
          assessment_type: string
          result_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assessment_type: string
          result_data: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assessment_type?: string
          result_data?: any
          updated_at?: string
        }
      }
    }
  }
}

// Helper functions for common operations
export const numerologyAPI = {
  // Save calculation result
  async saveCalculation(data: {
    user_name: string
    birth_date: string
    calculation_data: any
  }) {
    const { data: result, error } = await supabase
      .from('numerology_results')
      .insert({
        user_name: data.user_name,
        birth_date: data.birth_date,
        calculation_data: data.calculation_data
      })
      .select()
      .single()

    if (error) throw error
    return result
  },

  // Get user's calculation history
  async getUserHistory(userName: string) {
    const { data, error } = await supabase
      .from('numerology_results')
      .select('*')
      .eq('user_name', userName)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get calculation by ID
  async getCalculation(id: string) {
    const { data, error } = await supabase
      .from('numerology_results')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Get all calculations (with optional limit)
  async getAllCalculations(limit?: number) {
    let query = supabase
      .from('numerology_results')
      .select('*')
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  // Save result (alias for saveCalculation)
  async saveResult(data: {
    user_name: string
    birth_date: string
    calculation_data: any
  }) {
    return this.saveCalculation(data)
  },

  // Get results (alias for getAllCalculations)
  async getResults(limit?: number) {
    return this.getAllCalculations(limit)
  }
}

// Assessment API helpers
export const assessmentAPI = {
  // Save assessment result (DISC, MBTI, etc.)
  async saveResult(data: {
    user_id: string
    assessment_type: string
    result_data: any
  }) {
    const { data: result, error } = await supabase
      .from('assessment_results')
      .insert({
        user_id: data.user_id,
        assessment_type: data.assessment_type,
        result_data: data.result_data
      })
      .select()
      .single()

    if (error) throw error
    return result
  },

  // Get user's assessment history
  async getUserAssessments(userId: string, assessmentType?: string) {
    let query = supabase
      .from('assessment_results')
      .select('*')
      .eq('user_id', userId)

    if (assessmentType) {
      query = query.eq('assessment_type', assessmentType)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Get all assessments (with optional filters)
  async getAllAssessments(assessmentType?: string, limit?: number) {
    let query = supabase
      .from('assessment_results')
      .select('*')

    if (assessmentType) {
      query = query.eq('assessment_type', assessmentType)
    }

    query = query.order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }
}

// Authentication helpers
export const authAPI = {
  // Sign up new user
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (error) throw error
    return data
  },

  // Sign in user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }
}

export default supabase