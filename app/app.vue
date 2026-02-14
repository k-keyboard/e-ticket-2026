<script setup>
// 1. กำหนด SEO Meta สำหรับชื่อเว็บและโลโก้
useSeoMeta({
    title: 'Yi Peng Lanna Ticket - The Golden Passage',
    ogTitle: 'Yi Peng Lanna Ticket - 2026 Chiang Mai',
    description: 'Experience the magic of Yi Peng Festival. Secure your golden passage now.',
    ogDescription: 'สัมผัสความงามแห่งล้านนาในคืนเดือนเพ็ญ จองตั๋วปล่อยโคมพรีเมียมได้แล้ววันนี้',
    ogImage: '/logo.png', // มั่นใจว่ามีไฟล์นี้ใน public/
    twitterCard: 'summary_large_image',
})

// 2. จัดการระบบ PWA Install
const { $pwa } = useNuxtApp()

// ฟังก์ชันสำหรับกดติดตั้งแอป
const installApp = () => {
    if ($pwa?.canInstall) {
        $pwa.install()
    }
}
</script>

<template>
    <div>
        <Transition name="fade">
            <button v-if="$pwa?.canInstall" @click="installApp" class="lanna-install-fab">
                <span class="icon">🏮</span>
                <span class="text">INSTALL APP</span>
            </button>
        </Transition>

        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>

<style lang="scss">
// สไตล์สำหรับปุ่ม Install ให้เข้ากับธีมลานนา
.lanna-install-fab {
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 999;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    background: $color-night; // ใช้ Global Variable
    color: $color-gold; // ใช้ Global Variable
    border: 2px solid $color-gold;
    border-radius: 50px;
    font-weight: 800;
    font-size: 13px;
    letter-spacing: 1px;
    cursor: pointer;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        background: $color-gold;
        color: $color-night;
    }

    .icon {
        font-size: 18px;
    }
}

// Animation ตอนปุ่มโผล่มา
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(20px);
}
</style>
