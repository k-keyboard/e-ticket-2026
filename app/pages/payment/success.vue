<script setup>
import { CheckCircleFilled, ArrowRightOutlined, HomeOutlined, LoadingOutlined } from '@ant-design/icons-vue'

const route = useRoute()
const sessionId = route.query.session_id

// 1. เรียก API เพื่อยืนยันการจ่ายเงิน, บันทึกลง DB, ลดสต็อก และส่งอีเมล (ทำที่ Backend ตัวเดียว)
const {
    data: sessionData,
    pending,
    error,
} = await useFetch(`/api/stripe/retrieve-session`, {
    query: { session_id: sessionId },
    immediate: !!sessionId,
})

// คอนโซลดูเพื่อตรวจสอบค่าที่ส่งกลับมาจาก API
watchEffect(() => {
    if (sessionData.value) {
        console.log('Payment Verified:', sessionData.value)
    }
})
</script>

<template>
    <div class="success-page">
        <div class="stars-overlay"></div>

        <div class="success-container">
            <div v-if="pending" class="loading-state">
                <a-spin size="large">
                    <template #indicator><LoadingOutlined style="font-size: 48px; color: #d4af37" spin /></template>
                </a-spin>
                <p class="loading-text">Verifying your passage to Lanna...</p>
            </div>

            <div v-else-if="error || !sessionData?.success" class="error-card">
                <a-result
                    status="warning"
                    title="Payment Verification Pending"
                    sub-title="We are confirming your payment. If you don't receive an email within 5 minutes, please contact support."
                >
                    <template #extra>
                        <NuxtLink to="/"><a-button key="console" type="primary">Back to Home</a-button></NuxtLink>
                    </template>
                </a-result>
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
                        Your celestial journey has been reserved. <br />
                        <strong>A confirmation email with your tickets has been sent to your inbox.</strong>
                    </p>
                </div>

                <div class="divider-gold"></div>

                <div class="summary-box">
                    <div class="summary-item">
                        <span class="label">ORDER ID</span>
                        <span class="value">#{{ sessionData?.order_id }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">CUSTOMER</span>
                        <span class="value">{{ sessionData?.customer_name }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">STATUS</span>
                        <span class="value status-pill">CONFIRMED</span>
                    </div>
                </div>

                <div class="action-buttons">
                    <NuxtLink to="/my-tickets" class="btn-main-link">
                        <a-button type="primary" class="btn-download" block size="large">
                            VIEW MY TICKETS <ArrowRightOutlined />
                        </a-button>
                    </NuxtLink>

                    <NuxtLink to="/" class="btn-home-link">
                        <a-button type="link" block> <HomeOutlined /> RETURN TO HOME </a-button>
                    </NuxtLink>
                </div>

                <p class="footer-note">Please present your E-Ticket QR Code from "My Tickets" page at the entrance.</p>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
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

.loading-state {
    text-align: center;
    .loading-text {
        color: $color-gold;
        margin-top: 20px;
        font-size: 1.1rem;
        letter-spacing: 1px;
    }
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
    font-size: 2.2rem;
    font-weight: 800;
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
    .btn-main-link {
        text-decoration: none;
    }
    .btn-download {
        background: $color-gold;
        border-color: $color-gold;
        color: $color-night-blue;
        font-weight: 800;
        height: 55px;
        border-radius: 12px;
        font-size: 1rem;
        &:hover {
            background: #fff;
            border-color: #fff;
            transform: translateY(-2px);
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
