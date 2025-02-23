<script setup>
import {computed, onMounted, ref} from 'vue';

const props = defineProps({
  value: { type: String, required: false, default: '' },
  modelValue: { type: String, required: false, default: '' },
});
const emits = defineEmits([ 'update:modelValue', 'input', 'ready' ]);

const inputValue = computed({
  get: () => props.value || props.modelValue,
  set: (val) => emits('update:modelValue', val),
});

const onInput = (event) => {
  emits('input', event);
  inputValue.value = event.target.value;
};

const inputRef = ref();
onMounted(() => {
  emits('ready', inputRef);
});
</script>
<template>
  <input
    ref="inputRef"
    v-bind="$attrs"
    :value="inputValue"
    @input="onInput"
  >
</template>
<style scoped>

</style>