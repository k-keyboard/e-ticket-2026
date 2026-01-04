<script setup>
defineProps(['title'])
</script>

<template>
    <a-card :title="title">
        <template #extra><a href="#">รายละเอียด</a></template>
        <p>ราคา: 500 บาท</p>
        <a-button type="primary">จองตอนนี้</a-button>
    </a-card>
</template>
