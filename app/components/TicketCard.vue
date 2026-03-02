<script setup>
import { ShoppingCartOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  ticket: {
    type: Object,
    required: true
  }
})

// ฟังก์ชันแปลงราคาจาก Stripe (สตางค์ -> บาท)
const formatPrice = (amount) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount / 100)
}
</script>

<template>
  <div class="yi-peng-ticket">
    <div class="ticket-visual">
      <img :src="ticket.images[0]" :alt="ticket.name" class="ticket-image" />
      <div class="lantern-overlay"></div>
      <div class="status-badge" :class="{ 'out-of-stock': ticket.stock_quantity <= 0 }">
        {{ ticket.stock_quantity > 0 ? 'AVAILABLE' : 'SOLD OUT' }}
      </div>
    </div>

    <div class="ticket-body">
      <div class="lanna-pattern-top"></div>
      
      <div class="content-header">
        <h3 class="ticket-name">{{ ticket.name }}</h3>
        <p class="ticket-desc">{{ ticket.description }}</p>
      </div>

      <div class="ticket-info-grid">
        <div class="info-item">
          <span class="label">PRICE</span>
          <span class="value gold-text">{{ formatPrice(ticket.default_price.unit_amount) }}</span>
        </div>
        <div class="info-item text-right">
          <span class="label">REMAINING</span>
          <span class="value">{{ ticket.stock_quantity }} <span>slots</span></span>
        </div>
      </div>

      <div class="ticket-actions">
        <a-button class="btn-details" ghost>
          <InfoCircleOutlined /> DETAILS
        </a-button>
        <a-button 
          type="primary" 
          class="btn-buy" 
          :disabled="ticket.stock_quantity <= 0"
        >
          <ShoppingCartOutlined /> BOOK NOW
        </a-button>
      </div>
      
      <div class="lanna-pattern-bottom"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$gold: #d4af37;
$night: #020617;

.yi-peng-ticket {
  background: $slate;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba($gold, 0.2);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  max-width: 380px;

  &:hover {
    transform: translateY(-10px);
    border-color: $gold;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba($gold, 0.15);
  }

  .ticket-visual {
    height: 220px;
    position: relative;
    overflow: hidden;

    .ticket-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }

    .lantern-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 40%, $slate 100%);
    }

    .status-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      padding: 6px 14px;
      background: rgba(0, 200, 83, 0.9);
      color: #fff;
      border-radius: 50px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      backdrop-filter: blur(4px);

      &.out-of-stock {
        background: rgba(255, 82, 82, 0.9);
      }
    }
  }

  .ticket-body {
    padding: 24px;
    position: relative;
    
    // ลายเส้นล้านนาประยุกต์
    .lanna-pattern-top, .lanna-pattern-bottom {
      height: 4px;
      background-image: radial-gradient($gold 1px, transparent 1px);
      background-size: 10px 10px;
      opacity: 0.3;
      margin: 10px 0;
    }

    .ticket-name {
      color: #fff;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }

    .ticket-desc {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.9rem;
      line-height: 1.5;
      height: 45px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 20px;
    }

    .ticket-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      margin-bottom: 24px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      border: 1px inset rgba(255, 255, 255, 0.05);

      .info-item {
        display: flex;
        flex-direction: column;
        
        .label {
          font-size: 10px;
          color: $gold;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 4px;
        }
        .value {
          color: #fff;
          font-size: 1.2rem;
          font-weight: 700;
          
          span { font-size: 0.8rem; font-weight: 400; opacity: 0.6; }
        }
        .gold-text { color: $gold; }
      }
    }

    .ticket-actions {
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: 12px;

      .btn-details {
        border-color: rgba($gold, 0.5);
        color: $gold;
        height: 45px;
        border-radius: 12px;
        &:hover { border-color: $gold; color: #fff; background: rgba($gold, 0.1); }
      }

      .btn-buy {
        height: 45px;
        background: $gold;
        border: none;
        color: $night;
        font-weight: 800;
        border-radius: 12px;
        &:hover { background: #fff !important; color: $gold !important; transform: scale(1.02); }
      }
    }
  }

  &:hover .ticket-image {
    transform: scale(1.1);
  }
}
</style>