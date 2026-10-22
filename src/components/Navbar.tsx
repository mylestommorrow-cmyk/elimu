import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  Wifi,
  WifiOff,
  Users,
  Menu,
  X,
  ArrowDownToLine,
  Flame,
  Award,
  ChevronRight,
  TrendingUp,
  Gamepad2,
  Coins,
  ShieldCheck,
  Bell,
  PanelLeft,
} from 'lucide-react';
import { LearnerProfile } from '../types';

interface NavbarProps {
  activeTab: 'library' | 'quizzes' | 'game' | 'tutor' | 'progress' | 'offline';
  setActiveTab: (tab: 'library' | 'quizzes' | 'game' | 'tutor' | 'progress' | 'offline') => void;
  activeProfile: LearnerProfile;
  onOpenProfileModal: () => void;
  dataSaverMode: boolean;
  setDataSaverMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  offlineCount: number;
  studyStreak: number;
  onLaunchGame: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeProfile,
  onOpenProfileModal,
  dataSaverMode,
  setDataSaverMode,
  offlineCount,
  studyStreak,
  onLaunchGame,
  onToggleSidebar,
}) => {
  const [streakPopoverOpen, setStreakPopoverOpen] = useState(false);
  const streakPopoverRef = useRef<HTMLDivElement | null>(null);

  const getTabLabel = () => {
    switch (activeTab) {
      case 'library':
        return 'Course Catalog & Revision Modules';
      case 'quizzes':
        return 'Continuous Assessment Tests (CATs)';
      case 'game':
        return 'ElimuSprint Savannah Arcade';
      case 'tutor':
        return 'Mwalimu AI Academic Advisor';
      case 'progress':
        return 'Official Academic Transcript & Honors';
      case 'offline':
        return `Offline Learning Vault (${offlineCount} Cached)`;
      default:
        return 'Course Catalog';
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (streakPopoverRef.current && !streakPopoverRef.current.contains(event.target as Node)) {
        setStreakPopoverOpen(false);
      }
    }
    if (streakPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [streakPopoverOpen]);

  // Next milestone calculation
  const nextMilestone = studyStreak < 7 ? 7 : studyStreak < 14 ? 14 : studyStreak < 30 ? 30 : 60;
  const milestoneProgress = Math.min(100, Math.round((studyStreak / nextMilestone) * 100));

  return (
    <header className="sticky top-0 z-40 bg-[#002B49] text-white shadow-md border-b-2 border-[#F2A900]">
      {/* Top Banner Ribbon */}
      <div className="bg-[#001E33] text-slate-300 text-[11px] px-4 py-1.5 border-b border-[#002B49]/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex items-center gap-1.5 font-bold text-[#F2A900]">
              <span className="w-2 h-2 rounded-full bg-[#F2A900] animate-pulse" />
              ELIMU BRIDGE
            </span>
            <span className="opacity-40 hidden sm:inline">|</span>
            <span className="hidden sm:inline text-slate-300 font-medium truncate">
              CBC & KCSE Interactive Learning Portal · Academic Year 2026 Term 1
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Low-data toggle button */}
            <button
              onClick={() => setDataSaverMode((prev) => !prev)}
              className="flex items-center gap-1.5 bg-[#002B49] hover:bg-[#00385F] text-slate-200 px-2.5 py-0.5 rounded border border-[#F2A900]/30 transition-colors cursor-pointer text-[11px]"
              title="Toggle Data Saver bandwidth optimization"
            >
              {dataSaverMode ? (
                <>
                  <WifiOff className="w-3 h-3 text-[#F2A900]" />
                  <span className="font-bold text-[#F2A900]">Data Saver: ON</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>Bandwidth: High Speed</span>
                </>
              )}
            </button>

            {/* Offline sync badge */}
            <div className="hidden sm:flex items-center gap-1 text-slate-300 font-medium text-[11px]">
              <ArrowDownToLine className="w-3 h-3 text-[#F2A900]" />
              <span>{offlineCount} Synced</span>
            </div>

            {/* Student Registration Number pill */}
            <div className="bg-[#002B49]/90 border border-slate-700/80 px-2 py-0.5 rounded text-[10px] font-mono text-[#F2A900] font-bold tracking-wider">
              {activeProfile.regNo || 'EB-CBC-2026-0842'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Left: Sidebar Toggle Button & View Indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl bg-[#001E33] hover:bg-[#00385F] text-[#F2A900] border border-[#F2A900]/40 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Toggle Left Navigation Sidebar"
              aria-label="Toggle navigation sidebar"
            >
              <PanelLeft className="w-5 h-5" />
              <span className="text-xs font-bold hidden sm:inline text-white">Menu</span>
            </button>

            {/* Brand Logo & Current View Title */}
            <div className="flex items-center gap-2.5">
              <div
                onClick={() => setActiveTab('library')}
                className="cursor-pointer flex items-center gap-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#F2A900] text-[#002B49] flex items-center justify-center font-black shadow-xs group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-base font-black tracking-wider uppercase text-white font-sans leading-none block">
                    ELIMU BRIDGE
                  </span>
                  <span className="text-[10px] font-bold text-[#F2A900] uppercase tracking-wider block">
                    {getTabLabel()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick actions, Study Streak, Tokens, Student profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Game Arcade CTA */}
            <button
              onClick={onLaunchGame}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F2A900] hover:bg-[#FFB81C] text-[#002B49] font-black text-xs shadow-xs transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Gamepad2 className="w-3.5 h-3.5 fill-[#002B49]" />
              <span>ElimuSprint</span>
            </button>

            {/* Visual Study Streak Counter */}
            <div className="relative" ref={streakPopoverRef}>
              <button
                onClick={() => setStreakPopoverOpen(!streakPopoverOpen)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all shadow-xs cursor-pointer ${
                  streakPopoverOpen
                    ? 'bg-[#001E33] border-[#F2A900] ring-1 ring-[#F2A900] text-white'
                    : 'bg-[#00385F]/60 hover:bg-[#00385F] border-[#F2A900]/40 text-slate-200'
                }`}
                title={`Study Streak: ${studyStreak} consecutive days`}
                aria-label="View study streak details"
              >
                <div className="w-5 h-5 rounded bg-[#F2A900]/20 flex items-center justify-center">
                  <Flame className="w-3.5 h-3.5 text-[#F2A900] fill-[#F2A900] animate-pulse" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono font-black text-xs tabular-nums text-[#F2A900] leading-none">
                    {studyStreak}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 leading-none hidden xs:inline">
                    {studyStreak === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </button>

              {/* Interactive Streak Popover */}
              {streakPopoverOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border-2 border-[#002B49] p-5 z-50 text-slate-800 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#002B49] flex items-center justify-center shadow-xs">
                        <Flame className="w-4 h-4 text-[#F2A900] fill-[#F2A900]" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-[#002B49] leading-tight">
                          {studyStreak}-Day Study Streak!
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          ElimuBridge Local Attendance Log
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setStreakPopoverOpen(false)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Student <span className="font-bold text-[#002B49]">{activeProfile.name}</span> has maintained regular e-learning portal revision for{' '}
                    <span className="font-bold text-[#002B49]">{studyStreak} consecutive {studyStreak === 1 ? 'day' : 'days'}</span>.
                  </p>

                  {/* Milestone Progress Bar */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-[#002B49] flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-[#F2A900]" />
                        <span>Next Milestone: {nextMilestone} Days</span>
                      </span>
                      <span className="text-slate-700 font-mono text-[11px]">
                        {studyStreak}/{nextMilestone}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#002B49] to-[#F2A900] h-full rounded-full transition-all duration-500"
                        style={{ width: `${milestoneProgress}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {nextMilestone - studyStreak} more days to unlock the {nextMilestone}-day badge award.
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setStreakPopoverOpen(false);
                      setActiveTab('progress');
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-[#002B49] hover:bg-[#001E33] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-[#F2A900]" />
                    <span>View Official Academic Transcript</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-300" />
                  </button>
                </div>
              )}
            </div>

            {/* Digital Tokens Badge */}
            <button
              onClick={() => setActiveTab('progress')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#F2A900]/40 bg-[#001E33] hover:bg-[#00385F] text-[#F2A900] text-xs font-bold transition-all shadow-xs cursor-pointer"
              title={`Elimu Tokens: ${activeProfile.tokensBalance || 0} earned`}
            >
              <Coins className="w-3.5 h-3.5 fill-[#F2A900]" />
              <span className="tabular-nums font-mono font-bold">
                {activeProfile.tokensBalance || 0}
              </span>
              <span className="text-[10px] text-slate-300 uppercase hidden md:inline">Tokens</span>
            </button>

            {/* Student Profile Switcher */}
            <button
              onClick={onOpenProfileModal}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-600 bg-[#001E33] hover:bg-[#00385F] text-white text-xs transition-all shadow-xs cursor-pointer group"
              title="Switch student profile"
            >
              <div
                className="w-7 h-7 rounded bg-[#F2A900] text-[#002B49] flex items-center justify-center text-xs font-black shadow-xs"
              >
                {activeProfile.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <span className="block font-bold text-white leading-tight group-hover:text-[#F2A900] transition-colors">
                  {activeProfile.name.split(' ')[0]}
                </span>
                <span className="block text-[10px] text-slate-300 font-mono leading-tight">
                  {activeProfile.regNo || 'EB-2026'}
                </span>
              </div>
              <Users className="w-3.5 h-3.5 text-slate-400 group-hover:text-white ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
