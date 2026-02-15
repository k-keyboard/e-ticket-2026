<script setup>
useSeoMeta({
    title: 'Yi Peng Lanna Ticket - The Golden Passage',
    ogTitle: 'Yi Peng Lanna Ticket - 2026 Chiang Mai',
    description: 'Experience the magic of Yi Peng Festival. Secure your golden passage now.',
    ogDescription: 'สัมผัสความงามแห่งล้านนาในคืนเดือนเพ็ญ จองตั๋วปล่อยโคมพรีเมียมได้แล้ววันนี้',
    ogImage: '/logo.png',
    twitterCard: 'summary_large_image',
})

const { $pwa } = useNuxtApp()

const isInstallable = computed(() => {
    if (import.meta.server) return false

    return $pwa?.showInstallPrompt ?? false
})

const installApp = async () => {
    if (process.client && $pwa?.install) {
        try {
            await $pwa.install()
        } catch (error) {
            console.error('PWA Installation failed:', error)
        }
    }
}
</script>

<template>
    <div class="lanna-app-container">
        <ClientOnly>
            <Transition name="lanna-fade">
                <button v-if="isInstallable" @click="installApp" class="lanna-install-fab" type="button">
                    <span class="icon">🏮</span>
                    <span class="text">INSTALL APP</span>
                </button>
            </Transition>
        </ClientOnly>

        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>

<style lang="scss">
.lanna-app-container {
    min-height: 100vh;
    background-color: #020617;

    .lanna-install-fab {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 999;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 28px;

        background: $color-night;
        color: $color-gold;
        border: 2px solid $color-gold;
        border-radius: 50px;

        font-weight: 800;
        font-size: 13px;
        letter-spacing: 2px;
        text-transform: uppercase;
        cursor: pointer;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

        &:hover {
            transform: translateY(-5px) scale(1.05);
            background: $color-gold;
            color: $color-night;
            box-shadow: 0 15px 40px rgba(212, 175, 55, 0.4);
        }

        .icon {
            font-size: 20px;
        }
    }

    .lanna-fade-enter-active,
    .lanna-fade-leave-active {
        transition: all 0.6s ease;
    }

    .lanna-fade-enter-from,
    .lanna-fade-leave-to {
        opacity: 0;
        transform: translateY(40px) scale(0.8);
    }
}
</style>
