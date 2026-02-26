<script setup>
import { CloseOutlined, ExportOutlined, PlusSquareOutlined, DownloadOutlined } from '@ant-design/icons-vue'

// --- SEO & Meta Setup ---
useSeoMeta({
    title: 'Yi Peng Lanna Ticket - The Golden Passage',
    ogTitle: 'Yi Peng Lanna Ticket - 2026 Chiang Mai',
    description: 'Experience the magic of Yi Peng Festival. Secure your golden passage now.',
    ogImage: '/logo.png',
})

const { $pwa } = useNuxtApp()
const showBanner = ref(false)
const isIOS = ref(false)
const isMacSafari = ref(false)
const deferredPrompt = ref(null)

onMounted(() => {
    // ใช้ import.meta.client แทน process.client
    if (import.meta.client) {
        const ua = navigator.userAgent

        // 1. จำแนกประเภทอุปกรณ์
        isIOS.value = /iPad|iPhone|iPod/.test(ua) && !window.MSStream
        isMacSafari.value =
            /Safari/.test(ua) && /Apple Computer/.test(navigator.vendor) && !/Chrome/.test(ua) && !isIOS.value

        // 2. ดักจับสัญญาณติดตั้ง (Native Install Signal)
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('✅ PWA: Signal received. Ready to install.')
            e.preventDefault()
            deferredPrompt.value = e // เก็บ Event ไว้เพื่อเรียก .prompt()

            // แสดง Banner เฉพาะคนที่ยังไม่เคยปิด
            if (!localStorage.getItem('pwa_banner_dismissed')) {
                showBanner.value = true
            }
        })

        // 3. ตรวจสอบโหมด Standalone (ถ้าเปิดในแอปอยู่แล้วไม่ต้องโชว์)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches

        if (!isStandalone) {
            const isDismissed = localStorage.getItem('pwa_banner_dismissed')

            // สำหรับ Apple (iOS/Mac Safari) ที่ไม่มีสัญญาณข้างต้น
            if ((isIOS.value || isMacSafari.value) && !isDismissed) {
                setTimeout(() => {
                    showBanner.value = true
                }, 4000)
            }
        }
    }
})

const installApp = async () => {
    // กรณี Chrome/Edge บน Mac/PC/Android: เรียก Native Prompt ทันที
    if (deferredPrompt.value) {
        console.log('🚀 Triggering Native Install Prompt...')
        deferredPrompt.value.prompt()

        const { outcome } = await deferredPrompt.value.userChoice
        console.log(`User response: ${outcome}`)

        if (outcome === 'accepted') {
            showBanner.value = false
            deferredPrompt.value = null
        }
    }
    // กรณีฉุกเฉินหรือ Apple ที่ต้องใช้ Manual Guide
    else {
        let msg = 'To install: '
        if (isIOS.value) msg += 'Tap Share > Add to Home Screen'
        else if (isMacSafari.value) msg += 'Go to File > Add to Dock...'
        else msg += 'Click the [⊕] icon in the address bar.'

        alert(msg)
    }
}

const dismissBanner = () => {
    showBanner.value = false
    localStorage.setItem('pwa_banner_dismissed', 'true')
}
</script>

<template>
    <NuxtLayout>
        <div class="lanna-app-wrapper">
            <NuxtPage />

            <ClientOnly>
                <Transition name="lanna-pwa-slide">
                    <div v-if="showBanner" class="pwa-install-banner">
                        <button class="close-btn" @click="dismissBanner">
                            <CloseOutlined />
                        </button>

                        <div class="banner-content">
                            <div class="app-icon">
                                <img src="/pwa-192x192.png" alt="App Logo" />
                            </div>

                            <div class="text-group">
                                <h3>Install Yi Peng App</h3>
                                <p v-if="isIOS">
                                    Tap <ExportOutlined class="gold-icon" /> then
                                    <strong>"Add to Home Screen"</strong>
                                </p>
                                <p v-else-if="isMacSafari">
                                    Go to <strong>File</strong> > <strong>Add to Dock...</strong>
                                </p>
                                <p v-else>Fast access and offline ticket viewing.</p>
                            </div>

                            <button v-if="!isIOS && !isMacSafari" @click="installApp" class="action-btn">
                                <DownloadOutlined /> INSTALL
                            </button>

                            <div v-else class="apple-guide-icon">
                                <PlusSquareOutlined />
                            </div>
                        </div>
                    </div>
                </Transition>
            </ClientOnly>
        </div>
    </NuxtLayout>
</template>

<style lang="scss">
/* CSS คงเดิมตามที่คุณปรับแต่งไว้ */
.lanna-app-wrapper {
    min-height: 100vh;
    position: relative;
}
.pwa-install-banner {
    position: fixed;
    bottom: 30px;
    left: 20px;
    right: 20px;
    max-width: 500px;
    margin: 0 auto;
    background: rgba(10, 15, 30, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(212, 175, 55, 0.5);
    border-radius: 24px;
    padding: 20px;
    z-index: 10000;
    box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.8);

    .close-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        font-size: 16px;
        &:hover {
            color: #d4af37;
        }
    }
    .banner-content {
        display: flex;
        align-items: center;
        gap: 16px;
        .app-icon {
            width: 56px;
            height: 56px;
            border-radius: 14px;
            border: 1px solid #d4af37;
            overflow: hidden;
            flex-shrink: 0;
            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }
        .text-group {
            flex: 1;
            h3 {
                color: #d4af37;
                margin: 0;
                font-size: 17px;
                font-weight: 700;
            }
            p {
                color: #cbd5e1;
                margin: 4px 0 0;
                font-size: 13px;
                line-height: 1.4;
                .gold-icon {
                    color: #d4af37;
                }
                strong {
                    color: #fff;
                }
            }
        }
        .action-btn {
            background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 13px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: transform 0.2s;
            &:active {
                transform: scale(0.95);
            }
        }
        .apple-guide-icon {
            color: #d4af37;
            font-size: 28px;
        }
    }
}
.lanna-pwa-slide-enter-active,
.lanna-pwa-slide-leave-active {
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.lanna-pwa-slide-enter-from,
.lanna-pwa-slide-leave-to {
    opacity: 0;
    transform: translateY(100px) scale(0.9);
}
</style>
