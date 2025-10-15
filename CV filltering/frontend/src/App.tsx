import { JobRequirementInput } from './components/JobRequirementInput';
import { CandidateManagerEnhanced } from './components/CandidateManagerEnhanced';
import { DISCAssessment } from './components/DISCAssessment';
import { ShortlistRankingEnhanced } from './components/ShortlistRankingEnhanced';
import { RecentActivity } from './components/RecentActivity';
import './styles/globals.css';
import styles from './styles/App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className="container">
          <div className={styles.headerContent}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🎯</span>
              <div className={styles.brandInfo}>
                <h1>Hệ Thống Tuyển Dụng Thông Minh</h1>
                <p>Phân tích CV • DISC • Thần số học • Xếp hạng tự động</p>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.actionBtn}>⚙️</button>
              <button className={styles.actionBtn}>🔔</button>
              <div className={styles.userProfile}>👤 Nhà tuyển dụng</div>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className="container">
          <div className={styles.dashboardGrid}>
            {/* Job Requirements Section */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>📋 Tạo Yêu Cầu Công Việc</h2>
              <JobRequirementInput />
            </section>

            {/* Candidate Management */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>👥 Quản Lý Ứng Viên</h2>
              <CandidateManagerEnhanced />
            </section>

            {/* DISC Assessment */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>🎭 Đánh Giá DISC</h2>
              <DISCAssessment />
            </section>

            {/* Shortlist Ranking */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>🏆 Danh Sách Đề Xuất</h2>
              <ShortlistRankingEnhanced />
            </section>

            {/* Recent Activity */}
            <section className={styles.sectionFull}>
              <h2 className={styles.sectionTitle}>📈 Hoạt Động Gần Đây</h2>
              <RecentActivity />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;