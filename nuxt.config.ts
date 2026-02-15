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
                { rel: 'apple-touch-icon', href: '/pwa-192x192.png' }
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
        '@vite-pwa/nuxt',
    ],

    pwa: {
        registerType: 'autoUpdate',
        manifest: {
            name: 'Yi Peng Lanna Ticket',
            short_name: 'YiPeng',
            description: 'The Golden Passage to Yi Peng Festival',
            theme_color: '#020617',
            background_color: '#020617',
            display: 'standalone',
            orientation: 'portrait',
            start_url: '/',
            icons: [
                { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
            ]
        },
        workbox: {
            navigateFallback: '/',
            navigateFallbackDenylist: [/^\/api/], // ไม่ต้อง fallback สำหรับ API
            globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
            cleanupOutdatedCaches: true,
        },
        devOptions: {
            enabled: true, // ปิดไว้ตามเดิมเพื่อ Debug หน้าเว็บหลักให้ผ่านก่อน
            type: 'module',
            suppressWarnings: true
        }
    },

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