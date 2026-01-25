<script setup>
import {
    ArrowLeftOutlined,
    LinkOutlined,
    FacebookOutlined,
    LineOutlined,
    CalendarOutlined,
    UserOutlined,
    ShareAltOutlined,
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'

const route = useRoute()

// 1. Fetch ข้อมูล (API ของคุณส่งกลับมาเป็น { success: true, data: { ... } })
const { data: response, pending, error } = await useFetch(`/api/articles/${route.params.id}`)

// 2. ดึงข้อมูลบทความจากชั้น .data ออกมา (Computed เพื่อความปลอดภัย)
const article = computed(() => response.value?.data || null)

// 3. จัดการรูปภาพ (API ของคุณใช้ field 'url')
const displayImages = computed(() => {
    if (!article.value?.images) return []
    // ดึงค่า url ออกมาเป็น Array ของ String
    return article.value.images.map((img) => img.url)
})

// 4. Meta SEO (จัดการหลังจากได้ข้อมูล)
useHead({
    title: () => `${article.value?.title || 'กำลังโหลด...'} | Lanna Chronicles`,
    meta: [
        { name: 'description', content: () => article.value?.meta_description || '' },
        { property: 'og:title', content: () => article.value?.title },
        { property: 'og:image', content: () => displayImages.value[0] || '' },
    ],
})

// 5. ระบบ Sharing
const copyLink = () => {
    if (process.client) {
        navigator.clipboard.writeText(window.location.href)
        message.success('คัดลอกลิงก์เรียบร้อยแล้ว')
    }
}

const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
}
</script>

<template>
    <div class="article-detail-page">
        <div v-if="pending" class="state-container">
            <a-spin size="large" tip="กำลังเปิดหอจดหมายเหตุ..." />
        </div>

        <div v-else-if="error || !article" class="state-container">
            <a-empty description="ไม่พบเนื้อหาบทความที่คุณต้องการ" />
            <NuxtLink to="/articles" class="mt-4">
                <a-button type="primary">กลับสู่หน้าบทความ</a-button>
            </NuxtLink>
        </div>

        <template v-else>
            <nav class="detail-nav">
                <div class="nav-container">
                    <NuxtLink to="/articles" class="back-link"> <ArrowLeftOutlined /> BACK TO ARTICLES </NuxtLink>
                    <div class="nav-actions">
                        <FacebookOutlined @click="shareToFacebook" class="action-icon" />
                        <LinkOutlined @click="copyLink" class="action-icon" />
                    </div>
                </div>
            </nav>

            <header v-if="displayImages.length > 0" class="media-header">
                <div :class="['image-layout', `grid-${Math.min(displayImages.length, 3)}`]">
                    <div v-for="(img, idx) in displayImages.slice(0, 3)" :key="idx" class="img-item">
                        <a-image :src="img" :alt="article.title" />
                    </div>
                </div>
            </header>

            <main class="article-body">
                <div class="article-wrapper">
                    <header class="header-meta">
                        <h1 class="article-title">{{ article.title }}</h1>
                        <div class="meta-data">
                            <span><CalendarOutlined /> {{ dayjs(article.created_at).format('DD MMMM YYYY') }}</span>
                            <span class="sep">✦</span>
                            <span><UserOutlined /> Lanna Admin</span>
                        </div>
                    </header>

                    <div class="lanna-fancy-divider"></div>

                    <div class="rich-content" v-html="article.content"></div>

                    <footer class="article-footer">
                        <div class="share-box">
                            <span class="share-title">SHARE THIS CHRONICLE</span>
                            <div class="share-buttons">
                                <a-button @click="shareToFacebook" type="primary" ghost shape="round">
                                    <FacebookOutlined /> Facebook
                                </a-button>
                                <a-button @click="copyLink" shape="round"> <LinkOutlined /> Copy Link </a-button>
                            </div>
                        </div>
                    </footer>
                </div>
            </main>
        </template>
    </div>
</template>

<style lang="scss" scoped>
// อ้างอิง Global Variables จาก Gallery: $color-gold, $color-night-blue, $color-deep-purple

.article-detail-page {
    background: $color-night-blue;
    min-height: 100vh;
    color: #fff;
    padding-bottom: 80px;
}

// Nav
.detail-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba($color-night-blue, 0.9);
    backdrop-filter: blur(15px);
    border-bottom: 1px solid rgba($color-gold, 0.2);
    .nav-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 15px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .back-link {
        color: $color-gold;
        font-weight: 600;
        font-size: 0.9rem;
        letter-spacing: 1px;
    }
    .nav-actions {
        display: flex;
        gap: 20px;
        font-size: 1.2rem;
        color: rgba(#fff, 0.6);
        .action-icon {
            cursor: pointer;
            &:hover {
                color: $color-gold;
            }
        }
    }
}

// Media Grid (ซ้าย 1 ขวา 2)
.media-header {
    max-width: 1300px;
    margin: 30px auto;
    padding: 0 24px;
}
.image-layout {
    display: grid;
    gap: 12px;
    height: 550px;
    border-radius: 24px;
    overflow: hidden;
    .img-item {
        width: 100%;
        height: 100%;
        :deep(.ant-image) {
            width: 100%;
            height: 100%;
        }
        :deep(.ant-image-img) {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    &.grid-1 {
        grid-template-columns: 1fr;
    }
    &.grid-2 {
        grid-template-columns: 1fr 1fr;
    }
    &.grid-3 {
        grid-template-columns: 1.6fr 1fr;
        grid-template-rows: 1fr 1fr;
        .img-item:first-child {
            grid-row: span 2;
        }
    }
}

// Article Content
.article-body {
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 24px;
}
.header-meta {
    text-align: center;
    margin-bottom: 40px;
    .article-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(2rem, 5vw, 3.5rem);
        color: #fff;
        line-height: 1.2;
        margin-bottom: 20px;
    }
    .meta-data {
        color: $color-gold;
        display: flex;
        justify-content: center;
        gap: 15px;
        font-size: 0.9rem;
        .sep {
            opacity: 0.5;
        }
    }
}

.lanna-fancy-divider {
    height: 1px;
    width: 100%;
    background: linear-gradient(90deg, transparent, $color-gold, transparent);
    margin: 50px 0;
    position: relative;
    &::after {
        content: '✦';
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        background: $color-night-blue;
        padding: 0 20px;
        color: $color-gold;
    }
}

// Rich Text Style (สำคัญมากสำหรับการทำ v-html)
.rich-content {
    font-size: 1.15rem;
    line-height: 1.9;
    color: rgba(255, 255, 255, 0.8);
    :deep(p) {
        margin-bottom: 28px;
    }
    :deep(h2) {
        font-family: 'Playfair Display', serif;
        color: $color-gold;
        margin: 45px 0 20px;
        font-size: 1.8rem;
    }
    :deep(img) {
        border-radius: 16px;
        margin: 30px 0;
        width: 100%;
        height: auto;
        border: 1px solid rgba($color-gold, 0.2);
    }
    :deep(strong) {
        color: #fff;
        font-weight: 600;
    }
}

// Footer Share
.article-footer {
    margin-top: 100px;
    padding: 50px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 30px;
    border: 1px solid rgba($color-gold, 0.1);
    text-align: center;
    .share-title {
        color: $color-gold;
        letter-spacing: 3px;
        font-size: 0.75rem;
        font-weight: 700;
        display: block;
        margin-bottom: 25px;
    }
    .share-buttons {
        display: flex;
        justify-content: center;
        gap: 15px;
    }
}

.state-container {
    height: 80vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

@media (max-width: 768px) {
    .image-layout {
        height: 400px;
        &.grid-3 {
            grid-template-columns: 1fr;
            grid-template-rows: 2fr 1fr 1fr;
            .img-item:first-child {
                grid-row: span 1;
            }
        }
    }
}
</style>
