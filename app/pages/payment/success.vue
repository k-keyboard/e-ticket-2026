<script setup>
import { CheckCircleFilled, ArrowRightOutlined, DownloadOutlined, HomeOutlined } from '@ant-design/icons-vue'

const route = useRoute()
const sessionId = route.query.session_id

// 1. ดึงข้อมูลรายละเอียดการชำระเงินจาก Stripe Session (ถ้าต้องการ)
// ในขั้นตอนนี้คุณอาจจะสร้าง API อีกตัวเพื่อไป get session detail จาก Stripe มาแสดงชื่อลูกค้าหรือราคาก็ได้
const { data: sessionData, pending } = await useFetch(`/api/stripe/retrieve-session`, {
    query: { session_id: sessionId },
    immediate: !!sessionId,
})

</script>

<template>
    <div class="success-page">
        <div class="stars-overlay"></div>

        <div class="success-container">
            <div v-if="pending" class="loading-state">
                <a-spin size="large" tip="Verifying your passage..." />
            </div>

            <div v-else class="success-card">
                <div class="icon-section">
                    <div class="icon-pulse">
                        <CheckCircleFilled class="check-icon" />
                    </div>
                </div>

                <div class="text-section">
                    <h1 class="success-title">Payment <span class="gold-text">Successful</span></h1>
                    <p class="success-desc">
                        Your celestial journey has been reserved. A confirmation email has been sent to your inbox.
                    </p>
                </div>

                <div class="divider-gold"></div>

                <div class="summary-box">
                    <div class="summary-item">
                        <span class="label">ORDER ID</span>
                        <span class="value">#{{ sessionId?.slice(-8).toUpperCase() || 'N/A' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">STATUS</span>
                        <span class="value status-pill">CONFIRMED</span>
                    </div>
                </div>

                <div class="action-buttons">
                    <a-button type="primary" class="btn-download" block size="large">
                        <DownloadOutlined /> DOWNLOAD E-TICKET
                    </a-button>

                    <NuxtLink to="/" class="btn-home-link">
                        <a-button type="link" block> <HomeOutlined /> RETURN TO HOME </a-button>
                    </NuxtLink>
                </div>

                <p class="footer-note">Please present your E-Ticket QR Code at the entrance.</p>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
// ใช้ Global Variables: $color-gold, $color-night-blue

.success-page {
    min-height: 100vh;
    background: radial-gradient(circle at center, $color-deep-purple 0%, $color-night-blue 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
    overflow: hidden;
}

.success-container {
    position: relative;
    z-index: 10;
    max-width: 500px;
    width: 100%;
}

.success-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border: 1px solid rgba($color-gold, 0.2);
    border-radius: 32px;
    padding: 48px 32px;
    text-align: center;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.icon-section {
    margin-bottom: 32px;
    .icon-pulse {
        width: 80px;
        height: 80px;
        background: rgba($color-gold, 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        animation: pulse 2s infinite;
    }
    .check-icon {
        font-size: 50px;
        color: $color-gold;
    }
}

@keyframes pulse {
    0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba($color-gold, 0.4);
    }
    70% {
        transform: scale(1);
        box-shadow: 0 0 0 20px rgba($color-gold, 0);
    }
    100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba($color-gold, 0);
    }
}

.success-title {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem;
    color: #fff;
    margin-bottom: 16px;
    .gold-text {
        color: $color-gold;
    }
}

.success-desc {
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.6;
    margin-bottom: 32px;
}

.divider-gold {
    height: 1px;
    background: linear-gradient(90deg, transparent, $color-gold, transparent);
    margin: 32px 0;
}

.summary-box {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 32px;
    .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        &:last-child {
            margin-bottom: 0;
        }
        .label {
            color: rgba(255, 255, 255, 0.4);
            font-size: 0.8rem;
            letter-spacing: 1px;
        }
        .value {
            color: #fff;
            font-weight: 600;
        }
        .status-pill {
            color: $color-gold;
            background: rgba($color-gold, 0.1);
            padding: 2px 10px;
            border-radius: 20px;
            font-size: 0.75rem;
        }
    }
}

.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .btn-download {
        background: $color-gold;
        border-color: $color-gold;
        color: $color-night-blue;
        font-weight: 700;
        height: 50px;
        border-radius: 12px;
        &:hover {
            background: #fff;
            border-color: #fff;
        }
    }

    .btn-home-link {
        text-decoration: none;
        .ant-btn {
            color: rgba(255, 255, 255, 0.6);
            &:hover {
                color: $color-gold;
            }
        }
    }
}

.footer-note {
    margin-top: 32px;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.3);
    font-style: italic;
}

.stars-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(white, rgba(255, 255, 255, 0.2) 2px, transparent 40px);
    background-size: 100px 100px;
    opacity: 0.1;
}
</style>
