<script setup>
import {isValidValue} from '@/utils/functions/useJsUtils.js';
import {computed} from 'vue';

const props = defineProps({
  btnFirstClass: { type: String, default: undefined, required: false },
  btnPrevClass: { type: String, default: undefined, required: false },
  btnNumClass: { type: String, default: undefined, required: false },
  btnNextClass: { type: String, default: undefined, required: false },
  btnLastClass: { type: String, default: undefined, required: false },
  totalElements: {
    type: [ Number, String ],
    default: 0,
    required: true,
    validator (value) {
      return isValidValue(value) && isNaN(value) === false;
    },
  },
  size: {
    type: [ Number, String ],
    default: 25,
    required: false,
    validator (value) {
      return isValidValue(value) && isNaN(value) === false;
    },
  },
  page: {
    type: [ Number, String ],
    default: 1,
    required: true,
    validator (value) {
      return isValidValue(value) && isNaN(value) === false;
    },
  },
  pageGroupSize: {
    type: [ Number, String ],
    default: 10,
    required: false,
    validator (value) {
      return isValidValue(value) && isNaN(value) === false;
    },
  }
});
const emits = defineEmits([ 'update:page', 'change' ]);

const _parseNumber = (val) => {
  const valType = typeof val;
  if (![ 'string', 'number' ].includes(valType)) {
    throw new Error(`${val}(type: ${valType}) is not a numberLike value.`);
  }
  let res;
  if (typeof val === 'string') {
    res = Number(val);
  } else {
    res = val;
  }
  if (isNaN(res)) {
    throw new Error(`${val}is not a number.`);
  }
  return res;
};
const pageGroupSize = computed(() => _parseNumber(props.pageGroupSize))
const size = computed(() => _parseNumber(props.size));
const totalElements = computed(() => _parseNumber(props.totalElements));
const requestPage = computed({
  get: () => _parseNumber(props.page),
  set: (val) => emits('update:page', val),
});

const totalPageCount = computed(() => Math.ceil(totalElements.value / size.value));
const currentPageGroup = computed(() => Math.ceil(requestPage.value / pageGroupSize.value));
//어떤 한 페이지 그룹의 첫번째 페이지 번호 = ((페이지 그룹 - 1) * 한 화면에 보여질 페이지 개수) + 1
const firstPageNumber = computed(() => (currentPageGroup.value - 1) * pageGroupSize.value + 1);
// 어떤 한 페이지 그룹의 마지막 페이지 번호 = 페이지 그룹 * 한 화면에 보여질 페이지 개수
// (단, 페이지 그룹 * 한 화면에 보여질 페이지 개수의 값이 전체 페이지보다 크다면 전체 페이지가 마지막 페이지 번호)
const lastPageNumber = computed(() =>
  Math.min(currentPageGroup.value * pageGroupSize.value, totalPageCount.value),
);
const currentPageGroupRange = computed(() => {
  const start = firstPageNumber.value;
  const end = lastPageNumber.value;
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

// 첫번째 페이지일때 앞으로 버튼 비활성.
const disabledPrevPage = computed(() => totalPageCount.value === 0 || requestPage.value <= 1);
// 마지막페이지일 때 다음 버튼 비활성.
const disabledNextPage = computed(
  () => totalPageCount.value === 0 || requestPage.value >= totalPageCount.value,
);

const onPageChange = (pageNum) => {
  if (pageNum === requestPage.value) {
    return;
  }
  requestPage.value = pageNum;
  emits('change', pageNum);
};

const onFirstPage = () => {
  onPageChange(1);
};
const onPrevPage = () => {
  onPageChange(requestPage.value - 1);
};
const onNextPage = () => {
  onPageChange(requestPage.value + 1);
};
const onLastPage = () => {
  onPageChange(totalPageCount.value);
};
</script>
<template>
  <div v-bind="$attrs">
    <base-button
      type="button"
      class="nav-button"
      :class="btnFirstClass"
      :disabled="disabledPrevPage"
      @click="onFirstPage"
    >
      ◀◀
    </base-button>
    <base-button
      type="button"
      class="nav-button"
      :class="btnPrevClass"
      :disabled="disabledPrevPage"
      @click="onPrevPage"
    >
      ◀
    </base-button>
    <base-button
      v-for="(pageNum, index) in currentPageGroupRange"
      :key="index"
      type="button"
      class="page-num"
      :class="[btnNumClass, requestPage === pageNum && 'active']"
      @click="onPageChange(pageNum)"
    >
      {{ pageNum }}
    </base-button>
    <base-button
      type="button"
      class="nav-button"
      :class="btnNextClass"
      :disabled="disabledNextPage"
      @click="onNextPage"
    >
      ▶
    </base-button>
    <base-button
      type="button"
      class="nav-button"
      :class="btnLastClass"
      :disabled="disabledNextPage"
      @click="onLastPage"
    >
      ▶▶
    </base-button>
  </div>
</template>
<style scoped>

</style>