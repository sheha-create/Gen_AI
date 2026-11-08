import React from 'react';
import { ProfileData } from '../../types/resume';
import { User, Briefcase, Mail, Phone, MapPin, Globe, Linkedin, AlertCircle } from 'lucide-react';

interface ProfileEditorProps {
  profile: ProfileData;
  onChange: (updated: ProfileData) => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onChange }) => {
  const handleChange = (field: keyof ProfileData, value: string) => {
    onChange({
      ...profile,
      [field]: value
    });
  };

  const hasMissingContact = !profile.email.trim() || !profile.phone.trim();

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Personal & Contact Profile</h3>
            <p className="text-xs text-slate-500">Your core contact details displayed at the top of your resume.</p>
          </div>
        </div>

        {hasMissingContact && (
          <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md text-xs font-medium border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Missing direct contact details</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full text-sm pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
            />
            <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Professional Title */}
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Professional Title / Specialization <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={profile.professionalTitle}
              onChange={(e) => handleChange('professionalTitle', e.target.value)}
              placeholder="e.g. Senior Full Stack Software Engineer"
              className="w-full text-sm pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
            />
            <Briefcase className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="alex.morgan@example.com"
              className="w-full text-sm pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 019-2834"
              className="w-full text-sm pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
            />
            <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            City, Region / Location
          </label>
          <div className="relative">
            <input
              type="text"
              value={profile.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="San Francisco, CA or Remote"
              className="w-full text-sm pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
            />
            <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Portfolio / Website */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Portfolio / Personal Website URL
          </label>
          <div className="relative">
            <input
              type="url"
              value={profile.portfolioUrl}
              onChange={(e) => handleChange('portfolioUrl', e.target.value)}
              placeholder="https://alexmorgan.dev"
              className="w-full text-sm pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
            />
            <Globe className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* LinkedIn */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            LinkedIn Profile URL
          </label>
          <div className="relative">
            <input
              type="url"
              value={profile.linkedInUrl}
              onChange={(e) => handleChange('linkedInUrl', e.target.value)}
              placeholder="https://linkedin.com/in/alexmorgan"
              className="w-full text-sm pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
            />
            <Linkedin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
