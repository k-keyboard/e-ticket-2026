<script setup>
import { ref } from 'vue'
import { CheckCircleOutlined, ClockCircleOutlined, SwapOutlined } from '@ant-design/icons-vue'

const props = defineProps({
    data: {
        type: Object,
        required: true,
        default: () => ({
            id: 0,
            name: 'Yi Peng Ticket',
            priceId: '',
            image: '',
            price: '0.00',
            currency: 'thb',
            stock_quantity: 0,
        }),
    },
})

// --- Mock Data ส่วนที่ไม่มีใน Data Prop ---
const mockOrder = {
    id: 999,
    created_at: new Date().toISOString(),
}

const mockTicketData = {
    ticket_code: 'LN-2026-EXAMPLE',
    ticket_description: 'Experience the magic of the North with our premium sky lantern experience.',
}

// State สำหรับสลับสถานะ
const isUsedMode = ref(false)

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-EN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

const toggleStatus = () => {
    isUsedMode.value = !isUsedMode.value
}
</script>

<template>
    <div class="example-wrapper">
        <div class="control-panel">
            <div class="status-indicator" :class="{ 'is-used-active': isUsedMode }">
                <component :is="isUsedMode ? CheckCircleOutlined : ClockCircleOutlined" />
                {{ isUsedMode ? 'DEMO: USED STATE' : 'DEMO: READY STATE' }}
            </div>
            <button class="btn-toggle" @click="toggleStatus"><SwapOutlined /> Switch Status</button>
        </div>

        <div class="user-ticket-wrapper">
            <div class="ticket-container" :class="{ 'is-used': isUsedMode }">
                <div class="ticket-info" :style="{ '--ticket-bg': `url(${data?.image || '../assets/images/bg-ticket.png'})` }">
                    <div class="lanna-badge">YI PENG 2026</div>
                    <h3 class="ticket-title">{{ data.name }}</h3>
                    <p class="ticket-desc">{{ mockTicketData.ticket_description }}</p>

                    <div class="ticket-meta">
                        <div class="meta-item">
                            <span class="label">PURCHASED ON</span>
                            <span class="value">{{ formatDate(mockOrder.created_at) }}</span>
                        </div>
                        <div class="meta-item">
                            <span class="label">ORDER ID</span>
                            <span class="value">#{{ mockOrder.id }}</span>
                        </div>
                    </div>

                    <div class="usage-status">
                        <div v-if="isUsedMode" class="status used"><CheckCircleOutlined /> USED</div>
                        <div v-else class="status pending"><ClockCircleOutlined /> READY TO USE</div>
                    </div>
                </div>

                <div class="ticket-divider">
                    <div class="arc top"></div>
                    <div class="line"></div>
                    <div class="arc bottom"></div>
                </div>

                <div class="ticket-qr-zone">
                    <div class="stamp-display">
                        <img v-if="!isUsedMode" src="/moon.png" class="stamp-img" />
                        <img v-else src="/moon-dark.png" class="stamp-img" />
                    </div>

                    <div class="ticket-code">
                        {{ isUsedMode ? mockTicketData.ticket_code : '••-•-••••••••' }}
                    </div>

                    <button class="btn-use" :disabled="isUsedMode">
                        {{ isUsedMode ? 'ALREADY USED' : 'TAP TO USE' }}
                    </button>
                </div>
            </div>
        </div>

        <p class="demo-note">* This is a preview of the ticket interface for your customers.</p>
    </div>
</template>

<style lang="scss" scoped>
$gold: #d4af37;
$night: #020617;


.example-wrapper {
    max-width: 600px;
    margin: 0 auto;
}

.control-panel {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px 20px;
    background: rgba($gold, 0.1);
    border: 1px solid rgba($gold, 0.3);
    border-radius: 12px;

    .status-indicator {
        font-weight: 800;
        letter-spacing: 1px;
        font-size: 12px;
        color: #10b981;
        display: flex;
        align-items: center;
        gap: 8px;
        &.is-used-active {
            color: #ef4444;
        }
    }

    .btn-toggle {
        background: $gold;
        color: $night;
        border: none;
        padding: 6px 15px;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: 0.3s;
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba($gold, 0.3);
        }
    }
}

.demo-note {
    text-align: center;
    font-size: 12px;
    color: rgba(#fff, 0.5);
    margin-top: 15px;
    font-style: italic;
}

.user-ticket-wrapper {
    filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.3));
}

.ticket-container {
    display: flex;
    background: #fff;
    border-radius: 16px;
    min-height: 200px;
    overflow: hidden;
    position: relative;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);

    &.is-used {
        filter: grayscale(0.8);
        opacity: 0.8;
    }
}

.ticket-info {
    flex: 1;
    padding: 24px;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;

    &::before {
        position: absolute;
        content: '';
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        z-index: -1;
        // ปรับให้ดึงตัวแปร --ticket-bg มาใช้ ถ้าไม่มีให้ใช้สี gradient เฉยๆ
        background: linear-gradient($color-night-op, $color-gold-op), var(--ticket-bg);
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        opacity: 30%;
    }

    .lanna-badge {
        display: inline-block;
        font-size: 11px;
        font-weight: 800;
        color: $gold;
        background: rgba($night, 0.75);
        border: 1.5px solid rgba($gold, 0.6);
        backdrop-filter: blur(8px);
        padding: 3px 12px;
        border-radius: 6px;
        width: fit-content;
        margin-bottom: 12px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3), inset 0 0 5px rgba($gold, 0.2);
        letter-spacing: 1.5px; 
        text-transform: uppercase;
    }
    .ticket-title {
        font-size: 1.4rem;
        font-weight: 800;
        color: $night;
        margin-bottom: 4px;
    }
    .ticket-desc {
        color: #64748b;
        font-size: 0.9rem;
        margin-bottom: 16px;
    }
    .ticket-meta {
        display: flex;
        gap: 24px;
        margin-top: auto;
        .meta-item {
            .label {
                font-size: 10px;
                color: #94a3b8;
                font-weight: 700;
                display: block;
            }
            .value {
                font-size: 13px;
                color: $night;
                font-weight: 600;
            }
        }
    }
}

.usage-status {
    margin-top: 15px;
    .status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 800;
        font-size: 12px;
        &.used {
            color: #ef4444;
        }
        &.pending {
            color: #10b981;
        }
    }
}

.ticket-divider {
    width: 20px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    .line {
        flex: 1;
        width: 2px;
        border-left: 2px dashed #e2e8f0;
    }
    .arc {
        width: 20px;
        height: 10px;
        background: $night;
        position: absolute;
        &.top {
            top: -1px;
            border-radius: 0 0 10px 10px;
        }
        &.bottom {
            bottom: -1px;
            border-radius: 10px 10px 0 0;
        }
    }
}

.ticket-qr-zone {
    width: 180px;
    background: rgba($gold, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border-left: 1px solid rgba($gold, 0.1);

    .stamp-display {
        width: 90px;
        height: 90px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
        position: relative;
        .stamp-img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
        }
    }

    .ticket-code {
        font-family: 'Courier New', Courier, monospace;
        font-size: 12px;
        font-weight: 800;
        color: #64748b;
        margin-bottom: 12px;
        background: rgba(0, 0, 0, 0.05);
        padding: 4px 8px;
        border-radius: 4px;
    }

    .btn-use {
        width: 100%;
        padding: 10px;
        background: $night;
        color: $gold;
        border: none;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s;
        &:hover:not(:disabled) {
            background: $gold;
            color: $night;
            transform: scale(1.05);
        }
        &:disabled {
            background: #cbd5e1;
            color: #94a3b8;
            cursor: not-allowed;
        }
    }
}

@media (max-width: 640px) {
    .ticket-container {
        flex-direction: column;
    }
    .ticket-divider {
        width: 100%;
        height: 20px;
        flex-direction: row;
        .line {
            width: 100%;
            height: 2px;
            border-left: none;
            border-top: 2px dashed #e2e8f0;
        }
        .arc {
            width: 10px;
            height: 20px;
            &.top {
                left: -1px;
                top: unset;
                border-radius: 0 10px 10px 0;
            }
            &.bottom {
                right: -1px;
                bottom: unset;
                border-radius: 10px 0 0 10px;
            }
        }
    }
    .ticket-qr-zone {
        width: 100%;
        border-left: none;
        border-top: 1px solid rgba($gold, 0.1);
    }
}
</style>