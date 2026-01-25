<script setup>
import { 
    CalendarOutlined, 
    CheckCircleOutlined,
    SafetyCertificateOutlined,
    LockOutlined,
    ExpandOutlined,
    ArrowRightOutlined
} from '@ant-design/icons-vue'

const props = defineProps({
    ticket: Object,
    order: Object
})

const emit = defineEmits(['click'])

// ฟอร์แมตวันที่ซื้อให้ดูสวยงาม
const purchaseDate = computed(() => {
    return new Date(props.order.created_at).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })
})
</script>

<template>
    <div 
        class="ticket-card-premium" 
        :class="{ 'is-used': ticket.is_used }"
        @click="$emit('click', ticket)"
    >
        <div class="card-glow"></div>
        
        <div class="card-inner">
            <div class="card-header">
                <div class="type-tag">FESTIVAL PASS</div>
                <div class="status-indicator" :class="ticket.is_used ? 'used' : 'ready'">
                    <span class="status-dot" :class="{ 'pulse': !ticket.is_used }"></span>
                    {{ ticket.is_used ? 'REDEEMED' : 'READY TO USE' }}
                </div>
            </div>

            <div class="card-body">
                <h2 class="ticket-name">{{ ticket.ticket_name }}</h2>
                <div class="purchase-info">
                    <CalendarOutlined />
                    <span>Purchased on {{ purchaseDate }}</span>
                </div>
            </div>

            <div class="qr-action-zone">
                <div class="qr-blur-box">
                    <template v-if="!ticket.is_used">
                        <ExpandOutlined class="action-icon" />
                        <span class="action-text">TAP TO UNLOCK PASS</span>
                    </template>
                    <template v-else>
                        <LockOutlined class="action-icon used" />
                        <span class="action-text used">ENTRY COMPLETED</span>
                    </template>
                </div>
            </div>

            <div class="card-footer">
                <div class="entry-code">
                    <span class="label">ENTRY AUTH CODE</span>
                    <span class="value">•••• •••• {{ ticket.ticket_code.slice(-4) }}</span>
                </div>
                <ArrowRightOutlined v-if="!ticket.is_used" class="arrow-accent" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
$gold: #d4af37;
$ready: #52c41a;
$used: rgba(255, 255, 255, 0.3);

.ticket-card-premium {
    position: relative;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba($gold, 0.2);
    border-radius: 30px;
    padding: 2px; // For gradient border effect
    cursor: pointer;
    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
    overflow: hidden;

    &:hover:not(.is-used) {
        transform: translateY(-10px);
        border-color: $gold;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 20px rgba($gold, 0.2);
        
        .card-glow { opacity: 0.6; }
        .qr-blur-box { background: rgba($gold, 0.1); border-color: $gold; }
        .arrow-accent { transform: translateX(5px); opacity: 1; }
    }

    &.is-used {
        opacity: 0.6;
        filter: grayscale(1);
        cursor: default;
        .card-glow { display: none; }
    }
}

.card-glow {
    position: absolute;
    top: -50%; left: -50%; width: 200%; height: 200%;
    background: radial-gradient(circle at center, rgba($gold, 0.1) 0%, transparent 70%);
    opacity: 0.3;
    transition: opacity 0.5s ease;
    pointer-events: none;
}

.card-inner {
    position: relative;
    z-index: 2;
    background: #001529;
    border-radius: 28px;
    padding: 30px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;

    .type-tag {
        font-size: 0.6rem;
        letter-spacing: 2px;
        color: $gold;
        font-weight: 800;
        border: 1px solid rgba($gold, 0.3);
        padding: 4px 10px;
        border-radius: 8px;
    }

    .status-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 1px;

        &.ready { color: $ready; }
        &.used { color: $used; }

        .status-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: currentColor;
            &.pulse { animation: dotPulse 2s infinite; }
        }
    }
}

.ticket-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    color: #fff;
    margin: 0 0 8px 0;
    line-height: 1.2;
}

.purchase-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.8rem;
    margin-bottom: 35px;
}

.qr-action-zone {
    margin-bottom: 30px;
    .qr-blur-box {
        height: 120px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px dashed rgba($gold, 0.2);
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;

        .action-icon {
            font-size: 1.8rem;
            color: $gold;
            margin-bottom: 8px;
            &.used { color: $used; }
        }
        .action-text {
            font-size: 0.65rem;
            font-weight: bold;
            letter-spacing: 2px;
            color: $gold;
            &.used { color: $used; }
        }
    }
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);

    .entry-code {
        .label { display: block; font-size: 0.55rem; color: rgba(255,255,255,0.3); letter-spacing: 1px; margin-bottom: 4px;}
        .value { font-family: monospace; font-size: 1rem; color: #fff; letter-spacing: 2px; }
    }

    .arrow-accent { color: $gold; font-size: 1.2rem; opacity: 0.3; transition: all 0.3s ease; }
}

@keyframes dotPulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba($ready, 0.7); }
    70% { transform: scale(1.2); box-shadow: 0 0 0 10px rgba($ready, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba($ready, 0); }
}
</style>