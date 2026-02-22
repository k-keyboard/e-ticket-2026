<script setup>
import { QrcodeStream } from 'vue-qrcode-reader'
import {
    CloseOutlined,
    CheckCircleOutlined,
    LoadingOutlined,
    QrcodeOutlined,
    CameraOutlined,
    RetweetOutlined,
    BarcodeOutlined,
    NumberOutlined,
    ArrowRightOutlined,
    UserOutlined,
    CheckOutlined,
    MailOutlined,
    CalendarOutlined,
    ScheduleOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

definePageMeta({ layout: false })
useHead({ title: 'สแกนตรวจตั๋ว | Lanna Admin' })

// --- State Management ---
const scanMode = ref(null)
const scannedTicket = ref(null)
const isModalVisible = ref(false)
const confirmLoading = ref(false)
const paused = ref(false)
const cameraLoading = ref(false)

const passcodeField = ref('')
const externalInput = ref('')
const inputRef = ref(null)

// --- Camera Logic ---
const constraints = computed(() => {
    if (scanMode.value === 'camera-front') return { video: { facingMode: 'user' } }
    return { video: { facingMode: { exact: 'environment' } } }
})

const selectMode = (mode) => {
    scanMode.value = mode
    if (mode?.startsWith('camera')) cameraLoading.value = true
    // ล้างค่าเก่าทิ้งเมื่อสลับโหมด
    passcodeField.value = ''
    externalInput.value = ''
    if (mode === 'passcode' || mode === 'external-scanner') {
        nextTick(() => inputRef.value?.focus())
    }
}

const exitCamera = () => {
    scanMode.value = null
    cameraLoading.value = false
    paused.value = false
}

const closeModal = () => {
    isModalVisible.value = false
    paused.value = false
}

// --- Handlers ---
const onCameraReady = () => {
    cameraLoading.value = false
}
const onCameraError = (error) => {
    cameraLoading.value = false
    if (error.name === 'OverconstrainedError') {
        message.warning('ไม่พบกล้องหลัง กำลังลองกล้องหน้า...')
        scanMode.value = 'camera-front'
    } else {
        message.error('ไม่สามารถเปิดกล้องได้: ' + error.name)
    }
}

const onDetect = (detectedCodes) => {
    if (detectedCodes?.length > 0) processScan(detectedCodes[0].rawValue)
}

const processScan = async (code) => {
    if (!code || paused.value) return
    paused.value = true
    try {
        const data = await $fetch('/api/tickets/scan', {
            method: 'POST',
            body: { ticket_code: code.trim(), action: 'info' },
        })
        scannedTicket.value = data.ticket
        isModalVisible.value = true
    } catch (err) {
        message.error(err.data?.message || 'ไม่พบข้อมูลตั๋ว')
        paused.value = false
        // ถ้าเป็นโหมดพิมพ์ ให้ล้างค่าเพื่อให้พิมพ์ใหม่ได้ง่าย
        passcodeField.value = ''
        externalInput.value = ''
    }
}

const handleConfirmUse = async () => {
    confirmLoading.value = true
    try {
        await $fetch('/api/tickets/scan', {
            method: 'POST',
            body: { ticket_code: scannedTicket.value.ticket_code, action: 'confirm' },
        })
        message.success('เช็คอินสำเร็จ!')
        isModalVisible.value = false
        paused.value = false
    } catch (err) {
        message.error(err.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
        confirmLoading.value = false
    }
}
</script>

<template>
    <div class="scanner-container">
        <nav class="scanner-nav">
            <div class="nav-left">
                <QrcodeOutlined v-if="!scanMode" class="nav-logo" />
                <a-button v-else type="text" class="back-btn" @click="exitCamera">
                    <template #icon><RetweetOutlined /></template>
                    สลับโหมด
                </a-button>
            </div>

            <div class="nav-center">
                <span class="mode-title" v-if="scanMode">
                    {{ scanMode.startsWith('camera') ? 'กำลังสแกน...' : 'โหมดป้อนข้อมูล' }}
                </span>
            </div>

            <div class="nav-right">
                <button class="close-app-btn" @click="navigateTo('/admin')">
                    <CloseOutlined />
                </button>
            </div>
        </nav>

        <main class="scanner-content">
            <div v-if="!scanMode" class="selection-screen">
                <div class="hero">
                    <h1>Ticket Scanner</h1>
                    <p>ระบบตรวจสอบตั๋ว Yi Peng 2026</p>
                </div>
                <div class="grid-menu">
                    <button class="menu-item gold" @click="selectMode('camera-back')">
                        <CameraOutlined /> <span>กล้องหลัง</span>
                    </button>
                    <button class="menu-item" @click="selectMode('camera-front')">
                        <UserOutlined /> <span>กล้องหน้า</span>
                    </button>
                    <button class="menu-item dark" @click="selectMode('external-scanner')">
                        <BarcodeOutlined /> <span>เครื่องสแกนแยก</span>
                    </button>
                    <button class="menu-item outline" @click="selectMode('passcode')">
                        <NumberOutlined /> <span>กรอกรหัส</span>
                    </button>
                </div>
            </div>

            <div v-else-if="scanMode.startsWith('camera')" class="camera-viewport">
                <qrcode-stream
                    :key="scanMode"
                    :constraints="constraints"
                    :paused="paused"
                    @detect="onDetect"
                    @camera-on="onCameraReady"
                    @error="onCameraError"
                >
                    <div v-if="cameraLoading" class="camera-overlay loading">
                        <LoadingOutlined spin />
                        <p>กำลังเชื่อมต่อกล้อง...</p>
                    </div>

                    <div v-if="!cameraLoading" class="camera-overlay scanner-ui">
                        <div class="focus-box">
                            <div class="laser" />
                            <div class="corner tl"></div>
                            <div class="corner tr"></div>
                            <div class="corner bl"></div>
                            <div class="corner br"></div>
                        </div>
                        <p class="hint">วาง QR Code ลงในกรอบ</p>
                    </div>
                </qrcode-stream>
            </div>

            <div v-else class="input-viewport">
                <div class="input-card">
                    <div class="icon-circle">
                        <component :is="scanMode === 'passcode' ? NumberOutlined : BarcodeOutlined" />
                    </div>
                    <h2>{{ scanMode === 'passcode' ? 'กรอกรหัสตั๋ว' : 'พร้อมรับสัญญาณสแกน' }}</h2>

                    <div class="form-group">
                        <input
                            v-if="scanMode === 'passcode'"
                            ref="inputRef"
                            v-model="passcodeField"
                            placeholder="ใส่รหัส 8-10 หลัก"
                            class="custom-input"
                            @keyup.enter="processScan(passcodeField)"
                        />
                        <input
                            v-else
                            ref="inputRef"
                            v-model="externalInput"
                            placeholder="รอข้อมูลจากเครื่องสแกน..."
                            class="custom-input"
                            @keyup.enter="processScan(externalInput)"
                        />

                        <button
                            class="go-btn"
                            @click="processScan(scanMode === 'passcode' ? passcodeField : externalInput)"
                        >
                            <ArrowRightOutlined />
                        </button>
                    </div>
                </div>
            </div>
        </main>

        <a-modal v-model:open="isModalVisible" :footer="null" centered :closable="false" class="premium-modal">
            <div v-if="scannedTicket" class="result-card">
                <div class="header" :class="scannedTicket.is_used ? 'is-used' : 'is-ready'">
                    <CheckCircleFilled v-if="!scannedTicket.is_used" />
                    <CloseCircleFilled v-else />
                    <h3>{{ scannedTicket.is_used ? 'ตั๋วถูกใช้งานแล้ว' : 'ตั๋วพร้อมใช้งาน' }}</h3>
                </div>
                <div class="body">
                    <div class="row">
                        <span class="label">ประเภทตั๋ว</span><span class="val">{{ scannedTicket.ticket_name }}</span>
                    </div>
                    <div class="row">
                        <span class="label">ชื่อลูกค้า</span><span class="val">{{ scannedTicket.customer_name }}</span>
                    </div>
                    <div class="row">
                        <span class="label">รหัสตั๋ว</span><span class="val">#{{ scannedTicket.ticket_code }}</span>
                    </div>
                </div>
                <div class="footer">
                    <a-button block @click="closeModal">ปิดหน้าต่าง</a-button>
                    <a-button
                        v-if="!scannedTicket.is_used"
                        type="primary"
                        block
                        :loading="confirmLoading"
                        @click="handleConfirmUse"
                    >
                        ยืนยันเข้างาน
                    </a-button>
                </div>
            </div>
        </a-modal>
    </div>
</template>

<style scoped lang="scss">
/* SCSS ทั้งหมดคงเดิมเหมือนโค้ดก่อนหน้าครับ */
.scanner-container {
    height: 100vh;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    background: #000;
    overflow: hidden;
}
.scanner-nav {
    height: 70px;
    background: #0a0a0a;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    z-index: 1000;
    border-bottom: 1px solid #222;
    .nav-left {
        width: 100px;
        .nav-logo {
            color: #d4af37;
            font-size: 24px;
        }
    }
    .nav-center {
        flex: 1;
        text-align: center;
        .mode-title {
            color: #888;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
    }
    .nav-right {
        width: 100px;
        display: flex;
        justify-content: flex-end;
    }
    .back-btn {
        color: #d4af37;
        font-weight: 600;
        font-size: 14px;
        padding: 0;
    }
    .close-app-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        background: #ff4d4f;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
.scanner-content {
    flex: 1;
    position: relative;
    overflow: hidden;
}
.selection-screen {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
    .hero {
        text-align: center;
        margin-bottom: 40px;
        h1 {
            color: white;
            font-size: 28px;
            margin: 0;
        }
        p {
            color: #666;
        }
    }
    .grid-menu {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        width: 100%;
        max-width: 400px;
        .menu-item {
            height: 120px;
            border-radius: 20px;
            border: 1px solid #222;
            background: #111;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            &.gold {
                border-color: #d4af37;
                color: #d4af37;
            }
            &.dark {
                background: #d4af37;
                color: #000;
                border: none;
            }
            &:active {
                transform: scale(0.95);
            }
        }
    }
}
.camera-viewport {
    height: 100%;
    width: 100%;
    .camera-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        &.loading {
            background: #000;
            z-index: 5;
            color: #d4af37;
            gap: 15px;
            .anticon {
                font-size: 40px;
            }
        }
        .focus-box {
            width: 250px;
            height: 250px;
            border: 1px solid rgba(212, 175, 55, 0.3);
            border-radius: 30px;
            position: relative;
            box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.6);
            .laser {
                position: absolute;
                width: 90%;
                left: 5%;
                height: 2px;
                background: #d4af37;
                box-shadow: 0 0 10px #d4af37;
                animation: scan 2s infinite ease-in-out;
            }
            .corner {
                position: absolute;
                width: 20px;
                height: 20px;
                border: 3px solid #d4af37;
                &.tl {
                    top: 0;
                    left: 0;
                    border-right: 0;
                    border-bottom: 0;
                    border-top-left-radius: 20px;
                }
                &.tr {
                    top: 0;
                    right: 0;
                    border-left: 0;
                    border-bottom: 0;
                    border-top-right-radius: 20px;
                }
                &.bl {
                    bottom: 0;
                    left: 0;
                    border-right: 0;
                    border-top: 0;
                    border-bottom-left-radius: 20px;
                }
                &.br {
                    bottom: 0;
                    right: 0;
                    border-left: 0;
                    border-top: 0;
                    border-bottom-right-radius: 20px;
                }
            }
        }
        .hint {
            color: #fff;
            margin-top: 30px;
            font-size: 14px;
            opacity: 0.6;
        }
    }
}
@keyframes scan {
    0%,
    100% {
        top: 15%;
    }
    50% {
        top: 85%;
    }
}
.input-viewport {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    .input-card {
        width: 100%;
        max-width: 350px;
        text-align: center;
        .icon-circle {
            width: 80px;
            height: 80px;
            background: rgba(212, 175, 55, 0.1);
            color: #d4af37;
            font-size: 32px;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        h2 {
            color: white;
            margin-bottom: 25px;
        }
    }
    .form-group {
        display: flex;
        background: #111;
        border: 1px solid #333;
        padding: 6px;
        border-radius: 50px;
        .custom-input {
            flex: 1;
            background: transparent;
            border: none;
            outline: none;
            color: white;
            padding: 0 20px;
            font-size: 16px;
            width: 100%;
        }
        .go-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: none;
            background: #d4af37;
            color: #000;
            flex-shrink: 0;
        }
    }
}
.result-card {
    .header {
        padding: 30px;
        text-align: center;
        border-radius: 20px 20px 0 0;
        &.is-ready {
            background: #f6ffed;
            color: #52c41a;
        }
        &.is-used {
            background: #fff1f0;
            color: #f5222d;
        }
        .anticon {
            font-size: 60px;
            margin-bottom: 10px;
        }
        h3 {
            margin: 0;
            font-weight: 800;
            color: inherit;
        }
    }
    .body {
        padding: 24px;
        .row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
            .label {
                color: #888;
            }
            .val {
                font-weight: 600;
            }
        }
    }
    .footer {
        padding: 0 24px 24px;
        display: flex;
        gap: 12px;
    }
}
</style>
