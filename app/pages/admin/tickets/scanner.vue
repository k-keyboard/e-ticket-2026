<script setup>
import { QrcodeStream } from 'vue-qrcode-reader'
import {
    CloseOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    LoadingOutlined,
    QrcodeOutlined,
    CameraOutlined,
    RetweetOutlined,
    BarcodeOutlined,
    NumberOutlined,
    ArrowRightOutlined,
    UserOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

definePageMeta({ layout: false })

// --- State Management ---
const scanMode = ref(null) // 'camera-back', 'camera-front', 'external-scanner', 'passcode'
const scannedTicket = ref(null)
const isModalVisible = ref(false)
const confirmLoading = ref(false)
const paused = ref(false)
const cameraLoading = ref(true)

const externalInput = ref('')
const passcodeField = ref('') // สำหรับโหมดกรอกรหัส Manual
const inputRef = ref(null)

// --- Camera Logic ---
const constraints = computed(() => ({
    video: { facingMode: scanMode.value === 'camera-front' ? 'user' : 'environment' },
}))

const selectMode = (mode) => {
    scanMode.value = mode
    cameraLoading.value = true
    passcodeField.value = ''
    if (mode === 'external-scanner' || mode === 'passcode') {
        nextTick(() => inputRef.value?.focus())
    }
}

// --- Scan Logic ---
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
        console.log(data);
    } catch (err) {
        message.error(err.data?.message || 'ไม่พบข้อมูลตั๋ว หรือรหัสไม่ถูกต้อง')
        paused.value = false
        if (scanMode.value === 'external-scanner' || scanMode.value === 'passcode') {
            passcodeField.value = ''
            externalInput.value = ''
            inputRef.value?.focus()
        }
    }
}

const handlePasscodeSubmit = () => {
    if (!passcodeField.value) return message.warning('กรุณากรอกรหัสผ่าน')
    processScan(passcodeField.value)
}

const onDetect = (detectedCodes) => {
    processScan(detectedCodes[0]?.rawValue)
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

const resetScanner = () => {
    isModalVisible.value = false
    paused.value = false
    passcodeField.value = ''
    if (scanMode.value === 'external-scanner' || scanMode.value === 'passcode') {
        nextTick(() => inputRef.value?.focus())
    }
}
</script>

<template>
    <div class="scanner-wrap">
        <div class="scanner-nav">
            <div class="brand">
                <QrcodeOutlined v-if="!scanMode" />
                <span v-else
                    >โหมด:
                    {{
                        scanMode === 'external-scanner'
                            ? 'เครื่องสแกน'
                            : scanMode === 'passcode'
                            ? 'กรอกรหัส'
                            : 'กล้องมือถือ'
                    }}</span
                >
            </div>
            <div class="nav-right">
                <a-button v-if="scanMode" type="text" class="switch-btn" @click="scanMode = null">
                    <RetweetOutlined /> สลับโหมด
                </a-button>
                <button class="close-btn" @click="navigateTo('/admin')"><CloseOutlined /></button>
            </div>
        </div>

        <div v-if="!scanMode" class="mode-selection">
            <h2>ช่องทางตรวจตั๋ว</h2>
            <div class="mode-grid">
                <div class="mode-card gold" @click="selectMode('camera-back')">
                    <CameraOutlined /> <span>กล้องหลัง</span>
                </div>
                <div class="mode-card" @click="selectMode('camera-front')"><UserOutlined /> <span>กล้องหน้า</span></div>
                <div class="mode-card dark" @click="selectMode('external-scanner')">
                    <BarcodeOutlined /> <span>เครื่องสแกนแยก</span>
                </div>
                <div class="mode-card outline" @click="selectMode('passcode')">
                    <NumberOutlined /> <span>กรอก UNIQUE PASSCODE</span>
                </div>
            </div>
        </div>

        <div v-else-if="scanMode === 'passcode'" class="passcode-box">
            <div class="input-container">
                <NumberOutlined class="bg-icon" />
                <h3>UNIQUE PASSCODE</h3>
                <p>กรอกรหัสผ่าน 8-10 หลักจากอีเมลลูกค้า</p>
                <div class="field-group">
                    <input
                        ref="inputRef"
                        v-model="passcodeField"
                        placeholder="กรอกรหัสที่นี่..."
                        @keyup.enter="handlePasscodeSubmit"
                        class="passcode-input"
                    />
                    <button class="submit-btn" @click="handlePasscodeSubmit">
                        <ArrowRightOutlined />
                    </button>
                </div>
            </div>
        </div>

        <div v-else-if="scanMode.startsWith('camera')" class="camera-box">
            <qrcode-stream :constraints="constraints" :paused="paused" @detect="onDetect" @init="cameraLoading = false">
                <div v-if="cameraLoading" class="camera-loading-overlay">
                    <LoadingOutlined spin style="font-size: 40px; color: #c5a059" />
                </div>
                <div class="scan-ui" v-if="!cameraLoading">
                    <div class="target-box"><div class="laser-line"></div></div>
                </div>
            </qrcode-stream>
        </div>

        <div v-else-if="scanMode === 'external-scanner'" class="external-box">
            <div class="scanner-status">
                <div class="pulse-icon"><BarcodeOutlined /></div>
                <h3>พร้อมรับสัญญาณสแกน</h3>
                <input
                    ref="inputRef"
                    v-model="externalInput"
                    @keyup.enter="processScan(externalInput), (externalInput = '')"
                    class="hidden-input"
                    autofocus
                />
            </div>
        </div>

        <a-modal
            v-model:open="isModalVisible"
            :footer="null"
            centered
            :closable="false"
            :width="450"
            :zIndex="9999"
            class="premium-modal"
        >
            <div v-if="scannedTicket" class="ticket-result">
                <div class="status-header" :class="scannedTicket.is_used ? 'status-used' : 'status-ready'">
                    <div class="status-icon">
                        <CheckCircleFilled v-if="!scannedTicket.is_used" />
                        <CloseCircleFilled v-else />
                    </div>
                    <div class="status-text">
                        <h3>{{ scannedTicket.is_used ? 'ตั๋วนี้ถูกใช้งานแล้ว' : 'ตั๋วพร้อมใช้งาน' }}</h3>
                        <p>{{ scannedTicket.is_used ? 'ตรวจสอบเวลาการใช้งานอีกครั้ง' : 'ข้อมูลถูกต้องตามระบบ' }}</p>
                    </div>
                </div>

                <div class="ticket-details">
                    <div class="detail-row main-info">
                        <div class="detail-item">
                            <label>ประเภทตั๋ว</label>
                            <span class="ticket-type-badge">{{ scannedTicket.ticket_name }}</span>
                        </div>
                        <div class="detail-item text-right">
                            <label>รหัสอ้างอิง</label>
                            <span class="code-text">#{{ scannedTicket.ticket_code }}</span>
                        </div>
                    </div>

                    <a-divider style="margin: 12px 0" />

                    <div class="detail-grid">
                        <div class="detail-item">
                            <label><UserOutlined /> ชื่อผู้ซื้อ</label>
                            <span>{{ scannedTicket.customer_name || '-' }}</span>
                        </div>
                        <div class="detail-item">
                            <label><MailOutlined /> อีเมล</label>
                            <span>{{ scannedTicket.customer_email || '-' }}</span>
                        </div>
                        <div class="detail-item">
                            <label><CalendarOutlined /> วันที่สแกน</label>
                            <span>{{ dayjs(scannedTicket.scanned_at).format('DD MMM YYYY HH:mm') || 'ยังไม่มีข้อมูล' }}</span>
                        </div>
                        <div class="detail-item">
                            <label><ScheduleOutlined /> ชื่อกิจกรรม</label>
                            <span>{{ scannedTicket.event_name || 'กิจกรรมทั่วไป' }}</span>
                        </div>
                    </div>
                </div>

                <div class="action-footer">
                    <a-button block size="large" @click="resetScanner" class="btn-cancel"> ยกเลิกและปิด </a-button>
                    <a-button
                        v-if="!scannedTicket.is_used"
                        block
                        size="large"
                        type="primary"
                        :loading="confirmLoading"
                        @click="handleConfirmUse"
                        class="btn-confirm"
                    >
                        <CheckOutlined /> ยืนยันการเข้างาน
                    </a-button>
                </div>
            </div>
        </a-modal>
    </div>
</template>

<style scoped lang="scss">
.scanner-wrap {
    position: fixed;
    inset: 0;
    background: #000;
    display: flex;
    flex-direction: column;
    z-index: 9999;
    font-family: sans-serif;
}
.scanner-nav {
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #0a0a0a;
    color: #c5a059;
}
.switch-btn {
    color: #fff;
    opacity: 0.8;
}
.close-btn {
    background: #ff4d4f;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    color: white;
    cursor: pointer;
}

.mode-selection {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    h2 {
        color: white;
        margin-bottom: 30px;
        font-weight: 700;
    }
    .mode-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        width: 100%;
        max-width: 350px;
    }
    .mode-card {
        background: #1a1a1a;
        padding: 20px;
        border-radius: 12px;
        cursor: pointer;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        border: 1px solid #333;
        transition: all 0.2s;
        span {
            font-weight: 600;
            font-size: 15px;
        }
        &.gold {
            border-color: #c5a059;
            color: #c5a059;
        }
        &.dark {
            background: #c5a059;
            color: #000;
            border: none;
        }
        &.outline {
            border: 2px dashed #444;
        }
        &:active {
            transform: scale(0.97);
        }
    }
}

.passcode-box {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    .input-container {
        width: 100%;
        max-width: 400px;
        text-align: center;
        color: white;
        .bg-icon {
            font-size: 50px;
            color: #c5a059;
            opacity: 0.3;
            margin-bottom: 20px;
        }
        h3 {
            color: #c5a059;
            font-weight: 800;
            margin: 0;
        }
        p {
            color: #888;
            margin-bottom: 25px;
        }
        .field-group {
            display: flex;
            gap: 10px;
            background: #1a1a1a;
            padding: 8px;
            border-radius: 50px;
            border: 1px solid #333;
            &:focus-within {
                border-color: #c5a059;
            }
            .passcode-input {
                flex: 1;
                background: transparent;
                border: none;
                outline: none;
                color: white;
                padding: 0 20px;
                font-size: 18px;
                font-weight: bold;
                letter-spacing: 2px;
                &::placeholder {
                    letter-spacing: 0;
                    font-weight: normal;
                    font-size: 14px;
                }
            }
            .submit-btn {
                width: 45px;
                height: 45px;
                border-radius: 50%;
                border: none;
                background: $color-gold;
                color: #000;
                cursor: pointer;
                font-size: 18px;
            }
        }
    }
}

.external-box {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    text-align: center;
    .pulse-icon {
        font-size: 60px;
        color: $color-gold;
        margin-bottom: 15px;
        animation: pulse 2s infinite;
    }
    .hidden-input {
        opacity: 0;
        position: absolute;
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.15);
        opacity: 0.6;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.camera-box {
    flex: 1;
    position: relative;
}
.camera-loading-overlay {
    position: absolute;
    inset: 0;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
}
.scan-ui {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    .target-box {
        width: 260px;
        height: 260px;
        border: 2px solid $color-gold;
        border-radius: 24px;
        box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.6);
        position: relative;
        overflow: hidden;
        .laser-line {
            position: absolute;
            width: 100%;
            height: 2px;
            background: $color-gold;
            box-shadow: 0 0 10px $color-gold;
            animation: scanAnim 2s infinite;
        }
    }
}
@keyframes scanAnim {
    0%,
    100% {
        top: 0;
    }
    50% {
        top: 100%;
    }
}

.res-card {
    text-align: center;
    .status {
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 20px;
        &.green {
            background: #f6ffed;
            color: #52c41a;
        }
        &.red {
            background: #fff1f0;
            color: #ff4d4f;
        }
        h3 {
            margin-top: 10px;
            font-weight: 800;
            font-size: 20px;
            color: inherit;
        }
    }
    .info {
        text-align: left;
        margin-bottom: 24px;
        .item {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .gold-text {
            color: $color-gold;
            font-weight: bold;
            font-family: monospace;
        }
    }
    .btns {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .gold-btn {
        background: $color-gold;
        border: none;
        color: #000;
        font-weight: bold;
    }
}

:deep(.premium-modal) {
    .ant-modal-content {
        padding: 0;
        overflow: hidden;
        border-radius: 20px;
    }
}

.ticket-result {
    .status-header {
        padding: 30px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 12px;

        &.status-ready {
            background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
            color: #389e0d;
        }
        &.status-used {
            background: linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%);
            color: #cf1322;
        }

        .status-icon {
            font-size: 56px;
            filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.1));
        }

        h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 800;
            color: currentColor;
        }
        p {
            margin: 0;
            opacity: 0.8;
            font-size: 13px;
        }
    }

    .ticket-details {
        padding: 24px;
        background: #fff;

        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .detail-item {
            display: flex;
            flex-direction: column;
            gap: 4px;

            label {
                font-size: 11px;
                color: #8c8c8c;
                text-transform: uppercase;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            span {
                font-size: 14px;
                font-weight: 600;
                color: #262626;
            }

            .ticket-type-badge {
                background: #fffbe6;
                color: #c5a059;
                padding: 4px 12px;
                border-radius: 6px;
                border: 1px solid #ffe58f;
                font-size: 15px;
            }
            .code-text {
                font-family: 'Monaco', monospace;
                color: #595959;
            }
        }
    }

    .action-footer {
        padding: 20px;
        display: flex;
        gap: 12px;
        background: #fafafa;
        border-top: 1px solid #f0f0f0;

        .btn-cancel {
            border-radius: 12px;
            height: 48px;
            font-weight: 600;
        }

        .btn-confirm {
            border-radius: 12px;
            height: 48px;
            font-weight: 700;
            background: #c5a059;
            border: none;
            box-shadow: 0 4px 12px rgba(197, 160, 89, 0.3);

            &:hover {
                background: #ad8b4d !important;
            }
        }
    }
}

.text-right {
    text-align: right;
}
</style>
