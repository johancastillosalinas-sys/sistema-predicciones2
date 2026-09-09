export type UserRole = 'ADMIN' | 'EDITOR' | 'READER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title?: string;
  avatar: string;
  joinedAt: string;
  isCurrentUser?: boolean;
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  token: string;
  status: InvitationStatus;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
}

export interface DocumentVersion {
  id: string;
  version: number;
  title: string;
  content: string;
  commitMessage: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export type DocCategory = 'Metodología' | 'Tasación' | 'Estudio de Mercado' | 'Plusvalía' | 'Regulaciones';

export interface DocItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: DocCategory;
  tags: string[];
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  currentVersion: number;
  versions: DocumentVersion[];
}

export interface ActivityLog {
  id: string;
  type: 'INVITATION' | 'PREDICTION' | 'DOC' | 'MEMBER';
  description: string;
  authorName: string;
  timestamp: string;
}

