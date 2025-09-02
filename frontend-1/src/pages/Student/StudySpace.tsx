import React, { useState, useEffect } from 'react';
import StudyChat from './StudyChat';
import SharedNotes from './SharedNotes';
import StudySessions from './StudySessions';
import 'boxicons/css/boxicons.min.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://uniconnect-learninghub-backend.onrender.com/api';

interface StudyPartner {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

const StudySpace: React.FC = () => {
  const [partners, setPartners] = useState<StudyPartner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<StudyPartner | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'schedule' | 'group'>('chat');
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<StudyPartner[]>([]);
  const [groupMembers, setGroupMembers] = useState<StudyPartner[]>([]);

  useEffect(() => {
    fetchStudyPartners();
    fetchAvailableUsers();
  }, []);

  const fetchStudyPartners = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/study-partners`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setPartners(data.partners || []);
      if (data.partners?.length > 0) {
        setSelectedPartner(data.partners[0]);
        fetchGroupMembers(data.partners[0].id);
      }
    } catch (error) {
      console.error('Error fetching study partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAvailableUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const fetchGroupMembers = async (partnerId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/study-groups/${partnerId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setGroupMembers(data.members || []);
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  };

  const inviteToGroup = async (userId: string) => {
    if (!selectedPartner) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/study-groups/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          partner_id: selectedPartner.id,
          invited_user_id: userId
        })
      });
      
      fetchGroupMembers(selectedPartner.id);
      setShowInviteModal(false);
    } catch (error) {
      console.error('Error inviting to group:', error);
    }
  };

  const selectPartner = (partner: StudyPartner) => {
    setSelectedPartner(partner);
    fetchGroupMembers(partner.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading study space...</p>
        </div>
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <i className="bx bx-group text-6xl text-gray-400 mb-4"></i>
          <h2 className="text-2xl font-bold mb-2">No Study Partners Yet</h2>
          <p className="text-gray-400 mb-6">Add study partners to access your shared study space</p>
          <a
            href="/student/find-partner"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Find Study Partners
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-col lg:flex-row">
      {/* Sidebar - Study Partners */}
      <div className={`${selectedPartner ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 bg-gray-800 border-b lg:border-b-0 lg:border-r border-gray-700 flex flex-col`}>
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Study Space</h1>
          <p className="text-gray-400 text-xs sm:text-sm">Collaborate with your study partners</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <h3 className="text-gray-400 text-xs sm:text-sm font-semibold mb-3">Study Partners</h3>
          {partners.map((partner) => (
            <div
              key={partner.id}
              onClick={() => selectPartner(partner)}
              className={`p-2 sm:p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                selectedPartner?.id === partner.id ? 'bg-orange-500' : 'hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <img
                  src={partner.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.full_name)}&background=ff6600&color=fff&size=40`}
                  alt={partner.full_name}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium text-sm sm:text-base truncate">{partner.full_name}</p>
                  <p className="text-gray-400 text-xs truncate">{partner.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className={`${selectedPartner ? 'flex' : 'hidden lg:flex'} flex-1 flex flex-col`}>
        {selectedPartner && (
          <>
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <button
                    onClick={() => setSelectedPartner(null)}
                    className="lg:hidden text-white hover:text-orange-500 mr-2 flex-shrink-0"
                  >
                    <i className="bx bx-arrow-back text-xl"></i>
                  </button>
                  <img
                    src={selectedPartner.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPartner.full_name)}&background=ff6600&color=fff&size=40`}
                    alt={selectedPartner.full_name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-white font-semibold text-sm sm:text-base truncate">{selectedPartner.full_name}</h2>
                    <p className="text-gray-400 text-xs sm:text-sm">Study Partner</p>
                  </div>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-700 rounded-lg p-1 flex-shrink-0">
                  {[
                    { id: 'chat', label: 'Chat', icon: 'bx-message-dots' },
                    { id: 'notes', label: 'Notes', icon: 'bx-note' },
                    { id: 'schedule', label: 'Schedule', icon: 'bx-calendar' },
                    { id: 'group', label: 'Group', icon: 'bx-group' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-2 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1 sm:space-x-2 ${
                        activeTab === tab.id
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-600'
                      }`}
                    >
                      <i className={`bx ${tab.icon} text-sm sm:text-base`}></i>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'chat' && (
                <div className="h-full">
                  <StudyChat partnerId={selectedPartner.id} />
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="h-full p-3 sm:p-6">
                  <SharedNotes partnerId={selectedPartner.id} partnerName={selectedPartner.full_name} />
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="h-full p-3 sm:p-6">
                  <StudySessions partnerId={selectedPartner.id} partnerName={selectedPartner.full_name} />
                </div>
              )}

              {activeTab === 'group' && (
                <div className="h-full p-3 sm:p-6">
                  <div className="bg-gray-800 rounded-lg h-full flex flex-col">
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold text-lg">Study Group</h3>
                          <p className="text-gray-400 text-sm">Manage your study group members</p>
                        </div>
                        <button
                          onClick={() => setShowInviteModal(true)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <i className="bx bx-user-plus"></i>
                          <span>Invite</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="space-y-3">
                        <div className="bg-gray-700 rounded-lg p-4 border border-orange-500">
                          <div className="flex items-center space-x-3">
                            <img
                              src={selectedPartner.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPartner.full_name)}&background=ff6600&color=fff&size=40`}
                              alt={selectedPartner.full_name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                              <p className="text-white font-medium">{selectedPartner.full_name}</p>
                              <p className="text-gray-400 text-sm">{selectedPartner.email}</p>
                            </div>
                            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs">Partner</span>
                          </div>
                        </div>
                        
                        {groupMembers.map((member) => (
                          <div key={member.id} className="bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=ff6600&color=fff&size=40`}
                                alt={member.full_name}
                                className="w-10 h-10 rounded-full"
                              />
                              <div className="flex-1">
                                <p className="text-white font-medium">{member.full_name}</p>
                                <p className="text-gray-400 text-sm">{member.email}</p>
                              </div>
                              <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">Member</span>
                            </div>
                          </div>
                        ))}
                        
                        {groupMembers.length === 0 && (
                          <div className="text-center text-gray-400 mt-8">
                            <i className="bx bx-group text-4xl mb-2"></i>
                            <p>No additional group members yet</p>
                            <p className="text-sm mt-1">Invite more people to expand your study group</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Invite to Study Group</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="bx bx-x text-xl"></i>
              </button>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {availableUsers.filter(user => 
                user.id !== selectedPartner?.id && 
                !groupMembers.some(member => member.id === user.id)
              ).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=ff6600&color=fff&size=32`}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-white font-medium text-sm">{user.full_name}</p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => inviteToGroup(user.id)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Invite
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudySpace;