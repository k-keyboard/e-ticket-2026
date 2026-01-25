<script setup>
import { ArrowLeftOutlined, SearchOutlined, RightOutlined, CalendarOutlined, ReadOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const searchQuery = ref('')
const limit = ref(100)

const { data: allArticles, pending } = await useFetch('/api/articles', {
    query: { limit: limit, status: 'published' },
})

const filteredArticles = computed(() => {
    if (!allArticles.value) return []
    return allArticles.value.filter((article) => article.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const goBack = () => useRouter().push('/')
</script>

<template>
    <div class="article-page">
        <section class="article-hero">
            <div class="sky-bg">
                <div v-for="i in 20" :key="'as' + i" class="star-static"></div>
            </div>

            <div class="header-content">
                <a-button type="link" class="back-btn" @click="goBack"> <ArrowLeftOutlined /> BACK TO HOME </a-button>
                <div class="title-wrap">
                    <span class="sub-label">INSIGHTS & STORIES</span>
                    <h1 class="article-title">Lanna <span class="gold-text">Chronicles</span></h1>
                </div>

                <div class="search-wrapper">
                    <div class="lanna-search-bar">
                        <div class="input-inner">
                            <SearchOutlined class="search-icon" />
                            <input
                                v-model="searchQuery"
                                type="text"
                                placeholder="Search our archives..."
                                class="custom-input"
                            />
                        </div>
                        <button class="search-btn">SEARCH</button>
                    </div>
                </div>

                <div class="lanna-divider-small"></div>
            </div>
        </section>

        <main class="article-container">
            <div v-if="pending" class="loading-state">
                <a-spin size="large" />
            </div>
            <a-row v-else-if="filteredArticles.length > 0" :gutter="[24, 24]">
                <a-col
                    v-for="article in filteredArticles"
                    :key="article.id"
                    :xs="24"
                    :sm="12"
                    :lg="8"
                    class="grid-item"
                >
                    <NuxtLink :to="`/articles/${article.id}`" class="article-link">
                        <div class="article-modern-card">
                            <div class="card-image">
                                <img
                                    :src="article.images?.[0]?.image_url || '/images/placeholder-lanna.jpg'"
                                    :alt="article.title"
                                />
                                <div class="card-date">
                                    <CalendarOutlined /> {{ dayjs(article.created_at).format('DD MMM YYYY') }}
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

            <div v-else class="empty-state">
                <a-empty description="No stories found matching your search" />
            </div>
        </main>

        <footer class="article-footer">
            <div class="lanna-divider"></div>
            <p>Wisdom of the north, shared with the world.</p>
        </footer>
    </div>
</template>

<style lang="scss" scoped>
@use 'sass:math';

.article-page {
    background: $color-night-blue;
    min-height: 100vh;
    color: #fff;
    padding-bottom: 60px;
}

.article-hero {
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

    .article-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(2.5rem, 8vw, 4.5rem);
        margin: 10px 0;
        .gold-text {
            color: $color-gold;
            font-style: italic;
        }
    }
}

.search-wrapper {
    max-width: 550px;
    margin: 40px auto 0;

    .lanna-search-bar {
        display: flex;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba($color-gold, 0.3);
        border-radius: 100px;
        padding: 6px;
        transition: all 0.3s ease;

        &:focus-within {
            border-color: $color-gold;
            box-shadow: 0 0 20px rgba($color-gold, 0.2);
        }

        .input-inner {
            flex: 1;
            display: flex;
            align-items: center;
            padding-left: 20px;
            .search-icon {
                color: $color-gold;
                font-size: 1.1rem;
            }
            .custom-input {
                width: 100%;
                background: transparent;
                border: none;
                padding: 10px 15px;
                color: #fff;
                outline: none;
                font-size: 1rem;
                &::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }
            }
        }

        .search-btn {
            background: $color-gold;
            color: $color-night-blue;
            border: none;
            padding: 0 30px;
            border-radius: 100px;
            font-weight: 800;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.3s ease;
            &:hover {
                background: #fff;
                transform: scale(1.05);
            }
        }
    }
}

.article-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 60px 24px;
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
            -webkit-line-clamp: 2;
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
            -webkit-line-clamp: 3;
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
                top: math.random(100) * 1%;
                left: math.random(100) * 1%;
            }
        }
    }
}

.lanna-divider-small {
    width: 100px;
    height: 2px;
    background: $color-gold;
    margin: 40px auto;
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

.article-footer {
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.9rem;
    letter-spacing: 1px;
}
</style>
