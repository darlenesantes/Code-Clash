/**
 * Enhanced Corporate Sponsor Dashboard with Real Company Logos
 * File: client/src/components/CorporateSponsorDashboard.jsx
 * Shows all major tech companies with actual logos and back button functionality
 */
import React, { useState } from 'react';
import { 
  Building2, DollarSign, Users, TrendingUp, Calendar, MapPin, 
  Briefcase, Award, Eye, Target, ArrowLeft, Trophy, Star, 
  ChevronUp, ChevronDown, ExternalLink, Mail, Phone, Globe,
  GraduationCap, HandHeart, Zap, Filter, Search
} from 'lucide-react';

const CorporateSponsorDashboard = ({ navigate }) => {
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [sortBy, setSortBy] = useState('investment');
  const [searchTerm, setSearchTerm] = useState('');

  // Company Logo Component with Real Logos
  const CompanyLogo = ({ company }) => {
    const logoMap = {
      'google': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
      'microsoft': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
      'amazon': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
      'meta': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
      'apple': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
      'netflix': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
      'openai': 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
      'nvidia': 'https://upload.wikimedia.org/wikipedia/commons/a/a4/NVIDIA_logo.svg',
      'stripe': 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
      'uber': 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png',
      'citadel': 'https://upload.wikimedia.org/wikipedia/commons/6/66/Citadel_Securities_logo.jpg',
      'twosigma': 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Two_Sigma_logo.svg',
    };

    const logoUrl = logoMap[company.id];

    return (
      <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden p-2">
        {logoUrl ? (
          <img 
            src={logoUrl}
            alt={`${company.name} logo`}
            className="max-w-full max-h-full object-contain"
            style={{
              filter: company.id === 'apple' ? 'invert(0)' : 'none'
            }}
            onError={(e) => {
              // Fallback to text logo if image fails
              e.target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center';
              fallback.innerHTML = `<span class="text-white font-bold text-lg">${company.name[0]}</span>`;
              e.target.parentNode.appendChild(fallback);
            }}
          />
        ) : (
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">{company.name[0]}</span>
          </div>
        )}
      </div>
    );
  };

  // All major tech companies with realistic prizes
  const corporateSponsors = [
    {
      id: 'google',
      name: 'Google',
      tier: 'Diamond',
      investment: 250000,
      monthlyViewers: 420000,
      qualifiedLeads: 284,
      talentAcquired: 56,
      industry: 'Technology',
      headquarters: 'Mountain View, CA',
      employees: '156,000+',
      website: 'careers.google.com',
      sponsorshipType: 'Tournament Series Sponsor',
      cashPrizes: {
        totalAwarded: 85000,
        weeklyTournaments: 2500,
        monthlyChampionships: 10000,
        seasonalGrandPrix: 50000
      },
      internshipProgram: {
        available: true,
        positions: 45,
        duration: '12 weeks',
        salary: '$8,500/month',
        locations: ['Mountain View', 'New York', 'Seattle', 'Austin']
      }
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      tier: 'Diamond',
      investment: 220000,
      monthlyViewers: 380000,
      qualifiedLeads: 215,
      talentAcquired: 34,
      industry: 'Technology',
      headquarters: 'Redmond, WA',
      employees: '221,000+',
      website: 'careers.microsoft.com',
      sponsorshipType: 'Platform Integration Partner',
      cashPrizes: {
        totalAwarded: 72000,
        weeklyTournaments: 2000,
        monthlyChampionships: 7500,
        seasonalGrandPrix: 40000
      },
      internshipProgram: {
        available: true,
        positions: 38,
        duration: '12 weeks',
        salary: '$7,800/month',
        locations: ['Redmond', 'San Francisco', 'Atlanta', 'Cambridge']
      }
    },
    {
      id: 'amazon',
      name: 'Amazon',
      tier: 'Diamond',
      investment: 200000,
      monthlyViewers: 350000,
      qualifiedLeads: 198,
      talentAcquired: 28,
      industry: 'Technology / E-commerce',
      headquarters: 'Seattle, WA',
      employees: '1,540,000+',
      website: 'amazon.jobs',
      sponsorshipType: 'AWS Challenge Series',
      cashPrizes: {
        totalAwarded: 68000,
        weeklyTournaments: 1800,
        monthlyChampionships: 6500,
        seasonalGrandPrix: 35000
      },
      internshipProgram: {
        available: true,
        positions: 52,
        duration: '12-16 weeks',
        salary: '$8,000/month',
        locations: ['Seattle', 'Austin', 'New York', 'Boston', 'San Francisco']
      }
    },
    {
      id: 'meta',
      name: 'Meta',
      tier: 'Platinum',
      investment: 180000,
      monthlyViewers: 320000,
      qualifiedLeads: 175,
      talentAcquired: 27,
      industry: 'Social Technology',
      headquarters: 'Menlo Park, CA',
      employees: '86,000+',
      website: 'metacareers.com',
      sponsorshipType: 'VR/AR Challenge Sponsor',
      cashPrizes: {
        totalAwarded: 58000,
        weeklyTournaments: 1500,
        monthlyChampionships: 5500,
        seasonalGrandPrix: 30000
      },
      internshipProgram: {
        available: true,
        positions: 32,
        duration: '12 weeks',
        salary: '$8,200/month',
        locations: ['Menlo Park', 'New York', 'Seattle', 'London']
      }
    },
    {
      id: 'apple',
      name: 'Apple',
      tier: 'Platinum',
      investment: 160000,
      monthlyViewers: 290000,
      qualifiedLeads: 153,
      talentAcquired: 19,
      industry: 'Consumer Technology',
      headquarters: 'Cupertino, CA',
      employees: '164,000+',
      website: 'jobs.apple.com',
      sponsorshipType: 'iOS Development Partner',
      cashPrizes: {
        totalAwarded: 52000,
        weeklyTournaments: 1200,
        monthlyChampionships: 4500,
        seasonalGrandPrix: 25000
      },
      internshipProgram: {
        available: true,
        positions: 28,
        duration: '12 weeks',
        salary: '$7,500/month',
        locations: ['Cupertino', 'Austin', 'Seattle']
      }
    },
    {
      id: 'netflix',
      name: 'Netflix',
      tier: 'Gold',
      investment: 95000,
      monthlyViewers: 180000,
      qualifiedLeads: 98,
      talentAcquired: 15,
      industry: 'Entertainment Technology',
      headquarters: 'Los Gatos, CA',
      employees: '12,800+',
      website: 'jobs.netflix.com',
      sponsorshipType: 'Streaming Tech Challenge',
      cashPrizes: {
        totalAwarded: 32000,
        weeklyTournaments: 800,
        monthlyChampionships: 3000,
        seasonalGrandPrix: 15000
      },
      internshipProgram: {
        available: true,
        positions: 18,
        duration: '12 weeks',
        salary: '$7,200/month',
        locations: ['Los Gatos', 'Los Angeles']
      }
    },
    {
      id: 'openai',
      name: 'OpenAI',
      tier: 'Silver',
      investment: 80000,
      monthlyViewers: 120000,
      qualifiedLeads: 63,
      talentAcquired: 8,
      industry: 'Artificial Intelligence',
      headquarters: 'San Francisco, CA',
      employees: '770+',
      website: 'openai.com/careers',
      sponsorshipType: 'AI Challenge Series',
      cashPrizes: {
        totalAwarded: 28000,
        weeklyTournaments: 800,
        monthlyChampionships: 3000,
        seasonalGrandPrix: 12000
      },
      internshipProgram: {
        available: true,
        positions: 12,
        duration: '12 weeks',
        salary: '$9,000/month',
        locations: ['San Francisco']
      }
    },
    {
      id: 'nvidia',
      name: 'NVIDIA',
      tier: 'Silver',
      investment: 75000,
      monthlyViewers: 110000,
      qualifiedLeads: 56,
      talentAcquired: 14,
      industry: 'Hardware / AI',
      headquarters: 'Santa Clara, CA',
      employees: '29,600+',
      website: 'nvidia.com/careers',
      sponsorshipType: 'GPU Computing Partner',
      cashPrizes: {
        totalAwarded: 25000,
        weeklyTournaments: 700,
        monthlyChampionships: 2500,
        seasonalGrandPrix: 10000
      },
      internshipProgram: {
        available: true,
        positions: 18,
        duration: '12 weeks',
        salary: '$8,200/month',
        locations: ['Santa Clara', 'Austin', 'Tel Aviv']
      }
    },
    {
      id: 'stripe',
      name: 'Stripe',
      tier: 'Gold',
      investment: 95000,
      monthlyViewers: 140000,
      qualifiedLeads: 72,
      talentAcquired: 15,
      industry: 'Fintech',
      headquarters: 'San Francisco, CA',
      employees: '8,000+',
      website: 'stripe.com/jobs',
      sponsorshipType: 'Payment API Challenge',
      cashPrizes: {
        totalAwarded: 32000,
        weeklyTournaments: 1000,
        monthlyChampionships: 3500,
        seasonalGrandPrix: 15000
      },
      internshipProgram: {
        available: true,
        positions: 22,
        duration: '12 weeks',
        salary: '$8,500/month',
        locations: ['San Francisco', 'Seattle', 'New York', 'Dublin']
      }
    },
    {
      id: 'uber',
      name: 'Uber',
      tier: 'Gold',
      investment: 85000,
      monthlyViewers: 125000,
      qualifiedLeads: 65,
      talentAcquired: 13,
      industry: 'Transportation Technology',
      headquarters: 'San Francisco, CA',
      employees: '32,000+',
      website: 'uber.com/careers',
      sponsorshipType: 'Mobility Challenge Series',
      cashPrizes: {
        totalAwarded: 28000,
        weeklyTournaments: 800,
        monthlyChampionships: 3000,
        seasonalGrandPrix: 12000
      },
      internshipProgram: {
        available: true,
        positions: 25,
        duration: '12 weeks',
        salary: '$7,800/month',
        locations: ['San Francisco', 'New York', 'Seattle', 'Amsterdam']
      }
    },
    {
      id: 'citadel',
      name: 'Citadel',
      tier: 'Gold',
      investment: 120000,
      monthlyViewers: 180000,
      qualifiedLeads: 98,
      talentAcquired: 17,
      industry: 'Quantitative Finance',
      headquarters: 'Chicago, IL',
      employees: '26,000+',
      website: 'citadel.com/careers',
      sponsorshipType: 'Quantitative Challenge Series',
      cashPrizes: {
        totalAwarded: 45000,
        weeklyTournaments: 1500,
        monthlyChampionships: 5000,
        seasonalGrandPrix: 25000
      },
      internshipProgram: {
        available: true,
        positions: 15,
        duration: '10 weeks',
        salary: '$12,000/month',
        locations: ['Chicago', 'New York', 'London']
      }
    },
    {
      id: 'twosigma',
      name: 'Two Sigma',
      tier: 'Gold',
      investment: 110000,
      monthlyViewers: 160000,
      qualifiedLeads: 84,
      talentAcquired: 12,
      industry: 'Quantitative Finance',
      headquarters: 'New York, NY',
      employees: '1,800+',
      website: 'twosigma.com/careers',
      sponsorshipType: 'Data Science Partnership',
      cashPrizes: {
        totalAwarded: 38000,
        weeklyTournaments: 1200,
        monthlyChampionships: 4000,
        seasonalGrandPrix: 20000
      },
      internshipProgram: {
        available: true,
        positions: 12,
        duration: '12 weeks',
        salary: '$11,500/month',
        locations: ['New York', 'London']
      }
    }
  ];

  const filteredSponsors = corporateSponsors
    .filter(sponsor => {
      const matchesSearch = sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sponsor.industry.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier = selectedTier === 'all' || sponsor.tier === selectedTier;
      const matchesIndustry = selectedIndustry === 'all' || sponsor.industry.includes(selectedIndustry);
      return matchesSearch && matchesTier && matchesIndustry;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'investment': return b.investment - a.investment;
        case 'prizes': return b.cashPrizes.totalAwarded - a.cashPrizes.totalAwarded;
        case 'internships': return b.internshipProgram.positions - a.internshipProgram.positions;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

  const totalInvestment = corporateSponsors.reduce((sum, sponsor) => sum + sponsor.investment, 0);
  const totalPrizes = corporateSponsors.reduce((sum, sponsor) => sum + sponsor.cashPrizes.totalAwarded, 0);
  const totalInternships = corporateSponsors.reduce((sum, sponsor) => sum + sponsor.internshipProgram.positions, 0);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Diamond': return 'from-cyan-400 to-blue-600';
      case 'Platinum': return 'from-gray-300 to-gray-600';
      case 'Gold': return 'from-yellow-400 to-orange-600';
      case 'Silver': return 'from-gray-400 to-gray-600';
      case 'Bronze': return 'from-orange-300 to-orange-600';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'Diamond': return '💎';
      case 'Platinum': return '🥈';
      case 'Gold': return '🥇';
      case 'Silver': return '🥉';
      case 'Bronze': return '🟤';
      default: return '⚪';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('dashboard')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Corporate Sponsors</h1>
          <p className="text-gray-300 text-lg">
            {corporateSponsors.length} leading tech companies offering ${(totalPrizes / 1000).toFixed(0)}K+ in prizes and {totalInternships} internship positions
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
            <DollarSign className="w-8 h-8 mb-3" />
            <h3 className="text-2xl font-bold">${(totalInvestment / 1000000).toFixed(1)}M+</h3>
            <p className="text-green-100">Total Investment</p>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 text-white">
            <Trophy className="w-8 h-8 mb-3" />
            <h3 className="text-2xl font-bold">${(totalPrizes / 1000).toFixed(0)}K</h3>
            <p className="text-yellow-100">Prize Money</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
            <GraduationCap className="w-8 h-8 mb-3" />
            <h3 className="text-2xl font-bold">{totalInternships}</h3>
            <p className="text-blue-100">Internship Positions</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
            <Building2 className="w-8 h-8 mb-3" />
            <h3 className="text-2xl font-bold">{corporateSponsors.length}</h3>
            <p className="text-purple-100">Partner Companies</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none w-64"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <select 
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
              >
                <option value="all">All Tiers</option>
                <option value="Diamond">💎 Diamond</option>
                <option value="Platinum">🥈 Platinum</option>
                <option value="Gold">🥇 Gold</option>
                <option value="Silver">🥉 Silver</option>
              </select>
              
              <select 
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
              >
                <option value="all">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Quantitative Finance">Finance</option>
                <option value="Fintech">Fintech</option>
                <option value="AI">AI/ML</option>
              </select>
              
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
              >
                <option value="investment">Sort by Investment</option>
                <option value="prizes">Sort by Prize Money</option>
                <option value="internships">Sort by Internships</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
            
            <div className="text-white">
              <span className="text-gray-400">Showing:</span> {filteredSponsors.length} companies
            </div>
          </div>
        </div>

        {/* Sponsors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSponsors.map((sponsor) => (
            <div key={sponsor.id} className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-200 transform hover:scale-105">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <CompanyLogo company={sponsor} />
                  <div>
                    <h3 className="text-lg font-bold text-white">{sponsor.name}</h3>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-gradient-to-r ${getTierColor(sponsor.tier)} text-white text-xs font-semibold`}>
                      <span>{getTierBadge(sponsor.tier)}</span>
                      <span>{sponsor.tier}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-green-400">${(sponsor.investment / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-400">Investment</p>
                </div>
              </div>

              {/* Industry & Location */}
              <div className="mb-4">
                <p className="text-sm text-gray-300">{sponsor.industry}</p>
                <p className="text-xs text-gray-400">{sponsor.headquarters}</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-800/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-xs">Prizes</span>
                    <Trophy className="w-3 h-3 text-yellow-400" />
                  </div>
                  <p className="text-sm font-bold text-yellow-400">${(sponsor.cashPrizes.totalAwarded / 1000).toFixed(0)}K</p>
                </div>
                
                <div className="bg-gray-800/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-xs">Interns</span>
                    <GraduationCap className="w-3 h-3 text-blue-400" />
                  </div>
                  <p className="text-sm font-bold text-blue-400">{sponsor.internshipProgram.positions}</p>
                </div>
              </div>

              {/* Salary Info */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Intern Salary:</span>
                  <span className="text-green-400 font-semibold text-sm">{sponsor.internshipProgram.salary}</span>
                </div>
              </div>

              {/* Sponsorship Type */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">Sponsorship Focus</p>
                <p className="text-sm text-white">{sponsor.sponsorshipType}</p>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-colors">
                  Apply Now
                </button>
                <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Company Count by Tier */}
        <div className="mt-12 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Sponsorship Tiers</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Diamond', 'Platinum', 'Gold', 'Silver'].map((tier) => {
              const tierSponsors = corporateSponsors.filter(s => s.tier === tier);
              const avgPrizes = tierSponsors.length > 0 
                ? tierSponsors.reduce((sum, s) => sum + s.cashPrizes.totalAwarded, 0) / tierSponsors.length 
                : 0;
              
              return (
                <div key={tier} className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${getTierColor(tier)} flex items-center justify-center text-2xl`}>
                    {getTierBadge(tier)}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{tier}</h4>
                  <p className="text-gray-400 text-sm mb-2">{tierSponsors.length} companies</p>
                  <p className="text-gray-300 text-xs">
                    Avg: ${(avgPrizes / 1000).toFixed(0)}K prizes
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateSponsorDashboard;