import React, { useState } from 'react';
import { X, User, Building2, GraduationCap, Calendar, Award, CheckCircle2, Layers, LogOut } from 'lucide-react';
import { DIT_DEPARTMENTS, DIT_LEVELS, getDepartmentsForUniversity } from '../data/ditDepartments';
import { UNIVERSITY_STRUCTURES } from '../data/universityStructures';
import { GoogleSignInButton } from './GoogleAuthButton';

export default function ProfileSetupModal({
  isOpen,
  onClose,
  metadata,
  onSaveMetadata,
  googleUser,
  onSyncGoogleProfile,
  onLogout,
  onLogin
}) {
  const [form, setForm] = useState({ ...metadata });

  if (!isOpen) return null;

  const availableDepts = getDepartmentsForUniversity(form.universityId || 'dit');
  const currentDeptObj = availableDepts.find(d => d.name === form.department) || availableDepts[0];

  const handleDeptChange = (deptName) => {
    const d = availableDepts.find(item => item.name === deptName) || availableDepts[0];
    setForm(prev => ({
      ...prev,
      department: d.name,
      deptId: d.id,
      program: d.degrees[0],
      courseName: d.degrees[0]
    }));
  };

  const handleUniChange = (uniId) => {
    const u = UNIVERSITY_STRUCTURES.find(item => item.id === uniId) || UNIVERSITY_STRUCTURES[0];
    const depts = getDepartmentsForUniversity(u.id);
    const firstDept = depts[0];
    setForm(prev => ({
      ...prev,
      universityId: u.id,
      universityName: u.name,
      department: firstDept.name,
      deptId: firstDept.id,
      program: firstDept.degrees[0],
      courseName: firstDept.degrees[0],
      module: u.moduleTitle || (u.id === 'ifm' ? 'FIELD AND PROJECT WORK PRACTICE' : 'INDUSTRIAL PRACTICAL TRAINING (IPT)')
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveMetadata({
      ...form,
      universityId: 'dit',
      universityName: 'DAR ES SALAAM INSTITUTE OF TECHNOLOGY (DIT)',
      module: 'INDUSTRIAL PRACTICAL TRAINING (IPT)'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-2xl bg-[#171717] border border-[#2e2e2e] shadow-2xl p-6 relative my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2e2e2e]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                Taarifa za Mwanafunzi & Cover Page Profile
              </h3>
              <p className="text-xs text-slate-400">
                Taarifa hizi zitatumika kutengeneza jalada rasmi (Cover Page) na kurasa za mwanzo za ripoti.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[#252525] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Connected Google Account Banner */}
          {googleUser ? (
            <div className="p-3 rounded-xl bg-[#202020] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center space-x-3">
                {googleUser.picture ? (
                  <img 
                    src={googleUser.picture} 
                    alt={googleUser.name} 
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-amber-400 shrink-0" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleUser.name)}`;
                    }}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                    G
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-100 flex items-center space-x-1.5 truncate">
                    <span>{googleUser.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold shrink-0">
                      Google Verified
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">{googleUser.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onLogout) onLogout();
                }}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 hover:text-red-300 font-bold text-xs transition shrink-0 flex items-center space-x-1.5"
                title="Ondoka kwenye akaunti ya Google"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>Logout</span>
              </button>
            </div>
          ) : onLogin ? (
            <div className="p-3 rounded-xl bg-[#202020] border border-[#333333] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5">
                <span className="text-xs text-slate-300 font-medium">Unganisha akaunti ya Google kupakia jina lako:</span>
              </div>
              <GoogleSignInButton onLoginSuccess={onLogin} />
            </div>
          ) : null}

          {/* University & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1 flex items-center justify-between">
                <span>Chuo Kikuu / Taasisi</span>
                <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Toleo Rasmi 2026
                </span>
              </label>
              <div className="w-full px-3 py-2 rounded-xl bg-[#111111] border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between font-semibold">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>Chuo Kikuu / Taasisi ya Elimu ya Juu</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">IPT Guideline</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Idara ya Chuo (Department)
              </label>
              <select
                value={form.department}
                onChange={e => handleDeptChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0f0f0f] border border-[#333333] text-slate-100 text-xs focus:ring-1 focus:ring-amber-500"
              >
                {availableDepts.map(d => (
                  <option key={d.id} value={d.name}>
                    {d.name} {d.code ? `(${d.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Name & Admission Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Jina Kamili la Mwanafunzi (STUDENT NAME)
              </label>
              <input
                type="text"
                required
                value={form.studentName}
                onChange={e => setForm({ ...form, studentName: e.target.value.toUpperCase() })}
                placeholder="k.m. CHILLU JOHN MWITA"
                className="w-full px-3 py-2 rounded-xl bg-[#0f0f0f] border border-[#333333] text-slate-100 text-xs font-bold focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Admission / Reg Number (ADMISSION NUMBER)
              </label>
              <input
                type="text"
                required
                value={form.admissionNo || form.regNumber}
                onChange={e => setForm({ ...form, admissionNo: e.target.value, regNumber: e.target.value })}
                placeholder="k.m. 21023022415"
                className="w-full px-3 py-2 rounded-xl bg-[#0f0f0f] border border-[#333333] text-slate-100 text-xs font-mono font-bold focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Program, NTA Level & Class */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Program / Kozi (PROGRAM)
              </label>
              <input
                type="text"
                required
                value={form.program || form.courseName}
                onChange={e => setForm({ ...form, program: e.target.value.toUpperCase(), courseName: e.target.value })}
                placeholder="BACHELOR DEGREE IN COMPUTER ENGINEERING"
                className="w-full px-3 py-2 rounded-xl bg-[#0f0f0f] border border-[#333333] text-slate-100 text-xs focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Kiwango (NTA LEVEL)
              </label>
              <input
                type="text"
                value={form.ntaLevel || 'NTA LEVEL 7'}
                onChange={e => setForm({ ...form, ntaLevel: e.target.value.toUpperCase() })}
                placeholder="NTA LEVEL 7"
                className="w-full px-3 py-2 rounded-xl bg-[#0f0f0f] border border-[#333333] text-slate-100 text-xs focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Darasa (CLASS)
              </label>
              <input
                type="text"
                value={form.classCode || 'BENG23COE'}
                onChange={e => setForm({ ...form, classCode: e.target.value.toUpperCase() })}
                placeholder="BENG23COE"
                className="w-full px-3 py-2 rounded-xl bg-[#0f0f0f] border border-[#333333] text-slate-100 text-xs font-mono focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Firm & Module */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Kampuni / Shirika (FIRM)
              </label>
              <input
                type="text"
                required
                value={form.firm || form.companyName}
                onChange={e => setForm({ ...form, firm: e.target.value.toUpperCase(), companyName: e.target.value.toUpperCase() })}
                placeholder="THE UNITED AFRICAN TECHNICAL COLLEGE (UATC)"
                className="w-full px-3 py-2 rounded-xl bg-[#0f0f0f] border border-[#333333] text-slate-100 text-xs font-semibold focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Module Name (MODULE)
              </label>
              <input
                type="text"
                value={form.module || 'INDUSTRIAL PRACTICAL TRAINING (IPT)'}
                onChange={e => setForm({ ...form, module: e.target.value.toUpperCase() })}
                placeholder="INDUSTRIAL PRACTICAL TRAINING (IPT)"
                className="w-full px-3 py-2 rounded-xl bg-[#0f0f0f] border border-[#333333] text-slate-100 text-xs focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Supervisors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Supervisor wa Kazini (FIRM'S SUPERVISOR)
              </label>
              <input
                type="text"
                value={form.firmSupervisor || form.industrialSupervisor}
                onChange={e => setForm({ ...form, firmSupervisor: e.target.value, industrialSupervisor: e.target.value })}
                placeholder="Eng. Godfrey Mwakyoma"
                className="w-full px-3 py-2 rounded-xl bg-[#0f0f0f] border border-[#333333] text-slate-100 text-xs focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Supervisor wa Chuoni (INSTITUTE SUPERVISOR)
              </label>
              <input
                type="text"
                value={form.instituteSupervisor || form.academicSupervisor}
                onChange={e => setForm({ ...form, instituteSupervisor: e.target.value, academicSupervisor: e.target.value })}
                placeholder="Dr. J. M. Mtebe"
                className="w-full px-3 py-2 rounded-xl bg-[#0f0f0f] border border-[#333333] text-slate-100 text-xs focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Academic Year & Field Span */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Mwaka wa Masomo (ACADEMIC YEAR)
              </label>
              <input
                type="text"
                value={form.academicYear || '2023/2024'}
                onChange={e => setForm({ ...form, academicYear: e.target.value })}
                placeholder="2023/2024"
                className="w-full px-3 py-2 rounded-xl bg-[#0f0f0f] border border-[#333333] text-slate-100 text-xs focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Muda wa Field (FIELD SPAN)
              </label>
              <input
                type="text"
                value={form.fieldSpan || 'FROM 5 AUGUST 2024 TO 5 OCTOBER 2024'}
                onChange={e => setForm({ ...form, fieldSpan: e.target.value.toUpperCase() })}
                placeholder="FROM 5 AUGUST 2024 TO 5 OCTOBER 2024"
                className="w-full px-3 py-2 rounded-xl bg-[#0f0f0f] border border-[#333333] text-slate-100 text-xs font-bold focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#2e2e2e]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#252525] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>Hifadhi Taarifa za Cover Page</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
