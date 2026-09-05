/**
 * Google Analytics 4 (gtag.js) Event Tracking Helpers
 * Provides structured tracking for affiliate link conversions and referral block interactions.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Universal safe wrapper to send custom events to Google Analytics 4.
 */
export function sendGAEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...params,
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.debug(`[GA4 Event] ${eventName}`, params);
    }
  } catch (error) {
    console.error('Failed to dispatch Google Analytics event:', error);
  }
}

export type PromoBlockType = 'in_article_card' | 'sticky_footer';
export type PromoBlockAction = 'expand' | 'collapse' | 'toggle' | 'minimize' | 'restore';
export type PromoTrigger = 'card_body' | 'wow_button' | 'footer_bar' | 'minimize_button';

export interface PromoBlockClickParams {
  blockType: PromoBlockType;
  action: PromoBlockAction;
  trigger: PromoTrigger;
  promoName?: string;
}

/**
 * Tracks clicks and expand/collapse actions on the referral promotion blocks.
 */
export function trackPromoBlockClick({
  blockType,
  action,
  trigger,
  promoName = 'Super VPS Deal',
}: PromoBlockClickParams) {
  sendGAEvent('promo_block_click', {
    event_category: 'promotions',
    block_type: blockType,
    action,
    trigger,
    promo_name: promoName,
  });
}

/**
 * Tracks impressions when the full 5-deals list is expanded by the user.
 */
export function trackPromoDealsView({
  blockType,
  promoName = 'Super VPS Deal',
  dealCount = 5,
}: {
  blockType: PromoBlockType;
  promoName?: string;
  dealCount?: number;
}) {
  sendGAEvent('view_promotion', {
    event_category: 'promotions',
    creative_slot: blockType,
    promotion_name: promoName,
    items_count: dealCount,
  });
}

export interface AffiliateClickParams {
  dealId: string;
  dealName: string;
  dealBadge?: string;
  dealPriceYearly: number;
  dealPriceMonthly: number;
  affiliateUrl: string;
  placement: PromoBlockType;
}

/**
 * Tracks clicks on affiliate links ("Claim Deal").
 * Dispatches both a direct custom 'affiliate_click' event for straightforward GA4 Event reports,
 * and standard GA4 recommended 'select_promotion' for Monetization > Promotions dashboard.
 */
export function trackAffiliateClick({
  dealId,
  dealName,
  dealBadge,
  dealPriceYearly,
  dealPriceMonthly,
  affiliateUrl,
  placement,
}: AffiliateClickParams) {
  // 1. Direct custom event for simple querying and custom dimensions
  sendGAEvent('affiliate_click', {
    event_category: 'affiliate',
    deal_id: dealId,
    deal_name: dealName,
    deal_badge: dealBadge || '',
    deal_price_yearly: dealPriceYearly,
    deal_price_monthly: dealPriceMonthly,
    affiliate_url: affiliateUrl,
    placement,
    outbound: true,
    currency: 'USD',
    value: dealPriceYearly,
  });

  // 2. Standard GA4 recommended ecommerce promotion event
  sendGAEvent('select_promotion', {
    promotion_id: dealId,
    promotion_name: dealName,
    creative_name: dealBadge || 'vps_deal',
    creative_slot: placement,
    items: [
      {
        item_id: dealId,
        item_name: dealName,
        price: dealPriceYearly,
        item_category: 'vps_hosting',
      },
    ],
  });
}
