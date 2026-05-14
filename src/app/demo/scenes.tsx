'use client';

import { useState, useEffect } from 'react';
import { FadeIn, SlideIn, CountUp, ProgressFill, Typewriter } from './animations';
import {
  Search, MapPin, Phone, Calendar, CheckCircle2, DollarSign, Gift,
  Send, ThumbsUp, CheckSquare, Shield, Wallet, Briefcase, Users, Sparkles,
  ArrowRight, Building2,
} from 'lucide-react';
import { MOCK, formatMoney } from './mock-data';

const RoleChip = ({ role }: { role: 'referrer' | 'provider' | 'admin' }) => {
  const styles = {
    referrer: { label: 'Referrer', cls: 'bg-amber-400/15 text-amber-300 border-amber-400/30' },
    provider: { label: 'Provider', cls: 'bg-yellow-400/15 text-yellow-200 border-yellow-400/30' },
    admin: { label: 'Admin', cls: 'bg-orange-500/15 text-orange-300 border-orange-500/30' },
  } as const;
  const s = styles[role];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${s.cls}`}>
      {s.label} view
    </span>
  );
};

// ================================================================
// SCENE 1: HERO
// ================================================================
export function SceneHero({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <FadeIn show={active} delay={200}>
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-8 mx-auto shadow-lg shadow-amber-500/20">
          <span className="text-4xl">🐝</span>
        </div>
      </FadeIn>
      <FadeIn show={active} delay={600}>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Honey Bee Referral Club</h1>
      </FadeIn>
      <FadeIn show={active} delay={1000}>
        <p className="text-xl text-stone-300 mb-3">See How a Referral Becomes Revenue</p>
      </FadeIn>
      <FadeIn show={active} delay={1400}>
        <p className="text-base text-stone-400/80 max-w-lg">
          Watch the complete journey — from submitting a lead to earning your commission, automatically split into cash and benefits.
        </p>
      </FadeIn>
      <FadeIn show={active} delay={2000}>
        <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3 text-sm text-stone-400">
          {['Submit', 'Accept', 'Complete', 'Confirm', 'Get Paid'].map((t) => (
            <span key={t} className="rounded-full border border-stone-700 px-3 py-1">{t}</span>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE 2: REFERRER — SEARCH DIRECTORY
// ================================================================
const fakeProviders = [
  { name: 'BrightSpark Electrical', category: 'Electrical', commission: '8%', zip: '11201', initial: 'B' },
  { name: 'TyeNY Software Development', category: 'Software Development', commission: '10%', zip: '11201', initial: 'T' },
  { name: 'FastFlow Plumbing', category: 'Plumbing', commission: '$150', zip: '10001', initial: 'F' },
];

export function SceneReferrerSearch({ active }: { active: boolean }) {
  const [typed, setTyped] = useState('');
  useEffect(() => {
    if (!active) {
      setTyped('');
      return;
    }
    const target = 'TyeNY';
    let i = 0;
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setTyped(target.slice(0, i));
        if (i >= target.length) clearInterval(interval);
      }, 140);
      return () => clearInterval(interval);
    }, 1200);
    return () => clearTimeout(start);
  }, [active]);

  const searchActive = typed.length > 0;
  const filtered = searchActive
    ? fakeProviders.filter((p) => p.name.toLowerCase().includes(typed.toLowerCase()))
    : fakeProviders;

  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <div className="flex items-center gap-3 mb-1">
          <p className="text-xs uppercase tracking-widest text-amber-400">Referrer · Provider Directory</p>
          <RoleChip role="referrer" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-6">Find the right provider</h2>
      </FadeIn>

      <SlideIn show={active} delay={300}>
        <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 p-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -transtone-y-1/2 h-4 w-4 text-stone-500" />
            <div className="h-10 w-full rounded-md bg-stone-800/70 border border-stone-700/70 pl-9 pr-3 flex items-center text-sm text-white">
              <span className="tabular-nums">{typed || <span className="text-stone-500">Search providers by name, category, or ZIP...</span>}</span>
              {active && typed.length > 0 && typed.length < 5 && (
                <span className="inline-block w-[2px] h-4 bg-amber-400 align-middle ml-[1px] animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </SlideIn>

      <div className="grid gap-3">
        {fakeProviders.map((p, i) => {
          const isMatch = p.name === MOCK.providerCompany.name;
          const hidden = searchActive && !filtered.some((f) => f.name === p.name);
          return (
            <SlideIn key={p.name} show={active} delay={500 + i * 150}>
              <div
                className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-500 ${
                  hidden
                    ? 'opacity-0 -transtone-y-2 h-0 py-0 border-0 overflow-hidden'
                    : isMatch && searchActive
                    ? 'bg-amber-500/5 border-amber-500/40 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'bg-stone-900/80 border-stone-700/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${isMatch && searchActive ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-800 text-stone-300'}`}>
                    {p.initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                    <p className="text-[11px] text-stone-500 flex items-center gap-1"><MapPin className="h-3 w-3" />{p.zip} · {p.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="rounded-md bg-amber-400/15 px-2 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/30">{p.commission}</span>
                  <button className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${isMatch && searchActive ? 'bg-amber-500 text-stone-950 hover:bg-amber-400' : 'bg-stone-800 text-stone-300'}`}>
                    Submit Referral
                  </button>
                </div>
              </div>
            </SlideIn>
          );
        })}
      </div>

      <FadeIn show={active} delay={3200}>
        <p className="text-sm text-stone-400 text-center mt-6">
          Filter by category, commission, and ZIP — every provider lists their commission rate upfront.
        </p>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE 3: REFERRER — SUBMIT FORM
// ================================================================
export function SceneReferrerForm({ active }: { active: boolean }) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-4xl mx-auto">
      <FadeIn show={active} delay={0}>
        <div className="flex items-center gap-3 mb-1">
          <p className="text-xs uppercase tracking-widest text-amber-400">Referrer · Submit Referral</p>
          <RoleChip role="referrer" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-6">Fill the form, lock the rate</h2>
      </FadeIn>

      <SlideIn show={active} delay={300}>
        <div className="flex items-center justify-between rounded-xl bg-stone-900/80 border border-stone-700/50 px-4 py-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center font-bold text-amber-300">T</div>
            <div>
              <p className="text-sm font-semibold text-white">{MOCK.providerCompany.name}</p>
              <p className="text-[11px] text-stone-500">{MOCK.providerCompany.memberId}</p>
            </div>
          </div>
          <span className="rounded-md bg-amber-400/15 px-2 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/30">{MOCK.commission.value}% Commission</span>
        </div>
      </SlideIn>

      <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 p-5">
        <p className="text-xs uppercase tracking-wider text-stone-500 mb-4">Submit a Referral</p>
        <div className="space-y-4">
          {[
            { label: 'Homeowner Name', value: MOCK.homeowner.name, delay: 600, speed: 60 },
            { label: 'Phone Number', value: MOCK.homeowner.phone, delay: 2200, speed: 50 },
            { label: 'Address', value: MOCK.homeowner.address, delay: 3800, speed: 35 },
            { label: 'Service Category', value: MOCK.category, delay: 6000, speed: 50 },
          ].map((field) => (
            <FadeIn key={field.label} show={active} delay={field.delay - 200}>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5">{field.label}</p>
                <div className="h-10 w-full rounded-md bg-stone-800/70 border border-stone-700/70 px-3 flex items-center text-sm text-white">
                  <Typewriter text={field.value} show={active} delay={field.delay} speed={field.speed} />
                </div>
              </div>
            </FadeIn>
          ))}

          <FadeIn show={active} delay={7600}>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5">Project Description</p>
              <div className="min-h-[64px] w-full rounded-md bg-stone-800/70 border border-stone-700/70 px-3 py-2 text-sm text-white leading-relaxed">
                <Typewriter text={MOCK.description} show={active} delay={7800} speed={28} />
              </div>
            </div>
          </FadeIn>

          <FadeIn show={active} delay={9800}>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button className="rounded-md border border-stone-700 px-4 py-2 text-sm text-stone-300">Cancel</button>
              <button className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-500/20">
                Submit Referral
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// SCENE 4: REFERRER — SUCCESS
// ================================================================
export function SceneReferrerSuccess({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-amber-400 mb-2">Referrer · Confirmation</p>
      </FadeIn>
      <FadeIn show={active} delay={200}>
        <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 px-10 py-10 max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/15 border border-amber-400/40 mx-auto mb-4 shadow-lg shadow-amber-500/10">
            <CheckCircle2 className="h-8 w-8 text-amber-300" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Lead Submitted</h2>
          <p className="text-sm text-stone-300">
            Your referral has been sent to <span className="font-semibold text-white">{MOCK.providerCompany.name}</span>
          </p>
          <FadeIn show={active} delay={800}>
            <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-stone-800/70 px-3 py-2 text-xs text-stone-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Commission rate <span className="font-semibold text-amber-300">{MOCK.commission.value}%</span> locked in at submission</span>
            </div>
          </FadeIn>
        </div>
      </FadeIn>
      <FadeIn show={active} delay={1400}>
        <p className="text-sm text-stone-400 mt-5">The lead is now in the provider&apos;s queue.</p>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE 5: PROVIDER — NEW LEAD
// ================================================================
export function SceneProviderNewLead({ active }: { active: boolean }) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-4xl mx-auto">
      <FadeIn show={active} delay={0}>
        <div className="flex items-center gap-3 mb-1">
          <p className="text-xs uppercase tracking-widest text-yellow-300">Provider · Lead Queue</p>
          <RoleChip role="provider" />
        </div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">New leads land instantly</h2>
          <SlideIn show={active} delay={400} direction="right">
            <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-xs font-bold text-rose-300">
              1 New
            </span>
          </SlideIn>
        </div>
      </FadeIn>

      <SlideIn show={active} delay={700} direction="right">
        <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 border-l-4 border-l-amber-400 overflow-hidden">
          <div className="px-5 py-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{MOCK.homeowner.name}</h3>
                <p className="text-sm text-stone-400">
                  Referred by <span className="font-medium text-stone-200">{MOCK.referrerCompany.name}</span>
                </p>
              </div>
              <span className="rounded-md bg-stone-800 px-2 py-0.5 text-xs font-medium text-stone-300">{MOCK.category}</span>
            </div>

            <FadeIn show={active} delay={1200}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-stone-400 mb-4">
                <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{MOCK.homeowner.phone}</div>
                <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Brooklyn, NY</div>
                <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Just now</div>
              </div>
            </FadeIn>

            <FadeIn show={active} delay={1800}>
              <p className="text-sm text-stone-300 mb-4 leading-relaxed">{MOCK.description}</p>
            </FadeIn>

            <FadeIn show={active} delay={2400}>
              <div className="flex items-center justify-between border-t border-stone-800 pt-3">
                <div className="text-xs text-stone-400">
                  Commission rate: <span className="font-bold text-amber-300">{MOCK.commission.value}%</span>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-md border border-stone-700 px-3 py-1.5 text-xs text-stone-300">Reject</button>
                  <button className="rounded-md bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-stone-950 hover:bg-yellow-300 transition-colors shadow shadow-yellow-400/20">
                    Accept Lead
                  </button>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </SlideIn>

      <FadeIn show={active} delay={3200}>
        <p className="text-sm text-stone-400 text-center mt-6">
          Providers see every new referral the moment it&apos;s submitted — full contact info, project details, and locked commission.
        </p>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE 6: PROVIDER — ACCEPT LEAD (ESTIMATE)
// ================================================================
export function SceneProviderAccept({ active }: { active: boolean }) {
  const estFee = MOCK.estimatedJobValue * MOCK.commission.value / 100;
  return (
    <div className="px-6 sm:px-10 py-8 max-w-3xl mx-auto">
      <FadeIn show={active} delay={0}>
        <div className="flex items-center gap-3 mb-1">
          <p className="text-xs uppercase tracking-widest text-yellow-300">Provider · Accept Lead</p>
          <RoleChip role="provider" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-6">Set your estimate</h2>
      </FadeIn>

      <SlideIn show={active} delay={300}>
        <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 p-5">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-stone-800">
            <div className="h-9 w-9 rounded-full bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-300">SJ</div>
            <div>
              <p className="text-sm font-semibold text-white">{MOCK.homeowner.name}</p>
              <p className="text-[11px] text-stone-500">{MOCK.category}</p>
            </div>
          </div>

          <FadeIn show={active} delay={700}>
            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5">Estimated Job Value</p>
              <div className="h-11 w-full rounded-md bg-stone-800/70 border border-stone-700/70 px-3 flex items-center text-lg font-semibold text-white">
                <span className="text-stone-500 mr-1">$</span>
                <Typewriter text="25,000" show={active} delay={1000} speed={80} />
              </div>
            </div>
          </FadeIn>

          <FadeIn show={active} delay={2400}>
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-300/80">Estimated referral fee</p>
                  <p className="text-2xl font-bold text-amber-300 tabular-nums">
                    $<CountUp end={estFee} show={active} delay={2800} duration={1200} />
                  </p>
                </div>
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-200">{MOCK.commission.value}% of est.</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn show={active} delay={4400}>
            <button className="w-full rounded-md bg-yellow-400 py-2.5 text-sm font-semibold text-stone-950 hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/30">
              <CheckCircle2 className="h-4 w-4" />
              Accept Lead
            </button>
          </FadeIn>

          <FadeIn show={active} delay={5400}>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-400/10 border border-amber-400/25 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-amber-300" />
              <span className="text-sm text-amber-200 font-medium">Lead accepted — work begins</span>
            </div>
          </FadeIn>
        </div>
      </SlideIn>
    </div>
  );
}

// ================================================================
// SCENE 7: PROVIDER — COMPLETE JOB
// ================================================================
export function SceneProviderComplete({ active }: { active: boolean }) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-3xl mx-auto">
      <FadeIn show={active} delay={0}>
        <div className="flex items-center gap-3 mb-1">
          <p className="text-xs uppercase tracking-widest text-yellow-300">Provider · Mark Completed</p>
          <RoleChip role="provider" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-6">Close the deal with the final value</h2>
      </FadeIn>

      <SlideIn show={active} delay={300}>
        <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 p-5">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-stone-800">
            <div className="h-9 w-9 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
              <CheckSquare className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{MOCK.homeowner.name}</p>
              <p className="text-[11px] text-stone-500">{MOCK.category} · Est. {formatMoney(MOCK.estimatedJobValue)}</p>
            </div>
          </div>

          <FadeIn show={active} delay={700}>
            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5">Final Job Value</p>
              <div className="h-11 w-full rounded-md bg-stone-800/70 border border-stone-700/70 px-3 flex items-center text-lg font-semibold text-white">
                <span className="text-stone-500 mr-1">$</span>
                <Typewriter text="28,500" show={active} delay={1000} speed={80} />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">+ {formatMoney(MOCK.finalJobValue - MOCK.estimatedJobValue)} above estimate</p>
            </div>
          </FadeIn>

          <FadeIn show={active} delay={2400}>
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-300/80">Calculated commission</p>
                  <p className="text-2xl font-bold text-amber-300 tabular-nums">
                    $<CountUp end={MOCK.calculatedCommission} show={active} delay={2800} duration={1200} />
                  </p>
                </div>
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-200">{MOCK.commission.value}% of final</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn show={active} delay={4400}>
            <button className="w-full rounded-md bg-amber-500 py-2.5 text-sm font-semibold text-stone-950 hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
              <CheckCircle2 className="h-4 w-4" />
              Confirm Completion
            </button>
          </FadeIn>

          <FadeIn show={active} delay={5400}>
            <p className="text-xs text-stone-500 text-center mt-3">Awaiting admin confirmation before payout.</p>
          </FadeIn>
        </div>
      </SlideIn>
    </div>
  );
}

// ================================================================
// SCENE 8: ADMIN — CONFIRM DEAL
// ================================================================
export function SceneAdminConfirm({ active }: { active: boolean }) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <div className="flex items-center gap-3 mb-1">
          <p className="text-xs uppercase tracking-widest text-orange-300">Admin · Pending Confirmations</p>
          <RoleChip role="admin" />
        </div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Review & confirm the deal</h2>
          <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-300">1 Pending</span>
        </div>
      </FadeIn>

      <SlideIn show={active} delay={400}>
        <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-stone-800">
            {[
              { label: 'Referrer', value: MOCK.referrerCompany.name },
              { label: 'Provider', value: MOCK.providerCompany.name },
              { label: 'Job Value', value: formatMoney(MOCK.finalJobValue) },
              { label: 'Commission', value: formatMoney(MOCK.calculatedCommission), color: 'text-amber-300' },
            ].map((c) => (
              <div key={c.label} className="bg-stone-900 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-stone-500">{c.label}</p>
                <p className={`text-sm font-semibold mt-0.5 ${c.color || 'text-white'} truncate`}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 flex items-center justify-between gap-4 border-t border-stone-800">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{MOCK.homeowner.name}</p>
              <p className="text-xs text-stone-500">{MOCK.category} · Brooklyn, NY</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button className="rounded-md border border-stone-700 px-3 py-1.5 text-xs text-stone-300">Reject</button>
              <button className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-semibold text-stone-950 hover:bg-orange-400 transition-colors flex items-center gap-1.5 shadow shadow-orange-500/30">
                <Shield className="h-3.5 w-3.5" />
                Confirm Deal
              </button>
            </div>
          </div>
        </div>
      </SlideIn>

      <FadeIn show={active} delay={2800}>
        <div className="mt-5 rounded-xl bg-amber-400/10 border border-amber-400/25 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-amber-300 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-200">Deal Confirmed</p>
            <p className="text-xs text-amber-200/70">Processing payment distribution...</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn show={active} delay={4200}>
        <p className="text-sm text-stone-400 text-center mt-5">
          Every deal passes an admin checkpoint — referrer, provider, and final value all verified before payout.
        </p>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE 9: ADMIN — PAYMENT DISTRIBUTION (3-WAY SPLIT)
// ================================================================
export function SceneAdminDistributed({ active }: { active: boolean }) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-4xl mx-auto">
      <FadeIn show={active} delay={0}>
        <div className="flex items-center gap-3 mb-1">
          <p className="text-xs uppercase tracking-widest text-orange-300">Admin · Auto Split Engine</p>
          <RoleChip role="admin" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Pro-rata distribution, instantly</h2>
        <p className="text-sm text-stone-400 mb-6">
          Total Commission: <span className="font-semibold text-white">{formatMoney(MOCK.calculatedCommission)}</span>
        </p>
      </FadeIn>

      <div className="space-y-3">
        {[
          {
            icon: DollarSign, label: 'Cash to Referrer', sub: '50% of commission',
            value: MOCK.cashSplit, accent: 'gold', delay: 400,
          },
          {
            icon: Gift, label: 'Benefits to Referrer', sub: '40% of commission',
            value: MOCK.benefitsSplit, accent: 'yellow', delay: 1600,
          },
          {
            icon: Building2, label: 'Platform Revenue', sub: '10% of commission',
            value: MOCK.platformSplit, accent: 'orange', delay: 2800,
          },
        ].map((row) => {
          const accents: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
            gold: { bg: 'bg-amber-400/10', border: 'border-amber-400/30', text: 'text-amber-300', iconBg: 'bg-amber-400/20' },
            yellow: { bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', text: 'text-yellow-200', iconBg: 'bg-yellow-400/20' },
            orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-300', iconBg: 'bg-orange-500/20' },
          };
          const a = accents[row.accent];
          const Icon = row.icon;
          return (
            <SlideIn key={row.label} show={active} delay={row.delay} direction="up">
              <div className={`flex items-center justify-between rounded-xl ${a.bg} border ${a.border} px-5 py-4`}>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full ${a.iconBg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${a.text}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${a.text}`}>{row.label}</p>
                    <p className="text-[11px] text-stone-500">{row.sub}</p>
                  </div>
                </div>
                <p className={`text-xl font-bold tabular-nums ${a.text}`}>
                  $<CountUp end={row.value} show={active} delay={row.delay + 300} duration={1200} />
                </p>
              </div>
            </SlideIn>
          );
        })}
      </div>

      <FadeIn show={active} delay={4400}>
        <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-stone-900/80 border border-stone-700/50 px-4 py-3">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="text-sm text-stone-300">Auto-split complete — funds posted to wallets in seconds.</span>
        </div>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE 10: REFERRER — WALLET
// ================================================================
export function SceneReferrerWallet({ active }: { active: boolean }) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <div className="flex items-center gap-3 mb-1">
          <p className="text-xs uppercase tracking-widest text-amber-400">Referrer · My Wallet</p>
          <RoleChip role="referrer" />
        </div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Real-time earnings</h2>
          <button className="rounded-md border border-stone-700 px-3 py-1.5 text-xs text-stone-300 hover:bg-stone-800">Request Withdrawal</button>
        </div>
      </FadeIn>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <SlideIn show={active} delay={400}>
          <div className="rounded-xl bg-gradient-to-br from-amber-400/15 to-amber-500/5 border border-amber-400/30 p-5 shadow-lg shadow-amber-500/10">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-amber-300" />
              <p className="text-xs uppercase tracking-wider text-amber-300">Cash Balance</p>
            </div>
            <p className="text-3xl font-bold text-amber-300 tabular-nums">
              $<CountUp end={MOCK.cashSplit} show={active} delay={800} duration={1500} />
            </p>
            <p className="text-[11px] text-amber-300/70 mt-1">Available for withdrawal</p>
          </div>
        </SlideIn>

        <SlideIn show={active} delay={700}>
          <div className="rounded-xl bg-gradient-to-br from-yellow-400/15 to-yellow-500/5 border border-yellow-400/30 p-5 shadow-lg shadow-yellow-400/10">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-4 w-4 text-yellow-200" />
              <p className="text-xs uppercase tracking-wider text-yellow-200">Benefits Balance</p>
            </div>
            <p className="text-3xl font-bold text-yellow-200 tabular-nums">
              $<CountUp end={MOCK.benefitsSplit} show={active} delay={1100} duration={1500} />
            </p>
            <p className="text-[11px] text-yellow-200/70 mt-1">Benefits marketplace credits</p>
          </div>
        </SlideIn>
      </div>

      <SlideIn show={active} delay={1600}>
        <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-stone-800">
            <p className="text-xs uppercase tracking-wider text-stone-500">Recent Transactions</p>
          </div>

          {[
            { type: 'cash', delay: 2000 },
            { type: 'benefits', delay: 2400 },
          ].map((t) => {
            const isCash = t.type === 'cash';
            const Icon = isCash ? DollarSign : Gift;
            const amount = isCash ? MOCK.cashSplit : MOCK.benefitsSplit;
            const cls = isCash
              ? { iconBg: 'bg-amber-400/15', icon: 'text-amber-300', text: 'text-amber-300', label: 'Cash' }
              : { iconBg: 'bg-yellow-400/15', icon: 'text-yellow-200', text: 'text-yellow-200', label: 'Benefits' };
            return (
              <FadeIn key={t.type} show={active} delay={t.delay}>
                <div className="flex items-center justify-between px-5 py-3 border-b border-stone-800/50 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-9 w-9 rounded-full ${cls.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-4 w-4 ${cls.icon}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{MOCK.homeowner.name} · {MOCK.category}</p>
                      <p className="text-[11px] text-stone-500">via {MOCK.providerCompany.name}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold tabular-nums ${cls.text}`}>+{formatMoney(amount)}</p>
                    <span className="text-[10px] uppercase tracking-wider text-stone-500">{cls.label}</span>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </SlideIn>

      <FadeIn show={active} delay={3200}>
        <p className="text-sm text-stone-400 text-center mt-5">
          Every dollar earned is tracked, split, and ready to spend or withdraw.
        </p>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE 11: CLOSING
// ================================================================
export function SceneClosing({ active }: { active: boolean }) {
  const steps = [
    { icon: Send, label: 'Submit', accent: 'amber' },
    { icon: ThumbsUp, label: 'Accept', accent: 'yellow' },
    { icon: CheckSquare, label: 'Complete', accent: 'yellow' },
    { icon: Shield, label: 'Confirm', accent: 'orange' },
    { icon: Wallet, label: 'Paid', accent: 'gold' },
  ];
  const accents: Record<string, string> = {
    amber: 'bg-amber-400/15 border-amber-400/40 text-amber-300',
    yellow: 'bg-yellow-400/15 border-yellow-400/40 text-yellow-200',
    orange: 'bg-orange-500/15 border-orange-500/40 text-orange-300',
    gold: 'bg-gradient-to-br from-amber-300/25 to-amber-500/15 border-amber-300/50 text-amber-200',
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <FadeIn show={active} delay={200}>
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-6 mx-auto shadow-lg shadow-amber-500/20">
          <span className="text-4xl">🐝</span>
        </div>
      </FadeIn>
      <FadeIn show={active} delay={500}>
        <p className="text-sm uppercase tracking-widest text-amber-400 mb-2">From Referral to Revenue</p>
      </FadeIn>
      <FadeIn show={active} delay={800}>
        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-3">In 5 Simple Steps</h2>
      </FadeIn>
      <FadeIn show={active} delay={1100}>
        <div className="h-px w-24 bg-amber-500/40 mx-auto my-5" />
      </FadeIn>
      <FadeIn show={active} delay={1400}>
        <p className="text-base text-stone-300 mb-10 max-w-lg">
          Every step is automated, tracked, and split — so referrers, providers, and the platform all win.
        </p>
      </FadeIn>

      <div className="flex items-center justify-center flex-wrap gap-3 sm:gap-4 mb-10 max-w-xl">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <FadeIn key={s.label} show={active} delay={1700 + i * 200}>
              <div className="flex flex-col items-center gap-2">
                <div className={`h-12 w-12 rounded-full border flex items-center justify-center ${accents[s.accent]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400">{s.label}</span>
              </div>
            </FadeIn>
          );
        })}
      </div>

      <FadeIn show={active} delay={2800}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-xl">
          {[
            { value: '3', label: 'Roles' },
            { value: '50/40/10', label: 'Split' },
            { value: 'Auto', label: 'Distribution' },
            { value: 'Real-time', label: 'Wallet' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-stone-900/60 border border-stone-700/40 px-3 py-2.5">
              <p className="text-sm font-bold text-white">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-stone-500">{s.label}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn show={active} delay={3400}>
        <div className="flex items-center gap-3">
          <a href="/" className="rounded-md border border-stone-700 px-4 py-2 text-sm text-stone-300 hover:bg-stone-800 transition-colors">
            Back to Home
          </a>
          <a href="/register" className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-500/20">
            Get Started
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </FadeIn>
    </div>
  );
}
