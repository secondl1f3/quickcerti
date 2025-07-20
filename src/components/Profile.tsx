import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Camera, Save, AlertCircle, CheckCircle, Loader2, Edit3, Phone, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { UpdateUserProfileRequest } from '../services/userService';

interface ProfileProps {
  onClose?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { profile, isLoading, isUpdating, error, fetchUserProfile, updateProfile, clearError } = useUserStore();
  
  const [formData, setFormData] = useState<UpdateUserProfileRequest>({
    email: '',
    fullName: '',
    phone: '',
    avatarUrl: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        email: profile.email || '',
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        avatarUrl: profile.avatarUrl || '',
      });
    }
  }, [profile]);

  // Clear error when component unmounts or when starting new actions
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatarUrl: previewUrl }));
      
      // In a real implementation, you would upload the file here
      // For now, we'll use a placeholder URL
      // uploadAvatar(file).then(url => {
      //   setFormData(prev => ({ ...prev, avatarUrl: url }));
      // });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      return;
    }

    try {
      await updateProfile(user.id, formData);
      setShowSuccess(true);
      setIsEditing(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      // Error is handled by the store
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        email: profile.email || '',
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        avatarUrl: profile.avatarUrl || '',
      });
    }
    setIsEditing(false);
    clearError();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
            <p className="text-gray-500 mt-1">Manage your profile, and preferences.</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Left Panel: Avatar and Info */}
            <div className="md:col-span-1 p-8 bg-gray-50 border-r border-gray-200">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div 
                    className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center ring-4 ring-white shadow-md transition-transform transform hover:scale-105"
                    onClick={isEditing ? handleAvatarClick : undefined}
                  >
                    {formData.avatarUrl ? (
                      <img 
                        src={formData.avatarUrl} 
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="absolute bottom-1 right-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-3 shadow-md transition-colors"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {profile?.fullName || 'User Name'}
                </h2>
                <p className="text-gray-500 mt-1">{profile?.email}</p>
                {profile && (
                  <div className="mt-4 bg-emerald-100 text-emerald-800 font-bold py-2 px-4 rounded-full text-sm">
                    Points Balance: {profile.pointsBalance}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Form */}
            <div className="md:col-span-2 p-8">
              {/* Success Message */}
              {showSuccess && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                  <div className="flex items-center space-x-3 text-green-800">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-medium">Profile updated successfully!</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                  <div className="flex items-center space-x-3 text-red-800">
                    <AlertCircle className="w-6 h-6" />
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200 mt-8">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 transform hover:scale-105"
                      >
                        <Edit3 className="-ml-1 mr-2 h-5 w-5" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex items-center space-x-4">
                        <button
                          type="submit"
                          disabled={isUpdating}
                          className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 disabled:cursor-wait transition-all duration-300"
                        >
                          {isUpdating ? (
                            <Loader2 className="-ml-1 mr-2 h-5 w-5 animate-spin" />
                          ) : (
                            <Save className="-ml-1 mr-2 h-5 w-5" />
                          )}
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="inline-flex items-center justify-center px-6 py-2.5 border border-gray-300 text-sm font-bold rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/transaction-history')}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-gray-300 text-sm font-bold rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300"
                  >
                    <History className="-ml-1 mr-2 h-5 w-5" />
                    Transaction History
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};