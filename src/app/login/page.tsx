'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Droplets, 
  KeyRound, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  UserCheck, 
  Truck, 
  UserPlus,
  CheckCircle2,
  Delete
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'pin' | 'register' | 'email'>('pin');

  // PIN Login state
  const [pin, setPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<'ADMIN' | 'RIDER' | 'SUPER_ADMIN'>('ADMIN');
  const [regPin, setRegPin] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Standard Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // 1. PIN LOGIN HANDLER
  const handlePinSubmit = async (enteredPin?: string) => {
    const pinToUse = enteredPin || pin;
    if (!pinToUse || pinToUse.length < 4) {
      setPinError('Pakilagay ang iyong 4-digit PIN.');
      return;
    }

    setPinLoading(true);
    setPinError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        pin: pinToUse.trim(),
      });

      if (res?.error) {
        setPinError(res.error);
        setPinLoading(false);
        return;
      }

      // Check role to redirect
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      const role = sessionData?.user?.role;

      if (role === 'RIDER') {
        router.push('/rider');
      } else {
        router.push('/admin');
      }
      router.refresh();
    } catch (err: any) {
      setPinError('May aberya sa pag-login. Pakisubukang muli.');
      setPinLoading(false);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'clear') {
      setPin('');
      return;
    }
    if (val === 'backspace') {
      setPin((prev) => prev.slice(0, -1));
      return;
    }
    if (pin.length < 6) {
      const nextPin = pin + val;
      setPin(nextPin);
      if (nextPin.length === 4) {
        handlePinSubmit(nextPin);
      }
    }
  };

  // 2. REGISTER NEW ACCOUNT HANDLER
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');
    setRegSuccess('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          role: regRole,
          pin: regPin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRegError(data.error || 'Hindi matapos ang pagrehistro.');
        setRegLoading(false);
        return;
      }

      setRegSuccess('Nagawa na ang iyong account! Ina-authenticate na gamit ang iyong PIN...');

      // Auto login immediately using the new PIN!
      const signInRes = await signIn('credentials', {
        redirect: false,
        pin: regPin.trim(),
      });

      if (signInRes?.error) {
        setRegError('Nagawa ang account pero pakisubukang mag-login gamit ang PIN.');
        setTab('pin');
        setPin(regPin);
        setRegLoading(false);
        return;
      }

      // Redirect depending on registered role
      if (regRole === 'RIDER') {
        router.push('/rider');
      } else {
        router.push('/admin');
      }
      router.refresh();
    } catch (err: any) {
      setRegError('May aberya sa pagrehistro. Pakisubukang muli.');
      setRegLoading(false);
    }
  };

  // 3. EMAIL/PASSWORD LOGIN HANDLER
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (res?.error) {
        setEmailError(res.error);
        setEmailLoading(false);
        return;
      }

      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      const role = sessionData?.user?.role;

      if (role === 'RIDER') {
        router.push('/rider');
      } else {
        router.push('/admin');
      }
      router.refresh();
    } catch (err: any) {
      setEmailError('May aberya sa pag-login. Pakisubukang muli.');
      setEmailLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-md w-full space-y-6 bg-white p-7 sm:p-9 rounded-3xl border border-sky-100 shadow-xl">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white mx-auto shadow-md shadow-sky-500/20">
            <Droplets className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Aqua B Staff Portal
            </h1>
            <p className="text-xs text-slate-500">
              Direktang PIN access para sa Admin, Super Admin, at Delivery Riders
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => { setTab('pin'); setPinError(''); }}
            className={`py-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
              tab === 'pin'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>PIN Login</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('register'); setRegError(''); }}
            className={`py-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
              tab === 'register'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Gumawa</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('email'); setEmailError(''); }}
            className={`py-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
              tab === 'email'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>
        </div>

        {/* TAB 1: QUICK PIN LOGIN */}
        {tab === 'pin' && (
          <div className="space-y-5">
            {pinError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            {/* PIN Display Dots / Input */}
            <div className="text-center space-y-2">
              <label className="text-xs font-bold text-slate-600">Ilagay ang iyong 4-Digit Staff PIN</label>
              
              <div className="flex justify-center items-center gap-3 py-2">
                {[0, 1, 2, 3].map((index) => {
                  const filled = pin.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-black transition-all ${
                        filled
                          ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm scale-105'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      {filled ? '•' : ''}
                    </div>
                  );
                })}
              </div>

              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPin(val);
                  if (val.length === 4) handlePinSubmit(val);
                }}
                className="opacity-0 w-1 h-1 pointer-events-none absolute"
                autoFocus
              />
            </div>

            {/* Visual Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  disabled={pinLoading}
                  className="h-12 rounded-2xl bg-slate-100 hover:bg-sky-100 active:bg-sky-200 text-slate-800 text-lg font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleKeypadPress('clear')}
                className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all flex items-center justify-center"
              >
                C
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                disabled={pinLoading}
                className="h-12 rounded-2xl bg-slate-100 hover:bg-sky-100 active:bg-sky-200 text-slate-800 text-lg font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('backspace')}
                className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all flex items-center justify-center"
                title="Bura"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handlePinSubmit()}
              disabled={pinLoading || pin.length < 4}
              className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {pinLoading ? (
                <span>Kinikilala ang PIN...</span>
              ) : (
                <>
                  <span>Pumasok sa Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo PIN Badges */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                Mabilisang Demo PINs (1-Click)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { setPin('9999'); handlePinSubmit('9999'); }}
                  className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-center transition-all group"
                >
                  <ShieldCheck className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                  <span className="block text-[11px] font-black text-slate-900 leading-none">Super Admin</span>
                  <span className="text-[10px] text-sky-600 font-mono font-bold">PIN: 9999</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPin('1234'); handlePinSubmit('1234'); }}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-center transition-all group"
                >
                  <UserCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <span className="block text-[11px] font-black text-slate-900 leading-none">Station Admin</span>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold">PIN: 1234</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPin('1111'); handlePinSubmit('1111'); }}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-center transition-all group"
                >
                  <Truck className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <span className="block text-[11px] font-black text-slate-900 leading-none">Rider Rico</span>
                  <span className="text-[10px] text-amber-600 font-mono font-bold">PIN: 1111</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER NEW ACCOUNT (SET PIN) */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            {regError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Buong Pangalan</label>
              <input
                type="text"
                required
                placeholder="Hal. Juan Dela Cruz"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Work Email</label>
              <input
                type="email"
                required
                placeholder="juan@aquab.ph"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone (Optional)</label>
                <input
                  type="text"
                  placeholder="09123456789"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Gagawa ng 4-Digit PIN</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="Hal. 5555"
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            {/* Role Radio Picker */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Piliin ang Tungkulin (Role)</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setRegRole('SUPER_ADMIN')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    regRole === 'SUPER_ADMIN'
                      ? 'border-sky-600 bg-sky-50 text-sky-800 font-bold ring-2 ring-sky-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-sky-600" />
                  <span className="block text-[11px]">Super Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('ADMIN')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    regRole === 'ADMIN'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  <span className="block text-[11px]">Station Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('RIDER')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    regRole === 'RIDER'
                      ? 'border-amber-600 bg-amber-50 text-amber-800 font-bold ring-2 ring-amber-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Truck className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                  <span className="block text-[11px]">Rider</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={regLoading || regPin.length < 4}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 pt-3"
            >
              {regLoading ? (
                <span>Ginagawa ang account...</span>
              ) : (
                <>
                  <span>Gawin ang Account & Mag-Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: TRADITIONAL EMAIL / PASSWORD */}
        {tab === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {emailError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{emailError}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@aquab.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={emailLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {emailLoading ? <span>Authenticating...</span> : <span>Sign In via Email</span>}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-sky-600 font-semibold hover:underline"
          >
            ← Bumalik sa Storefront
          </Link>
        </div>

      </div>
    </div>
  );
}
