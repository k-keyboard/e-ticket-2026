<script setup>
const mockTickets = [
  {
    // --- ข้อมูลที่เลียนแบบมาจาก Stripe API ---
    id: "prod_Tr9hadJHLQAj5T",
    name: "Yi Peng Ticket VIP 2026",
    description: "สัมผัสประสบการณ์สุดพิเศษในโซน VIP พร้อมอาหารค่ำแบบขันโตกและการปล่อยโคมลอยในจุดที่ดีที่สุด",
    images: [
      "https://files.stripe.com/links/MDB8YWNjdF8xUnhKRjVKWkRBRVlyQWhsfGZsX3Rlc3Rfdmd3NndUYUZ0RjY3OEEyUkM1MENBNnRO00gEbfT5DS"
    ],
    default_price: {
      unit_amount: 599900, // 5,999.00 THB (หน่วยสตางค์)
      currency: "thb"
    },
    
    // --- ข้อมูลที่เลียนแบบมาจาก Database ของคุณ ---
    stock_quantity: 45, // จำนวนคงเหลือที่ดึงมาจากตาราง tickets
    is_active: "active"
  },
  {
    id: "prod_Standard_001",
    name: "Standard Lantern Pass",
    description: "บัตรเข้างานโซนทั่วไป รวมโคมลอย 1 ใบ และของที่ระลึกจากงานเทศกาลยี่เป็ง",
    images: [
      "https://files.stripe.com/links/MDB8YWNjdF8xUnhKRjVKWkRBRVlyQWhsfGZsX3Rlc3Rfdmd3NndUYUZ0RjY3OEEyUkM1MENBNnRO00gEbfT5DS"
    ],
    default_price: {
      unit_amount: 159900, // 1,599.00 THB
      currency: "thb"
    },
    stock_quantity: 0, // ทดสอบกรณีของหมด (Sold Out)
    is_active: "active"
  }
]
</script>

<template>
    <div class="ticket-container">
      <h2 class="section-title">CHOOSE YOUR EXPERIENCE</h2>
      
      <div class="ticket-grid">
        <TicketCard 
          v-for="item in mockTickets" 
          :key="item.id" 
          :ticket="item" 
        />
      </div>
    </div>
  </template>
  
  <style scoped>
  .ticket-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 30px;
    padding: 20px;
  }
  .section-title {
    text-align: center;
    color: #d4af37;
    letter-spacing: 4px;
    margin-bottom: 40px;
  }
  </style>