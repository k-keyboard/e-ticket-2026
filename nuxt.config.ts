// nuxt.config.ts
export default defineNuxtConfig({
    compatibilityDate: '2025-12-28',

    // เปิดโครงสร้าง Nuxt 4 อย่างเต็มตัว
    future: {
        compatibilityVersion: 4,
    },

    // รวมไฟล์ CSS/SCSS หลักของโปรเจกต์
    css: [
        'ant-design-vue/dist/reset.css', // Reset สไตล์ของ Antd
        '~/assets/scss/main.scss'       // ไฟล์ SCSS หลักของคุณ
    ],

    // เพิ่ม Modules ที่จำเป็น
    modules: [
        '@ant-design-vue/nuxt',
        // อย่าลืมใส่บรรทัดนี้หลังจาก yarn add @pinia/nuxt นะครับ
        '@pinia/nuxt',
        '@unlok-co/nuxt-stripe'
    ],

    // ตั้งค่าเพิ่มเติมสำหรับ Ant Design Vue (ถ้ามี)
    antd: {
        // เช่น การตั้งค่า extractStyle: true สำหรับโปรเจกต์ขนาดใหญ่
    },

    // การตั้งค่า Vite สำหรับ SCSS (ทางเลือก)
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    // หากคุณมีไฟล์รวมตัวแปร อยากให้เรียกใช้ได้ทุกที่โดยไม่ต้อง import
                    additionalData: '@use "~/assets/scss/_variables.scss" as *;'
                }
            }
        }
    },

    stripe: {
        server: {
            key: process.env.STRIPE_SECRET_KEY,
        },
        client: {
            key: process.env.STRIPE_PUBLISHABLE_KEY,
        }
    },

    runtimeConfig: {
        public: {
            // ใช้ค่าจาก .env ถ้าไม่มีให้ใช้ localhost:3000 เป็นค่าเริ่มต้น
            apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000'
        }
    },

    routeRules: {
        '/api/**': {
            cors: true,
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials': 'true',
            },
        },
    },
})