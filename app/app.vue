<script setup>
import {
    CloseOutlined,
    ExportOutlined,
    PlusSquareOutlined,
    DownloadOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons-vue'

// --- 1. Dynamic Year ---
const currentYear = new Date().getFullYear()

// --- 2. SEO Setup ---
useSeoMeta({
    title: `Yi Peng Lanna Ticket ${currentYear} - The Golden Passage`,
    ogTitle: `Yi Peng Lanna Ticket - ${currentYear} Chiang Mai`,
    description: `Experience the magic of Yi Peng Festival ${currentYear}. Secure your golden passage now.`,
    ogImage: '/logo.png',
})

// --- 3. States ---
const showBanner = ref(false)
const showCookieConsent = ref(false)
const isPrivacyVisible = ref(false)
const isIOS = ref(false)
const isMacSafari = ref(false)
const deferredPrompt = ref(null)

// --- 4. Logic Functions ---
const acceptCookies = () => {
    localStorage.setItem('cookie_consent_accepted', 'true')
    showCookieConsent.value = false
    isPrivacyVisible.value = false
}

const declineCookies = () => {
    localStorage.setItem('cookie_consent_accepted', 'false')
    showCookieConsent.value = false
}

const installApp = async () => {
    if (deferredPrompt.value) {
        deferredPrompt.value.prompt()
        const { outcome } = await deferredPrompt.value.userChoice
        if (outcome === 'accepted') {
            showBanner.value = false
            deferredPrompt.value = null
        }
    } else {
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

// --- 5. Lifecycle ---
onMounted(() => {
    if (import.meta.client) {
        const ua = navigator.userAgent

        // Cookie logic
        if (!localStorage.getItem('cookie_consent_accepted')) {
            setTimeout(() => {
                showCookieConsent.value = true
            }, 2000)
        }

        // PWA logic
        isIOS.value = /iPad|iPhone|iPod/.test(ua) && !(window).MSStream
        isMacSafari.value =
            /Safari/.test(ua) && /Apple Computer/.test(navigator.vendor) && !/Chrome/.test(ua) && !isIOS.value

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault()
            deferredPrompt.value = e
            if (!localStorage.getItem('pwa_banner_dismissed')) showBanner.value = true
        })
    }
})
</script>

<template>
    <div class="lanna-app-root">
        <NuxtLayout>
            <div class="lanna-app-wrapper">
                <NuxtPage />

                <ClientOnly>
                    <Transition name="lanna-pwa-slide-down">
                        <div v-if="showBanner" class="pwa-install-banner-top">
                            <button class="close-btn" @click="dismissBanner"><CloseOutlined /></button>
                            <div class="banner-content">
                                <div class="app-icon"><img src="/pwa-192x192.png" alt="App Logo" /></div>
                                <div class="text-group">
                                    <h3>Install Yi Peng App {{ currentYear }}</h3>
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
                                <div v-else class="apple-guide-icon"><PlusSquareOutlined /></div>
                            </div>
                        </div>
                    </Transition>

                    <Transition name="cookie-slide-up">
                        <div v-if="showCookieConsent" class="cookie-consent-bottom">
                            <div class="cookie-content">
                                <span class="cookie-icon"><CheckCircleOutlined /></span>
                                <div class="cookie-text">
                                    <p>
                                        We use cookies to enhance your experience in {{ currentYear }}.
                                        <span @click="isPrivacyVisible = true" class="gold-link" style="cursor: pointer"
                                            >Privacy Policy</span
                                        >
                                    </p>
                                </div>
                                <div class="cookie-btns">
                                    <button @click="declineCookies" class="decline-btn">Decline</button>
                                    <button @click="acceptCookies" class="accept-btn">Accept</button>
                                </div>
                            </div>
                        </div>
                    </Transition>

                    <PrivacyModal v-model:open="isPrivacyVisible" @accept="acceptCookies" />
                </ClientOnly>
            </div>
        </NuxtLayout>
    </div>
</template>

<style lang="scss">
.lanna-app-wrapper {
    min-height: 100vh;
    position: relative;
}

// --- PWA Banner (Top) ---
.pwa-install-banner-top {
    position: fixed;
    top: 20px;
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
                .gold-icon {
                    color: #d4af37;
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
        }
        .apple-guide-icon {
            color: #d4af37;
            font-size: 28px;
        }
    }
}

// --- Cookie Consent (Bottom) ---
.cookie-consent-bottom {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    z-index: 9999;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 16px;
    padding: 15px 20px;
    max-width: 600px;
    margin: 0 auto;

    .cookie-content {
        display: flex;
        align-items: center;
        gap: 15px;
        .cookie-icon {
            color: #d4af37;
            font-size: 20px;
        }
        .cookie-text {
            flex: 1;
            p {
                color: #e2e8f0;
                font-size: 13px;
                margin: 0;
                .gold-link {
                    color: #d4af37;
                    text-decoration: underline;
                }
            }
        }
        .cookie-btns {
            display: flex;
            gap: 10px;
            button {
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
            }
            .decline-btn {
                background: transparent;
                border: 1px solid #475569;
                color: #94a3b8;
            }
            .accept-btn {
                background: #d4af37;
                border: none;
                color: #000;
            }
        }
    }
}

// --- Privacy Modal Custom Styles ---
.lanna-privacy-modal {
    .ant-modal-content {
        background: rgba(10, 15, 30, 0.98) !important;
        backdrop-filter: blur(25px);
        border: 1px solid rgba(212, 175, 55, 0.4);
        border-radius: 24px;
        color: #fff;
    }
    .ant-modal-close {
        color: #d4af37;
    }

    .modal-inner {
        padding: 10px;
        .modal-header {
            text-align: center;
            .sub-label {
                letter-spacing: 3px;
                font-size: 0.7rem;
                color: rgba(255, 255, 255, 0.5);
            }
            h2 {
                font-family: 'Playfair Display', serif;
                font-size: 2rem;
                margin: 10px 0;
            }
        }
        .modal-scroll-content {
            max-height: 50vh;
            overflow-y: auto;
            padding-right: 10px;
            margin: 25px 0;
            &::-webkit-scrollbar {
                width: 3px;
            }
            &::-webkit-scrollbar-thumb {
                background: #d4af37;
            }
            .policy-item {
                margin-bottom: 25px;
                h3 {
                    color: #d4af37;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                }
                p {
                    color: rgba(255, 255, 255, 0.8);
                    line-height: 1.6;
                    font-size: 0.95rem;
                }
            }
        }
        .modal-footer-action {
            text-align: center;
            .modal-accept-btn {
                background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
                color: #000;
                border: none;
                padding: 12px 35px;
                border-radius: 12px;
                font-weight: 800;
                cursor: pointer;
                transition: all 0.3s;
                &:hover {
                    transform: scale(1.05);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
                }
            }
        }
    }
}

// --- Transitions & Dividers ---
.lanna-divider-small {
    width: 60px;
    height: 1px;
    background: #d4af37;
    margin: 20px auto;
    position: relative;
    &::after {
        content: '✦';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #0a0f1e;
        padding: 0 8px;
        color: #d4af37;
        font-size: 0.6rem;
    }
}

.lanna-pwa-slide-down-enter-active,
.lanna-pwa-slide-down-leave-active {
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.lanna-pwa-slide-down-enter-from,
.lanna-pwa-slide-down-leave-to {
    opacity: 0;
    transform: translateY(-100px);
}
.cookie-slide-up-enter-active,
.cookie-slide-up-leave-active {
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.cookie-slide-up-enter-from,
.cookie-slide-up-leave-to {
    opacity: 0;
    transform: translateY(100px);
}
.gold-text {
    color: #d4af37;
    font-weight: bold;
}
</style>
