<script setup>
    import { UserOutlined, LogoutOutlined, AuditOutlined, DownOutlined, HomeOutlined } from '@ant-design/icons-vue'
    
    // เรียกใช้ Auth Store เพื่อเอาข้อมูลจริงมาแสดง
    const authStore = useAuthStore()
    
    const handleLogout = () => {
        authStore.clearAuth()
        navigateTo('/login')
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
                                <span class="main-brand">YI PENG <span class="gold-accent">2025</span></span>
                            </div>
                        </NuxtLink>
                    </div>
    
                    <div class="user-zone">
                        <template v-if="authStore.isLoggedIn">
                            <a-popover
                                placement="bottom"
                                trigger="click"
                                overlayClassName="user-popover-wrapper"
                                :arrow="false"
                            >
                                <template #content>
                                    <div class="popover-inner">
                                        <div class="user-profile-header">
                                            <a-avatar class="large-avatar" :size="48">
                                                <template #icon><UserOutlined /></template>
                                            </a-avatar>
                                            <div class="info">
                                                <div class="name">{{ authStore.user?.email }}</div>
                                                <div class="email">{{ authStore.user?.role }}</div>
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
    
                                        <button class="logout-action" @click="handleLogout">
                                            <LogoutOutlined /> <span>Sign Out</span>
                                        </button>
                                    </div>
                                </template>
    
                                <div class="user-trigger">
                                    <a-avatar class="user-avatar">
                                        <template #icon><UserOutlined /></template>
                                    </a-avatar>
                                    <div class="user-info-text">
                                        <span class="username">{{ authStore.user?.email }}</span>
                                        <span class="user-role">{{ authStore.user?.role }}</span>
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
                <div class="page-wrapper">
                    <slot />
                </div>
            </a-layout-content>
    
            <a-layout-footer class="custom-footer">
                <div class="footer-container">
                    <div class="footer-line"></div>
                    <p class="footer-text">CHIANG MAI HERITAGE &bull; YI PENG FESTIVAL E-TICKET SYSTEM</p>
                    <p class="copyright">© 2025 Created with Passion by Your Name</p>
                </div>
            </a-layout-footer>
        </a-layout>
    </template>
<style lang="scss" scoped>
.main-layout {
    min-height: 100vh;
    background: $color-night-blue;
}

.custom-header {
    position: fixed;
    z-index: 1000;
    width: 100%;
    height: 80px;
    line-height: 80px;
    @include glass-effect;
    border-radius: 0 !important;
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    padding: 0 24px;

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
    .logo-link {
        text-decoration: none;
    }
    .brand-text {
        display: flex;
        flex-direction: column;
        line-height: 1.1;
        .small-brand {
            font-size: 0.7rem;
            letter-spacing: 5px;
            color: $color-gold;
            font-weight: 800;
        }
        .main-brand {
            font-size: 1.4rem;
            color: #fff;
            font-family: 'Playfair Display', serif;
            font-weight: 700;
            .gold-accent {
                color: $color-gold;
            }
        }
    }
}

.user-zone {
    .user-trigger {
        display: flex;
        align-items: center;
        gap: 15px;
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 50px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
        height: 50px;

        &:hover {
            background: rgba($color-gold, 0.1);
            border-color: rgba($color-gold, 0.4);
        }

        .user-avatar {
            background-color: $color-gold;
            color: #000;
        }
        .user-info-text {
            display: flex;
            flex-direction: column;
            line-height: 1.2;
            .username {
                color: #fff;
                font-weight: 600;
                font-size: 0.9rem;
            }
            .user-role {
                color: rgba(255, 255, 255, 0.4);
                font-size: 0.7rem;
            }
        }
        .icon-arrow {
            color: $color-gold;
            font-size: 0.75rem;
        }
    }
}

.main-content {
    padding-top: 80px;
}

.custom-footer {
    background: $color-deep-bg;
    color: rgba(255, 255, 255, 0.5);
    padding: 60px 20px;
    text-align: center;
    .footer-line {
        width: 60px;
        height: 3px;
        background: linear-gradient(90deg, transparent, $color-gold, transparent);
        margin: 0 auto 25px;
    }
    .footer-text {
        color: $color-gold;
        letter-spacing: 3px;
        font-weight: 600;
    }
}
</style>

<style lang="scss">
.user-popover-wrapper {
    & .ant-popover-inner {
        background-color: unset;
        padding: 0;
    }
    // สไตล์เนื้อหาภายในที่เราออกแบบ
    .popover-inner {
        width: 260px;
        background: #0f172a;
        border-radius: 12px;
        overflow: hidden;

        .user-profile-header {
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(212, 175, 55, 0.05);

            .large-avatar {
                background: #d4af37;
                color: #0f172a;
            }

            .info {
                .name {
                    color: #fff;
                    font-weight: 600;
                    font-size: 14px;
                    line-height: 1.4;
                }
                .email {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                }
            }
        }

        .divider {
            height: 1px;
            background: rgba(212, 175, 55, 0.2);
        }

        .popover-nav {
            padding: 8px;
            .nav-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 16px;
                color: rgba(255, 255, 255, 0.8) !important;
                border-radius: 8px;
                transition: 0.2s;
                text-decoration: none;

                &:hover {
                    background: rgba(212, 175, 55, 0.1);
                    color: #d4af37 !important;
                }
            }
        }

        .logout-action {
            width: 100%;
            padding: 12px 24px;
            background: transparent;
            border: none;
            color: #ff7875;
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            transition: 0.2s;

            &:hover {
                background: rgba(255, 120, 117, 0.1);
            }
        }
    }
}
</style>
