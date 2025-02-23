<script setup>
import {toRefs} from 'vue';
const props = defineProps({
  isLoading: { type: Boolean, required: true, default: false },
});
const { isLoading } = toRefs(props);
</script>
<template>
  <template v-if="isLoading"><base-spinner type="jump"/></template>
  <template v-else><slot></slot></template>
</template>
<style scoped>

</style>