<script setup>
import {
    EnvironmentOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    HistoryOutlined,
    ScheduleOutlined,
    IdcardOutlined,
    PictureOutlined,
    MailOutlined,
    PhoneOutlined,
    ArrowRightOutlined,
    StarFilled,
    AppstoreOutlined,
    CheckCircleOutlined, // เพิ่มสำหรับลิสต์สิทธิประโยชน์
    GlobalOutlined, // เพิ่มสำหรับสถานที่
} from '@ant-design/icons-vue'

// 3. ปรับตารางกิจกรรมตามภาพ (เป็นภาษาอังกฤษ)
const schedule = [
    { time: '02:00 PM', title: 'Assembly', desc: 'Gathering at the meeting point and participant registration.' },
    { time: '06:00 PM', title: 'Event Entry', desc: 'Check-in and receive badges or souvenirs at the main entrance.' },
    { time: '06:30 PM', title: 'Festivity Begins', desc: 'Participate in various traditional Lanna activities.' },
    { time: '07:30 PM', title: 'Dinner & Refreshments', desc: 'Enjoy local cuisine, snacks, desserts, and beverages.' },
    {
        time: '08:00 PM',
        title: 'Grand Ceremony',
        desc: 'Sacred rituals accompanied by spectacular Lanna performances.',
    },
    { time: '08:30 PM', title: 'Lantern Distribution', desc: 'Receive your Khom Loy and move to the launching area.' },
    {
        time: '08:50 PM',
        title: 'Mass Lantern Release',
        desc: 'Simultaneous lighting and release of lanterns into the sky.',
    },
    { time: '09:20 PM', title: 'Departure', desc: 'Safe return journey to the designated drop-off points.' },
]

const galleryPhotos = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    url: `https://picsum.photos/seed/${i + 50}/600/400`,
    alt: `Yi Peng Moment ${i + 1}`,
}))
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
                <p class="main-subtitle">The Light of Spiritual Heritage 2025</p>
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
                    <span class="sub-label">OUR STORY</span>
                    <h2 class="title-v2">The Legacy of Light</h2>
                </div>
                <div class="history-grid">
                    <div class="history-card main-text">
                        <p class="drop-cap">
                            Originating from the ancient Lanna Kingdom, Yi Peng is a sacred festival celebrated on the
                            full moon of the 2nd month of the Lanna calendar.
                        </p>
                        <p>
                            It is a time for devotees to release lanterns (Khom Loy) into the celestial realm,
                            symbolizing the release of misfortune and paying homage to the Phra Ket Kaew Chulamanee
                            stupa in heaven.
                        </p>
                    </div>
                    <div class="history-stat">
                        <div class="stat-item">
                            <span class="num">700+</span>
                            <span class="lab">Years of Tradition</span>
                        </div>
                    </div>
                </div>
            </section>

            <div class="lanna-divider"></div>

            <section id="gallery" class="section-v2">
                <div class="section-header flex-header">
                    <div>
                        <span class="sub-label">ATMOSPHERE</span>
                        <h2 class="title-v2">Visual Journey</h2>
                    </div>
                    <NuxtLink to="/gallery" class="view-all-link"> VIEW ALL <AppstoreOutlined /> </NuxtLink>
                </div>

                <div class="gallery-premium-grid">
                    <div v-for="img in galleryPhotos" :key="img.id" class="gallery-item">
                        <img :src="img.url" :alt="img.alt" loading="lazy" />
                        <div class="img-overlay">
                            <PictureOutlined />
                        </div>
                    </div>
                </div>
            </section>

            <div class="lanna-divider"></div>

            <section id="schedule" class="section-v2">
                <div class="section-header text-center">
                    <span class="sub-label">EVENT PROGRAM</span>
                    <h2 class="title-v2">Evening Itinerary</h2>
                </div>
                <div class="timeline-container">
                    <div v-for="(item, idx) in schedule" :key="idx" class="timeline-item">
                        <div class="time-box">{{ item.time }}</div>
                        <div class="event-content">
                            <h3>{{ item.title }}</h3>
                            <p>{{ item.desc }}</p>
                        </div>
                    </div>
                </div>
            </section>

            <div class="lanna-divider"></div>

            <section id="ticket" class="section-v2">
                <div class="section-header text-center">
                    <span class="sub-label">ADMISSION</span>
                    <h2 class="title-v2">Your Golden Passage</h2>
                </div>

                <div class="ticket-artistic-wrap">
                    <div class="ticket-card-v2">
                        <div class="ticket-left">
                            <div class="ticket-brand">YI PENG 2025</div>
                            <div class="ticket-main-info">
                                <h4 class="ticket-type">VIP ADMISSION</h4>
                                <div class="detail-row">
                                    <div class="detail-item">
                                        <label>DATE</label>
                                        <span>Nov 15, 2025</span>
                                    </div>
                                    <div class="detail-item">
                                        <label>VENUE</label>
                                        <span>Ban Pao, Mae Taeng</span>
                                    </div>
                                </div>
                                <div class="ticket-perks">
                                    <div class="perk-item"><CheckCircleOutlined /> Free Admission</div>
                                    <div class="perk-item"><CheckCircleOutlined /> 1 Complementary Lantern</div>
                                    <div class="perk-item"><CheckCircleOutlined /> 1 Free Local Meal Set</div>
                                </div>
                            </div>
                            <div class="ticket-footer">
                                <span class="serial">#YP-888-2025</span>
                                <span class="price">฿ 5,999.00</span>
                            </div>
                        </div>
                        <div class="ticket-right">
                            <div class="qr-zone">
                                <a-qrcode value="VIP-TICKET" :size="100" color="#d4af37" bgColor="transparent" />
                                <p>SCAN TO ENTRY</p>
                            </div>
                        </div>
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
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120677.89209536098!2d98.83549726216447!3d19.05565342080392!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da3cc03e488d01%3A0x40346c550601330!2sBan%20Pao%2C%20Mae%20Taeng%20District%2C%20Chiang%20Mai!5e0!3m2!1sen!2sth!4v1700000000000!5m2!1sen!2sth"
                            width="100%"
                            height="450"
                            style="border: 0"
                            allowfullscreen=""
                            loading="lazy"
                            referrerpolicy="no-referrer-when-downgrade"
                        >
                        </iframe>
                    </div>
                </div>
            </section>
        </a-layout-content>

        <footer class="footer-modern">
            <div class="footer-grid">
                <div class="brand-side">
                    <h3>YI PENG FESTIVAL</h3>
                    <p>Preserving Lanna culture for generations.</p>
                </div>
                <div class="contact-side">
                    <p><MailOutlined /> hello@yipengfestival.com</p>
                    <p><PhoneOutlined /> +66 (0) 53 123 4567</p>
                </div>
            </div>
            <div class="footer-bottom">&copy; 2025 CHIANG MAI TOURISM. ALL RIGHTS RESERVED.</div>
        </footer>
    </div>
</template>

<style lang="scss" scoped>
@use 'sass:math';

// Style สำหรับส่วนสิทธิประโยชน์ในตั๋ว
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

// Style สำหรับส่วน Venue
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

// --- โค้ดเดิมที่คงไว้ทั้งหมด ---
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

    .gallery-item {
        position: relative;
        aspect-ratio: 1/1;
        overflow: hidden;
        border-radius: 12px;
        cursor: pointer;
        border: 1px solid rgba($color-gold, 0.2);

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
        }

        .img-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba($color-deep-purple, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: $color-gold;
            opacity: 0;
            transition: 0.3s;
        }

        &:hover {
            img {
                transform: scale(1.1);
            }
            .img-overlay {
                opacity: 1;
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
        url('../assets//images/bg-ticket.png');
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
</style>
