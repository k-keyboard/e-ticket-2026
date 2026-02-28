<script setup>
import { storeToRefs } from 'pinia'
import { UserOutlined, LogoutOutlined, AuditOutlined, DownOutlined, HomeOutlined } from '@ant-design/icons-vue'
import GoogleTranslateSelect from '@google-translate-select/vue3'


const authStore = useAuthStore()
const { isLoggedIn, user } = storeToRefs(authStore)

const userInitial = computed(() => user.value?.email?.charAt(0).toUpperCase() || 'U')
const displayName = computed(() => (user.value?.email ? user.value.email.split('@')[0] : 'Guest'))

const handleLogout = () => {
    authStore.clearAuth()
    navigateTo('/login')
}

const handleGoogleTranslateSelect = (language) => {
    console.log(language)
}
</script>

<template>
    <a-layout class="main-layout">
        <a-layout-header class="custom-header">
            <div class="header-content">
                <div class="logo-zone">
                    <NuxtLink to="/" class="logo-link">
                        <div class="brand-text">
                            <span class="small-brand">CHIANG MAI</span>
                            <span class="main-brand">YI PENG <span class="gold-accent">2026</span></span>
                        </div>
                    </NuxtLink>
                </div>

                <div class="user-zone">
                    <div class="lanna-translate-container">
                        <GoogleTranslateSelect
                            default-language-code="en"
                            trigger="click"
                            :languages="[
                                { code: 'en', name: 'English' },
                                { code: 'th', name: 'ภาษาไทย' },
                                { code: 'zh-CN', name: '简体中文' },
                                { code: 'ja', name: '日本語' },
                                { code: 'ko', name: '한국어' },
                            ]"
                        >
                            <template #trigger="{ selectedLanguage }">
                                <div class="custom-vgt-trigger">
                                    <GlobalOutlined class="gold-icon" />
                                    <span class="lang-label">{{ selectedLanguage?.name || 'Language' }}</span>
                                    <DownOutlined class="arrow-icon" />
                                </div>
                            </template>
                        </GoogleTranslateSelect>
                    </div>
                    <template v-if="isLoggedIn">
                        <a-popover
                            placement="bottomRight"
                            trigger="click"
                            overlayClassName="user-popover-wrapper"
                            :arrow="false"
                            :mouseEnterDelay="0.1"
                        >
                            <template #content>
                                <div class="popover-inner">
                                    <div class="user-profile-header">
                                        <a-avatar class="large-avatar">{{ userInitial }}</a-avatar>
                                        <div class="info">
                                            <div class="name">{{ displayName }}</div>
                                            <div class="role-tag">{{ user?.role || 'Member' }}</div>
                                        </div>
                                    </div>
                                    <div class="divider"></div>
                                    <nav class="popover-nav">
                                        <NuxtLink to="/" class="nav-item">
                                            <HomeOutlined /> <span>Home</span>
                                        </NuxtLink>
                                        <NuxtLink to="/my-tickets" class="nav-item">
                                            <AuditOutlined /> <span>My Tickets</span>
                                        </NuxtLink>
                                    </nav>
                                    <div class="divider"></div>
                                    <div class="popover-footer">
                                        <button class="logout-action" @click="handleLogout">
                                            <LogoutOutlined /> <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            </template>

                            <div class="user-trigger">
                                <a-avatar class="user-avatar">{{ userInitial }}</a-avatar>
                                <div class="user-info-text">
                                    <span class="username">{{ displayName }}</span>
                                    <span class="user-role">{{ user?.role || 'Member' }}</span>
                                </div>
                                <DownOutlined class="icon-arrow" />
                            </div>
                        </a-popover>
                    </template>
                    <template v-else>
                        <a-button type="primary" class="login-btn" @click="navigateTo('/login')"> SIGN IN </a-button>
                    </template>
                </div>
            </div>
        </a-layout-header>

        <a-layout-content class="main-content">
            <div class="page-wrapper"><slot /></div>
        </a-layout-content>

        <a-layout-footer class="custom-footer">
            <div class="footer-container">
                <div class="footer-line"></div>
                <p class="footer-text">CHIANG MAI HERITAGE &bull; YI PENG FESTIVAL</p>
                <p class="copyright">© 2026 Created with Passion</p>
            </div>
        </a-layout-footer>
    </a-layout>
</template>

<style lang="scss" scoped>
@use 'sass:color'; 

$color-gold: #d4af37;
$night: #020617;

.main-layout {
    min-height: 100vh;
    background: $night;
}

.custom-header {
    position: fixed;
    z-index: 1000;
    width: 100%;
    height: 70px;
    line-height: 70px;
    background: rgba(2, 6, 23, 0.8);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba($color-gold, 0.2);
    padding: 0 16px;
    @media (min-width: 768px) {
        height: 80px;
        line-height: 80px;
        padding: 0 24px;
    }
    .header-content {
        height: 100%;
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}

.logo-zone {
    .brand-text {
        display: flex;
        flex-direction: column;
        line-height: 1.1;
        .small-brand {
            font-size: 0.6rem;
            letter-spacing: 3px;
            color: $color-gold;
            font-weight: 800;
        }
        .main-brand {
            font-size: 1.1rem;
            color: #fff;
            font-weight: 700;
            .gold-accent {
                color: $color-gold;
            }
        }
        @media (min-width: 768px) {
            .small-brand {
                font-size: 0.7rem;
                letter-spacing: 5px;
            }
            .main-brand {
                font-size: 1.4rem;
            }
        }
    }
}

.user-zone {
    display: flex;
    gap: 8px;
    height: 32px;
    & :deep(.language-selector) {
        height: 70px !important;
        & .language-dropdown {
            height: 32px;
            padding: 0 16px !important;
            border-radius: 8px;
            & .selected-language {
                height: 32px;
            }
            & .language-options > li {
                line-height: normal !important;
            }
        }
    }
    .user-trigger {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 4px 4px 4px 12px;
        border-radius: 50px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba($color-gold, 0.2);
        transition: all 0.3s ease;
        &:hover {
            background: rgba($color-gold, 0.15);
            border-color: $color-gold;
        }
        .user-avatar {
            background-color: $color-gold;
            color: #000;
            font-weight: bold;
        }
        .user-info-text {
            display: none;
            flex-direction: column;
            line-height: 1.2;
            .username {
                color: #fff;
                font-weight: 600;
                font-size: 0.85rem;
            }
            .user-role {
                color: rgba(255, 255, 255, 0.5);
                font-size: 0.7rem;
            }
            @media (min-width: 768px) {
                display: flex;
            }
        }
        .icon-arrow {
            color: $color-gold;
            font-size: 0.7rem;
            margin-right: 8px;
            @media (max-width: 767px) {
                display: none;
            }
        }
    }
    .login-btn {
        background: $color-gold;
        border: none;
        color: #000;
        font-weight: bold;
        border-radius: 50px;
        &:hover {
            background: #fff;
            color: $color-gold;
        }
    }
}

.main-content {
    padding-top: 70px;
    @media (min-width: 768px) {
        padding-top: 80px;
    }
}

.custom-footer {
    background: color.adjust($night, $lightness: -2%); // ใช้แทน darken
    padding: 40px 20px;
    text-align: center;
    .footer-line {
        width: 40px;
        height: 2px;
        background: $color-gold;
        margin: 0 auto 20px;
    }
    .footer-text {
        color: $color-gold;
        letter-spacing: 2px;
        font-size: 0.8rem;
        margin-bottom: 8px;
    }
    .copyright {
        color: rgba(255, 255, 255, 0.3);
        font-size: 0.7rem;
    }
}
</style>

<style lang="scss">
.user-popover-wrapper {
    padding-top: 12px;

    .ant-popover-inner {
        background-color: transparent !important;
        padding: 0 !important;
        box-shadow: none !important;
    }

    .ant-popover-inner-content {
        padding: 0 !important;
    }

    .popover-inner {
        width: 260px;
        background: #0f172a;
        border-radius: 16px;
        border: 1px solid rgba(212, 175, 55, 0.3);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
        overflow: hidden;
        animation: popoverFade 0.2s ease-out;

        .user-profile-header {
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%);

            .large-avatar {
                width: 44px;
                height: 44px;
                line-height: 44px;
                background: #d4af37;
                color: #020617;
                font-size: 18px;
                font-weight: 700;
                box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
            }

            .info {
                .name {
                    color: #fff;
                    font-weight: 700;
                    font-size: 15px;
                    margin-bottom: 2px;
                }
                .role-tag {
                    display: inline-block;
                    padding: 2px 8px;
                    background: rgba(212, 175, 55, 0.1);
                    color: #d4af37;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
            }
        }

        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent);
        }

        .popover-nav {
            padding: 8px;
            .nav-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                color: rgba(255, 255, 255, 0.7) !important;
                border-radius: 10px;
                font-weight: 500;
                transition: all 0.2s;

                span {
                    font-size: 14px;
                }
                .anticon {
                    font-size: 16px;
                    color: #d4af37;
                }

                &:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff !important;
                    transform: translateX(4px);
                }
            }
        }

        .popover-footer {
            padding: 8px;
            .logout-action {
                width: 100%;
                padding: 12px;
                border-radius: 10px;
                background: rgba(255, 120, 117, 0.05);
                border: none;
                color: #ff7875;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s;

                &:hover {
                    background: #ff7875;
                    color: #fff;
                }
            }
        }
    }
}

@keyframes popoverFade {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 576px) {
    .user-popover-wrapper {
        width: calc(100vw - 32px) !important;
        left: 16px !important;
        right: 16px !important;

        .popover-inner {
            width: 100%;
            max-width: none;
        }
    }
}

.lanna-translate-container {
    background: $slate;
    border-radius: 50px;
    display: flex;
    align-items: center;
    & .google-translate-select-dropdown__activator {
        line-height: normal;
        color: #fff;
    }
}
</style>
