<script setup>
import {
    DashboardOutlined,
    IdcardOutlined,
    UserOutlined,
    ScheduleOutlined,
    PictureOutlined,
    FileTextOutlined,
    SettingOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    ProfileOutlined,
    ScanOutlined,
    VerticalAlignTopOutlined,
    BellOutlined,
    CaretDownOutlined,
} from '@ant-design/icons-vue'
import { Grid } from 'ant-design-vue'

const { useBreakpoint } = Grid
const screens = useBreakpoint()
const route = useRoute()

const collapsed = ref(false)
const drawerVisible = ref(false)
const selectedKeys = ref([])

const menuItems = [
    { key: '1', icon: DashboardOutlined, label: 'Dashboard', path: '/admin' },
    { key: '2', icon: IdcardOutlined, label: 'จัดการตั๋ว', path: '/admin/tickets' },
    { key: '3', icon: ProfileOutlined, label: 'คำสั่งซื้อ', path: '/admin/orders' },
    { key: '4', icon: UserOutlined, label: 'จัดการผู้ใช้งาน', path: '/admin/users' },
    { key: '5', icon: ScheduleOutlined, label: 'จัดการกิจกรรม', path: '/admin/events' },
    { key: '6', icon: PictureOutlined, label: 'จัดการแกลอรี่', path: '/admin/gallery' },
    { key: '7', icon: FileTextOutlined, label: 'จัดการบทความ', path: '/admin/articles' },
    { key: '8', icon: SettingOutlined, label: 'ตั้งค่าระบบ', path: '/admin/settings' },
]

watchEffect(() => {
    const activeItem = menuItems.find(
        (item) => route.path === item.path || (item.path !== '/admin' && route.path.startsWith(item.path))
    )
    if (activeItem) selectedKeys.value = [activeItem.key]
    drawerVisible.value = false
})

const toggleMenu = () => {
    if (screens.value.md) collapsed.value = !collapsed.value
    else drawerVisible.value = !drawerVisible.value
}

const handleLogout = () => navigateTo('/login')
</script>

<template>
    <a-layout class="admin-shell">
        <a-layout-sider
            v-if="screens.md"
            v-model:collapsed="collapsed"
            :trigger="null"
            collapsible
            class="main-sider"
            width="250"
        >
            <div class="side-logo">
                <div class="logo-box">
                    <span class="logo-icon">✦</span>
                    <span v-if="!collapsed" class="logo-text">LANNA TICKET</span>
                </div>
            </div>
            <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline" class="side-menu">
                <a-menu-item v-for="item in menuItems" :key="item.key" @click="navigateTo(item.path)">
                    <template #icon><component :is="item.icon" /></template>
                    <span>{{ item.label }}</span>
                </a-menu-item>
            </a-menu>
        </a-layout-sider>

        <a-drawer
            v-else
            v-model:open="drawerVisible"
            placement="left"
            :closable="false"
            width="260px"
            class="mobile-drawer"
            :body-style="{ padding: 0, backgroundColor: '#001529' }"
        >
            <div class="drawer-logo">✦ LANNA TICKET</div>
            <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
                <a-menu-item v-for="item in menuItems" :key="item.key" @click="navigateTo(item.path)">
                    <template #icon><component :is="item.icon" /></template>
                    <span>{{ item.label }}</span>
                </a-menu-item>
                <a-menu-divider style="background: rgba(255, 255, 255, 0.1)" />
                <a-menu-item key="logout" @click="handleLogout" class="logout-menu-item">
                    <template #icon><LogoutOutlined /></template>
                    <span>ออกจากระบบ</span>
                </a-menu-item>
            </a-menu>
        </a-drawer>

        <a-layout class="main-container">
            <a-layout-header class="main-header">
                <div class="header-left">
                    <div class="menu-toggle" @click="toggleMenu">
                        <MenuFoldOutlined v-if="!collapsed && screens.md" />
                        <MenuUnfoldOutlined v-else />
                    </div>
                </div>

                <div class="header-right">
                    <div class="action-items" v-if="screens.sm">
                        <a-tooltip title="การแจ้งเตือน">
                            <div class="icon-btn">
                                <a-badge
                                    dot
                                    :number-style="{ backgroundColor: '#c5a059', boxShadow: '0 0 0 1px #fff' }"
                                >
                                    <BellOutlined />
                                </a-badge>
                            </div>
                        </a-tooltip>

                        <a-tooltip title="ไปที่หน้าเว็บหลัก">
                            <div class="icon-btn" @click="navigateTo('/')">
                                <GlobalOutlined />
                            </div>
                        </a-tooltip>
                    </div>

                    <div class="v-divider" v-if="screens.sm"></div>

                    <a-dropdown :trigger="['click']" placement="bottomRight">
                        <div class="user-account-box">
                            <div class="avatar-wrapper">
                                <a-avatar :size="40" class="avatar-gold">AD</a-avatar>
                                <div class="online-indicator"></div>
                            </div>

                            <div class="user-meta" v-if="screens.sm">
                                <span class="user-name">Administrator</span>
                                <span class="user-role">System Staff</span>
                            </div>

                            <CaretDownOutlined class="chevron-icon" v-if="screens.sm" />
                        </div>

                        <template #overlay>
                            <a-menu class="user-dropdown-menu">
                                <div class="dropdown-header" v-if="!screens.sm">
                                    <strong>Administrator</strong>
                                    <p>System Staff</p>
                                </div>
                                <a-menu-item key="profile">
                                    <template #icon><UserOutlined /></template>
                                    โปรไฟล์ส่วนตัว
                                </a-menu-item>
                                <a-menu-item key="settings">
                                    <template #icon><SettingOutlined /></template>
                                    ตั้งค่าบัญชี
                                </a-menu-item>
                                <a-menu-divider />
                                <a-menu-item key="logout" @click="handleLogout" class="logout-red">
                                    <template #icon><LogoutOutlined /></template>
                                    ออกจากระบบ
                                </a-menu-item>
                            </a-menu>
                        </template>
                    </a-dropdown>
                </div>
            </a-layout-header>

            <a-layout-content class="main-content">
                <div class="content-body">
                    <slot />
                </div>
            </a-layout-content>

            <a-float-button
                type="primary"
                :style="{ right: screens.md ? '30px' : '20px', bottom: '30px', width: '50px', height: '50px' }"
                @click="navigateTo('/admin/tickets/scanner')"
            >
                <template #icon><ScanOutlined /></template>
            </a-float-button>
        </a-layout>
    </a-layout>
</template>

<style lang="scss" scoped>
// ไม่ใช้ darken() เพื่อเลี่ยงบัค ใช้การระบุสีตรงๆ ร่วมกับ Global Variables
.admin-shell {
    min-height: 100vh;
    background: #f8fafc;

    .main-sider {
        height: 100vh;
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);

        .side-logo {
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000c17; // สีที่เข้มกว่า $color-night
            .logo-box {
                color: $color-gold;
                font-weight: 800;
                display: flex;
                align-items: center;
                gap: 8px;
                .logo-icon {
                    font-size: 1.2rem;
                }
                .logo-text {
                    letter-spacing: 1px;
                    font-size: 14px;
                }
            }
        }
        .side-menu {
            border-right: 0;
        }
    }

    .main-header {
        background: #ffffff;
        padding: 0 16px;
        height: 64px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
        position: sticky;
        top: 0;
        z-index: 90;

        @media (min-width: 768px) {
            padding: 0 24px;
        }

        .menu-toggle {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s;
            &:hover {
                background: #f5f5f5;
                color: $color-gold;
            }
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 8px;

            .action-items {
                display: flex;
                align-items: center;
                gap: 4px;

                .icon-btn {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    color: #595959;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;

                    &:hover {
                        background: #f5f5f5;
                        color: $color-gold;
                    }
                }
            }

            .v-divider {
                width: 1px;
                height: 24px;
                background: #f0f0f0;
                margin: 0 8px;
            }

            .user-account-box {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 6px 12px;
                padding-right: 4px;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
                border: 1px solid transparent;

                &:hover {
                    background: #fff;
                    border-color: #f0f0f0;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

                    .chevron-icon {
                        color: $color-gold;
                    }
                }

                .avatar-wrapper {
                    position: relative;
                    display: inline-flex; // ช่วยให้ container รัดพอดีกับ avatar

                    .avatar-gold {
                        background: $color-gold;
                        font-weight: bold;
                        border: 2px solid #fff;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                    }

                    .online-indicator {
                        position: absolute;
                        bottom: 2px;
                        right: 2px;
                        width: 12px; // ปรับขนาดให้ชัดขึ้นเล็กน้อย
                        height: 12px;
                        background: #52c41a;
                        border: 2px solid #fff; // ขอบสีขาวจะช่วยตัดกับพื้นหลังทำให้ดูไม่ลอยแปลกๆ
                        border-radius: 50%;
                        z-index: 1;

                        // เพิ่มเงาให้จุดนิดนึงจะดูเนียนขึ้น
                        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                    }
                }

                .user-meta {
                    display: flex;
                    flex-direction: column;
                    line-height: 1.4;

                    .user-name {
                        font-size: 14px;
                        font-weight: 700;
                        color: $color-night;
                    }
                    .user-role {
                        font-size: 11px;
                        color: #8c8c8c;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                }

                .chevron-icon {
                    font-size: 10px;
                    color: #bfbfbf;
                    margin-left: 4px;
                    transition: color 0.2s;
                }
            }
        }

        // Dropdown Menu Styling
        .user-dropdown-menu {
            padding: 8px;
            border-radius: 12px;
            min-width: 180px;
            box-shadow: 0 10px 32px rgba(0, 0, 0, 0.1);

            .dropdown-header {
                padding: 12px;
                margin-bottom: 4px;
                background: #fafafa;
                border-radius: 8px;
                strong {
                    display: block;
                    color: $color-night;
                }
                p {
                    margin: 0;
                    font-size: 12px;
                    color: #8c8c8c;
                }
            }

            :deep(.ant-dropdown-menu-item) {
                border-radius: 8px;
                padding: 10px 12px;
                margin: 2px 0;

                &:hover {
                    background: #fffbe6;
                    color: $color-gold;
                }
            }

            .logout-red {
                color: #ff4d4f !important;
                margin-top: 4px;
                &:hover {
                    background: #fff1f0 !important;
                }
            }
        }
    }

    .main-content {
        padding: 12px;
        @media (min-width: 768px) {
            padding: 24px;
        }

        .content-body {
            background: #fff;
            border-radius: 12px;
            padding: 16px;
            min-height: calc(100vh - 112px);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
            @media (min-width: 768px) {
                padding: 24px;
            }
        }
    }
}

.drawer-logo {
    height: 64px;
    display: flex;
    align-items: center;
    padding: 0 24px;
    background: #000c17;
    color: $color-gold;
    font-weight: 800;
    font-size: 16px;
}

.user-dropdown-menu {
    min-width: 180px;
    padding: 8px;
    border-radius: 10px;
    .logout-red {
        color: #ff4d4f !important;
        &:hover {
            background: #fff1f0 !important;
        }
    }
}

// กำหนดสีปุ่ม Floating ให้ใช้ตัวแปรทอง
:deep(.ant-float-btn-primary) {
    .ant-float-btn-body {
        background: $color-gold;
        &:hover {
            background: #ad8b4d;
        } // ใช้สีทองที่เข้มขึ้นแทน darken
    }
}
</style>
