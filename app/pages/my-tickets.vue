<script setup>
import { storeToRefs } from 'pinia'
import { Modal } from 'ant-design-vue'
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    IdcardOutlined,
    LoadingOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    ExpandOutlined,
    SafetyCertificateOutlined,
    LockOutlined,
    SyncOutlined,
} from '@ant-design/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const { user } = storeToRefs(authStore)
const userEmail = computed(() => user.value?.email || '')

const {
    data: myTickets,
    pending,
    refresh,
} = await useFetch('/api/tickets/my-tickets', {
    query: { email: userEmail },
    watch: [userEmail],
    immediate: !!userEmail.value,
})

const goBack = () => router.push('/')

const isQrModalOpen = ref(false)
const selectedTicket = ref(null)

const handleTicketClick = (ticket) => {
    if (ticket.is_used) return

    Modal.confirm({
        title: h('div', { class: 'modal-title-celestial' }, [
            h(SafetyCertificateOutlined, { class: 'modal-icon-gold' }),
            h('span', 'Reveal Celestial Pass'),
        ]),
        content: h('div', { class: 'modal-content-lanna' }, [
            h('p', { class: 'highlight-text' }, 'Ready to enter the festival?'),
            h(
                'p',
                'Your digital passage will be generated. Please note that each QR code can be scanned only once at the sanctuary entrance.'
            ),
        ]),
        // สไตล์ปุ่มแบบ Custom
        okText: 'REVEAL PASS',
        cancelText: 'MAYBE LATER',
        centered: true,
        width: 450,
        okButtonProps: {
            class: 'btn-gold-celestial',
            style: 'background: #d4af37; border: none; color: #001529; font-weight: 800; border-radius: 8px; height: 40px; letter-spacing: 1px;',
        },
        cancelButtonProps: {
            style: 'border: 1px solid rgba(212, 175, 55, 0.3); color: #d4af37; background: transparent; border-radius: 8px; height: 40px;',
        },
        // ใช้ wrapClassName เพื่อใส่ CSS เฉพาะจุด
        wrapClassName: 'celestial-confirm-modal',
        onOk() {
            selectedTicket.value = ticket
            isQrModalOpen.value = true
        },
    })
}
</script>

<template>
    <div class="ticket-page">
        <section class="ticket-hero">
            <div class="sky-bg">
                <div v-for="i in 20" :key="'gs' + i" class="star-static"></div>
            </div>

            <div class="header-content">
                <a-button type="link" class="back-btn" @click="goBack"> <ArrowLeftOutlined /> BACK TO HOME </a-button>
                <div class="title-wrap">
                    <span class="sub-label">YOUR FESTIVAL PASSAGE</span>
                    <h1 class="ticket-title">Celestial <span class="gold-text">Passes</span></h1>
                </div>
                <div class="lanna-divider-small"></div>
            </div>
        </section>

        <main class="ticket-container">
            <div v-if="pending" class="state-container">
                <a-spin :indicator="h(LoadingOutlined, { style: 'font-size: 45px; color: #d4af37' })" />
                <p class="mt-4 pulse-text">Reading the constellations...</p>
            </div>

            <div v-else-if="!myTickets || myTickets.length === 0" class="state-container">
                <div class="empty-card">
                    <div class="icon-circle">
                        <ExclamationCircleOutlined class="empty-icon" />
                    </div>
                    <h3>No Passage Found</h3>
                    <p>It seems you haven't secured your place in the festival yet.</p>
                    <NuxtLink to="/tickets">
                        <a-button type="primary" class="gold-btn mt-6">EXPLORE TICKETS</a-button>
                    </NuxtLink>
                </div>
            </div>

            <div v-else class="ticket-masonry">
                <template v-for="order in myTickets" :key="order.id">
                    <div v-for="ticket in order.tickets" :key="ticket.ticket_code" class="masonry-item">
                        <ticket-card-my-order :ticket="ticket" :order="order" @click="handleTicketClick" />
                    </div>
                </template>
            </div>
        </main>

        <footer class="ticket-footer">
            <div class="lanna-divider"></div>
            <p>Capturing the spirit of Lanna heritage through the lens.</p>
        </footer>

        <a-modal
            v-model:open="isQrModalOpen"
            :footer="null"
            centered
            class="celestial-qr-modal"
            :closable="true"
            :maskClosable="false"
            :width="450"
        >
            <div v-if="selectedTicket" class="modal-body-content">
                <div class="modal-top-accent"></div>

                <div class="modal-header-lanna">
                    <div class="divine-symbol">✦</div>
                    <span class="modal-sub">OFFICIAL ENTRY PASSAGE</span>
                    <h2 class="modal-title-main">{{ selectedTicket.ticket_name }}</h2>
                    <div class="lanna-divider-gold"></div>
                </div>

                <div class="modal-qr-section">
                    <div class="qr-frame">
                        <div class="corner tl"></div>
                        <div class="corner tr"></div>
                        <div class="corner bl"></div>
                        <div class="corner br"></div>

                        <div class="qr-wrapper">
                            <img
                                :src="`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${selectedTicket.ticket_code}`"
                                alt="Festival QR Pass"
                            />
                        </div>
                    </div>
                </div>

                <div class="modal-info-section">
                    <div class="hash-label">UNIQUE PASSCODE</div>
                    <div class="modal-ticket-hash">{{ selectedTicket.ticket_code }}</div>

                    <div class="instruction-box">
                        <SafetyCertificateOutlined />
                        <span class="modal-instruction">Present this QR at the festival entrance gate.</span>
                    </div>
                </div>

                <div class="modal-footer-decor">
                    <span>CELESTIAL LANNA FEST 2026</span>
                </div>
            </div>
        </a-modal>
    </div>
</template>

<style lang="scss" scoped>
@use 'sass:math';

// ดึงตัวแปรและโครงสร้าง CSS จาก ticket มาใช้ทั้งหมด
.ticket-page {
    background: $color-night-blue;
    min-height: 100vh;
    color: #fff;
    padding-bottom: 60px;
}

// Grid Layout ของ ticket
.ticket-masonry {
    columns: 3;
    column-gap: 20px;
    .masonry-item {
        break-inside: avoid;
        margin-bottom: 20px;
    }
}

// --- HEADER STYLE (จาก ticket) ---
.ticket-hero {
    padding: 120px 24px 60px;
    text-align: center;
    position: relative;
    overflow: hidden;
    background: linear-gradient(to bottom, $color-deep-purple 0%, $color-night-blue 100%);
    .header-content {
        position: relative;
        z-index: 10;
    }
    .back-btn {
        color: $color-gold;
        letter-spacing: 2px;
        font-weight: 600;
        margin-bottom: 40px;
        &:hover {
            opacity: 0.7;
            transform: translateX(-5px);
        }
    }
    .ticket-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(2.5rem, 8vw, 4.5rem);
        margin: 10px 0;
        .gold-text {
            color: $color-gold;
            font-style: italic;
        }
    }
}

.sky-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    .star-static {
        position: absolute;
        background: #fff;
        border-radius: 50%;
        opacity: 0.3;
        width: 2px;
        height: 2px;
        @for $i from 1 through 20 {
            &:nth-child(#{$i}) {
                top: math.random(100) * 1%;
                left: math.random(100) * 1%;
            }
        }
    }
}

.ticket-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 24px;
}

// --- DIVIDERS & FOOTER (จาก ticket) ---
.lanna-divider-small {
    width: 100px;
    height: 2px;
    background: $color-gold;
    margin: 30px auto;
    position: relative;
    &::after {
        content: '✦';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: $color-night-blue;
        padding: 0 10px;
        color: $color-gold;
    }
}
.lanna-divider {
    height: 1px;
    width: 100%;
    background: linear-gradient(90deg, transparent, $color-gold, transparent);
    margin: 80px 0 30px;
    opacity: 0.3;
}
.ticket-footer {
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.9rem;
    letter-spacing: 1px;
}

// --- TICKET CARD BOX CSS (โค้ดเดิมของคุณ 100%) ---
.ticket-card-box {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba($color-gold, 0.15);
    border-radius: 28px;
    padding: 35px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    position: relative;
    overflow: hidden;

    &:hover:not(.is-redeemed) {
        border-color: $color-gold;
        transform: translateY(-10px);
        background: rgba(255, 255, 255, 0.06);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }

    &.is-redeemed {
        opacity: 0.6;
        filter: grayscale(0.8);
        cursor: not-allowed;
        &::after {
            content: 'VOID';
            position: absolute;
            top: 20px;
            right: -30px;
            background: rgba(255, 255, 255, 0.1);
            padding: 5px 40px;
            transform: rotate(45deg);
            font-size: 0.6rem;
            color: #fff;
            letter-spacing: 2px;
        }
    }
}

.ticket-status-row {
    display: flex;
    margin-bottom: 20px;
}
.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 50px;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 1.5px;
    &.active {
        background: rgba($color-active, 0.15);
        color: $color-active;
        border: 1px solid rgba($color-active, 0.3);
        .status-dot.pulse {
            animation: statusPulse 2s infinite;
        }
    }
    &.redeemed {
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
}
.ticket-title-text {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    color: #fff;
    margin-bottom: 15px;
}
.ticket-meta-info {
    display: flex;
    gap: 15px;
    justify-content: center;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 20px;
}
.qr-preview-container {
    margin: 25px 0;
    .qr-placeholder {
        height: 150px;
        background: rgba(0, 0, 0, 0.4);
        border: 1px dashed rgba($color-gold, 0.3);
        border-radius: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
}

@keyframes statusPulse {
    0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba($color-active, 0.7);
    }
    70% {
        transform: scale(1.3);
        box-shadow: 0 0 0 8px rgba($color-active, 0);
    }
    100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba($color-active, 0);
    }
}

@media (max-width: 768px) {
    .ticket-masonry {
        columns: 2 150px;
    }
}

</style>

<style lang="scss">
// Modal
.celestial-qr-modal {
    & .ant-modal-content {
        background: #001c36; 
        border: 1px solid rgba($color-gold, 0.3);
        border-radius: 32px;
        padding: 0;
        overflow: hidden;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
    }

    & .ant-modal-close {
        color: rgba($color-gold, 0.5);
        &:hover {
            color: $color-gold;
        }
    }

    .modal-body-content {
        position: relative;
        text-align: center;
        padding: 40px 30px;
    }

    .modal-top-accent {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 8px;
        background: linear-gradient(90deg, transparent, $color-gold, transparent);
    }

    .modal-header-lanna {
        margin-bottom: 30px;
        .divine-symbol {
            color: $color-gold;
            font-size: 1.2rem;
            margin-bottom: 10px;
        }
        .modal-sub {
            display: block;
            font-size: 0.65rem;
            letter-spacing: 3px;
            color: rgba($color-gold, 0.7);
            font-weight: 700;
        }
        .modal-title-main {
            font-family: 'Playfair Display', serif;
            font-size: 1.8rem;
            color: #fff;
            margin: 10px 0;
        }
        .lanna-divider-gold {
            width: 60px;
            height: 1px;
            background: rgba($color-gold, 0.4);
            margin: 0 auto;
        }
    }

    // --- QR Section with Corners ---
    .modal-qr-section {
        display: flex;
        justify-content: center;
        margin-bottom: 30px;
        .qr-frame {
            position: relative;
            padding: 15px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 24px;
            .corner {
                position: absolute;
                width: 15px;
                height: 15px;
                border: 2px solid $color-gold;
                &.tl {
                    top: 0;
                    left: 0;
                    border-right: 0;
                    border-bottom: 0;
                    border-top-left-radius: 12px;
                }
                &.tr {
                    top: 0;
                    right: 0;
                    border-left: 0;
                    border-bottom: 0;
                    border-top-right-radius: 12px;
                }
                &.bl {
                    bottom: 0;
                    left: 0;
                    border-right: 0;
                    border-top: 0;
                    border-bottom-left-radius: 12px;
                }
                &.br {
                    bottom: 0;
                    right: 0;
                    border-left: 0;
                    border-top: 0;
                    border-bottom-right-radius: 12px;
                }
            }
        }
        .qr-wrapper {
            background: #fff;
            padding: 12px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            img {
                width: 220px;
                height: 220px;
                display: block;
            }
        }
    }

    .modal-info-section {
        .hash-label {
            font-size: 0.6rem;
            color: rgba($color-gold, 0.6);
            letter-spacing: 2px;
        }
        .modal-ticket-hash {
            font-family: 'Courier New', monospace;
            font-size: 1.2rem;
            color: #fff;
            font-weight: bold;
            letter-spacing: 4px;
            margin: 8px 0 25px;
        }
        .instruction-box {
            background: rgba($color-gold, 0.05);
            border: 1px solid rgba($color-gold, 0.1);
            padding: 12px 20px;
            border-radius: 50px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.75rem;
            .anticon {
                color: $color-gold;
                font-size: 1rem;
            }
        }
    }

    .modal-footer-decor {
        margin-top: 40px;
        font-size: 0.55rem;
        letter-spacing: 4px;
        color: rgba($color-gold, 0.3);
    }
}
</style>
