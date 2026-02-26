// nuxt.config.ts
export default defineNuxtConfig({
    compatibilityDate: '2025-12-28',
    app: {
        head: {
            charset: 'utf-8',
            title: 'Yi Peng Lanna Ticket - The Golden Passage',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: 'Experience the magic of Yi Peng Festival in Chiang Mai.' },
                { name: 'theme-color', content: '#020617' },
                { name: 'mobile-web-app-capable', content: 'yes' },
                { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
                { name: 'apple-mobile-web-app-title', content: 'Yi Peng' }
            ],
            link: [
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
                { rel: 'apple-touch-icon', href: '/pwa-192x192.png' },
                // บังคับเรียก manifest ตรงๆ เพื่อความไวในการตรวจจับของเบราว์เซอร์
                { rel: 'manifest', href: '/manifest.webmanifest' }
            ]
        }
    },

    future: {
        compatibilityVersion: 4,
    },

    css: [
        'ant-design-vue/dist/reset.css',
        '~/assets/scss/main.scss'
    ],

    modules: [
        '@ant-design-vue/nuxt',
        '@pinia/nuxt',
        'pinia-plugin-persistedstate/nuxt',
        '@unlok-co/nuxt-stripe',
        'nuxt-tiptap-editor',
        [
            '@vite-pwa/nuxt',
            {
                registerType: 'autoUpdate',
                devOptions: {
                    enabled: true,
                    type: 'module',
                },
                manifest: {
                    id: '/',
                    name: 'Yi Peng Lanna Ticket',
                    short_name: 'YiPeng',
                    description: 'The Golden Passage to Yi Peng Festival',
                    start_url: '/',
                    scope: '/',
                    display: 'standalone',
                    theme_color: '#020617',
                    background_color: '#020617',
                    icons: [
                        {
                            src: '/pwa-192x192.png',
                            sizes: '192x192',
                            type: 'image/png',
                            purpose: 'any' // ช่วยให้ Chrome ยอมรับการติดตั้งง่ายขึ้น
                        },
                        {
                            src: '/pwa-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'maskable' // สำหรับ Adaptive Icons
                        },
                    ],
                },
                workbox: {
                    navigateFallback: '/',
                    // แก้ไข Warning: สแกนไฟล์เฉพาะตอน Production เท่านั้น
                    globPatterns: process.env.NODE_ENV === 'production'
                        ? ['**/*.{js,css,html,png,svg,ico}']
                        : [],
                    cleanupOutdatedCaches: true
                }
            }
        ],
    ],

    runtimeConfig: {
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT,
        smtpUser: process.env.SMTP_USER,
        smtpPass: process.env.SMTP_PASS,

        public: {
            siteUrl: process.env.PUBLIC_SITE_URL || 'http://localhost:3000',
            apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000'
        }
    },

    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: '@use "~/assets/scss/_variables.scss" as *;'
                }
            }
        }
    },

    stripe: {
        server: { key: process.env.STRIPE_SECRET_KEY },
        client: { key: process.env.STRIPE_PUBLISHABLE_KEY }
    },

    routeRules: {
        '/api/**': {
            cors: true,
            headers: {
                'Access-Control-Allow-Origin': process.env.PUBLIC_SITE_URL || '*',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            },
        },
    },
})