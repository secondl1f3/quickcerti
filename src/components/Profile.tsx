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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="px-6 py-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span>Profile updated successfully!</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Profile Content */}
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div 
                    className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                    onClick={isEditing ? handleAvatarClick : undefined}
                  >
                    {formData.avatarUrl ? (
                      <img 
                        src={formData.avatarUrl} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
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
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {profile?.fullName || 'User Name'}
                  </h3>
                  <p className="text-gray-600">{profile?.email}</p>
                  {profile && (
                    <p className="text-sm text-emerald-600 font-medium">
                      Points Balance: {profile.pointsBalance}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                        isEditing 
                          ? 'border-gray-300 bg-white' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                        isEditing 
                          ? 'border-gray-300 bg-white' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                        isEditing 
                          ? 'border-gray-300 bg-white' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Points Information (Read-only) */}
                {profile && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Points Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-emerald-600">{profile.pointsBalance}</p>
                        <p className="text-xs text-gray-600">Current Balance</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{profile.totalPointsPurchased}</p>
                        <p className="text-xs text-gray-600">Total Purchased</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-orange-600">{profile.totalPointsUsed}</p>
                        <p className="text-xs text-gray-600">Total Used</p>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => navigate('/transaction-history')}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center justify-center space-x-1 mx-auto transition-colors"
                      >
                        <History className="w-4 h-4" />
                        <span>View Transaction History</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg transition-colors"
                    >
                      {isUpdating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};