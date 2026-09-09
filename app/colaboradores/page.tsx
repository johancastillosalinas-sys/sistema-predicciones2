'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { 
  Users, 
  Mail, 
  Shield, 
  Clock, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  UserPlus, 
  HelpCircle,
  Edit3,
  Eye
} from 'lucide-react';
import InviteModal from '@/components/InviteModal';

export default function ColaboradoresPage() {
  const { users, invitations, revokeInvitation, changeUserRole, removeUser } = useData();
  const { currentUser, isAdmin } = useAuth();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Validación temprana para evitar errores de tipo si currentUser es undefined
  if (!currentUser) {
    return null;
  }

  const pendingInvites = invitations.filter((i) => i.status === 'PENDING');
  const pastInvites = invitations.filter((i) => i.status !== 'PENDING');

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/invite?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
            <Shield className="w-3 h-3 text-amber-400" /> Administrador
          </span>
        );
      case 'EDITOR':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-semibold">
            <Edit3 className="w-3 h-3 text-blue-400" /> Tasador / Editor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-700/40 border border-slate-600/40 text-slate-300 font-medium">
            <Eye className="w-3 h-3 text-slate-400" /> Inversionista (Lector)
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Colaboradores & Control de Acceso
              </h1>
              <p className="text-sm text-slate-400">
                Modelo de invitaciones por correo electrónico estilo GitHub Organizations
              </p>
            </div>
          </div>
        </div>

        <div>
          {isAdmin ? (
            <button
              onClick={() => setInviteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invitar por Correo</span>
            </button>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-400">
              Solo el Administrador puede enviar invitaciones
            </div>
          )}
        </div>
      </div>

      {/* Philosophy Banner */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              ¿Cómo sustentar este módulo ante tu profesor?
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Tú eres el <strong>Administrador (Owner)</strong> de la plataforma. Para que cualquier tasador, estudiante o profesor acceda, debes ingresar su correo y asignarle un rol. El sistema crea un <strong>token único</strong> y un enlace privado. Al abrir el enlace, el usuario activa su cuenta y queda vinculado con sus permisos correspondientes.
            </p>
          </div>
        </div>
        <button
          onClick={() => setInviteModalOpen(true)}
          disabled={!isAdmin}
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 shrink-0 disabled:opacity-50 cursor-pointer"
        >
          Emitir nueva invitación &rarr;
        </button>
      </div>

      {/* SECTION 1: Pending Invitations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Invitaciones Pendientes por Correo</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
              {pendingInvites.length} en espera
            </span>
          </div>
        </div>

        {pendingInvites.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/70 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 border-b border-slate-800">Correo Electrónico</th>
                  <th className="px-5 py-3.5 border-b border-slate-800">Rol Asignado</th>
                  <th className="px-5 py-3.5 border-b border-slate-800">Estado</th>
                  <th className="px-5 py-3.5 border-b border-slate-800">Invitado por</th>
                  <th className="px-5 py-3.5 border-b border-slate-800">Expira en</th>
                  <th className="px-5 py-3.5 border-b border-slate-800 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pendingInvites.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-4 font-mono text-sm text-white font-medium">
                      {inv.email}
                    </td>
                    <td className="px-5 py-4">
                      {getRoleBadge(inv.role)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                        PENDING
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {inv.invitedBy}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCopyLink(inv.token)}
                          title="Copiar enlace de invitación"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition cursor-pointer"
                        >
                          {copiedToken === inv.token ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copiar Link</span>
                            </>
                          )}
                        </button>

                        <a
                          href={`/invite?token=${inv.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Abrir enlace de activación para probar"
                          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {isAdmin && (
                          <button
                            onClick={() => revokeInvitation(inv.id)}
                            title="Revocar invitación"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/30 text-center">
            <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No hay invitaciones pendientes.</p>
            {isAdmin && (
              <button
                onClick={() => setInviteModalOpen(true)}
                className="mt-3 text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                + Enviar la primera invitación por correo
              </button>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: Active Members */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Miembros con Acceso Autorizado</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              {users.length} miembros activos
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/70 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 border-b border-slate-800">Colaborador</th>
                <th className="px-5 py-3.5 border-b border-slate-800">Correo Electrónico</th>
                <th className="px-5 py-3.5 border-b border-slate-800">Rol en la Organización</th>
                <th className="px-5 py-3.5 border-b border-slate-800">Fecha de Ingreso</th>
                <th className="px-5 py-3.5 border-b border-slate-800 text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => {
                const isCurrent = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{u.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold">
                                Tú
                              </span>
                            )}
                          </div>
                          {u.title && (
                            <p className="text-xs text-slate-400">{u.title}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-300">
                      {u.email}
                    </td>
                    <td className="px-5 py-4">
                      {isAdmin && !isCurrent ? (
                        <select
                          value={u.role}
                          onChange={(e) => changeUserRole(u.id, e.target.value as UserRole)}
                          className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="ADMIN">Administrador</option>
                          <option value="EDITOR">Tasador / Editor</option>
                          <option value="READER">Inversionista / Lector</option>
                        </select>
                      ) : (
                        getRoleBadge(u.role)
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {u.joinedAt}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {isAdmin && !isCurrent ? (
                        <button
                          onClick={() => removeUser(u.id)}
                          title="Revocar acceso y expulsar del espacio"
                          className="flex items-center gap-1.5 ml-auto px-2.5 py-1 rounded-lg text-xs text-rose-400 hover:bg-rose-500/15 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revocar Acceso</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 italic">
                          {isCurrent ? 'Propietario' : 'Sin cambios'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: Past / History */}
      {pastInvites.length > 0 && (
        <div className="space-y-3 pt-4 opacity-80">
          <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Historial de Invitaciones Finalizadas</span>
          </h3>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 overflow-hidden text-xs">
            {pastInvites.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-5 py-2.5 border-b border-slate-800/60 last:border-0">
                <span className="font-mono text-slate-300">{inv.email}</span>
                <span className="text-slate-400">Rol: {inv.role}</span>
                <span className={`font-semibold ${inv.status === 'ACCEPTED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {inv.status === 'ACCEPTED' ? '✓ Aceptada' : '✗ Revocada'}
                </span>
                <span className="text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
    </div>
  );
}