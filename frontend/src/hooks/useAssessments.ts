import { useState, useEffect, useCallback } from 'react';
import { assessmentAPI } from '../lib/supabase';
import { trackApiCall, trackApiError, trackUserAction } from '../lib/systemMonitor';
import { trackUserAction as sentryTrack } from '../lib/monitoring';

export interface AssessmentResult {
  id: string;
  user_id: string;
  assessment_type: 'numerology' | 'mbti' | 'disc' | 'cv_analysis';
  result_data: any;
  created_at: string;
  updated_at: string;
}

interface AssessmentsState {
  results: AssessmentResult[];
  loading: boolean;
  error: string | null;
  saving: boolean;
}

export const useAssessments = (userId?: string) => {
  const [state, setState] = useState<AssessmentsState>({
    results: [],
    loading: false,
    error: null,
    saving: false
  });

  // Load user assessments
  const loadAssessments = useCallback(async (assessmentType?: string) => {
    if (!userId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const finishApiCall = trackApiCall('assessments/load');
      const results = await assessmentAPI.getUserAssessments(userId, assessmentType);
      finishApiCall();

      setState(prev => ({
        ...prev,
        results: results || [],
        loading: false
      }));

      sentryTrack('assessments_loaded', { 
        userId, 
        count: results?.length || 0,
        type: assessmentType || 'all'
      });

    } catch (error) {
      trackApiError('assessments/load', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load assessments'
      }));
    }
  }, [userId]);

  // Save assessment result
  const saveAssessment = useCallback(async (
    assessmentType: AssessmentResult['assessment_type'],
    resultData: any
  ) => {
    if (!userId) throw new Error('User not authenticated');

    setState(prev => ({ ...prev, saving: true, error: null }));
    
    try {
      const finishApiCall = trackApiCall(`assessments/save_${assessmentType}`);
      
      const result = await assessmentAPI.saveAssessment({
        user_id: userId,
        assessment_type: assessmentType,
        result_data: resultData
      });
      
      finishApiCall();

      // Update local state
      setState(prev => ({
        ...prev,
        results: [result, ...prev.results],
        saving: false
      }));

      trackUserAction('assessment_complete');
      sentryTrack('assessment_saved', { 
        userId, 
        assessmentType,
        resultId: result.id
      });

      return result;

    } catch (error) {
      trackApiError(`assessments/save_${assessmentType}`, error);
      setState(prev => ({
        ...prev,
        saving: false,
        error: error instanceof Error ? error.message : 'Failed to save assessment'
      }));
      throw error;
    }
  }, [userId]);

  // Get specific assessment result
  const getAssessmentResult = useCallback((
    assessmentType: AssessmentResult['assessment_type']
  ): AssessmentResult | null => {
    return state.results.find(result => result.assessment_type === assessmentType) || null;
  }, [state.results]);

  // Get all assessment results by type
  const getAssessmentsByType = useCallback((
    assessmentType: AssessmentResult['assessment_type']
  ): AssessmentResult[] => {
    return state.results.filter(result => result.assessment_type === assessmentType);
  }, [state.results]);

  // Delete assessment
  const deleteAssessment = useCallback(async (assessmentId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const finishApiCall = trackApiCall('assessments/delete');
      await assessmentAPI.deleteAssessment(assessmentId);
      finishApiCall();

      setState(prev => ({
        ...prev,
        results: prev.results.filter(result => result.id !== assessmentId),
        loading: false
      }));

      sentryTrack('assessment_deleted', { assessmentId });

    } catch (error) {
      trackApiError('assessments/delete', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to delete assessment'
      }));
    }
  }, []);

  // Get assessment statistics
  const getStats = useCallback(() => {
    const stats = {
      total: state.results.length,
      byType: {} as Record<string, number>,
      mostRecent: null as AssessmentResult | null,
      completionDates: [] as string[]
    };

    state.results.forEach(result => {
      stats.byType[result.assessment_type] = (stats.byType[result.assessment_type] || 0) + 1;
      stats.completionDates.push(result.created_at);
    });

    if (state.results.length > 0) {
      stats.mostRecent = state.results.reduce((latest, current) => 
        new Date(current.created_at) > new Date(latest.created_at) ? current : latest
      );
    }

    return stats;
  }, [state.results]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-load assessments when userId changes
  useEffect(() => {
    if (userId) {
      loadAssessments();
    }
  }, [userId, loadAssessments]);

  return {
    ...state,
    loadAssessments,
    saveAssessment,
    deleteAssessment,
    getAssessmentResult,
    getAssessmentsByType,
    getStats,
    clearError
  };
};