<script setup>
import {computed, onMounted, ref, toRefs} from 'vue';
import {useOptionByValue} from '@/composables/useOptionByValue.js';

const props = defineProps({
  options: { type: Array, required: false, default: () => [] },
  value: { type: String, required: false, default: '' },
  modelValue: { type: String, required: false, default: '' },
});

const emits = defineEmits([ 'update:modelValue', 'change', 'ready' ]);
const { options } = toRefs(props);
const selection = computed({
  get: () => props.value || props.modelValue,
  set: (value) => emits('update:modelValue', value),
});
const getOptionByValue = useOptionByValue(options);

const selectedItem = computed(() => getOptionByValue(selection.value));
const onOptionChange = (opt) => {
  emits('change', opt);
  selection.value = opt.value;
  isOpen.value = false;
};

const isOpen = ref(false); // select가 열린 상태 감지
const toggleDropdown = () => isOpen.value = !isOpen.value;
const closeDropdown = () => isOpen.value = false;
const selectRef = ref();
onMounted(() => {
  emits('ready', selectRef);
});
</script>
<template>
  <div
    class="base-select-container"
    v-bind="$attrs"
  >
    <div
      v-if="isOpen"
      class="container-mask"
      @click="closeDropdown()"
    ></div>
    <div class="base-select-selected" @click="toggleDropdown">
      <span>{{ selectedItem.name }}</span>
      <span class="base-select-arrow"></span>
    </div>
    <transition name="dropdown">
      <ul v-if="isOpen" class="base-select-menu">
        <li
          v-for="opt in options"
          :key="opt.value"
          @click="onOptionChange(opt)"
          class="base-select-option"
          :class="{ 'active': opt.value === selection }"
        >
          {{ opt.name }}
        </li>
      </ul>
    </transition>
  </div>
</template>
<style scoped></style>