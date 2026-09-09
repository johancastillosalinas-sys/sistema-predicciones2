'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { 
  Building2, 
  TrendingUp, 
  BookOpen, 
  Users, 
  Shield, 
  Edit3, 
  Eye, 
  ChevronDown, 
  RotateCcw,
  Sparkles,
  LayoutDashboard,
  LogOut
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, currentRole, switchUser, logout } = useAuth();
  const { users, invitations, resetToDefaults } = useData();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Evita errores si no hay usuario autenticado
  if (!currentUser) return null;

  const pendingInvitesCount = invitations.filter((i) => i.status === 'PENDING').length;

  const navLinks = [
    { href: '/', label: 'Inicio', icon: LayoutDashboard },
    { href: '/predictor', label: 'Predictor de Precios', icon: TrendingUp },
    { href: '/docs', label: 'Central de Información', icon: BookOpen },
    { 
      href: '/colaboradores', 
      label: 'Colaboradores', 
      icon: Users,
      badge: pendingInvitesCount > 0 ? pendingInvitesCount : null
    },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
            <Shield className="w-3 h-3 text-amber-400" /> Admin
          </span>
        );
      case 'EDITOR':
        return (
          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 font-semibold">
            <Edit3 className="w-3 h-3 text-sky-400" /> Tasador / Editor
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-700/40 border border-slate-600/40 text-slate-300 font-medium">
            <Eye className="w-3 h-3 text-slate-400" /> Inversionista (Lector)
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              <Building2 className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white tracking-tight">InmoPredict</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">
                  Hub CMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Inteligencia Inmobiliaria & Colaboradores</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge !== null && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Role Simulator & Logout */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover border border-slate-700"
              />
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                    {currentUser.name ? currentUser.name.split(' ')[0] : 'Usuario'}
                  </span>
                  {getRoleBadge(currentRole)}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-800 bg-[#0d131f] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-800/80">
                  <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Simulador de Roles (Para Sustentación)
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cambia de usuario para demostrar permisos a tu profesor:
                  </p>
                </div>

                <div className="py-1.5 space-y-1 max-h-56 overflow-y-auto">
                  {users.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-500/15 border border-blue-500/30'
                            : 'hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                            alt={u.name}
                            className="w-6 h-6 rounded-md object-cover"
                          />
                          <div className="truncate">
                            <p className="font-semibold text-white truncate">{u.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>
                        {getRoleBadge(u.role)}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-800/80 mt-1 space-y-1">
                  <button
                    onClick={() => {
                      resetToDefaults();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restablecer datos de prueba</span>
                  </button>

                  {/* Botón Cerrar Sesión dentro del Dropdown */}
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition cursor-pointer font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botón Cerrar Sesión directo */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}