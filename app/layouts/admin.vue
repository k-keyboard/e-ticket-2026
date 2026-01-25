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
} from '@ant-design/icons-vue'

const collapsed = ref(false)
const selectedKeys = ref(['1'])

const menuItems = [
    { key: '1', icon: DashboardOutlined, label: 'Dashboard', path: '/admin' },
    { key: '2', icon: IdcardOutlined, label: 'จัดการตั๋ว', path: '/admin/tickets' },
    { key: '8', icon: ProfileOutlined, label: 'คำสั่งซื้อ', path: '/admin/orders' },
    { key: '3', icon: UserOutlined, label: 'จัดการผู้ใช้งาน', path: '/admin/users' },
    { key: '4', icon: ScheduleOutlined, label: 'จัดการกิจกรรม', path: '/admin/events' },
    { key: '5', icon: PictureOutlined, label: 'จัดการแกลอรี่', path: '/admin/gallery' },
    { key: '6', icon: FileTextOutlined, label: 'จัดการบทความ', path: '/admin/articles' },
    { key: '7', icon: SettingOutlined, label: 'ตั้งค่าระบบ', path: '/admin/settings' },
]

const handleLogout = () => {
    // Logic logout ตรงนี้
    navigateTo('/login')
}
</script>

<template>
    <a-layout class="admin-layout">
        <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible class="sidebar">
            <div class="logo">
                <h2 v-if="!collapsed">E-TICKET</h2>
                <h2 v-else>ET</h2>
            </div>
            <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
                <a-menu-item v-for="item in menuItems" :key="item.key" @click="navigateTo(item.path)">
                    <component :is="item.icon" />
                    <span>{{ item.label }}</span>
                </a-menu-item>

                <a-menu-item key="logout" class="logout-menu" @click="handleLogout">
                    <LogoutOutlined />
                    <span>ออกจากระบบ</span>
                </a-menu-item>
            </a-menu>
        </a-layout-sider>

        <a-layout>
            <a-layout-header class="header">
                <menu-unfold-outlined v-if="collapsed" class="trigger" @click="() => (collapsed = !collapsed)" />
                <menu-fold-outlined v-else class="trigger" @click="() => (collapsed = !collapsed)" />

                <div class="header-right">
                    <a-avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" />
                    <span class="admin-name">Administrator</span>
                </div>
            </a-layout-header>

            <a-layout-content class="content">
                <div class="page-container">
                    <slot />
                </div>
            </a-layout-content>
        </a-layout>
    </a-layout>
</template>

<style scoped lang="scss">
.admin-layout {
    min-height: 100vh;

    .sidebar {
        background: #001529;
        .logo {
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffd700;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            h2 {
                margin: 0;
                font-weight: bold;
                font-size: 1.2rem;
            }
        }
    }

    .header {
        background: #fff;
        padding: 0 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

        .trigger {
            font-size: 18px;
            cursor: pointer;
            transition: color 0.3s;
            &:hover {
                color: #1890ff;
            }
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 12px;
            .admin-name {
                font-weight: 500;
            }
        }
    }

    .content {
        margin: 24px;
        .page-container {
            background: #fff;
            padding: 24px;
            min-height: 280px;
            border-radius: 8px;
        }
    }

    .logout-menu {
        margin-top: auto;
        color: #ff4d4f !important;
        &:hover {
            background: rgba(255, 77, 79, 0.1) !important;
        }
    }
}
</style>
