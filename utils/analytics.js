// Google Analytics utility functions

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

// Check if analytics should be enabled
const isAnalyticsEnabled = () => {
    if (typeof window === 'undefined') return false;
    if (!GA_TRACKING_ID) return false;

    // Check for DNT (Do Not Track) header
    if (navigator.doNotTrack === '1') return false;

    // You can add cookie consent check here
    // return localStorage.getItem('cookie-consent') === 'accepted';

    return true;
};

// Initialize Google Analytics
export const initGA = () => {
    if (!isAnalyticsEnabled()) return;

    try {
        // Load gtag script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            window.dataLayer.push(arguments);
        }
        window.gtag = gtag;

        gtag('js', new Date());
        gtag('config', GA_TRACKING_ID, {
            page_title: document.title,
            page_location: window.location.href,
            // Privacy settings
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
        });

        console.log('Google Analytics initialized successfully');
    } catch (error) {
        console.warn('Failed to initialize Google Analytics:', error);
    }
};

// Log page views
export const logPageView = (url) => {
    if (!isAnalyticsEnabled() || !window.gtag) return;

    try {
        window.gtag('config', GA_TRACKING_ID, {
            page_path: url,
        });
    } catch (error) {
        console.warn('Failed to log page view:', error);
    }
};

// Log custom events
export const logEvent = (action, category, label, value) => {
    if (!isAnalyticsEnabled() || !window.gtag) return;

    try {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    } catch (error) {
        console.warn('Failed to log event:', error);
    }
};

// Predefined events for BOLAO app
export const logSearch = (searchQuery, resultsCount) => {
    logEvent('search', 'search', searchQuery, resultsCount);
};

export const logProductView = (productId, productName) => {
    logEvent('view_item', 'engagement', `${productName} (${productId})`);
};

export const logFilterUse = (filterType, filterValue) => {
    logEvent('filter_use', 'engagement', `${filterType}: ${filterValue}`);
};

export const logContactAction = (action, productName) => {
    logEvent(action, 'contact', productName);
};

export const logSocialClick = (platform, productName) => {
    logEvent('social_click', 'engagement', `${platform}: ${productName}`);
};

export const logMapInteraction = (action, productName) => {
    logEvent('map_interaction', 'engagement', `${action}: ${productName}`);
};
