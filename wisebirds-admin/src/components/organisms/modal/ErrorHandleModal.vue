<script setup>
import {defineProps, defineEmits} from 'vue';

const props = defineProps({
  show: { type: Boolean, required: true }, // 모달 표시 여부
  message: { type: String, required: true }, // 에러 메시지
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};
</script>
<template>
  <!-- 배경 마스크 -->
  <div
    v-show="show"
    class="error-modal-mask"
    @click.self="closeModal"
  >
    <!-- 모달 창 -->
    <div class="error-modal">
      <p class="error-message">
        {{ message }}
      </p>
      <div class="error-info">
        ❊ 고객센터<br>
        - email: <a href="mailto:helpdesk@wisebirds.ai">helpdesk@wisebirds.ai</a>
      </div>
      <div class="button-container">
        <base-button
          class="error-button"
          @click="closeModal"
        >
          확인
        </base-button>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* 배경 마스크 */
.error-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* 투명 회색 */
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 상단 정렬 */
  padding-top: 80px; /* 상단 여백 조정 */
  z-index: 1000;
}

/* 모달 스타일 */
.error-modal {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  min-width: 320px;
  max-width: 400px;
  text-align: left; /* 메시지 좌측 정렬 */
  font-size: 14px;
  z-index: 1001;
}

/* 에러 메시지 */
.error-message {
  margin-bottom: 10px;
  font-weight: bold;
  text-align: left; /* 메시지 좌측 정렬 */
  
  white-space: pre-line; /* 개행 문자(\n) 반영 */
}


/* 고객센터 안내 */
.error-info {
  font-size: 12px;
  color: #666;
  margin-bottom: 15px;
  line-height: 1.4;
  text-align: left; /* 고객센터 정보 좌측 정렬 */
}

/* 버튼 컨테이너 */
.button-container {
  display: flex;
  justify-content: flex-end; /* 버튼 우측 정렬 */
}

/* 확인 버튼 */
.error-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease-in-out;
}

.error-button:hover {
  background: #0056b3;
}
</style>
