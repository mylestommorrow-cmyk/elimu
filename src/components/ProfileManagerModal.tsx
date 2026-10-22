import React, { useState } from 'react';
import { LearnerProfile } from '../types';
import { X, UserPlus, Check, Users, Sparkles, GraduationCap, School } from 'lucide-react';

interface ProfileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: LearnerProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onAddProfile: (newProfile: Omit<LearnerProfile, 'id' | 'completedTopicsCount' | 'quizzesTaken' | 'averageScore' | 'streakDays' | 'tokensBalance' | 'unlockedBadgeIds' | 'weakAreas' | 'recentQuizScores'>) => void;
}

export const ProfileManagerModal: React.FC<ProfileManagerModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onAddProfile,
}) => {
  if (!isOpen) return null;

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('Grade 8 CBC');
  const [schoolName, setSchoolName] = useState('');
  const [avatarColor, setAvatarColor] = useState('bg-purple-600');

  const gradeOptions = [
    { label: 'Playgroup (Early Childhood)', value: 'Playgroup', level: 'CBE' as const },
    { label: 'PP1 (Pre-Primary 1)', value: 'PP1', level: 'CBE' as const },
    { label: 'PP2 (Pre-Primary 2)', value: 'PP2', level: 'CBE' as const },
    { label: 'Grade 1 (Lower Primary)', value: 'Grade 1', level: 'CBE' as const },
    { label: 'Grade 2 (Lower Primary)', value: 'Grade 2', level: 'CBE' as const },
    { label: 'Grade 3 (Lower Primary)', value: 'Grade 3', level: 'CBE' as const },
    { label: 'Grade 4 (Upper Primary)', value: 'Grade 4', level: 'CBE' as const },
    { label: 'Grade 5 (Upper Primary)', value: 'Grade 5', level: 'CBE' as const },
    { label: 'Grade 6 (Upper Primary - KPSEA)', value: 'Grade 6', level: 'CBE' as const },
    { label: 'Grade 7 (Junior School - JSS)', value: 'Grade 7', level: 'CBE' as const },
    { label: 'Grade 8 (Junior School - JSS)', value: 'Grade 8', level: 'CBE' as const },
    { label: 'Grade 9 (Junior School - KJSEA)', value: 'Grade 9', level: 'CBE' as const },
    { label: 'Grade 10 (Senior School - STEM/Arts)', value: 'Grade 10', level: 'CBE' as const },
    { label: 'Grade 11 (Senior School - Advanced)', value: 'Grade 11', level: 'CBE' as const },
    { label: 'Grade 12 (Senior School Exit/Cert)', value: 'Grade 12', level: 'CBE' as const },
  ];

  const colorChoices = [
    'bg-purple-600',
    'bg-emerald-600',
    'bg-blue-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-indigo-600',
  ];

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const matched = gradeOptions.find((g) => g.value === grade);
    const level = matched ? matched.level : 'CBC';

    onAddProfile({
      name: name.trim(),
      grade,
      level,
      schoolName: schoolName.trim() || 'Kenyan Day / Boarding School',
      avatarColor,
    });

    setName('');
    setSchoolName('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Household Learner Profiles</h3>
              <p className="text-[11px] text-slate-500">Shared phone or tablet for multiple siblings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!isAdding ? (
            <>
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Select Active Learner:
                </div>
                <div className="space-y-2.5">
                  {profiles.map((profile) => {
                    const isActive = profile.id === activeProfileId;
                    return (
                      <div
                        key={profile.id}
                        onClick={() => {
                          onSelectProfile(profile.id);
                          onClose();
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isActive
                            ? 'border-[#7C3AED] bg-purple-50/80 shadow-xs ring-1 ring-[#7C3AED]'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl ${profile.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-xs`}
                          >
                            {profile.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{profile.name}</span>
                              {isActive && (
                                <span className="text-[10px] bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-full font-bold">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">
                              {profile.grade} · {profile.schoolName}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-bold text-amber-700 tabular-nums">
                            🪙 {profile.tokensBalance || 0}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {profile.averageScore}% Avg · {profile.unlockedBadgeIds?.length || 0} badges
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setIsAdding(true)}
                className="w-full py-3 rounded-2xl border border-dashed border-purple-300 hover:border-[#7C3AED] bg-purple-50/40 hover:bg-purple-50 text-[#7C3AED] text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Another Learner Profile</span>
              </button>
            </>
          ) : (
            /* Add Profile Form */
            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Learner's Full Name:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kevin Kipchirchir"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Class / Curriculum Level:</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white"
                >
                  {gradeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">School Name (Optional):</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Nakuru Day Secondary School"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Avatar Badge Color:</label>
                <div className="flex items-center gap-2">
                  {colorChoices.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatarColor(c)}
                      className={`w-7 h-7 rounded-lg ${c} flex items-center justify-center transition-transform ${
                        avatarColor === c ? 'scale-110 ring-2 ring-slate-900' : 'opacity-80'
                      }`}
                    >
                      {avatarColor === c && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-sm"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
