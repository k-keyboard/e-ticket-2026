<script setup>
// ดึงข้อมูลสินค้าจาก API ที่เราสร้างไว้ใน server/api/products.get.ts
const { data: products, pending, error } = await useFetch('/api/stripe/products')

const formatPrice = (priceObj) => {
    if (!priceObj) return 'N/A'
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: priceObj.currency.toUpperCase(),
    }).format(priceObj.unit_amount / 100)
}
</script>

<template>
    <div style="padding: 24px">
        <a-typography-title>ตั๋วที่เปิดขาย (Stripe Products)</a-typography-title>

        <div v-if="pending" style="text-align: center; padding: 50px">
            <a-spin size="large" />
        </div>

        <a-alert v-else-if="error" type="error" message="เกิดข้อผิดพลาดในการดึงข้อมูล" show-icon />

        <a-row v-else :gutter="[16, 16]">
            <a-col v-for="product in products" :key="product.id" :xs="24" :sm="12" :md="8">
                <a-card hoverable>
                    <template #cover>
                        <img
                            :src="product.images[0] || 'https://via.placeholder.com/300'"
                            style="height: 200px; object-fit: cover"
                        />
                    </template>

                    <a-card-meta :title="product.name">
                        <template #description>
                            {{ product.description }}
                            <div style="margin-top: 10px; color: #1890ff; font-weight: bold; font-size: 1.2rem">
                                {{ formatPrice(product.default_price) }}
                            </div>
                        </template>
                    </a-card-meta>

                    <template #actions>
                        <a-button type="primary" block>ซื้อตั๋ว</a-button>
                    </template>
                </a-card>
            </a-col>
        </a-row>
    </div>
</template>
