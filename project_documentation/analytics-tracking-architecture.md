# Google Analytics Event Tracking Architecture

This document provides a high-level summary and architectural overview of how promotional banner interactions and outbound affiliate clicks are tracked in Google Analytics 4 (GA4) across the LayerBiz frontend.

---

## 1. High-Level Architecture Flow

Tracking follows a decoupled 3-tier structure so visual components do not directly handle raw analytics payloads:

```
[ Visitor Interaction ]
         │
         ▼
[ 1. Presentation Layer (VpsPromoBanner.tsx) ]
     - Detects user interaction (card click, toggle dock, affiliate link click)
     - Pulls context from vps-deals.json
         │
         ▼
[ 2. Analytics Dispatcher (lib/analytics.ts) ]
     - Validates GA4 client availability (safe against SSR & AdBlockers)
     - Normalizes event names & builds structured payload
         │
         ▼
[ 3. Google Analytics 4 (gtag.js) ]
     - Dispatches payload to GA4 servers
     - Visible immediately in Realtime / DebugView
```

### Execution Pipeline

1. **User Action**: The visitor toggles the promo card/dock or clicks "Claim Deal".
2. **Component Dispatch**: The UI component invokes a purpose-built handler function.
3. **Safety Check**: The dispatcher verifies that `window.gtag` or `window.dataLayer` is available before dispatching.
4. **Data Transmission**: Standardized events are transmitted directly to the configured GA4 Measurement ID (`NEXT_PUBLIC_GA_ID`).

---

## 2. Event Taxonomy

The system separates interaction diagnostics from high-intent conversion clicks:

| Event Name | Type | Purpose | Triggers When |
| :--- | :--- | :--- | :--- |
| **`promo_block_click`** | Custom Event | Diagnostic tracking for UI block engagement | Visitor expands, collapses, or minimizes the in-article card or floating footer dock |
| **`view_promotion`** | GA4 Recommended | Measures promotional deal visibility | Deals list is expanded and viewed by the reader |
| **`affiliate_click`** | Custom Event | Conversion tracking for monetization | Reader clicks an external "Claim Deal" affiliate link |
| **`select_promotion`** | GA4 Recommended Ecommerce | Populates standard GA4 Monetization reports | Fires concurrently with `affiliate_click` |

---

## 3. Data Dictionary: Key Captured Dimensions

Every event transmits contextual dimensions to allow granular reporting in GA4:

| Dimension / Parameter | Expected Value | Description |
| :--- | :--- | :--- |
| **`block_type`** | `in_article_card` \| `sticky_footer` | Identifies which UI placement was interacted with |
| **`action`** | `expand` \| `collapse` \| `minimize` \| `restore` | Action performed on the promo block |
| **`trigger`** | `card_body` \| `wow_button` \| `footer_bar` \| `minimize_button` | Specific button or click area pressed |
| **`deal_id`** | e.g. `kvm-1`, `kvm-2` | Unique identifier of the clicked offering |
| **`deal_name`** | e.g. `KVM 1 Starter` | Name of the specific plan or product |
| **`deal_price_yearly`** | Numeric string (e.g. `5.99`) | Yearly promotional price point |
| **`placement`** | `in_article_card` \| `sticky_footer` | Location where the conversion link was clicked |
| **`affiliate_url`** | External destination URL | Outbound affiliate referral address |

---

## 4. Key Architectural Benefits

* **Zero Layout Impact**: All tracking runs asynchronously via client callbacks. It never blocks rendering, animations, or countdown timers.
* **AdBlocker Resilience**: The dispatcher handles blocked or absent analytics scripts gracefully without throwing console errors or crashing UI state.
* **Dual Event Strategy**: Custom events (`affiliate_click`) offer instant, human-readable insights in Realtime reports, while GA4 recommended events (`select_promotion`) populate built-in Google Analytics monetization reports automatically.
* **Placement Attribution**: By comparing `in_article_card` versus `sticky_footer`, you can measure whether readers engage more with embedded content or persistent floating bars.

---

## 5. Verification Quick Reference

* **Realtime Verification**: Navigate to **Reports > Realtime** in GA4. Clicks on the banner and affiliate links will reflect in the **Event count by Event name** table within seconds.
* **Detailed Parameter Inspection**: Open GA4 **Admin > DebugView** (with Chrome GA Debugger enabled) to inspect exact parameter values for every click stream.
