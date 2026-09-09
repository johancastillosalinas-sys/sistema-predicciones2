'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Mail, CheckCircle2, AlertCircle, ArrowRight, Building2, Key } from 'lucide-react';
import Link from 'next/link';

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const { invitations, acceptInvitation } = useData();
  const { setCurrentUserDirect } = useAuth();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const invite = invitations.find((i) => i.token === token);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const result = acceptInvitation(token, name);
    if (!result.success || !result.user) {
      setError(result.error || 'No se pudo procesar la invitación.');
      return;
    }

    setCurrentUserDirect(result.user);
    setSuccess(true);

    setTimeout(() => {
      router.push('/predictor');
    }, 2000);
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl border border-slate-800 bg-slate-900/60 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white">Token de Invitación Ausente</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Para acceder a InmoPredict Hub necesitas un enlace con token válido emitido por el Administrador.
        </p>
        <Link
          href="/colaboradores"
          className="inline-block mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
        >
          Ir al Panel de Colaboradores
        </Link>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl border border-rose-500/30 bg-rose-950/20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white">Invitación Inválida</h1>
        <p className="text-xs text-rose-300/80 leading-relaxed">
          El token suministrado no se encuentra en el registro de invitaciones o fue revocado por el administrador.
        </p>
        <Link
          href="/"
          className="inline-block mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
        >
          Volver al Inicio
        </Link>
      </div>
    );
  }

  if (invite.status !== 'PENDING') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl border border-slate-800 bg-slate-900/60 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white">Esta invitación ya fue utilizada</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          La invitación para <strong className="text-white">{invite.email}</strong> ya se encuentra en estado <strong className="text-emerald-400">{invite.status}</strong>.
        </p>
        <Link
          href="/predictor"
          className="inline-block mt-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold"
        >
          Acceder al Predictor
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto my-8 p-6 sm:p-8 rounded-3xl border border-slate-800 bg-[#0d131f] shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
          <Building2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-white">Únete a InmoPredict Hub</h1>
        <p className="text-xs text-slate-400">
          Has sido invitado formalmente a colaborar en la plataforma de inteligencia inmobiliaria
        </p>
      </div>

      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-2 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <span className="text-slate-400">Invitado por:</span>
          <span className="font-semibold text-white">{invite.invitedBy}</span>
        </div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <span className="text-slate-400">Correo autorizado:</span>
          <span className="font-mono text-blue-400 font-medium">{invite.email}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Rol asignado:</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 border border-blue-500/30 text-blue-300">
            {invite.role === 'ADMIN' ? 'Administrador' : invite.role === 'EDITOR' ? 'Tasador / Editor' : 'Inversionista (Lector)'}
          </span>
        </div>
      </div>

      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tu Nombre Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej: Prof. Roberto Sánchez"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Crear Contraseña de Acceso
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Para la sustentación con el profesor, cualquier clave mayor a 4 caracteres es aceptada.
            </p>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-400 hover:to-emerald-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition cursor-pointer"
          >
            <span>Aceptar Invitación y Activar Acceso</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-center space-y-3 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">¡Bienvenido a InmoPredict!</h2>
          <p className="text-xs text-emerald-300/90">
            Tu cuenta ha sido activada con rol <strong>{invite.role}</strong>. Redirigiéndote al motor de predicción...
          </p>
        </div>
      )}
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-400 text-sm">Cargando datos de invitación...</div>}>
      <InviteContent />
    </Suspense>
  );
}

