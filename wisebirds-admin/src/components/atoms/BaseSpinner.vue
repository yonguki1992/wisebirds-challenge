<script setup>
import {computed} from 'vue';

const props = defineProps({
  // 기본 원형 스피너
  type: { type: [ String, () => 'circle', () => 'bar', () => 'dots', () => 'jump' ], required: false, default: 'circle' },
  size: { type: Number, required: false, default: 40 }, // 크기 설정
  color: { type: String, required: false, default: '#3498db' }, // 색상 설정
  fixed: { type: Boolean, required: false, default: true }, // 페이지 중앙 고정 여부 (기본값: true)
  mask: { type: Boolean, required: false, default: false }, // 배경 마스크 표시 여부
});

const spinnerClass = computed(() => `base-spinner-${props.type}`);
</script>
<template>
  <div
    class="base-spinner-wrapper"
    :class="{ 'fixed': fixed }"
  >
    <!-- 마스크 (배경) -->
    <div
      v-if="mask && fixed"
      class="base-spinner-mask"
    ></div>
    <div
      class="base-spinner"
      :class="spinnerClass"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <!-- 점, 바, 점프 스타일 등 추가 -->
      <template v-if="['jump', 'dots'].includes(type)">
        <div
          v-for="i in 3"
          :key="i"
        />
      </template>
    </div>
  </div>
</template>
<style scoped>
/* ✅ 테이블 내부 스피너 컨테이너 */
.table-spinner-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 40px;
}

/* ✅ 테이블 전용 스피너 */
.table-spinner-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  overflow: hidden;
}

.base-spinner-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1001;
}
/* 기본적으로 inline-block */
.base-spinner-wrapper {
  display: inline-block;
  width: auto;
  height: auto;
  max-width: 40px;
  max-height: 40px;
  text-align: center;
}

/* 페이지 중앙에 고정되는 경우 */
.base-spinner-wrapper.fixed {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

/* 스피너 자체 크기 제한 */
.base-spinner {
  width: inherit;
  height: inherit;
  max-width: inherit;
  max-height: inherit;
}

/* 점프하는 점 */
.base-spinner-jump {
  display: flex;
  justify-content: center;
  align-items: center;
}

.base-spinner-jump div {
  width: 6px;
  height: 6px;
  background: v-bind(color);
  border-radius: 50%;
  margin: 0 2px;
  animation: jump 1.4s infinite ease-in-out;
}

.base-spinner-jump div:nth-child(2) { animation-delay: 0.2s; }
.base-spinner-jump div:nth-child(3) { animation-delay: 0.4s; }

@keyframes jump {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}

/* 기본 원형 스피너 */
.base-spinner-circle {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid v-bind(color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 점이 순차적으로 사라지는 애니메이션 */
.base-spinner-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.base-spinner-dots div {
  width: 10px;
  height: 10px;
  background: v-bind(color);
  border-radius: 50%;
  animation: dot-bounce 1.5s infinite ease-in-out;
}

.base-spinner-dots div:nth-child(2) { animation-delay: 0.2s; }
.base-spinner-dots div:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
}

/* 바 형태 로딩 */
.base-spinner-bar {
  width: 50px;
  height: 4px;
  background: linear-gradient(to right, v-bind(color), transparent);
  animation: loading-bar 1.5s infinite linear;
}

@keyframes loading-bar {
  0% { transform: translateX(-50px); }
  100% { transform: translateX(50px); }
}
</style>