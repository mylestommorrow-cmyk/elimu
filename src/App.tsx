/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { SubjectCategory, CurriculumLevel, CbeStage, CbeGrade, StudyTopic, LearnerProfile } from './types';
import { COURSES_DATA } from './data/courses';
import { INITIAL_PROFILES } from './data/profiles';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { CourseCard } from './components/CourseCard';
import { StudyNotesModal } from './components/StudyNotesModal';
import { QuizPlayer } from './components/QuizPlayer';
import { AITutorTab } from './components/AITutorTab';
import { ProgressTrackerView } from './components/ProgressTrackerView';
import { OfflineVaultView } from './components/OfflineVaultView';
import { ProfileManagerModal } from './components/ProfileManagerModal';
import { ElimuGame } from './components/ElimuGame';
import { Sidebar } from './components/Sidebar';
import { BookOpen, Sparkles, Award, ShieldCheck, Heart, ArrowUp, Gamepad2 } from 'lucide-react';

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'library' | 'quizzes' | 'game' | 'tutor' | 'progress' | 'offline'>('library');
  const [isGamePlaying, setIsGamePlaying] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory>('All');
  const [selectedStage, setSelectedStage] = useState<CbeStage>('All');
  const [selectedGrade, setSelectedGrade] = useState<CbeGrade>('All');
  const [selectedLevel, setSelectedLevel] = useState<CurriculumLevel>('All');
  const [onlyOffline, setOnlyOffline] = useState<boolean>(false);
  const [dataSaverMode, setDataSaverMode] = useState<boolean>(() => {
    return localStorage.getItem('elimubridge_datasaver') === 'true';
  });

  // Courses with dynamic offline download status
  const [courses, setCourses] = useState<StudyTopic[]>(() => {
    const savedOffline = localStorage.getItem('elimubridge_offline_ids');
    if (savedOffline) {
      try {
        const offlineIds: string[] = JSON.parse(savedOffline);
        return COURSES_DATA.map((c) => ({
          ...c,
          downloaded: offlineIds.includes(c.id),
        }));
      } catch (e) {
        // Fall back
      }
    }
    return COURSES_DATA;
  });

  // Household learner profiles state
  const [profiles, setProfiles] = useState<LearnerProfile[]>(() => {
    const saved = localStorage.getItem('elimubridge_profiles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fall back
      }
    }
    return INITIAL_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    const saved = localStorage.getItem('elimubridge_active_profile');
    if (saved) return saved;
    return INITIAL_PROFILES[0].id;
  });

  // Modals and deep linking state
  const [selectedTopicForModal, setSelectedTopicForModal] = useState<StudyTopic | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [targetQuizId, setTargetQuizId] = useState<string | undefined>(undefined);
  const [prefilledTutorPrompt, setPrefilledTutorPrompt] = useState<string | undefined>(undefined);

  // Study Streak counter state (consecutive days accessed, stored in localStorage)
  const [studyStreak, setStudyStreak] = useState<number>(() => {
    try {
      const savedStreak = localStorage.getItem('elimubridge_study_streak');
      const lastAccessDate = localStorage.getItem('elimubridge_last_access_date');
      const today = new Date().toISOString().slice(0, 10);

      if (savedStreak && lastAccessDate) {
        const streakNum = parseInt(savedStreak, 10);
        if (lastAccessDate === today) {
          // Already accessed today, return current streak
          return isNaN(streakNum) ? 1 : streakNum;
        }

        // Compare dates in days
        const lastTime = new Date(lastAccessDate).getTime();
        const todayTime = new Date(today).getTime();
        const diffDays = Math.round((todayTime - lastTime) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          // Consecutive day access! Increment streak
          const newStreak = (isNaN(streakNum) ? 1 : streakNum) + 1;
          localStorage.setItem('elimubridge_study_streak', String(newStreak));
          localStorage.setItem('elimubridge_last_access_date', today);
          return newStreak;
        } else if (diffDays > 1) {
          // Missed at least one day, reset streak to 1
          localStorage.setItem('elimubridge_study_streak', '1');
          localStorage.setItem('elimubridge_last_access_date', today);
          return 1;
        }
        return isNaN(streakNum) ? 1 : streakNum;
      }

      // Initial visit - set default streak
      const initialStreak = 5;
      localStorage.setItem('elimubridge_study_streak', String(initialStreak));
      localStorage.setItem('elimubridge_last_access_date', today);
      return initialStreak;
    } catch (e) {
      return 1;
    }
  });

  // Ensure study streak state is synced in localStorage
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('elimubridge_study_streak', String(studyStreak));
    localStorage.setItem('elimubridge_last_access_date', today);
  }, [studyStreak]);

  // Sync data saver setting to local storage
  useEffect(() => {
    localStorage.setItem('elimubridge_datasaver', String(dataSaverMode));
  }, [dataSaverMode]);

  // Sync profiles to local storage
  useEffect(() => {
    localStorage.setItem('elimubridge_profiles', JSON.stringify(profiles));
    localStorage.setItem('elimubridge_active_profile', activeProfileId);
  }, [profiles, activeProfileId]);

  // Current active profile
  const activeProfile = useMemo(() => {
    return profiles.find((p) => p.id === activeProfileId) || profiles[0];
  }, [profiles, activeProfileId]);

  // Downloaded topics count
  const downloadedTopics = useMemo(() => {
    return courses.filter((c) => c.downloaded);
  }, [courses]);

  // Toggle download / offline caching for a topic
  const handleToggleOffline = (topicId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setCourses((prev) => {
      const updated = prev.map((item) => {
        if (item.id === topicId) {
          return { ...item, downloaded: !item.downloaded };
        }
        return item;
      });

      // Update local storage IDs
      const offlineIds = updated.filter((item) => item.downloaded).map((item) => item.id);
      localStorage.setItem('elimubridge_offline_ids', JSON.stringify(offlineIds));

      return updated;
    });

    // Also update modal if open
    if (selectedTopicForModal && selectedTopicForModal.id === topicId) {
      setSelectedTopicForModal((prev) => (prev ? { ...prev, downloaded: !prev.downloaded } : null));
    }
  };

  // Add new profile handler
  const handleAddProfile = (newProfileData: Omit<LearnerProfile, 'id' | 'completedTopicsCount' | 'quizzesTaken' | 'averageScore' | 'streakDays' | 'tokensBalance' | 'unlockedBadgeIds' | 'weakAreas' | 'recentQuizScores'>) => {
    const newProfile: LearnerProfile = {
      ...newProfileData,
      id: `profile-${Date.now()}`,
      completedTopicsCount: 0,
      quizzesTaken: 0,
      averageScore: 0,
      streakDays: 1,
      tokensBalance: 100, // Welcome bonus tokens!
      unlockedBadgeIds: [],
      weakAreas: ['General Revision & Past Papers'],
      recentQuizScores: [],
    };
    setProfiles((prev) => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  // Update profile score after a quiz attempt & award digital tokens
  const handleUpdateProfileScore = (quizTitle: string, score: number, total: number) => {
    const percentage = Math.round((score / total) * 100);
    const isPerfect = score === total;
    const earnedTokens = isPerfect ? 75 : 25; // Bonus tokens for high score!

    setProfiles((prev) =>
      prev.map((prof) => {
        if (prof.id === activeProfileId) {
          const newQuizzesTaken = prof.quizzesTaken + 1;
          const newAverageScore = Math.round(
            (prof.averageScore * prof.quizzesTaken + percentage) / newQuizzesTaken
          );
          const newUnlockedBadges = [...(prof.unlockedBadgeIds || [])];

          // Check badge unlock triggers
          if (isPerfect && !newUnlockedBadges.includes('badge-quiz-ace')) {
            newUnlockedBadges.push('badge-quiz-ace');
          }
          if (newQuizzesTaken >= 5 && !newUnlockedBadges.includes('badge-quiz-veteran')) {
            newUnlockedBadges.push('badge-quiz-veteran');
          }
          if (newAverageScore >= 85 && !newUnlockedBadges.includes('badge-high-accuracy')) {
            newUnlockedBadges.push('badge-high-accuracy');
          }

          return {
            ...prof,
            quizzesTaken: newQuizzesTaken,
            averageScore: newAverageScore,
            completedTopicsCount: prof.completedTopicsCount + (score >= total * 0.7 ? 1 : 0),
            tokensBalance: (prof.tokensBalance || 0) + earnedTokens,
            unlockedBadgeIds: newUnlockedBadges,
            recentQuizScores: [
              {
                quizTitle,
                score,
                total,
                date: 'Just now',
              },
              ...prof.recentQuizScores.slice(0, 4),
            ],
          };
        }
        return prof;
      })
    );
  };

  // Deep link to Quiz from notes or hero
  const handleTakeQuiz = (quizId?: string) => {
    if (quizId) setTargetQuizId(quizId);
    setActiveTab('quizzes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Deep link to AI Tutor
  const handleAskAITutor = (prompt: string, subject: string) => {
    setPrefilledTutorPrompt(prompt);
    setActiveTab('tutor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered courses for library view
  const filteredCourses = useMemo(() => {
    return courses.filter((topic) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          topic.title.toLowerCase().includes(q) ||
          topic.subject.toLowerCase().includes(q) ||
          topic.gradeLevel.toLowerCase().includes(q) ||
          topic.summary.toLowerCase().includes(q) ||
          topic.keyTerms.some((k) => k.term.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Stage match (e.g. Pre-Primary, Lower Primary, etc.)
      if (selectedStage !== 'All' && topic.cbeStage !== selectedStage) {
        return false;
      }

      // Granular Grade match (e.g. Playgroup, PP1, Grade 1... Grade 12)
      if (selectedGrade !== 'All' && topic.gradeLevel !== selectedGrade) {
        return false;
      }

      // Category match
      if (selectedCategory !== 'All' && topic.category !== selectedCategory) {
        return false;
      }

      // Curriculum level match
      if (selectedLevel !== 'All' && topic.level !== selectedLevel) {
        return false;
      }

      // Offline only match
      if (onlyOffline && !topic.downloaded) {
        return false;
      }

      return true;
    });
  }, [courses, searchQuery, selectedCategory, selectedStage, selectedGrade, selectedLevel, onlyOffline]);

  // If full-viewport game shell is active, render without top nav or footer
  if (isGamePlaying) {
    return (
      <ElimuGame
        onExitGame={() => setIsGamePlaying(false)}
        activeProfile={activeProfile}
        onUpdateScore={(gameScore) => {
          setProfiles((prev) =>
            prev.map((prof) =>
              prof.id === activeProfileId
                ? {
                    ...prof,
                    completedTopicsCount: prof.completedTopicsCount + 1,
                  }
                : prof
            )
          );
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F4F6F9] text-slate-900 selection:bg-[#002B49] selection:text-[#F2A900]">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeProfile={activeProfile}
        onOpenProfileModal={() => setProfileModalOpen(true)}
        dataSaverMode={dataSaverMode}
        setDataSaverMode={setDataSaverMode}
        offlineCount={downloadedTopics.length}
        studyStreak={studyStreak}
        onLaunchGame={() => setIsGamePlaying(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Column (with desktop offset for fixed left sidebar) */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeProfile={activeProfile}
          onOpenProfileModal={() => setProfileModalOpen(true)}
          dataSaverMode={dataSaverMode}
          setDataSaverMode={setDataSaverMode}
          offlineCount={downloadedTopics.length}
          studyStreak={studyStreak}
          onLaunchGame={() => setIsGamePlaying(true)}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Main Content Area */}
        <main className="flex-1">
        {activeTab === 'library' && (
          <div className="space-y-6">
            {/* Hero Section */}
            <HeroSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onExploreQuizzes={() => handleTakeQuiz()}
              onOpenAITutor={() => handleAskAITutor('How does photosynthesis work in biology?', 'Integrated Science')}
              onLaunchGame={() => setIsGamePlaying(true)}
              dataSaverMode={dataSaverMode}
              activeProfile={activeProfile}
            />

            {/* Interactive Category Filter Bar */}
            <CategoryFilterBar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedStage={selectedStage}
              onSelectStage={setSelectedStage}
              selectedGrade={selectedGrade}
              onSelectGrade={setSelectedGrade}
              onlyOffline={onlyOffline}
              onToggleOnlyOffline={() => setOnlyOffline(!onlyOffline)}
              totalCoursesCount={filteredCourses.length}
            />

            {/* Course Cards Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((topic) => (
                    <CourseCard
                      key={topic.id}
                      topic={topic}
                      onOpenNotes={setSelectedTopicForModal}
                      onToggleOffline={handleToggleOffline}
                      dataSaverMode={dataSaverMode}
                    />
                  ))}
                </div>
              ) : (
                /* No courses match state */
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#002B49] flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6 text-[#002B49]" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No matching CBE revision lessons found</h3>
                  <p className="text-xs text-slate-500">
                    Try clearing search queries or switching between CBE stages (Playgroup to Grade 12) or subject areas.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSelectedStage('All');
                      setSelectedGrade('All');
                      setSelectedLevel('All');
                      setOnlyOffline(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#002B49] hover:bg-[#004A7C] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
                Exam Preparation
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Interactive Revision Quizzes
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Practice past examination questions with instant visual feedback and step-by-step worked explanations.
              </p>
            </div>

            <QuizPlayer
              initialQuizId={targetQuizId}
              activeProfile={activeProfile}
              onUpdateProfileScore={handleUpdateProfileScore}
              onAskAITutor={handleAskAITutor}
            />
          </div>
        )}

        {/* Mwalimu AI Tutor Tab */}
        {activeTab === 'tutor' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
                Bilingual Learning Assistant
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Mwalimu AI Study Companion
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Ask questions in English or Kiswahili tailored directly to the Kenyan CBC and KCSE syllabus.
              </p>
            </div>

            <AITutorTab
              activeProfile={activeProfile}
              prefilledPrompt={prefilledTutorPrompt}
              onClearPrefill={() => setPrefilledTutorPrompt(undefined)}
            />
          </div>
        )}

        {/* Progress Tracker Tab */}
        {activeTab === 'progress' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
                Learning Analytics
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Household Learning Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Track topic completions, quiz accuracy, and targeted weak-area recommendations.
              </p>
            </div>

            <ProgressTrackerView
              activeProfile={activeProfile}
              onOpenProfileModal={() => setProfileModalOpen(true)}
              onTakeQuiz={() => setActiveTab('quizzes')}
              onAskAITutor={handleAskAITutor}
              offlineCount={downloadedTopics.length}
              studyStreak={studyStreak}
              onLaunchGame={() => setIsGamePlaying(true)}
            />
          </div>
        )}

        {/* Offline Learning Vault Tab */}
        {activeTab === 'offline' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <OfflineVaultView
              downloadedTopics={downloadedTopics}
              onOpenNotes={setSelectedTopicForModal}
              onRemoveOffline={(id) => handleToggleOffline(id)}
              onGoToLibrary={() => setActiveTab('library')}
              dataSaverMode={dataSaverMode}
            />
          </div>
        )}
      </main>

      {/* Study Notes View Modal */}
      <StudyNotesModal
        topic={selectedTopicForModal}
        onClose={() => setSelectedTopicForModal(null)}
        onTakeQuiz={handleTakeQuiz}
        onAskAITutor={handleAskAITutor}
        onToggleOffline={handleToggleOffline}
        dataSaverMode={dataSaverMode}
      />

      {/* Household Learner Profile Manager Modal */}
      <ProfileManagerModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={setActiveProfileId}
        onAddProfile={handleAddProfile}
      />

      {/* Institutional ELIMU BRIDGE Footer */}
      <footer className="border-t-2 border-[#002B49] bg-[#001E33] mt-16 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-[#F2A900] text-[#002B49] flex items-center justify-center font-black text-xs shadow-xs">
              E
            </div>
            <div>
              <span className="font-bold text-white uppercase tracking-wider block">
                ELIMU BRIDGE · Kenya CBC & KCSE Portal
              </span>
              <span className="text-[10px] text-slate-400">
                Academic Affairs & E-Learning Division · Aligned with KICD & KNEC Syllabus
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-slate-300 font-medium">
            <button onClick={() => setActiveTab('library')} className="hover:text-[#F2A900] transition-colors cursor-pointer">
              Course Catalog
            </button>
            <button onClick={() => setActiveTab('quizzes')} className="hover:text-[#F2A900] transition-colors cursor-pointer">
              CATs & Quizzes
            </button>
            <button onClick={() => setActiveTab('tutor')} className="hover:text-[#F2A900] transition-colors cursor-pointer">
              Mwalimu AI Advisor
            </button>
            <button onClick={() => setActiveTab('progress')} className="hover:text-[#F2A900] transition-colors cursor-pointer">
              Transcript & Honors
            </button>
            <button onClick={() => setActiveTab('offline')} className="hover:text-[#F2A900] transition-colors cursor-pointer">
              Offline Coursepack
            </button>
          </div>

          <div className="text-[11px] font-mono text-[#F2A900] text-center md:text-right">
            ELIMU BRIDGE Portal v2.6 · 2026 Academic Term 1
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
