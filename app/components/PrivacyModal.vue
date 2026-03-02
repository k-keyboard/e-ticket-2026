<script setup lang="ts">
import { SafetyCertificateOutlined, LockOutlined, FileTextOutlined, CheckOutlined } from '@ant-design/icons-vue'

// รับ Props เพื่อควบคุมสถานะการเปิดจากภายนอก
defineProps<{
    open: boolean
}>()

// ส่ง Event กลับไปหาตัวแม่
const emit = defineEmits(['update:open', 'accept'])

const currentYear = new Date().getFullYear()

const handleClose = () => {
    emit('update:open', false)
}

const handleAccept = () => {
    emit('accept')
}
</script>

<template>
    <a-modal
        :open="open"
        :footer="null"
        :width="700"
        centered
        wrap-class-name="lanna-privacy-modal"
        @cancel="handleClose"
    >
        <div class="modal-inner">
            <header class="modal-header">
                <span class="sub-label">LEGAL OBLIGATIONS {{ currentYear }}</span>
                <h2 class="gold-text">Privacy Policy</h2>
                <div class="lanna-divider-small"></div>
            </header>

            <div class="modal-scroll-content">
                <div class="policy-item">
                    <h3><SafetyCertificateOutlined /> 1. Data Controller</h3>
                    <p>
                        Controlled by <strong>Takra Co., Ltd. (บจก. ตะกร้า)</strong>. We protect your data under the
                        Thailand PDPA regulations.
                    </p>
                </div>
                <div class="policy-item">
                    <h3><LockOutlined /> 2. Information We Collect</h3>
                    <p>
                        We collect your Name, Email, and Phone for ticket issuance in {{ currentYear }}, and IP
                        address/Cookies for system optimization.
                    </p>
                </div>
                <div class="policy-item">
                    <h3><FileTextOutlined /> 3. Usage</h3>
                    <p>Your data is used solely for ticket delivery and event verification at the festival.</p>
                </div>
            </div>

            <div class="modal-footer-action">
                <div class="lanna-divider"></div>
                <button class="modal-accept-btn" @click="handleAccept"><CheckOutlined /> I UNDERSTAND & ACCEPT</button>
            </div>
        </div>
    </a-modal>
</template>

<style lang="scss">
.lanna-privacy-modal {
    .ant-modal-content {
        background: rgba(10, 15, 30, 0.98) !important;
        backdrop-filter: blur(25px);
        border: 1px solid rgba(212, 175, 55, 0.4);
        border-radius: 24px;
        color: #fff;
    }
    .ant-modal-close {
        color: #d4af37;
    }

    .modal-inner {
        padding: 10px;
        .modal-header {
            text-align: center;
            .sub-label {
                letter-spacing: 3px;
                font-size: 0.7rem;
                color: rgba(255, 255, 255, 0.5);
            }
            h2 {
                font-family: 'Playfair Display', serif;
                font-size: 2rem;
                margin: 10px 0;
                color: #d4af37;
            }
        }
        .modal-scroll-content {
            max-height: 50vh;
            overflow-y: auto;
            padding-right: 10px;
            margin: 25px 0;
            &::-webkit-scrollbar {
                width: 3px;
            }
            &::-webkit-scrollbar-thumb {
                background: #d4af37;
            }
            .policy-item {
                margin-bottom: 25px;
                h3 {
                    color: #d4af37;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                }
                p {
                    color: rgba(255, 255, 255, 0.8);
                    line-height: 1.6;
                    font-size: 0.95rem;
                }
            }
        }
        .modal-footer-action {
            text-align: center;
            .modal-accept-btn {
                background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
                color: #000;
                border: none;
                padding: 12px 35px;
                border-radius: 12px;
                font-weight: 800;
                cursor: pointer;
                transition: all 0.3s;
                &:hover {
                    transform: scale(1.05);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
                }
            }
        }
    }
}
.lanna-divider-small {
    width: 60px;
    height: 1px;
    background: #d4af37;
    margin: 20px auto;
    position: relative;
    &::after {
        content: '✦';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #0a0f1e;
        padding: 0 8px;
        color: #d4af37;
        font-size: 0.6rem;
    }
}
</style>
