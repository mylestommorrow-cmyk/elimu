export type CurriculumLevel =
  | 'All'
  | 'CBE'
  | 'Pre-Primary'
  | 'Lower Primary'
  | 'Upper Primary'
  | 'Junior School'
  | 'Senior School'
  | 'CBC'
  | 'KCSE';

export type CbeStage =
  | 'All'
  | 'Pre-Primary'
  | 'Lower Primary'
  | 'Upper Primary'
  | 'Junior School'
  | 'Senior School';

export type CbeGrade =
  | 'All'
  | 'Playgroup'
  | 'PP1'
  | 'PP2'
  | 'Grade 1'
  | 'Grade 2'
  | 'Grade 3'
  | 'Grade 4'
  | 'Grade 5'
  | 'Grade 6'
  | 'Grade 7'
  | 'Grade 8'
  | 'Grade 9'
  | 'Grade 10'
  | 'Grade 11'
  | 'Grade 12';

export type SubjectCategory =
  | 'All'
  | 'Mathematics'
  | 'Integrated Science'
  | 'English'
  | 'Kiswahili'
  | 'History'
  | 'Agriculture'
  | 'Pre-Technical & STEM'
  | 'Creative Arts & Environmental'
  | 'Social Studies';

export interface StudyTopic {
  id: string;
  courseCode?: string; // e.g. "CBE-PG-01", "CBE-G8-02", "MTH 301"
  credits?: number;
  term?: string;
  title: string;
  subject: string;
  category: SubjectCategory;
  level: 'CBE' | 'CBC' | 'KCSE';
  cbeStage?: CbeStage;
  gradeLevel: string; // e.g. "Playgroup", "PP1", "PP2", "Grade 1", ..., "Grade 12"
  gradeNumber?: number; // 0 for Playgroup/PP, 1-12 for Grades 1-12
  strand?: string; // e.g. "Strand 3: Living Organisms & Human Health"
  subStrand?: string;
  coreCompetency?: string; // e.g. "Critical Thinking & Problem Solving"
  instructor: {
    name: string;
    role: string;
    institution: string;
  };
  rating: number;
  reviewsCount: number;
  offlineSize: string; // e.g. "1.2 MB"
  downloaded: boolean;
  coverImage: string;
  duration: string;
  summary: string;
  kicdCompetencies: string[];
  keyTerms: { term: string; definition: string }[];
  contentSections: {
    heading: string;
    body: string[];
    diagramLabel?: string;
    diagramKeyPoints?: string[];
    workedExample?: {
      problem: string;
      steps: string[];
      answer: string;
    };
  }[];
  commonMistakes: string[];
  quizId: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  contextSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  curriculumRef: string;
}

export interface RevisionQuiz {
  id: string;
  title: string;
  subject: string;
  category: SubjectCategory;
  level: 'CBE' | 'CBC' | 'KCSE';
  gradeLevel: string;
  questions: QuizQuestion[];
  estimatedMinutes: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category: 'streak' | 'quiz' | 'mastery' | 'offline';
  tokenReward: number;
  iconName: string;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    badgeGlow: string;
  };
  criteriaText: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: {
    current: number;
    max: number;
    unit: string;
  };
}

export interface LearnerProfile {
  id: string;
  regNo?: string; // e.g. "EB-CBE-2026-0842"
  academicStanding?: string; // e.g. "Good Standing · Honor Roll"
  gpa?: string; // e.g. "3.85 / 4.00"
  name: string;
  grade: string;
  level: 'CBE' | 'CBC' | 'KCSE';
  schoolName: string;
  avatarColor: string;
  completedTopicsCount: number;
  quizzesTaken: number;
  averageScore: number;
  streakDays: number;
  tokensBalance: number;
  unlockedBadgeIds: string[];
  weakAreas: string[];
  recentQuizScores: { quizTitle: string; score: number; total: number; date: string }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  language?: 'en' | 'sw';
  source?: string;
}
