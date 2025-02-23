<script setup>
import {computed, onMounted, ref} from 'vue';

const props = defineProps({
  checked: { type: Boolean, required: false, default: false },
  modelValue: { type: Boolean, required: false, default: false }, // 토글 상태
  disabled: { type: Boolean, required: false, default: false },
});
const emits = defineEmits([ 'update:modelValue', 'change', 'ready' ]);

const toggle = computed({
  get: () => props.checked || props.modelValue,
  set: (value) => emits('update:modelValue', value),
});

const onSwitchToggle = (event) => {
  emits('change', event);
  toggle.value = event.target.checked;
}
const toggleRef = ref();
onMounted(() => {
  emits('ready', toggleRef);
});
</script>
<template>
  <label
    class="base-toggle"
    :class="{ 'disabled': disabled }"
  >
    <input
      ref="toggleRef"
      v-bind="$attrs"
      type="checkbox"
      class="base-toggle-input"
      :disabled="disabled"
      :checked="toggle"
      @change="onSwitchToggle"
    />
    <span class="base-toggle-slider"></span>
  </label>
</template>

<style scoped>

</style>