<script setup>
import {
    TeamOutlined,
    IdcardOutlined,
    DollarCircleOutlined,
    SyncOutlined,
    ClockCircleOutlined,
    ArrowRightOutlined,
    CheckCircleOutlined,
    QrcodeOutlined, // เพิ่มไอคอน QR
} from '@ant-design/icons-vue'

definePageMeta({ layout: 'admin' })

const { data: dashboardData, pending, refresh } = await useFetch('/api/admin/stats')

const summary = computed(
    () =>
        dashboardData.value?.summary || {
            totalRevenue: 0,
            ticketsSold: 0,
            totalUsers: 0,
            redeemedTotal: 0,
        }
)

const recentOrders = computed(() => dashboardData.value?.recentOrders || [])
const formatCurrency = (val) => `฿${Number(val).toLocaleString()}`
const formatDate = (date) =>
    date
        ? new Date(date).toLocaleDateString('th-TH', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
          })
        : '-'
</script>

<template>
    <div class="admin-dashboard-light">
        <header class="admin-header">
            <div class="title-group">
                <span class="lanna-tag">✦ LANNA SYSTEM</span>
                <h1>แผงควบคุมหลัก</h1>
            </div>
            <div class="header-actions">
                <a-button type="primary" class="scan-btn" @click="navigateTo('/admin/tickets/scanner')">
                    <QrcodeOutlined /> <span class="btn-text">สแกนตั๋ว</span>
                </a-button>
                <a-button @click="refresh" :loading="pending" class="gold-btn">
                    <SyncOutlined :spin="pending" /> <span class="btn-text">อัปเดต</span>
                </a-button>
            </div>
        </header>

        <section class="stats-grid">
            <div class="stat-card">
                <div class="icon-box rev"><DollarCircleOutlined /></div>
                <div class="info">
                    <label>รายได้สุทธิ</label>
                    <h2>{{ formatCurrency(summary.totalRevenue) }}</h2>
                </div>
            </div>
            <div class="stat-card">
                <div class="icon-box tix"><IdcardOutlined /></div>
                <div class="info">
                    <label>ยอดขายตั๋ว</label>
                    <h2>{{ summary.ticketsSold.toLocaleString() }} <small>ใบ</small></h2>
                </div>
            </div>
            <div class="stat-card">
                <div class="icon-box usr"><TeamOutlined /></div>
                <div class="info">
                    <label>จำนวนสมาชิก</label>
                    <h2>{{ summary.totalUsers.toLocaleString() }} <small>คน</small></h2>
                </div>
            </div>
            <div class="stat-card check">
                <div class="icon-box rdm"><CheckCircleOutlined /></div>
                <div class="info">
                    <label>สแกนเข้างานแล้ว</label>
                    <h2>{{ summary.redeemedTotal }} <small>ใบ</small></h2>
                </div>
            </div>
        </section>

        <div class="data-panel">
            <div class="panel-header">
                <h3><ClockCircleOutlined /> รายการล่าสุด</h3>
                <NuxtLink to="/admin/orders" class="link-gold">ทั้งหมด <ArrowRightOutlined /></NuxtLink>
            </div>

            <a-table
                :dataSource="recentOrders"
                :pagination="false"
                :loading="pending"
                rowKey="id"
                size="middle"
                :scroll="{ x: 600 }"
            >
                <a-table-column title="Order" dataIndex="id" key="id" :width="100">
                    <template #default="{ text }"
                        ><span class="id-text">#{{ text }}</span></template
                    >
                </a-table-column>
                <a-table-column title="อีเมล" dataIndex="customer_email" key="customer_email" />
                <a-table-column title="ยอดชำระ" dataIndex="total_amount" key="total_amount" :width="120">
                    <template #default="{ text }"
                        ><strong>{{ formatCurrency(text) }}</strong></template
                    >
                </a-table-column>
                <a-table-column title="สถานะ" dataIndex="payment_status" key="payment_status" :width="100">
                    <template #default="{ text }">
                        <a-tag :color="text === 'paid' ? 'success' : 'warning'">{{ text?.toUpperCase() }}</a-tag>
                    </template>
                </a-table-column>
                <a-table-column title="วันที่" dataIndex="created_at" key="created_at" :width="150">
                    <template #default="{ text }">{{ formatDate(text) }}</template>
                </a-table-column>
            </a-table>
        </div>
    </div>
</template>

<style lang="scss" scoped>
/* เพิ่มสไตล์สำหรับปุ่มสแกน */
.header-actions {
    display: flex;
    gap: 8px;
}

.scan-btn {
    background: #111;
    border: none;
    color: #fff;
    font-weight: bold;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 5px;

    &:hover {
        background: #333 !important;
        color: #fff !important;
    }
}

.admin-dashboard-light {
    padding: 15px;
    background: #f8fafc;
    min-height: 100vh;
    color: $color-night;

    @media (min-width: 768px) {
        padding: 30px;
    }
}

.admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .lanna-tag {
        color: $color-gold;
        font-size: 10px;
        font-weight: bold;
        letter-spacing: 1.5px;
    }

    h1 {
        margin: 0;
        font-size: 20px;
        font-weight: 800;
        @media (min-width: 768px) {
            font-size: 24px;
        }
    }

    .btn-text {
        display: none;
        @media (min-width: 576px) {
            display: inline;
        }
    }
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
    margin-bottom: 25px;

    @media (min-width: 576px) {
        grid-template-columns: repeat(2, 1fr);
    }
    @media (min-width: 1200px) {
        grid-template-columns: repeat(4, 1fr);
    }
}

.stat-card {
    background: #fff;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: transform 0.2s;

    &:active {
        transform: scale(0.98);
    }

    &.check {
        border-bottom: 3px solid $color-active;
    }

    .icon-box {
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;

        &.rev {
            background: #fffbeb;
            color: $color-gold;
        }
        &.tix {
            background: #eff6ff;
            color: #3b82f6;
        }
        &.usr {
            background: #f5f3ff;
            color: #8b5cf6;
        }
        &.rdm {
            background: #f0fdf4;
            color: $color-active;
        }
    }

    .info {
        label {
            font-size: 11px;
            color: #64748b;
            display: block;
        }
        h2 {
            font-size: 16px;
            margin: 0;
            font-weight: 700;
            small {
                font-size: 12px;
                font-weight: normal;
                color: #94a3b8;
            }
        }
    }
}

.data-panel {
    background: #fff;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    overflow: hidden;

    @media (min-width: 768px) {
        padding: 24px;
    }

    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        h3 {
            font-size: 15px;
            margin: 0;
        }
    }

    .link-gold {
        color: $color-gold;
        font-weight: 600;
        font-size: 13px;
    }
}

.id-text {
    font-family: monospace;
    color: $color-gold;
    font-weight: bold;
}

.gold-btn {
    background: $color-gold;
    border: none;
    color: #fff;
    font-weight: bold;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 5px;
}
</style>
