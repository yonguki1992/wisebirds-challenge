<script setup>
import {ref} from 'vue';

const isOpen = ref(false);
const onMenuToggle = () => isOpen.value = !isOpen.value;
const closeMenu = () => isOpen.value = false;
</script>
<template>
  <div
    v-bind="$attrs"
    class="popover-container"
  >
    <div
      v-if="isOpen"
      class="container-mask"
      @click="closeMenu()"
    ></div>
    <base-button
      type="button"
      class="dropdown-btn"
      @click.stop="onMenuToggle"
    >
      <slot
        name="popover-button-label"
        :isOpen="isOpen"
      ></slot>
    </base-button>
    <transition name="bounce" mode="out-in">
      <div
        v-if="isOpen"
        class="popover-menu"
        :class="{ 'active': isOpen }"
      >
        <slot></slot>
      </div>
    </transition>
  </div>
</template>
<style scoped>

</style>