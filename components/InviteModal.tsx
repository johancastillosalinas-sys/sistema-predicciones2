'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { UserRole, Invitation } from '@/types';
import { Mail, Shield, Check, Copy, ExternalLink, X, Send, AlertCircle } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const { inviteCollaborator } = useData();
  const { currentUser } = useAuth();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('EDITOR');
  const [error, setError] = useState<string | null>(null);
  const [generatedInvite, setGeneratedInvite] = useState<Invitation | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    // Se agrega encadenamiento opcional y fallback para evitar el error de TypeScript
    const inviterName = currentUser?.name || 'Administrador';
    const result = inviteCollaborator(email, role, inviterName);
    
    if (!result.success) {
      setError(result.error || 'Ocurrió un error al generar la invitación.');
      return;
    }

    if (result.invitation) {
      setGeneratedInvite(result.invitation);
    }
  };

  const handleReset = () => {
    setEmail('');
    setRole('EDITOR');
    setError(null);
    setGeneratedInvite(null);
    setCopied(false);
    onClose();
  };

  const inviteUrl = typeof window !== 'undefined' && generatedInvite
    ? `${window.location.origin}/invite?token=${generatedInvite.token}`
    : `http://localhost:3000/invite?token=${generatedInvite?.token || ''}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0d131f] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Invitar Colaborador por Correo</h2>
              <p className="text-xs text-slate-400">Control de acceso estilo GitHub para la plataforma inmobiliaria</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!generatedInvite ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-300 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Correo del Colaborador o Evaluador
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ej: profesor.evaluador@universidad.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  Se generará un token criptográfico único con 7 días de validez.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Asignar Rol de Acceso
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Editor / Tasador */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      role === 'EDITOR'
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'border-slate-800 bg-slate-950/40 hover:bg-slate-900/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="EDITOR"
                      checked={role === 'EDITOR'}
                      onChange={() => setRole('EDITOR')}
                      className="mt-1 text-blue-500 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">Tasador / Analista (Editor)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                          Recomendado
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Puede ejecutar predicciones, redactar informes técnicos en el CMS y guardar versiones con commits.
                      </p>
                    </div>
                  </label>

                  {/* Reader / Inversionista */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      role === 'READER'
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'border-slate-800 bg-slate-950/40 hover:bg-slate-900/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="READER"
                      checked={role === 'READER'}
                      onChange={() => setRole('READER')}
                      className="mt-1 text-blue-500 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-white">Inversionista / Cliente (Lector)</span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Acceso a consultas de precios y lectura de estudios de mercado. Sin permisos de edición.
                      </p>
                    </div>
                  </label>

                  {/* Admin */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      role === 'ADMIN'
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'border-slate-800 bg-slate-950/40 hover:bg-slate-900/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="ADMIN"
                      checked={role === 'ADMIN'}
                      onChange={() => setRole('ADMIN')}
                      className="mt-1 text-blue-500 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">Administrador</span>
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Control total del sistema, invitar miembros y configurar datasets.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Emitir Invitación</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-emerald-200">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>¡Invitación Registrada Exitosamente!</span>
                </div>
                <p className="text-xs text-emerald-300/80 mt-1">
                  Se ha generado el acceso para <strong className="text-white">{generatedInvite.email}</strong> con rol <strong className="text-white">{generatedInvite.role}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Enlace Mágico de Invitación
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono text-blue-300 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium transition cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Email simulation preview */}
              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/60 pb-2 mb-2">
                  <span>Simulación de Envío por Correo Electrónico</span>
                  <span className="font-mono text-emerald-400">no-reply@inmopredict.pe</span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-300">
                  <p><strong className="text-white">Para:</strong> {generatedInvite.email}</p>
                  <p><strong className="text-white">Asunto:</strong> {currentUser?.name || 'El Administrador'} te ha invitado como {generatedInvite.role} a InmoPredict Hub</p>
                  <p className="text-slate-400 pt-1 text-[11px]">
                    &quot;Has recibido autorización para acceder a la Central de Información y Predictor Inmobiliario. Abre el enlace para activar tu cuenta.&quot;
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <a
                  href={`/invite?token=${generatedInvite.token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 underline underline-offset-4"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Probar enlace de invitación ahora</span>
                </a>

                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}