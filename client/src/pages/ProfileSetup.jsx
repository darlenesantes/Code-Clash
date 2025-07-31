import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Code, Target, Check } from 'lucide-react';
import Avatar from '../components/ui/Avatar';

const ProfileSetup = ({ navigate, user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [profileData, setProfileData] = useState({
    avatarTheme: 'coder',
    avatarColor: 'blue',
    favoriteLanguages: [],
    skillLevel: '',
    goals: []
  });

  const steps = [
    { id: 1, title: 'Choose Your Avatar', icon: User },
    { id: 2, title: 'Coding Background', icon: Code },
    { id: 3, title: 'Your Goals', icon: Target }
  ];

  const avatarThemes = [
    { id: 'gamer', name: 'Gamer', icon: '🎮', description: 'Battle-ready competitor' },
    { id: 'coder', name: 'Coder', icon: '💻', description: 'Algorithm enthusiast' },
    { id: 'genius', name: 'Genius', icon: '🧠', description: 'Strategic thinker' },
    { id: 'champion', name: 'Champion', icon: '🏆', description: 'Victory seeker' },
    { id: 'cyborg', name: 'Cyborg', icon: '🦾', description: 'Tech-enhanced warrior' },
    { id: 'ninja', name: 'Ninja', icon: '🥷', description: 'Stealthy problem solver' }
  ];

  const avatarColors = [
    { id: 'red', name: 'Red', class: 'bg-red-500' },
    { id: 'blue', name: 'Blue', class: 'bg-blue-500' },
    { id: 'green', name: 'Green', class: 'bg-green-500' },
    { id: 'purple', name: 'Purple', class: 'bg-purple-500' },
    { id: 'orange', name: 'Orange', class: 'bg-orange-500' },
    { id: 'pink', name: 'Pink', class: 'bg-pink-500' },
    { id: 'yellow', name: 'Yellow', class: 'bg-yellow-500' },
    { id: 'cyan', name: 'Cyan', class: 'bg-cyan-500' }
  ];

  const languages = [
    'Python', 'JavaScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'TypeScript', 'Swift', 'Kotlin'
  ];

  const skillLevels = [
    { id: 'beginner', title: 'Beginner', description: 'Just starting my coding journey' },
    { id: 'intermediate', title: 'Intermediate', description: 'Comfortable with basic algorithms' },
    { id: 'advanced', title: 'Advanced', description: 'Ready for complex challenges' },
    { id: 'expert', title: 'Expert', description: 'Bring on the hardest problems' }
  ];

  const goalOptions = [
    'Get better at interviews',
    'Learn new algorithms',
    'Improve problem-solving speed',
    'Master data structures',
    'Compete in tournaments',
    'Have fun coding'
  ];

  const handleLanguageToggle = (language) => {
    setProfileData(prev => {
      const languages = prev.favoriteLanguages.includes(language)
        ? prev.favoriteLanguages.filter(l => l !== language)
        : prev.favoriteLanguages.length < 3
          ? [...prev.favoriteLanguages, language]
          : prev.favoriteLanguages;
      return { ...prev, favoriteLanguages: languages };
    });
  };

  const handleGoalToggle = (goal) => {
    setProfileData(prev => {
      const goals = prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal];
      return { ...prev, goals };
    });
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');

    try {
      // SKIP BACKEND CALL - Just simulate success
      console.log('Profile setup completed with data:', profileData);
      
      // Simulate a brief loading state for UX
      setTimeout(() => {
        // Create updated user object with profile data
        const updatedUser = {
          ...user,
          avatarTheme: profileData.avatarTheme,
          avatarColor: profileData.avatarColor,
          favoriteLanguages: profileData.favoriteLanguages,
          skillLevel: profileData.skillLevel,
          goals: profileData.goals,
          setupComplete: true
        };
        
        console.log('Calling onComplete with user:', updatedUser);
        onComplete(updatedUser);
      }, 500);

    } catch (error) {
      console.error('Profile setup error:', error);
      setError('Failed to save profile. Please try again.');
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return profileData.avatarTheme && profileData.avatarColor;
      case 2: return profileData.favoriteLanguages.length > 0 && profileData.skillLevel;
      case 3: return profileData.goals.length > 0;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Choose Your Avatar</h2>
              <p className="text-gray-400">Pick a theme and color that represents you</p>
            </div>
            
            {/* Theme Selection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Choose Your Theme</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {avatarThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setProfileData(prev => ({ ...prev, avatarTheme: theme.id }))}
                    className={`p-4 rounded-xl text-center transition-all duration-300 ${
                      profileData.avatarTheme === theme.id
                        ? 'bg-blue-600 text-white ring-4 ring-blue-400'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-2">{theme.icon}</div>
                    <div className="font-semibold">{theme.name}</div>
                    <div className="text-xs opacity-80">{theme.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Choose Your Color</h3>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {avatarColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setProfileData(prev => ({ ...prev, avatarColor: color.id }))}
                    className={`w-12 h-12 rounded-full transition-all duration-300 ${color.class} ${
                      profileData.avatarColor === color.id
                        ? 'ring-4 ring-white scale-110'
                        : 'hover:scale-105'
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            
            {/* Avatar Preview */}
            <div className="text-center">
              <div className="mb-4">
                <Avatar 
                  theme={profileData.avatarTheme} 
                  color={profileData.avatarColor} 
                  size="xl"
                  className="mx-auto"
                />
              </div>
              <p className="text-gray-400">Your avatar preview</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Your Coding Background</h2>
              <p className="text-gray-400">Tell us about your programming skills</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Favorite Languages <span className="text-gray-400">(select up to 3)</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {languages.map((language) => (
                  <button
                    key={language}
                    onClick={() => handleLanguageToggle(language)}
                    disabled={!profileData.favoriteLanguages.includes(language) && profileData.favoriteLanguages.length >= 3}
                    className={`p-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                      profileData.favoriteLanguages.includes(language)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Skill Level</h3>
              <div className="space-y-3">
                {skillLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setProfileData(prev => ({ ...prev, skillLevel: level.id }))}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                      profileData.skillLevel === level.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-semibold">{level.title}</div>
                    <div className="text-sm opacity-80">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Your Goals</h2>
              <p className="text-gray-400">What do you want to achieve with CodeClash?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goalOptions.map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleGoalToggle(goal)}
                  className={`p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-3 ${
                    profileData.goals.includes(goal)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    profileData.goals.includes(goal)
                      ? 'border-white bg-white'
                      : 'border-gray-400'
                  }`}>
                    {profileData.goals.includes(goal) && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <span>{goal}</span>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="relative z-50 px-6 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Welcome to CodeClash</h1>
          <button
            onClick={() => navigate('dashboard')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Skip Setup
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-1 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
            {renderStep()}

            {error && (
              <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-center">{error}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={!canProceed() || isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  Complete Setup
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;