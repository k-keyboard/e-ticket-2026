<script setup>
import { ArrowLeftOutlined, ExpandOutlined, PictureOutlined } from '@ant-design/icons-vue'

// จำลองข้อมูลรูปภาพ 20 ภาพสำหรับหน้าแกลเลอรี
const fullGallery = Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    url: `https://picsum.photos/seed/${i + 100}/800/${i % 3 === 0 ? '1000' : '600'}`, // สลับความสูงให้ดูเป็นศิลปะ
    title: `Yi Peng Moment ${i + 1}`,
    location: 'Chiang Mai, Thailand',
}))

const goBack = () => {
    useRouter().push('/')
}
</script>

<template>
    <div class="gallery-page">
        <section class="gallery-hero">
            <div class="sky-bg">
                <div v-for="i in 20" :key="'gs' + i" class="star-static"></div>
            </div>

            <div class="header-content">
                <a-button type="link" class="back-btn" @click="goBack"> <ArrowLeftOutlined /> BACK TO HOME </a-button>
                <div class="title-wrap">
                    <span class="sub-label">THE ATMOSPHERE</span>
                    <h1 class="gallery-title">Celestial <span class="gold-text">Gallery</span></h1>
                </div>
                <div class="lanna-divider-small"></div>
            </div>
        </section>

        <main class="gallery-container">
            <div class="gallery-masonry">
                <div v-for="img in fullGallery" :key="img.id" class="masonry-item">
                    <div class="image-card">
                        <img :src="img.url" :alt="img.title" loading="lazy" />
                        <div class="card-overlay">
                            <div class="overlay-info">
                                <h3>{{ img.title }}</h3>
                                <p><PictureOutlined /> {{ img.location }}</p>
                            </div>
                            <div class="expand-icon">
                                <ExpandOutlined />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <footer class="gallery-footer">
            <div class="lanna-divider"></div>
            <p>Capturing the spirit of Lanna heritage through the lens.</p>
        </footer>
    </div>
</template>

<style lang="scss" scoped>
.gallery-page {
    background: $color-night-blue;
    min-height: 100vh;
    color: #fff;
    padding-bottom: 60px;
}

// --- HEADER ---
.gallery-hero {
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

    .gallery-title {
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
                top: random(100) * 1%;
                left: random(100) * 1%;
            }
        }
    }
}

// --- MASONRY GRID ---
.gallery-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
}

.gallery-masonry {
    columns: 4 300px; // สร้าง Column อัตโนมัติรองรับ Responsive
    column-gap: 20px;

    .masonry-item {
        break-inside: avoid;
        margin-bottom: 20px;
    }
}

.image-card {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba($color-gold, 0.2);
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);

    img {
        width: 100%;
        display: block;
        transition: transform 0.8s ease;
    }

    .card-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to top, rgba($color-deep-purple, 0.9) 0%, transparent 50%);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 24px;
        opacity: 0;
        transition: opacity 0.4s ease;

        .overlay-info {
            transform: translateY(20px);
            transition: transform 0.4s ease;
            h3 {
                color: #fff;
                margin: 0;
                font-size: 1.1rem;
            }
            p {
                color: $color-gold;
                font-size: 0.8rem;
                margin: 5px 0 0;
            }
        }

        .expand-icon {
            position: absolute;
            top: 20px;
            right: 20px;
            color: #fff;
            font-size: 1.2rem;
            opacity: 0.5;
        }
    }

    &:hover {
        border-color: $color-gold;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);

        img {
            transform: scale(1.08);
        }
        .card-overlay {
            opacity: 1;
            .overlay-info {
                transform: translateY(0);
            }
        }
    }
}

// --- DIVIDERS ---
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

.gallery-footer {
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.9rem;
    letter-spacing: 1px;
}

// --- RESPONSIVE ---
@media (max-width: 768px) {
    .gallery-masonry {
        columns: 2 150px;
    }
    .gallery-hero {
        padding-top: 80px;
    }
}
</style>
