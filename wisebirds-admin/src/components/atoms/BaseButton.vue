<script setup>
import {onMounted, ref, toRefs} from 'vue';

const props = defineProps({
  type: { type: [ () => 'submit', () => 'button', () => 'reset' ], required: false, default: 'submit' },
});
const { type } = toRefs(props);

const emits = defineEmits([
  'click',
]);

const onBtnClick = (evt) => {
  emits('click', evt);
};

const buttonRef = ref();
onMounted(() => {
  emits('ready', buttonRef);
});
</script>
<template>
  <button
    ref="buttonRef"
    :type
    class="base-button"
    v-bind="$attrs"
    @click="onBtnClick"
  >
    <slot></slot>
  </button>
</template>
<style scoped></style>