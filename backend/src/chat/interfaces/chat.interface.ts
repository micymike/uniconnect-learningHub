export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface StudyMate {
  id: string;
  userId: string;
  studyMateId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
}

export interface UserStatus {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
  isTyping: boolean;
  typingTo?: string;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  createdAt: Date;
}