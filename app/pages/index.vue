<script setup>
import {
    EnvironmentOutlined,
    CalendarOutlined,
    HistoryOutlined, // (เก็บไว้หากใช้ในอนาคต แต่ใน template นี้ไม่ได้เรียกใช้ชัดเจน ถ้าไม่ได้ใช้ลบเพิ่มได้ครับ)
    MailOutlined,
    PhoneOutlined,
    ArrowRightOutlined,
    AppstoreOutlined,
    CheckCircleOutlined,
    GlobalOutlined,
    EyeOutlined, // เพิ่มตัวนี้เพราะใน template มีการเรียกใช้ <EyeOutlined /> ใน Gallery
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 1. Fetch Gallery
const { data: galleryPhotos, pending: galleryPending } = await useFetch('/api/gallery', {
    query: { limit: 8 },
})

// 2. Fetch Articles (4 รายการล่าสุด)
const { data: articles, pending: articlesPending } = await useFetch('/api/articles', {
    query: { limit: 4, status: 'published' },
})

const { data: activeTicket, pending: ticketPending, refresh } = await useFetch('/api/tickets/active')

// 3. Fetch Events Schedule
const { data: schedule, pending, error } = await useFetch('/api/events')

if (error.value) {
    console.error('Fetch error:', error.value)
}

const isProcessing = ref(false)

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

// ฟังก์ชันเรียก API ที่เราย้ายไปไว้ใน /api/stripe/checkout
const handleCheckout = async (priceId) => {
    if (isProcessing.value) return
    isProcessing.value = true

    try {
        const response = await $fetch('/api/stripe/checkout', {
            method: 'POST',
            body: {
                priceId: priceId,
                email: user.value?.email,
            },
        })

        if (response.url) {
            window.location.href = response.url
        }
    } catch (error) {
        message.error('System error, cannot proceed to checkout.')
        console.error(error)
    } finally {
        isProcessing.value = false
    }
}

const validateAndCheckout = async () => {
    // ดึงข้อมูลล่าสุดจาก Server ก่อน (กันคนค้างหน้าเว็บไว้นาน)
    await refresh()
    const ticket = await activeTicket.value
    // 1. ตรวจสอบสต๊อกตั๋ว
    if (ticket.stock_quantity <= 0) {
        Modal.info({
            title: 'Ticket Unavailble',
            content: h('div', { class: 'lanna-modal-content' }, [
                h('p', 'We apologize, but this ticket category is currently sold out.'),
                h('p', 'Please check back later or contact our support team for further assistance.'),
            ]),
            okText: 'Understood',
            centered: true,
            maskClosable: true,
            // เพิ่มสไตล์ให้เข้ากับธีม Gold & Night
            wrapClassName: 'lanna-soldout-modal',
        })
        return
    }

    // 2. ตรวจสอบสถานะ Login
    if (!user.value || !user.value.email) {
        showLoginWarning()
        return
    }

    const priceId = ticket.priceId
    handleCheckout(priceId)
}

const showLoginWarning = () => {
    Modal.warning({
        title: 'Please Login First',
        content: 'You must be logged in to purchase a ticket. Please sign in to your account to continue.',
        okText: 'Go to Login',
        centered: true,
        maskClosable: true,
        onOk() {
            navigateTo('/login')
        },
    })
}
</script>

<template>
    <div class="layout-wrapper">
        <section class="hero-premium">
            <div class="sky-elements">
                <div class="moon-giant"></div>
                <div v-for="i in 40" :key="'s' + i" class="star-blink"></div>
            </div>

            <div class="hero-inner">
                <div class="location-tag"><EnvironmentOutlined /> CHIANG MAI, THAILAND</div>
                <h1 class="main-title">Yi Peng <span class="gold-text">Festival</span></h1>
                <p class="main-subtitle">The Light of Spiritual Heritage 2026</p>
                <div class="hero-actions">
                    <a-button type="primary" class="btn-reserve" href="#ticket">
                        RESERVE NOW <ArrowRightOutlined />
                    </a-button>
                </div>
            </div>

            <div class="lantern-stream">
                <div v-for="i in 12" :key="'l' + i" class="floating-lantern"></div>
            </div>
        </section>

        <a-layout-content class="content-container">
            <section id="history" class="section-v2">
                <div class="section-header">
                    <span class="sub-label">OUR HERITAGE</span>
                    <h2 class="title-v2">The Legacy of Light</h2>
                </div>

                <div class="history-grid">
                    <div class="history-card main-text">
                        <p class="drop-cap">
                            Rooted in the soul of the ancient Lanna Kingdom, Yi Peng is Chiang Mai’s most sacred time of
                            reflection. Celebrated on the full moon of the 12th Thai lunar month, it marks a celestial
                            transition where the physical and spiritual worlds meet.
                        </p>
                        <p>
                            During this "Festival of Lights," the city is transformed by thousands of
                            <strong>Khom Loy</strong> (sky lanterns) drifting into the night sky. For the people of
                            Northern Thailand, this is more than a spectacle; it is a ritual of
                            <em>Sado-Kro</em>—releasing misfortune and letting go of the past.
                        </p>
                        <p>
                            As these golden orbs ascend, they carry silent prayers to the
                            <strong>Phra Ket Kaew Chulamanee</strong>, the sacred stupa in the highest heaven. Down on
                            earth, the flickering "Phang Pratheep" (clay lamps) illuminate homes and temples, guiding
                            the way for a year of wisdom and prosperity.
                        </p>
                    </div>

                    <div class="history-stat">
                        <div class="stat-item">
                            <div class="stat-visual">
                                <span class="num">700+</span>
                                <span class="plus">Years</span>
                            </div>
                            <span class="lab">Lanna Tradition</span>
                        </div>

                        <div class="stat-divider"></div>

                        <div class="stat-item">
                            <div class="stat-visual">
                                <span class="num">100%</span>
                            </div>
                            <span class="lab">Cultural Authenticity</span>
                        </div>
                    </div>
                </div>
            </section>

            <div class="lanna-divider"></div>

            <section id="atmosphere" class="section-v2">
                <div class="container">
                    <div class="section-header text-center flex-header">
                        <div>
                            <span class="sub-label">ATMOSPHERE</span>
                            <h2 class="title-v2">Event Gallery</h2>
                        </div>
                        <NuxtLink to="/gallery" class="view-all-link"> VIEW ALL <AppstoreOutlined /> </NuxtLink>
                    </div>

                    <div v-if="galleryPending" class="text-center py-20">
                        <a-spin size="large" tip="Loading Gallery..." />
                    </div>

                    <div v-else class="gallery-premium-grid">
                        <a-image-preview-group>
                            <div v-for="img in galleryPhotos" :key="img.id" class="gallery-item">
                                <a-image :src="img.url" :alt="img.alt || 'Yi Peng Moment'" class="gallery-img-custom">
                                    <template #previewMask>
                                        <div class="custom-mask">
                                            <EyeOutlined />
                                            <span style="margin-left: 8px">View Full Size</span>
                                        </div>
                                    </template>
                                </a-image>
                            </div>
                        </a-image-preview-group>
                    </div>

                    <div v-if="!galleryPending && galleryPhotos?.length === 0" class="text-center py-10">
                        <a-empty description="No atmosphere photos yet." />
                    </div>
                </div>
            </section>

            <div class="lanna-divider"></div>

            <section id="schedule" class="section-v2">
                <div class="section-header text-center">
                    <span class="sub-label">EVENT PROGRAM</span>
                    <h2 class="title-v2">Evening Itinerary</h2>
                </div>

                <div v-if="pending" class="text-center">
                    <a-spin size="large" />
                </div>

                <div v-else class="timeline-container">
                    <div v-for="(item, idx) in schedule" :key="idx" class="timeline-item">
                        <div class="time-box">{{ item.event_time }}</div>
                        <div class="event-content">
                            <h3>{{ item.title }}</h3>
                            <p>{{ item.description }}</p>
                        </div>
                    </div>

                    <div v-if="!schedule || schedule.length === 0" class="text-center">
                        <p>Stay tuned! Schedule will be updated soon.</p>
                    </div>
                </div>
            </section>

            <div v-if="activeTicket" class="lanna-divider"></div>

            <section v-if="activeTicket" id="ticket" class="section-v2">
                <div class="section-header text-center">
                    <span class="sub-label">ADMISSION</span>
                    <h2 class="title-v2">Your Golden Passage</h2>
                </div>

                <div class="ticket-artistic-wrap">
                    <ticket-example v-if="!ticketPending && activeTicket" :key="activeTicket.id" :data="activeTicket" />
                    <div v-else-if="ticketPending">
                        <a-skeleton active />
                    </div>

                    <div v-if="activeTicket" class="price-display-wrapper">
                        <div class="price-details">
                            <span class="price-label">INVESTMENT IN TRADITION</span>

                            <div class="price-value-group">
                                <span class="currency">{{ activeTicket.currency?.toUpperCase() }}</span>

                                <span class="amount">{{ Number(activeTicket.price).toLocaleString() }}</span>
                            </div>
                        </div>
                    </div>
                    <div v-if="activeTicket.stock_quantity <= 5" class="stock-warning">
                        Only {{ activeTicket.stock_quantity }} lanterns remaining
                    </div>
                    <div class="checkout-action-area">
                        <button
                            :key="activeTicket?.stock_quantity"
                            class="lanna-checkout-btn"
                            @click="validateAndCheckout(activeTicket)"
                            :disabled="isProcessing || activeTicket?.stock_quantity <= 0"
                        >
                            <span class="btn-content" v-if="!isProcessing">
                                <span class="btn-text">SECURE CHECKOUT</span>
                                <ArrowRightOutlined class="btn-icon" />
                            </span>
                            <span class="btn-content" v-else> <LoadingOutlined /> PROCESSING... </span>
                        </button>
                        <div class="secure-badge"><LockOutlined /> Secured by Stripe</div>
                    </div>
                </div>
            </section>

            <div class="lanna-divider"></div>

            <section id="venue" class="section-v2">
                <div class="section-header text-center">
                    <span class="sub-label">THE VENUE</span>
                    <h2 class="title-v2">Ban Pao, Mae Taeng</h2>
                </div>

                <div class="venue-container">
                    <div class="venue-info-card">
                        <div class="venue-detail">
                            <EnvironmentOutlined class="v-icon" />
                            <div>
                                <h4>Location</h4>
                                <p>Ban Pao Subdistrict, Mae Taeng District, Chiang Mai 50150</p>
                            </div>
                        </div>
                        <div class="venue-detail">
                            <GlobalOutlined class="v-icon" />
                            <div>
                                <h4>Atmosphere</h4>
                                <p>Surrounded by nature and traditional Lanna charm near the Ping River.</p>
                            </div>
                        </div>
                    </div>

                    <div class="map-wrapper">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15086.123456789!2d98.9!3d19.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA2JzAwLjAiTiA5OMKwNTQnMDAuMCJF!5e0!3m2!1sth!2sth!4v1234567890"
                            width="100%"
                            height="450"
                            style="border: 0"
                            allowfullscreen=""
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>
            </section>

            <div class="lanna-divider"></div>

            <section id="articles" class="section-v2">
                <div class="container">
                    <div class="section-header text-center flex-header" style="margin-bottom: 40px">
                        <div>
                            <span class="sub-label">INSIGHTS</span>
                            <h2 class="title-v2">Lanna Chronicles</h2>
                        </div>
                        <NuxtLink to="/articles" class="view-all-link"> VIEW ALL <AppstoreOutlined /> </NuxtLink>
                    </div>

                    <div v-if="articlesPending" class="text-center py-10">
                        <a-spin size="large" />
                    </div>

                    <div v-else class="article-grid">
                        <a-row :gutter="[24, 24]">
                            <a-col v-for="article in articles" :key="article.id" :xs="24" :sm="12" :lg="8">
                                <NuxtLink :to="`/articles/${article.id}`" class="article-card-link">
                                    <div class="article-modern-card">
                                        <div class="card-image">
                                            <img
                                                :src="article.images?.[0]?.image_url || '/images/placeholder-lanna.jpg'"
                                                :alt="article.title"
                                            />
                                            <div class="card-date">
                                                <CalendarOutlined />
                                                {{ dayjs(article.created_at).format('DD MMM YYYY') }}
                                            </div>
                                        </div>

                                        <div class="card-content">
                                            <div class="category-info"><ReadOutlined /> ARTICLE</div>
                                            <h3 class="card-title">{{ article.title }}</h3>
                                            <p class="card-excerpt">
                                                {{
                                                    article.meta_description ||
                                                    'Explore the profound beauty and traditions of Lanna culture...'
                                                }}
                                            </p>
                                            <div class="card-footer">
                                                <span class="read-more">READ STORY</span>
                                                <RightOutlined class="arrow-icon" />
                                            </div>
                                        </div>
                                    </div>
                                </NuxtLink>
                            </a-col>
                        </a-row>
                    </div>
                </div>
            </section>
        </a-layout-content>

        <footer class="footer-modern"></footer>
    </div>
</template>

<style lang="scss" scoped>
@use 'sass:math';

.ticket-perks {
    margin-top: 25px;
    padding-top: 15px;
    border-top: 1px solid rgba($color-gold, 0.15);
    display: flex;
    flex-wrap: wrap;
    gap: 15px;

    .perk-item {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.7);
        display: flex;
        align-items: center;
        gap: 8px;

        .anticon {
            color: $color-gold;
        }
    }
}

.venue-container {
    display: flex;
    flex-direction: column;
    gap: 40px;

    .venue-info-card {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        background: rgba(255, 255, 255, 0.03);
        padding: 40px;
        border-radius: 24px;
        border: 1px solid rgba($color-gold, 0.1);

        .venue-detail {
            display: flex;
            gap: 20px;
            align-items: flex-start;

            .v-icon {
                font-size: 1.5rem;
                color: $color-gold;
                background: rgba($color-gold, 0.1);
                padding: 12px;
                border-radius: 12px;
            }

            h4 {
                color: #fff;
                margin-bottom: 8px;
                font-weight: 600;
            }
            p {
                color: rgba(255, 255, 255, 0.6);
                margin: 0;
                line-height: 1.6;
            }
        }
    }

    .map-wrapper {
        border-radius: 24px;
        overflow: hidden;
        border: 1px solid rgba($color-gold, 0.2);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
}

.lanna-divider {
    height: 40px;
    width: 100%;
    margin: 20px 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 1px;
        background: linear-gradient(90deg, transparent, $color-gold, transparent);
        opacity: 0.3;
    }

    &::after {
        content: '✦ ✦ ✦';
        color: $color-gold;
        background: $color-night-blue;
        padding: 0 30px;
        letter-spacing: 15px;
        font-size: 1.2rem;
        z-index: 2;
        opacity: 0.8;
    }
}

.gallery-premium-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    margin-top: 30px;

    :deep(.ant-image) {
        width: 100%;
        height: 100%;
    }

    .gallery-item {
        position: relative;
        aspect-ratio: 1/1;
        overflow: hidden;
        border-radius: 12px;
        cursor: pointer;
        border: 1px solid rgba($color-gold, 0.2);

        :deep(.ant-image-img) {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
            display: block;
        }

        :deep(.ant-image-mask) {
            background: rgba($color-deep-purple, 0.6);
            color: $color-gold;
            font-size: 1.2rem;
            border-radius: 12px;
            & .custom-mask {
                display: grid;
                gap: 8px;
            }

            .ant-image-mask-info {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                font-size: 1.2rem;

                .anticon {
                    font-size: 2.5rem;
                }
            }
        }

        &:hover {
            :deep(.ant-image-img) {
                transform: scale(1.1);
            }
        }
    }
}

.flex-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.view-all-link {
    color: $color-gold;
    font-weight: 700;
    letter-spacing: 2px;
    font-size: 0.85rem;
    margin-bottom: 65px;
    border-bottom: 1px solid transparent;
    transition: 0.3s;
    display: flex;
    align-items: center;
    gap: 10px;
    &:hover {
        border-color: $color-gold;
        gap: 15px;
    }
}

.layout-wrapper {
    background: $color-night-blue;
    color: #fff;
    min-height: 100vh;
    overflow-x: hidden;
}

.content-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 24px;
    position: relative;
    z-index: 20;
}

.hero-premium {
    height: 100vh;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: radial-gradient(circle at 50% 100%, $color-deep-purple 0%, $color-night-blue 100%);

    .hero-inner {
        z-index: 30;
        text-align: center;
    }

    .location-tag {
        color: $color-gold;
        letter-spacing: 4px;
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        text-transform: uppercase;
    }

    .main-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(3.5rem, 12vw, 7rem);
        line-height: 0.9;
        margin: 0;
        font-weight: 800;
        color: $color-gold;
        text-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }

    .gold-text {
        font-style: italic;
        color: white;
    }
    .main-subtitle {
        font-size: 1.4rem;
        color: $color-soft-amber;
        margin: 30px 0;
        letter-spacing: 3px;
        font-weight: 300;
    }
}

.sky-elements {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}
.moon-giant {
    position: absolute;
    top: -80px;
    right: -80px;
    width: min(500px, 80vw);
    height: min(500px, 80vw);
    background: radial-gradient(circle at 35% 35%, #fff 0%, $color-soft-amber 40%, rgba($color-gold, 0.5) 100%);
    border-radius: 50%;
    box-shadow: 0 0 120px rgba($color-gold, 0.3), inset -20px -20px 60px rgba(0, 0, 0, 0.1);
    opacity: 0.9;
    filter: blur(1px);
}

.star-blink {
    position: absolute;
    background: #fff;
    border-radius: 50%;
    animation: blink math.random(3000) + 2000ms infinite ease-in-out;
    @for $i from 1 through 40 {
        &:nth-child(#{$i}) {
            $size: math.random(3) + 1px;
            width: $size;
            height: $size;
            top: math.random(100) * 1%;
            left: math.random(100) * 1%;
            animation-delay: math.random(5000) * 1ms;
            opacity: math.div(math.random(10), 10);
        }
    }
}

.lantern-stream {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 10;
}
.floating-lantern {
    position: absolute;
    bottom: -100px;
    width: 35px;
    height: 50px;
    background: linear-gradient(to bottom, $color-orange 20%, transparent 100%);
    border-radius: 40% 40% 15% 15%;
    box-shadow: 0 0 25px rgba($color-orange, 0.7);
    opacity: 0;
    animation: lanternFloat 22s linear infinite;
    &::after {
        content: '';
        position: absolute;
        bottom: 4px;
        left: 50%;
        transform: translateX(-50%);
        width: 8px;
        height: 8px;
        background: #fff;
        border-radius: 50%;
        box-shadow: 0 0 12px #fff;
    }
    @for $i from 1 through 15 {
        &:nth-child(#{$i}) {
            left: math.random(95) * 1%;
            animation-delay: math.random(25) * 1s;
            transform: scale(0.4 + math.div(math.random(8), 10));
            animation-duration: 18s + math.random(10) * 1s;
        }
    }
}

.section-v2 {
    padding: 120px 0;
}
.sub-label {
    color: $color-gold;
    font-weight: 600;
    letter-spacing: 4px;
    font-size: 0.85rem;
    display: block;
}
.title-v2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    color: #fff;
    margin: 15px 0 60px;
}

.history-grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 60px;
    align-items: center;
    .main-text {
        font-size: 1.15rem;
        line-height: 1.9;
        color: rgba(255, 255, 255, 0.85);
        .drop-cap::first-letter {
            float: left;
            font-size: 4.5rem;
            line-height: 0.8;
            padding-right: 15px;
            color: $color-gold;
            font-family: 'Playfair Display', serif;
            font-weight: 700;
        }
    }
    .stat-item {
        border-left: 3px solid $color-gold;
        padding: 10px 0 10px 30px;
        .num {
            display: block;
            font-size: 4rem;
            font-weight: 800;
            color: $color-gold;
            line-height: 1;
        }
        .lab {
            color: $color-soft-amber;
            font-size: 1rem;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
    }
}

.timeline-container {
    display: grid;
    gap: 24px;
    .timeline-item {
        display: flex;
        gap: 40px;
        background: rgba(255, 255, 255, 0.03);
        padding: 35px;
        border-radius: 20px;
        border: 1px solid rgba($color-gold, 0.1);
        transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        &:hover {
            background: rgba($color-gold, 0.07);
            transform: translateX(15px);
            border-color: rgba($color-gold, 0.3);
        }
        .time-box {
            min-width: 120px;
            color: $color-gold;
            font-weight: 700;
            font-size: 1.3rem;
            font-family: 'Playfair Display', serif;
        }
        .event-content {
            h3 {
                color: #fff;
                margin: 0 0 10px;
                font-size: 1.5rem;
                font-weight: 600;
            }
            p {
                margin: 0;
                color: rgba(255, 255, 255, 0.6);
                font-size: 1rem;
            }
        }
    }
}

.ticket-card-v2 {
    position: relative;
    display: flex;
    max-width: 800px;
    height: 360px;
    margin: 0 auto;
    background: #0a0a0a;
    border: 1px solid rgba($color-gold, 0.4);
    border-radius: 8px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    &::before {
        position: absolute;
        content: '';
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        background: linear-gradient(rgba(255, 255, 255, 0.5), rgba(0, 0, 0, 0.2)),
            url('../assets/images/bg-ticket.png');
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        opacity: 30%;
    }
    .ticket-left {
        padding: 40px;
        flex-grow: 1;
        border-right: 2px dashed rgba($color-gold, 0.2);
        position: relative;
        &::before,
        &::after {
            content: '';
            position: absolute;
            right: -11px;
            width: 20px;
            height: 20px;
            background: $color-night-blue;
            border-radius: 50%;
            z-index: 5;
        }
        &::before {
            top: -11px;
        }
        &::after {
            bottom: -11px;
        }
    }
    .ticket-brand {
        font-size: 0.75rem;
        letter-spacing: 6px;
        color: $color-gold;
        font-weight: 700;
        margin-bottom: 25px;
    }
    .ticket-type {
        font-size: 2.2rem;
        margin: 10px 0;
        font-family: 'Playfair Display', serif;
        color: #fff;
    }
    .detail-row {
        display: flex;
        gap: 40px;
        margin-top: 30px;
        label {
            display: block;
            font-size: 0.65rem;
            color: $color-gold;
            letter-spacing: 2px;
            margin-bottom: 5px;
        }
        span {
            font-size: 1rem;
            font-weight: 500;
        }
    }
    .ticket-footer {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-top: 40px;
        .price {
            font-size: 1.8rem;
            font-weight: 800;
            color: $color-gold;
        }
        .serial {
            font-size: 0.7rem;
            opacity: 0.4;
            font-family: monospace;
        }
    }
    .ticket-right {
        padding: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba($color-gold, 0.02);
        min-width: 200px;
        .qr-zone {
            text-align: center;
            p {
                font-size: 0.6rem;
                margin-top: 15px;
                color: $color-gold;
                letter-spacing: 2px;
                font-weight: 700;
            }
        }
    }
    @media (max-width: 768px) {
        flex-direction: column;
        height: auto;
        max-width: 100%;
        .ticket-left {
            border-right: none;
            border-bottom: 2px dashed rgba($color-gold, 0.2);
            padding: 30px 24px;

            &::before,
            &::after {
                right: auto;
                bottom: -11px;
                left: -11px;
            }
            &::after {
                left: auto;
                right: -11px;
            }
        }

        .ticket-type {
            font-size: 1.8rem;
        }

        .detail-row {
            gap: 20px;
            flex-wrap: wrap;
        }

        .ticket-right {
            padding: 30px;
            min-width: 100%;
            background: rgba($color-gold, 0.05);
        }

        .ticket-footer {
            margin-top: 30px;
            .price {
                font-size: 1.5rem;
            }
        }
    }
}

@keyframes blink {
    0%,
    100% {
        opacity: 0.3;
        transform: scale(1);
    }
    50% {
        opacity: 1;
        transform: scale(1.2);
    }
}
@keyframes lanternFloat {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0;
    }
    10% {
        opacity: 0.8;
    }
    90% {
        opacity: 0.8;
    }
    100% {
        transform: translateY(-130vh) rotate(20deg);
        opacity: 0;
    }
}
.hero-actions {
    display: flex;
    justify-content: center;
}
.btn-reserve {
    background: transparent !important;
    border: 1px solid $color-gold !important;
    color: $color-gold !important;
    height: 60px !important;
    letter-spacing: 3px;
    font-weight: 700;
    border-radius: 0 !important;
    transition: all 0.3s !important;
    width: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
        background: $color-gold !important;
        color: #000 !important;
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba($color-gold, 0.2);
    }
}

.footer-modern {
    background: #050505;
    padding: 80px 24px 30px;
    margin-top: 100px;
    .footer-grid {
        max-width: 1100px;
        margin: 0 auto 60px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }
    .brand-side h3 {
        color: $color-gold;
        letter-spacing: 4px;
        font-size: 1.5rem;
        margin-bottom: 15px;
    }
    .brand-side p {
        opacity: 0.5;
        max-width: 300px;
        font-size: 0.9rem;
    }
    .contact-side p {
        margin-bottom: 10px;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 10px;
        color: rgba(255, 255, 255, 0.7);
    }
    .footer-bottom {
        text-align: center;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        padding-top: 30px;
        font-size: 0.75rem;
        letter-spacing: 1px;
        opacity: 0.3;
    }
}

@media (max-width: 768px) {
    .gallery-premium-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .venue-info-card {
        grid-template-columns: 1fr !important;
    }
    .history-grid {
        grid-template-columns: 1fr;
        gap: 40px;
    }
    .ticket-card-v2 {
        flex-direction: column;
        .ticket-left {
            border-right: none;
            border-bottom: 2px dashed rgba($color-gold, 0.2);
        }
    }
    .timeline-item {
        flex-direction: column;
        gap: 15px;
    }
    .footer-grid {
        flex-direction: column;
        gap: 40px;
    }
}

/* Article Section Custom Style */
.article-grid {
    padding: 0 20px;
}

.article-modern-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba($color-gold, 0.15);
    border-radius: 20px;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);

    &:hover {
        border-color: $color-gold;
        transform: translateY(-10px);
        background: rgba($color-gold, 0.05);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        .card-image img {
            transform: scale(1.1);
        }
        .arrow-icon {
            transform: translateX(5px);
        }
    }

    .card-image {
        position: relative;
        height: 240px;
        overflow: hidden;
        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s ease;
        }
        .card-date {
            position: absolute;
            bottom: 15px;
            left: 15px;
            background: rgba($color-night-blue, 0.8);
            color: $color-gold;
            padding: 5px 12px;
            border-radius: 6px;
            font-size: 0.75rem;
            backdrop-filter: blur(4px);
            border: 1px solid rgba($color-gold, 0.2);
        }
    }

    .card-content {
        padding: 28px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;

        .category-info {
            color: $color-gold;
            font-size: 0.7rem;
            letter-spacing: 2px;
            margin-bottom: 12px;
            font-weight: 600;
        }

        .card-title {
            font-family: 'Playfair Display', serif;
            font-size: 1.5rem;
            color: #fff;
            margin-bottom: 15px;
            line-height: 1.4;
            display: -webkit-box;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .card-excerpt {
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.95rem;
            line-height: 1.7;
            margin-bottom: 25px;
            flex-grow: 1;
            display: -webkit-box;
            line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .card-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-top: 20px;
            border-top: 1px solid rgba($color-gold, 0.1);
            color: $color-gold;
            font-weight: 700;
            font-size: 0.8rem;
            letter-spacing: 1.5px;
            .arrow-icon {
                transition: transform 0.3s ease;
            }
        }
    }
}

.article-modern-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 12px 24px rgba(212, 175, 55, 0.15); /* เงาสีทอง */
}

.article-image-wrapper {
    position: relative;
    height: 200px;
    overflow: hidden;
}

.article-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.article-date-tag {
    position: absolute;
    bottom: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    backdrop-filter: blur(4px);
}

.article-title-text {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.article-excerpt {
    font-size: 14px;
    color: #666;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.6;
}

.article-card-link {
    text-decoration: none;
}

/* ปรับ View All Link ให้เหมือน Gallery */
.view-all-link {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #d4af37;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.3s;
}

.view-all-link:hover {
    color: #b8952d;
}

.ticket-artistic-wrap {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    & .price-display-wrapper {
        margin: 24px auto 32px;
        text-align: center;
        position: relative;
        max-width: 600px;

        &::before,
        &::after {
            content: '';
            position: absolute;
            top: 55%;
            width: 80px;
            height: 1px;
            background: linear-gradient(to right, transparent, $color-gold);
        }
        &::before {
            left: 0;
        }
        &::after {
            right: 0;
            transform: rotate(180deg);
        }

        .price-details {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            .price-label {
                font-size: 14px;
                letter-spacing: 5px;
                color: $color-gold;
                font-weight: 700;
                opacity: 0.9;
            }

            .price-value-group {
                display: flex;
                align-items: baseline;
                gap: 12px;

                .currency {
                    font-size: 2rem;
                    font-weight: 600;
                    color: $color-gold;
                    font-family: 'serif';
                }

                .amount {
                    font-size: 6rem;
                    font-weight: 900;
                    color: #fff;
                    line-height: 0.9;
                    text-shadow: 0 0 10px rgba($color-gold, 0.5), 0 0 30px rgba($color-gold, 0.3),
                        0 10px 20px rgba(0, 0, 0, 0.4);

                    background: linear-gradient(to bottom, #fff 20%, $color-gold 100%);
                    background-clip: text;
                    -webkit-text-fill-color: transparent;

                    @media (max-width: 640px) {
                        font-size: 4rem;
                    }
                }
            }
        }
    }

    .stock-warning {
        margin-top: 12px;
        font-size: 14px;
        letter-spacing: 1px;
        color: #ef4444;
        font-weight: 700;
        background: rgba(#ef4444, 0.15);
        padding: 4px 16px;
        border-radius: 20px;
        border: 1px solid rgba(#ef4444, 0.3);
        box-shadow: 0 0 15px rgba(#ef4444, 0.2);
    }

    .lanna-checkout-btn {
        width: 100%;
        max-width: 400px;
        padding: 18px 32px;
        background: $color-night;
        border: 2px solid $color-gold;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);

        .btn-content {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            color: $color-gold;
        }

        .btn-text {
            font-size: 1.1rem;
            font-weight: 900;
            letter-spacing: 2px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .btn-icon {
            font-size: 1.2rem;
            filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.5));
        }

        &:hover:not(:disabled) {
            background: $color-gold;
            transform: translateY(-3px);
            box-shadow: 0 12px 30px rgba($color-gold, 0.3);

            .btn-text,
            .btn-icon {
                color: $color-night;
                text-shadow: none;
            }
        }

        &:disabled {
            opacity: 0.6;
            filter: grayscale(1);
            cursor: not-allowed;
        }
    }

    .secure-badge {
        margin-top: 16px;
        font-size: 12px;
        color: rgba(#fff, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        letter-spacing: 1px;
    }
}

.checkout-action-area {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.lanna-checkout-btn {
    position: relative;
    width: 100%;
    max-width: 400px;
    height: 60px;
    background: linear-gradient(135deg, #d4af37 0%, #f2d472 50%, #d4af37 100%);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);

    .btn-content {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        color: $color-night-blue;
        font-weight: 800;
        font-size: 1.1rem;
        letter-spacing: 2px;
    }

    .btn-icon {
        transition: transform 0.3s ease;
    }

    &:hover:not(:disabled) {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px rgba(212, 175, 55, 0.5);
        background: linear-gradient(135deg, #f2d472 0%, #ffffff 50%, #f2d472 100%);

        .btn-icon {
            transform: translateX(8px);
        }
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        filter: grayscale(0.5);
    }

    &::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transform: rotate(45deg);
        animation: shimmer 3s infinite;
    }
    @media (max-width: 576px) {
        width: 100%;
        height: 55px;
        .btn-text {
            font-size: 0.95rem;
        }
    }
}

@keyframes shimmer {
    0% {
        transform: translateX(-100%) rotate(45deg);
    }
    100% {
        transform: translateX(100%) rotate(45deg);
    }
}

.secure-badge {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 6px;
    letter-spacing: 1px;
}

@media (max-width: 576px) {
    .lanna-checkout-btn {
        max-width: 100%;
    }
}

.ticket-artistic-wrap {
    width: 100%;
    padding: 0 10px;
}
</style>

<style lang="scss">
.lanna-soldout-modal {
    .ant-modal-content {
        background: #0f172a;
        border: 1px solid rgba(212, 175, 55, 0.3);
        border-radius: 15px;
    }
    .ant-modal-confirm-title {
        color: #d4af37 !important;
        font-weight: 800;
        font-size: 1.2rem;
    }
    .ant-modal-confirm-content {
        color: rgba(255, 255, 255, 0.8) !important;
        margin-top: 12px;
    }
    .ant-btn-primary {
        background: #d4af37;
        border-color: #d4af37;
        color: #020617;
        font-weight: 700;
        &:hover {
            background: #fff;
            color: #d4af37;
        }
    }
}
</style>
