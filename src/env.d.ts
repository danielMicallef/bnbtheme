/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly PUBLIC_SITE_NAME: string;
    readonly PUBLIC_DETAILED_NAME: string;
    readonly PUBLIC_GOOGLE_ANALYTICS_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

interface Window {
    dataLayer: any[];
}
