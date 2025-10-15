import React, { useState } from 'react';
import styles from '../styles/JobRequirementInput.module.css';

interface JobRequirement {
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: string;
  cultureCriteria: string;
}

export const JobRequirementInput: React.FC = () => {
  const [jobData, setJobData] = useState<JobRequirement>({
    title: '',
    description: '',
    requiredSkills: [],
    experienceLevel: 'junior',
    cultureCriteria: ''
  });

  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim() && !jobData.requiredSkills.includes(skillInput.trim())) {
      setJobData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setJobData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Job requirement created:', jobData);
    // TODO: Submit to backend
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Tên vị trí tuyển dụng</label>
          <input
            type="text"
            value={jobData.title}
            onChange={(e) => setJobData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ví dụ: Senior Frontend Developer"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Mô tả công việc</label>
          <textarea
            value={jobData.description}
            onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Mô tả chi tiết về công việc, trách nhiệm..."
            className={styles.textarea}
            rows={4}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Kỹ năng yêu cầu</label>
          <div className={styles.skillInput}>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Nhập kỹ năng và nhấn Enter"
              className={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <button type="button" onClick={addSkill} className={styles.addBtn}>
              Thêm
            </button>
          </div>
          <div className={styles.skillTags}>
            {jobData.requiredSkills.map((skill, index) => (
              <span key={index} className={styles.skillTag}>
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className={styles.removeSkill}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Mức kinh nghiệm</label>
          <select
            value={jobData.experienceLevel}
            onChange={(e) => setJobData(prev => ({ ...prev, experienceLevel: e.target.value }))}
            className={styles.select}
          >
            <option value="intern">Thực tập sinh</option>
            <option value="junior">Junior (0-2 năm)</option>
            <option value="middle">Middle (2-5 năm)</option>
            <option value="senior">Senior (5+ năm)</option>
            <option value="lead">Team Lead/Manager</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Tiêu chí văn hóa công ty</label>
          <textarea
            value={jobData.cultureCriteria}
            onChange={(e) => setJobData(prev => ({ ...prev, cultureCriteria: e.target.value }))}
            placeholder="Mô tả về văn hóa công ty, tính cách phù hợp..."
            className={styles.textarea}
            rows={3}
          />
        </div>

        <button type="submit" className={styles.submitBtn}>
          🎯 Tạo Yêu Cầu Tuyển Dụng
        </button>
      </form>
    </div>
  );
};