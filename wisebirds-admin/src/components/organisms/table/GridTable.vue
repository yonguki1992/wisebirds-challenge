<script setup>
import {isValidValue} from '@/utils/functions/useJsUtils.js';
import PaginationBar from '@/components/molecules/PaginationBar.vue';
import {computed, onMounted, ref, toRefs} from 'vue';

const props = defineProps({
  tableConfigs: { type: Array, required: true },
  tableKeyProps: { type: String, required: true },
  isLoading: { type: Boolean, required: false, default: false },
  list: { type: Array, required: false, default: () => [] },
  pagingInfo: { type: [Object, Boolean], required: false, default: undefined },
});
const { list, isLoading, pagingInfo, tableConfigs, tableKeyProps } = toRefs(props);
const emits = defineEmits([ 'pageChange', 'ready' ]);


const getConfigByRecursively = (config, parentBind = []) => {
  if (!isValidValue(config.tableConfigs)) {
    const currBind = [...parentBind];
    if (isValidValue(config.bind)) {
      currBind.push(...(Array.isArray(config.bind) ? config.bind : [config.bind]));
    }
    return {
      ...config,
      bind: currBind,
    };
  }
  return config.tableConfigs.flatMap((tabConfig) => {
    let currBind = [...parentBind];
    if (isValidValue(config.bind)) {
      currBind.push(...(Array.isArray(config.bind) ? config.bind : [config.bind]));
    }
    return getConfigByRecursively(tabConfig, currBind);
  });
};
const getFlattenConfigs = (includeKeys) => {
  return tableConfigs.value
    .flatMap((config) => getConfigByRecursively(config))
    .filter((config) => !config.colHide)
    .map((config) => {
      const key = `${config.title}_${JSON.stringify(config.bind)}`;
      if (!isValidValue(includeKeys)) {
        return { ...config, key };
      }
      let res = {};
      includeKeys.forEach((key) => {
        if (key in config) {
          res[key] = config[key];
        }
      });
      return { ...res, key };
    });
};
const colHeaderBind = computed(() => getFlattenConfigs());

const getColsByTableConfig = (row) => {
  const configs = colHeaderBind.value;
  const cols = [];
  for (let i = 0, len = configs.length; i < len; i++) {
    const config = configs[i];
    const { bind, format, useSlot } = config;
    if (!isValidValue(bind) || useSlot) {
      // col을 slot 방식으로 사용함
      cols.push(config);
    } else {
      let value = row;
      (Array.isArray(bind) ? bind : [bind]).forEach((bindEl) => {
        if (typeof bindEl === "function") {
          value = value.find((el) => bindEl(el));
        } else {
          value = value?.[bindEl];
        }
      });
      cols.push({
        ...config,
        value: isValidValue(format) ? format(value) : value,
      });
    }
  }
  return cols;
};
const parsedList = computed(() => {
  if (!isValidValue(list.value)) {
    return [];
  }
  return list.value.map((item) => {
    return {
      [tableKeyProps.value]: item[tableKeyProps.value],
      colBinds: getColsByTableConfig(item),
    };
  });
});


const onPageChange = (page) => {
  emits('pageChange', page);
}
const tableRef = ref();
const paginationRef = ref();
onMounted(() => {
  emits('ready', { tableRef, paginationRef });
});
</script>
<template>
  <div
    ref="tableRef"
    v-bind="$attrs"
    class="table-container"
  >
    <div class="table-header">
      <div
        v-for="colHeader in colHeaderBind"
        :key="`col_header_${colHeader.key}`"
        :class="[ colHeader.headerCls, `col-${colHeader.align}` ]"
        :style="colHeader.headerStyle"
      >
        {{ colHeader.title }}
      </div>
    </div>
    <!-- 데이터 로딩중 -->
    <template v-if="isLoading">
      <div class="loading-container">
        <base-spinner type="jump" :fixed="false" />
      </div>
    </template>
    <template v-else-if="isValidValue(parsedList)">
      <div
        class="table-row"
        v-for="(row, rowIndex) in parsedList"
        :key="row[tableKeyProps]"
      >
        <div
          v-for="(col, colIndex) in row.colBinds"
          :key="`row_${col.key}`"
          :class="[ col.colCls, `col-${col.align}` ]"
          :style="col.colStyle"
        >
          <template v-if="col.useSlot">
            <slot
              :key="`col_${col.key}`"
              :name="col.name"
              :rowIndex="rowIndex"
              :conIndex="colIndex"
              :tableRow="list[rowIndex]"
              :tableCol="col"
              :events="col.events"
            >
              {{col.name}}
            </slot>
          </template>
          <template v-else>
            <a
              v-if="isValidValue(col.events)"
              href="javascript:void(0);"
              v-on="col.events"
            >
              {{ col.value }}
            </a>
            <template v-else>{{ col.value }}</template>
          </template>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="table-row">
        <div
          class="col-center"
          :style="{ gridColumn: `span ${parsedList.length}` }"
        >
          조회된 정보가 없습니다.
        </div>
      </div>
    </template>
    
    <pagination-bar
      ref="paginationRef"
      class="pagination"
      :page="pagingInfo.page"
      :total-elements="pagingInfo.totalElements"
      @change="onPageChange"
    />
  </div>
</template>
<style scoped>
/* 테이블 내부에서 크기 조절을 위한 컨테이너 */
.loading-container {
  display: inline-block; /* 부모 크기 영향 방지 */
  text-align: center;
  width: 100%;
  min-height: 40px; /* 최소 높이 확보 */
  border-bottom: 1px solid #ddd;
}

</style>