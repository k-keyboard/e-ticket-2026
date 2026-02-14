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
                { name: 'apple-mobile-web-app-capable', content: 'yes' },
                { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
                { name: 'apple-mobile-web-app-title', content: 'Yi Peng' }
            ],

            // การกำหนด Favicon และ Font
            link: [
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
                { rel: 'apple-touch-icon', href: '/pwa-192x192.png' } // สำหรับ iOS
            ]
        }
    },

    // เปิดโครงสร้าง Nuxt 4 อย่างเต็มตัว
    future: {
        compatibilityVersion: 4,
    },

    // รวมไฟล์ CSS/SCSS หลัก
    css: [
        'ant-design-vue/dist/reset.css',
        '~/assets/scss/main.scss'
    ],

    // เพิ่ม Modules
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
            theme_color: '#020617', // $color-night
            background_color: '#020617',
            display: 'standalone',
            display_override: ['standalone', 'window-controls-overlay'],
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            icons: [
                {
                    src: 'pwa-192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                },
                {
                    src: 'pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable',
                }
            ]
        },
        workbox: {
            navigateFallback: '/',
            globPatterns: ['**/*.{js,css,html,png,svg,ico}'], // Cache ไฟล์พื้นฐาน
            maximumFileSizeToCacheInBytes: 5242880,
        },
        devOptions: {
            enabled: true, // เปิดให้ทดสอบได้ในโบท dev (จะเห็น Service Worker ใน DevTools)
            type: 'classic',
        }
    },

    tiptap: {
        prefix: 'Tiptap',
    },

    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    // เรียกใช้ Variable ทั่วโปรเจกต์
                    additionalData: '@use "~/assets/scss/_variables.scss" as *;'
                }
            }
        }
    },

    stripe: {
        server: { key: process.env.STRIPE_SECRET_KEY },
        client: { key: process.env.STRIPE_PUBLISHABLE_KEY }
    },

    runtimeConfig: {
        public: {
            siteUrl: process.env.PUBLIC_SITE_URL,
            apiBase: process.env.NUXT_PUBLIC_API_BASE
        }
    },

    routeRules: {
        '/api/**': {
            cors: true,
            headers: {
                'Access-Control-Allow-Origin': '*', // ปรับเป็น Site URL เมื่อขึ้น Production
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials': 'true',
            },
        },
    },
})