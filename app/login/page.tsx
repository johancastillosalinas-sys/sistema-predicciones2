'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { User, UserRole } from '@/types';
import { 
  Building2, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  Mail, 
  User as UserIcon, 
  ArrowRight,
  BarChart2
} from 'lucide-react';

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('EDITOR');

  const { setCurrentUserDirect } = useAuth();
  const { users, inviteCollaborator } = useData();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = users.find((u: User) => u.email.toLowerCase() === normalizedEmail);

    if (isRegistering) {
      if (existingUser) {
        alert('Este correo ya está registrado. Por favor, inicia sesión.');
        setIsRegistering(false);
        return;
      }

      const userName = name.trim() || email.split('@')[0];
      inviteCollaborator(normalizedEmail, role, userName);

      const newUser: User = {
        id: Date.now().toString(),
        name: userName,
        email: normalizedEmail,
        role: role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`,
        joinedAt: new Date().toISOString().split('T')[0],
      };

      setCurrentUserDirect(newUser);
      router.push('/');
    } else {
      // Si el usuario existe en el DataContext se usa su información
      if (existingUser) {
        setCurrentUserDirect(existingUser);
        router.push('/');
      } else if (normalizedEmail.length > 0) {
        // Permite la entrada creando una sesión temporal con el correo ingresado
        const tempUser: User = {
          id: Date.now().toString(),
          name: email.split('@')[0],
          email: normalizedEmail,
          role: 'ADMIN',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedEmail}`,
          joinedAt: new Date().toISOString().split('T')[0],
        };
        setCurrentUserDirect(tempUser);
        router.push('/');
      } else {
        alert('Por favor, ingresa un correo electrónico válido.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070A12] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Orbs Effect */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-[#0D1322]/80 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-2xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative z-10">
        
        {/* Left Column: Visual & Value Proposition */}
        <div className="lg:col-span-5 p-8 lg:p-12 bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-[#070A12] border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between">
          <div>
            {/* Brand Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-blue-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white block">InmoPredict</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Hub CMS v2.0
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              Inteligencia Inmobiliaria & Control de Acceso
            </h1>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Plataforma de predicción de precios algorítmica, informes periciales y gestión colaborativa de permisos.
            </p>

            {/* Feature Highlights */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-slate-200">Motor Predictor</p>
                  <p className="text-slate-400">Modelos de regresión en tiempo real</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-slate-200">Roles estilo GitHub</p>
                  <p className="text-slate-400">Administradores, Tasadores e Inversionistas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stat Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              Dataset Operativo
            </span>
            <span className="font-mono text-slate-300">v2.4 LTS</span>
          </div>
        </div>

        {/* Right Column: Form Container */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-6">
            
            {/* Form Title */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isRegistering ? 'Nuevo Registro' : 'Acceso al Sistema'}</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {isRegistering ? 'Crear una Cuenta' : 'Iniciar Sesión'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isRegistering 
                  ? 'Completa tus datos para asignarte un rol en el sistema' 
                  : 'Ingresa con tu correo institucional o de colaborador'}
              </p>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Carlos Mendoza"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@inmopredict.pe"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    required
                  />
                </div>
              </div>

              {isRegistering && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Rol de Acceso
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  >
                    <option value="EDITOR">Tasador / Analista (Editor)</option>
                    <option value="READER">Inversionista (Lector)</option>
                    <option value="ADMIN">Administrador Central (Admin)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span>{isRegistering ? 'Completar Registro' : 'Ingresar al Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Form Toggle */}
            <div className="pt-4 border-t border-slate-800/80 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setEmail('');
                  setName('');
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition cursor-pointer"
              >
                {isRegistering 
                  ? '¿Ya posees una cuenta? Inicia Sesión' 
                  : '¿No tienes cuenta? Registra un correo nuevo'}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}