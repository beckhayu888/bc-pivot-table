<template>
  <section style="width: 500px; height: 200px; overflow: hidden">
    <FixedPivotTable v-if="fixed" :rowKey="rowKey" :colKey="colKey" :dataList="dataList" :valueKey="valueKey" :showSum="showSum" :cellStyleOps="cellStyleOps"></FixedPivotTable>
    <BasePivotTable v-else :rowKey="rowKey" :colKey="colKey" :dataList="dataList" :valueKey="valueKey" :showSum="showSum" :cellStyleOps="cellStyleOps"></BasePivotTable>
  </section>
</template>

<script lang="ts" setup>
import BasePivotTable from '@/components/BasePivotTable/BasePivotTable.vue';
import FixedPivotTable from '@/components/FixedPivotTable/FixedPivotTable.vue';
import { ref } from 'vue';
let fixed = ref(true); // 是否固定左边列
let showSum = ref(true); // 是否展示合计
// 数据
let dataList = [
  {
    rowKey1: 'rowKey1',
    rowKey2: 'rowKey2',
    colKey1: 'colKey1',
    colKey2: 'colKey2',
    valueKey: 123,
  },
  {
    rowKey1: 'rowKey1',
    rowKey2: 'rowKey2',
    colKey1: 'colKey1',
    colKey2: 'colKey22',
    valueKey: 123,
  },
  {
    rowKey1: 'rowKey11',
    rowKey2: 'rowKey22',
    colKey1: 'colKey11',
    colKey2: 'colKey22',
    valueKey: 123,
  },
];
let rowKey = ref([
  {
    label: '左边格子一',
    value: 'rowKey1',
  },
  {
    label: '左边格子二',
    value: 'rowKey2',
  },
]);
let colKey = ref([
  {
    label: '上面格子一',
    value: 'colKey1',
  },
  {
    label: '上面格子二',
    value: 'colKey2',
  },
]);
let valueKey = ref('valueKey'); //数据的值的字段
let cellStyleOps = ref({
  paddingLeft: 6,
  paddingRight: 6,
  height: 28,
  fontSize: 12,
  maxWidth: 150,
  workerAutoLimit: 3000,
});
</script>
<style lang="scss" scoped></style>
