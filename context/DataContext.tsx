'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Invitation, DocItem, ActivityLog, UserRole, DocCategory, DocumentVersion } from '@/types';
import { INITIAL_USERS, INITIAL_INVITATIONS, INITIAL_DOCS, INITIAL_LOGS } from '@/lib/inmoData';

interface DataContextType {
  users: User[];
  invitations: Invitation[];
  docs: DocItem[];
  logs: ActivityLog[];
  inviteCollaborator: (email: string, role: UserRole, invitedByName: string) => { success: boolean; invitation?: Invitation; error?: string };
  revokeInvitation: (id: string) => void;
  acceptInvitation: (token: string, name: string) => { success: boolean; user?: User; error?: string };
  changeUserRole: (userId: string, newRole: UserRole) => void;
  removeUser: (userId: string) => void;
  createDocument: (data: { title: string; description: string; category: DocCategory; tags: string[]; content: string; commitMessage: string; authorId: string; authorName: string }) => DocItem;
  updateDocument: (id: string, data: { title?: string; description?: string; category?: DocCategory; tags?: string[]; content: string; commitMessage: string; editorId: string; editorName: string }) => DocItem | null;
  deleteDocument: (id: string) => void;
  logPrediction: (descripcion: string, authorName: string) => void;
  resetToDefaults: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'inmopredict_hub_';

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [invitations, setInvitations] = useState<Invitation[]>(INITIAL_INVITATIONS);
  const [docs, setDocs] = useState<DocItem[]>(INITIAL_DOCS);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem(STORAGE_KEY_PREFIX + 'users');
      const savedInvites = localStorage.getItem(STORAGE_KEY_PREFIX + 'invitations');
      const savedDocs = localStorage.getItem(STORAGE_KEY_PREFIX + 'docs');
      const savedLogs = localStorage.getItem(STORAGE_KEY_PREFIX + 'logs');

      if (savedUsers) setUsers(JSON.parse(savedUsers));
      if (savedInvites) setInvitations(JSON.parse(savedInvites));
      if (savedDocs) setDocs(JSON.parse(savedDocs));
      if (savedLogs) setLogs(JSON.parse(savedLogs));
    } catch (e) {
      console.error('Error loading inmoData from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'users', JSON.stringify(users));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'invitations', JSON.stringify(invitations));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'docs', JSON.stringify(docs));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Error saving inmoData to localStorage', e);
    }
  }, [users, invitations, docs, logs, isLoaded]);

  const addLog = (type: ActivityLog['type'], description: string, authorName: string) => {
    const newLog: ActivityLog = {
      id: 'act-' + Date.now(),
      type,
      description,
      authorName,
      timestamp: 'Justo ahora',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const inviteCollaborator = (email: string, role: UserRole, invitedByName: string) => {
    const cleanEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Este correo ya pertenece a un miembro activo.' };
    }

    if (invitations.some((i) => i.email.toLowerCase() === cleanEmail && i.status === 'PENDING')) {
      return { success: false, error: 'Ya existe una invitación pendiente para este correo.' };
    }

    const token = 'inv_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    const newInvite: Invitation = {
      id: 'inv-' + Date.now(),
      email: cleanEmail,
      role,
      token,
      status: 'PENDING',
      invitedBy: invitedByName,
      createdAt: new Date().toISOString(),
      expiresAt: expires.toISOString(),
    };

    setInvitations((prev) => [newInvite, ...prev]);
    addLog('INVITATION', `${invitedByName} envió una invitación por correo a ${cleanEmail} con rol ${role}.`, invitedByName);

    return { success: true, invitation: newInvite };
  };

  const revokeInvitation = (id: string) => {
    const target = invitations.find((i) => i.id === id);
    if (!target) return;

    setInvitations((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: 'REVOKED' } : inv))
    );
    addLog('INVITATION', `Se revocó la invitación para ${target.email}.`, 'Admin');
  };

  const acceptInvitation = (token: string, name: string) => {
    const invite = invitations.find((i) => i.token === token);
    if (!invite) {
      return { success: false, error: 'El enlace de invitación no es válido o ha expirado.' };
    }
    if (invite.status !== 'PENDING') {
      return { success: false, error: `Esta invitación ya fue ${invite.status === 'ACCEPTED' ? 'aceptada' : 'revocada'}.` };
    }

    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: name.trim() || invite.email.split('@')[0],
      email: invite.email,
      role: invite.role,
      title: invite.role === 'EDITOR' ? 'Tasador Inmobiliario' : invite.role === 'ADMIN' ? 'Administrador' : 'Inversionista',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(invite.email)}`,
      joinedAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [...prev, newUser]);
    setInvitations((prev) =>
      prev.map((i) => (i.id === invite.id ? { ...i, status: 'ACCEPTED' } : i))
    );

    addLog('MEMBER', `${newUser.name} aceptó la invitación por correo y se unió como ${newUser.role}.`, newUser.name);

    return { success: true, user: newUser };
  };

  const changeUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    const user = users.find((u) => u.id === userId);
    if (user) {
      addLog('MEMBER', `Se actualizó el rol de ${user.name} a ${newRole}.`, 'Admin');
    }
  };

  const removeUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    addLog('MEMBER', `Se revocó el acceso a ${user.name} (${user.email}).`, 'Admin');
  };

  const createDocument = (data: {
    title: string;
    description: string;
    category: DocCategory;
    tags: string[];
    content: string;
    commitMessage: string;
    authorId: string;
    authorName: string;
  }) => {
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'reporte-' + Date.now();

    const initialVersion: DocumentVersion = {
      id: 'ver-' + Date.now(),
      version: 1,
      title: data.title,
      content: data.content,
      commitMessage: data.commitMessage || 'Commit inicial: publicación del informe',
      authorId: data.authorId,
      authorName: data.authorName,
      createdAt: new Date().toISOString(),
    };

    const newDoc: DocItem = {
      id: 'doc-' + Date.now(),
      slug,
      title: data.title,
      description: data.description,
      category: data.category,
      tags: data.tags,
      content: data.content,
      authorId: data.authorId,
      authorName: data.authorName,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      currentVersion: 1,
      versions: [initialVersion],
    };

    setDocs((prev) => [newDoc, ...prev]);
    addLog('DOC', `${data.authorName} publicó el informe de mercado "${data.title}" (v1).`, data.authorName);
    return newDoc;
  };

  const updateDocument = (
    id: string,
    data: {
      title?: string;
      description?: string;
      category?: DocCategory;
      tags?: string[];
      content: string;
      commitMessage: string;
      editorId: string;
      editorName: string;
    }
  ) => {
    let updatedItem: DocItem | null = null;

    setDocs((prev) =>
      prev.map((doc) => {
        if (doc.id !== id) return doc;

        const nextVersionNum = doc.currentVersion + 1;
        const newVersion: DocumentVersion = {
          id: 'ver-' + Date.now(),
          version: nextVersionNum,
          title: data.title || doc.title,
          content: data.content,
          commitMessage: data.commitMessage || `Actualización v${nextVersionNum}`,
          authorId: data.editorId,
          authorName: data.editorName,
          createdAt: new Date().toISOString(),
        };

        updatedItem = {
          ...doc,
          title: data.title || doc.title,
          description: data.description !== undefined ? data.description : doc.description,
          category: data.category || doc.category,
          tags: data.tags || doc.tags,
          content: data.content,
          currentVersion: nextVersionNum,
          updatedAt: new Date().toISOString().split('T')[0],
          versions: [...doc.versions, newVersion],
        };

        return updatedItem;
      })
    );

    if (updatedItem) {
      addLog('DOC', `${data.editorName} guardó el commit "${data.commitMessage}" en "${(updatedItem as DocItem).title}" (v${(updatedItem as DocItem).currentVersion}).`, data.editorName);
    }

    return updatedItem;
  };

  const deleteDocument = (id: string) => {
    const doc = docs.find((d) => d.id === id);
    if (!doc) return;
    setDocs((prev) => prev.filter((d) => d.id !== id));
    addLog('DOC', `Se eliminó el informe "${doc.title}".`, 'Admin');
  };

  const logPrediction = (descripcion: string, authorName: string) => {
    addLog('PREDICTION', descripcion, authorName);
  };

  const resetToDefaults = () => {
    setUsers(INITIAL_USERS);
    setInvitations(INITIAL_INVITATIONS);
    setDocs(INITIAL_DOCS);
    setLogs(INITIAL_LOGS);
    localStorage.clear();
  };

  return (
    <DataContext.Provider
      value={{
        users,
        invitations,
        docs,
        logs,
        inviteCollaborator,
        revokeInvitation,
        acceptInvitation,
        changeUserRole,
        removeUser,
        createDocument,
        updateDocument,
        deleteDocument,
        logPrediction,
        resetToDefaults,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe utilizarse dentro de un DataProvider');
  }
  return context;
}

