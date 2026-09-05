'use client';

import React, { useState, useEffect } from 'react';
import vpsData from '@/data/vps-deals.json';
import {
  trackAffiliateClick,
  trackPromoBlockClick,
  trackPromoDealsView,
} from '@/lib/analytics';

export interface VpsDealRaw {
  id: string;
  name: string;
  badge: string;
  specs: string[];
  actualPriceYearly: number;
  sellingPriceYearly: number;
  actualPriceMonthly: number;
  sellingPriceMonthly: number;
  affiliateUrl: string;
  popular?: boolean;
}

export interface VpsDealComputed extends VpsDealRaw {
  originalMonthly: string;
  originalYearly: string;
  promoMonthly: string;
  promoYearly: string;
  discountPct: string;
}

// Dynamically compute discount percentages and format currency from JSON
const COMPUTED_DEALS: VpsDealComputed[] = vpsData.deals.map((deal) => {
  const discount = Math.round(
    ((deal.actualPriceYearly - deal.sellingPriceYearly) / deal.actualPriceYearly) * 100
  );
  return {
    ...deal,
    originalMonthly: `$${deal.actualPriceMonthly.toFixed(2)}/mo`,
    originalYearly: `$${deal.actualPriceYearly}/yr`,
    promoMonthly: `$${deal.sellingPriceMonthly.toFixed(2)}/mo`,
    promoYearly: `$${deal.sellingPriceYearly}/Year`,
    discountPct: `${discount}% OFF`,
  };
});

const TIMER_STORAGE_KEY = 'layerbiz_vps_flash_sale_end';
const TIMER_CONFIG_HASH_KEY = 'layerbiz_vps_timer_config_hash';

const configuredDays = Number((vpsData.promoConfig as any).timerDays ?? 2);
const configuredHours = Number(vpsData.promoConfig.timerHours ?? 18);
const configuredMinutes = Number(vpsData.promoConfig.timerMinutes ?? 42);
const configuredSeconds = Number(vpsData.promoConfig.timerSeconds ?? 15);
const fixedEndDate = (vpsData.promoConfig as any).fixedEndDate || '';

const DEFAULT_DURATION_MS =
  configuredDays * 24 * 60 * 60 * 1000 +
  configuredHours * 60 * 60 * 1000 +
  configuredMinutes * 60 * 1000 +
  configuredSeconds * 1000;

// Unique signature to detect when user changes the timer in vps-deals.json
const CURRENT_CONFIG_SIGNATURE = `${configuredDays}:${configuredHours}:${configuredMinutes}:${configuredSeconds}:${fixedEndDate}`;

interface VpsPromoBannerProps {
  showInArticleCard?: boolean;
}

export default function VpsPromoBanner({ showInArticleCard = true }: VpsPromoBannerProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: configuredDays,
    hours: configuredHours,
    minutes: configuredMinutes,
    seconds: configuredSeconds,
  });
  const [showTopDeals, setShowTopDeals] = useState(false);
  const [isBottomExpanded, setIsBottomExpanded] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);
  const [slotsLeft, setSlotsLeft] = useState(7);

  // Persistent Countdown Logic (Syncs with JSON config changes)
  useEffect(() => {
    // Expose quick dev testing trigger
    if (typeof window !== 'undefined') {
      (window as any).resetVpsTimer = () => {
        localStorage.removeItem(TIMER_STORAGE_KEY);
        localStorage.removeItem(TIMER_CONFIG_HASH_KEY);
        window.location.reload();
      };
    }

    let endTime: number;
    try {
      if (fixedEndDate) {
        endTime = new Date(fixedEndDate).getTime();
      } else {
        const storedSignature = localStorage.getItem(TIMER_CONFIG_HASH_KEY);
        const storedEnd = localStorage.getItem(TIMER_STORAGE_KEY);

        // If the user modified the timer in vps-deals.json, reset timer to the new configuration immediately!
        if (storedSignature !== CURRENT_CONFIG_SIGNATURE || !storedEnd) {
          endTime = Date.now() + DEFAULT_DURATION_MS;
          localStorage.setItem(TIMER_STORAGE_KEY, endTime.toString());
          localStorage.setItem(TIMER_CONFIG_HASH_KEY, CURRENT_CONFIG_SIGNATURE);
        } else {
          endTime = parseInt(storedEnd, 10);
          // If expired, loop over to 1 day 18 hours realistic rolling timer
          if (endTime <= Date.now()) {
            endTime = Date.now() + (1 * 24 + 18) * 60 * 60 * 1000;
            localStorage.setItem(TIMER_STORAGE_KEY, endTime.toString());
          }
        }
      }
    } catch {
      endTime = Date.now() + DEFAULT_DURATION_MS;
    }

    const updateTimer = () => {
      const difference = endTime - Date.now();
      if (difference <= 0) {
        const newEndTime = Date.now() + (1 * 24 + 18) * 60 * 60 * 1000;
        try {
          localStorage.setItem(TIMER_STORAGE_KEY, newEndTime.toString());
        } catch {}
        setTimeLeft({ days: 1, hours: 18, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    const randomSlots = 5 + Math.floor((Date.now() % 50000) / 10000);
    setSlotsLeft(randomSlots);

    return () => clearInterval(interval);
  }, []);

  const formatDigit = (num: number) => num.toString().padStart(2, '0');

  const { promoConfig } = vpsData;

  const handleToggleTopDeals = (trigger: 'card_body' | 'wow_button') => {
    const nextState = !showTopDeals;
    setShowTopDeals(nextState);
    trackPromoBlockClick({
      blockType: 'in_article_card',
      action: nextState ? 'expand' : 'collapse',
      trigger,
      promoName: promoConfig.headline,
    });
    if (nextState) {
      trackPromoDealsView({
        blockType: 'in_article_card',
        promoName: promoConfig.headline,
        dealCount: COMPUTED_DEALS.length,
      });
    }
  };

  const handleToggleBottomExpanded = (trigger: 'footer_bar' | 'wow_button') => {
    const nextState = !isBottomExpanded;
    setIsBottomExpanded(nextState);
    trackPromoBlockClick({
      blockType: 'sticky_footer',
      action: nextState ? 'expand' : 'collapse',
      trigger,
      promoName: promoConfig.headline,
    });
    if (nextState) {
      trackPromoDealsView({
        blockType: 'sticky_footer',
        promoName: promoConfig.headline,
        dealCount: COMPUTED_DEALS.length,
      });
    }
  };

  const handleToggleBottomCollapse = () => {
    const nextState = !isBottomCollapsed;
    setIsBottomCollapsed(nextState);
    trackPromoBlockClick({
      blockType: 'sticky_footer',
      action: nextState ? 'minimize' : 'restore',
      trigger: 'minimize_button',
      promoName: promoConfig.headline,
    });
  };

  const handleAffiliateClick = (deal: VpsDealComputed, placement: 'in_article_card' | 'sticky_footer') => {
    trackAffiliateClick({
      dealId: deal.id,
      dealName: deal.name,
      dealBadge: deal.badge,
      dealPriceYearly: deal.sellingPriceYearly,
      dealPriceMonthly: deal.sellingPriceMonthly,
      affiliateUrl: deal.affiliateUrl,
      placement,
    });
  };

  return (
    <>
      {/* 
        1. DESKTOP/TABLET COMPACT IN-ARTICLE CALLOUT WITH CLOUD WOW BUTTON & EXPANDABLE FULL-WIDTH DEALS
        - Hidden on mobile (hidden sm:block) so mobile reading relies cleanly on the floating footer dock.
        - Displays on tablet & desktop (sm:block).
        - Whole card is clickable to expand/collapse.
        - Cloud WOW button toggles the 5 deals.
        - When expanded, shows full-width deal rows showing ALL specs and complete descriptions without any truncation!
      */}
      {showInArticleCard && (
        <div
          onClick={() => handleToggleTopDeals('card_body')}
          className="hidden sm:block my-6 rounded-2xl border-2 border-orange-500/50 hover:border-orange-500/80 bg-gradient-to-r from-[#1a110a] via-[#0f172a] to-[#090e1a] p-3.5 sm:p-5 shadow-[0_0_25px_rgba(249,115,22,0.22)] not-prose relative overflow-hidden cursor-pointer transition-all group"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Bar Ribbon: Live Badge & Slots on Left, Timer & Cloud WOW Button on Right */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            {/* Left: Blinking Radar Beacon + Slots */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/50 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                LIVE FLASH SALE
              </span>

              <span className="text-xs font-mono text-slate-400 bg-black/50 px-2.5 py-1 rounded-lg border border-slate-800">
                <i className="fas fa-fire text-orange-500 mr-1"></i>
                <span className="text-orange-400 font-bold">{slotsLeft} slots</span> remaining
              </span>
            </div>

            {/* Right: Digital Timer + Cloud WOW Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Ticking Digital Clock */}
              <div className="flex items-center gap-1 font-mono text-orange-400 bg-black/90 px-2.5 py-1.5 rounded-lg border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.25)] text-xs sm:text-sm font-bold">
                <i className="fas fa-clock text-orange-400 text-xs mr-1 animate-pulse"></i>
                {timeLeft.days > 0 && (
                  <>
                    <span className="text-amber-300 font-bold">{timeLeft.days}d</span>
                    <span className="text-slate-600">:</span>
                  </>
                )}
                <span className="font-bold">{formatDigit(timeLeft.hours)}:</span>
                <span className="font-bold">{formatDigit(timeLeft.minutes)}:</span>
                <span className="text-white font-bold">{formatDigit(timeLeft.seconds)}</span>
              </div>

              {/* Cloud WOW Box Button */}
              <div className="relative group/wow shrink-0">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 rounded-xl blur opacity-75 group-hover/wow:opacity-100 transition duration-300 animate-pulse"></div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleTopDeals('wow_button');
                  }}
                  className="relative px-3.5 sm:px-4 py-2 rounded-xl text-xs font-mono font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-400 hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center gap-1.5 border border-amber-200 cursor-pointer"
                >
                  <i className="fas fa-cloud text-slate-900 text-xs animate-bounce"></i>
                  <span>{showTopDeals ? 'Hide Deals' : '5 Cloud Deals'}</span>
                  <i className={`fas fa-chevron-${showTopDeals ? 'down' : 'up'} text-[9px] text-slate-900`}></i>
                </button>
              </div>
            </div>
          </div>

          {/* Main Headline & Graphic Comparison Row: Spacious & Well-Proportioned */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Full Width Headline & Subheadline */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug group-hover:text-amber-300 transition-colors">
                {promoConfig.headline.split(':')[0]}:{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                  {promoConfig.headline.split(':')[1] || 'Pay for 1 Month, Host for the Year!'}
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                {promoConfig.subheadline}
              </p>
            </div>

            {/* Right: Graphic Comparison Badge (1 Mo $21.99 -> 12 Mos $21.99) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 select-none self-start md:self-center">
              {/* Normal 1-Month Box (Crossed out) */}
              <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-center flex flex-col items-center justify-center opacity-85">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                  {promoConfig.comparisonCard.standardLabel}
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold text-slate-400 line-through decoration-rose-500 decoration-2">
                  {promoConfig.comparisonCard.standardDuration} = {promoConfig.comparisonCard.standardCost}
                </span>
                <span className="text-[8px] font-mono text-rose-400 font-semibold flex items-center gap-0.5">
                  <i className="fas fa-times text-[7px]"></i> Normal
                </span>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center justify-center text-orange-400 font-bold px-0.5">
                <i className="fas fa-arrow-right text-xs text-orange-400 animate-pulse"></i>
              </div>

              {/* Flash Deal 12-Month Box (Tick Mark) */}
              <div className="px-3 py-2 rounded-xl bg-gradient-to-b from-orange-500/25 to-amber-500/15 border-2 border-orange-500 text-center flex flex-col items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.3)]">
                <span className="text-[9px] font-mono text-amber-300 uppercase font-black tracking-wider">
                  {promoConfig.comparisonCard.flashLabel}
                </span>
                <span className="text-xs sm:text-sm font-mono font-black text-orange-400">
                  {promoConfig.comparisonCard.flashDuration} = {promoConfig.comparisonCard.flashCost}
                </span>
                <span className="text-[8px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                  <i className="fas fa-check text-[7px]"></i> Entire Year!
                </span>
              </div>
            </div>
          </div>

          {/* Expandable 5 Deals Drawer: Full-Width Spacious Rows Showing ALL Specs & Complete Descriptions */}
          {showTopDeals && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-5 pt-5 border-t border-slate-800 space-y-3 cursor-default"
            >
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span className="text-orange-400 font-bold uppercase flex items-center gap-1.5">
                  <i className="fas fa-cloud text-amber-400"></i> Verified 1-Year Cloud VPS Deals:
                </span>
                <span className="text-amber-400 text-[11px] font-bold">
                  Ends in {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{timeLeft.hours}h {timeLeft.minutes}m
                </span>
              </div>

              {COMPUTED_DEALS.map((deal) => (
                <div
                  key={deal.id}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                    deal.popular
                      ? 'bg-orange-950/25 border-orange-500/60 shadow-[0_0_15px_rgba(249,115,22,0.18)]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Full Description & Specs Cell - Spacious & Complete */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-bold text-white text-sm sm:text-base">{deal.name}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          deal.popular
                            ? 'bg-orange-500 text-slate-950'
                            : 'bg-slate-800 text-orange-400 border border-orange-500/30'
                        }`}
                      >
                        {deal.badge}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                        {deal.discountPct}
                      </span>
                    </div>

                    {/* All Bullet Features - Cleanly displayed without any truncation */}
                    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-slate-300 font-mono">
                      {deal.specs.map((spec, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5">
                          <i className="fas fa-check text-orange-400 text-[10px]"></i>
                          <span>{spec}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Referral CTA Button */}
                  <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-left sm:text-right">
                      <div className="text-[11px] text-slate-500 line-through font-mono">
                        Was {deal.originalYearly} ({deal.originalMonthly})
                      </div>
                      <div className="text-base sm:text-lg font-black text-orange-400 font-mono">
                        {deal.promoYearly}{' '}
                        <span className="text-[11px] text-slate-300 font-normal">
                          (Just {deal.promoMonthly})
                        </span>
                      </div>
                    </div>

                    <a
                      href={deal.affiliateUrl}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      onClick={() => handleAffiliateClick(deal, 'in_article_card')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-orange-500/20 whitespace-nowrap font-bold"
                    >
                      <span>Claim Deal</span>
                      <i className="fas fa-arrow-right text-[10px]"></i>
                    </a>
                  </div>
                </div>
              ))}

              <div className="text-[10px] text-slate-500 font-mono pt-1 text-center">
                Affiliate referral partner links. Supports LayerBiz at zero extra cost to you.
              </div>
            </div>
          )}
        </div>
      )}

      {/* 
        2. PERSISTENT FLOATING BOTTOM DOCK
        - Fixed at the bottom of the viewport so it is visible ALL TIME during blog reading & homepage.
        - Click whole bar to expand/collapse the 5 deals.
        - Cloud WOW Box Button.
      */}
      <div
        className={`fixed bottom-0 inset-x-0 z-40 transition-all duration-300 pointer-events-auto ${
          isBottomCollapsed ? 'translate-y-[calc(100%-38px)]' : 'translate-y-0'
        }`}
      >
        <div className="max-w-5xl mx-auto px-2 sm:px-4 pb-2 sm:pb-3">
          <div
            onClick={() => handleToggleBottomExpanded('footer_bar')}
            className="rounded-2xl border-2 border-orange-500/70 hover:border-orange-500 bg-[#090d16]/95 backdrop-blur-xl shadow-[0_-5px_30px_rgba(249,115,22,0.35)] p-2.5 sm:p-3.5 text-white cursor-pointer transition-all group"
          >
            
            {/* Top Bar / Mobile & Desktop Row */}
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              
              {/* Left Side: Panic Indicator + Clear Value Proposition */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                </span>

                <div className="min-w-0">
                  {/* Mobile-First Graphic Badge Row */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 px-1.5 py-0.5 rounded shadow-sm">
                      {promoConfig.badgeText}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                      {promoConfig.headline}
                    </span>
                  </div>

                  {/* Subtitle explaining the concept clearly on both desktop & mobile */}
                  <div className="text-[10px] sm:text-xs text-slate-300 font-sans truncate">
                    {promoConfig.subheadline}
                  </div>
                </div>
              </div>

              {/* Right Side: Contrasting Digital Clock + WOW Cloud Button */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                
                {/* Contrasting Digital Clock */}
                <div className="flex items-center gap-1 font-mono text-orange-400 bg-black/90 px-2 py-1 rounded-lg border border-orange-500/50 text-xs sm:text-sm font-bold shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                  <i className="fas fa-clock text-orange-400 text-xs animate-pulse hidden xs:inline"></i>
                  {timeLeft.days > 0 && (
                    <>
                      <span className="text-amber-300 font-bold">{timeLeft.days}d</span>
                      <span className="text-slate-600">:</span>
                    </>
                  )}
                  <span>{formatDigit(timeLeft.hours)}:</span>
                  <span>{formatDigit(timeLeft.minutes)}:</span>
                  <span className="text-white">{formatDigit(timeLeft.seconds)}</span>
                </div>

                {/* Cloud WOW Box Button */}
                <div className="relative group/btn shrink-0">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg blur opacity-70 group-hover/btn:opacity-100 transition duration-300 animate-pulse"></div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBottomExpanded('wow_button');
                    }}
                    className="relative px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-mono font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-400 hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-1.5 border border-amber-200"
                  >
                    <i className="fas fa-cloud text-slate-900 text-xs"></i>
                    <span>{isBottomExpanded ? 'Close' : '5 Deals'}</span>
                    <i className={`fas fa-chevron-${isBottomExpanded ? 'down' : 'up'} text-[9px]`}></i>
                  </button>
                </div>

                {/* Minimize / Expand Bar Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleBottomCollapse();
                  }}
                  title={isBottomCollapsed ? 'Expand bar' : 'Minimize bar'}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors text-xs"
                >
                  <i className={`fas fa-${isBottomCollapsed ? 'chevron-up' : 'chevron-down'}`}></i>
                </button>
              </div>
            </div>

            {/* Expandable 5 Deals Tray in Floating Dock */}
            {isBottomExpanded && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-3 pt-3 border-t border-slate-800 space-y-2.5 max-h-[55vh] overflow-y-auto pr-1 cursor-default"
              >
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-orange-400 font-bold flex items-center gap-1">
                    <i className="fas fa-cloud text-amber-400 mr-1"></i> 5 Verified 1-Year Flash Deals:
                  </span>
                  <span className="text-amber-400 text-[10px] font-bold">
                    Ends in {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{timeLeft.hours}h {timeLeft.minutes}m
                  </span>
                </div>

                {COMPUTED_DEALS.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="font-bold text-white text-xs">{deal.name}</span>
                        <span className="text-[9px] font-mono text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                          {deal.badge}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold">
                          {deal.discountPct}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-300 text-[11px] font-mono">
                        {deal.specs.map((spec, i) => (
                          <span key={i} className="inline-flex items-center gap-1">
                            <i className="fas fa-check text-orange-400 text-[9px]"></i> {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-left sm:text-right">
                        <div className="text-[10px] text-slate-500 line-through font-mono">
                          Was {deal.originalYearly}
                        </div>
                        <div className="text-xs font-black text-orange-400 font-mono">
                          {deal.promoYearly}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({deal.promoMonthly})
                          </span>
                        </div>
                      </div>

                      <a
                        href={deal.affiliateUrl}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                        onClick={() => handleAffiliateClick(deal, 'sticky_footer')}
                        className="px-3.5 py-1.5 rounded text-[11px] font-mono font-bold uppercase text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 active:scale-95 transition-all whitespace-nowrap shadow-sm shadow-orange-500/20 font-bold"
                      >
                        Claim Deal
                      </a>
                    </div>
                  </div>
                ))}

                <div className="text-[10px] text-slate-500 font-mono text-center pt-1">
                  Affiliate partner referral links. Zero price markup for readers.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
