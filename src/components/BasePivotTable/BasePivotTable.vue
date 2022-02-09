<template>
  <div class="pivot-main" :style="{ fontSize: cellStyleOps.fontSize + 'px' }">
    <section class="base-table-main" ref="base-table-main">
      <TableHeader v-bind="leftConfig" :scrollLeft="scrollLeft" :cellStyleOps="cellStyleOps" :colKey="colKey" :showSum="showSum" :rightSumWidth="rightConfig.rightSumWidth" :lastLinkTree="rightConfig.lastLinkTree"></TableHeader>
      <TableBody v-bind="{ ...leftConfig, ...rightConfig }" v-model:scrollLeft="scrollLeft" :cellStyleOps="cellStyleOps" :colKey="colKey" :showSum="showSum" :indexArr="indexArr" :scrollTop="scrollTop" :bodyLastColWidth="getBodyLastColWidth" @getListLength="getListLength"></TableBody>
    </section>
  </div>
</template>

<script lang="ts" setup>
import TableHeader from './TableHeader.vue';
import TableBody from './TableBody.vue';
import { getTextWidth } from '../getTextWidth';
import { getRightData } from '../getRightData';
import { computed, defineProps, watch, reactive, getCurrentInstance, ref, nextTick } from 'vue';
import formDataWorker from '../worker/formDataWorker.js';
import getWebWorker from '../worker/webWorker';
interface itemObj {
  label: string;
  width?: number;
  height?: number;
}
interface bodyCol {
  value: number | string;
  width: number;
}
interface treeItemObj {
  children: treeItemObj[];
  index?: number;
  label?: string;
  path?: string;
  width?: number;
  childrenWidth?: number;
}
class TreeItem implements treeItemObj {
  children: treeItemObj[];
  label?: string;
  index?: number;
  path?: string;
  width?: number;
  childrenWidth?: number;
  constructor(children: treeItemObj[] = []) {
    this.children = children;
  }
}
const _this = getCurrentInstance();
const scrollHandle = function () {
  let scrollTop = ref(0);
  let indexArr = ref([0, 0]);
  let scrollLeft = ref(0);
  const getListLength = function (top: number) {
    scrollTop.value = top;
    if (_this) {
      const parent = _this.parent?.proxy;
      if (parent && parent.$el) {
        const tableHeaderHeight = (rightConfig.lastLinkTree.length + 1) * props.cellStyleOps.height; // 表头高度
        const maxHeight = parent.$el.clientHeight || 0; // 父元素最大的高度
        let scrollIndex = 0; // 向上偏移了多少行
        let canShowLength = 0; // 最多能放多少条
        if (top > tableHeaderHeight) {
          // 全部表头滚动上去了
          scrollIndex = Math.floor((scrollTop.value - tableHeaderHeight) / props.cellStyleOps.height);
          canShowLength = Math.ceil(maxHeight / props.cellStyleOps.height);
        } else {
          // 表头还未完全滚动
          canShowLength = Math.ceil((maxHeight - (tableHeaderHeight - top)) / props.cellStyleOps.height);
        }
        indexArr.value = [scrollIndex, scrollIndex + canShowLength];
      }
    }
  };
  return {
    scrollTop,
    indexArr,
    getListLength,
    scrollLeft,
  };
};
function formatData() {
  let leftConfig = reactive({
    rowHeaderList: [] as string[],
    rowBodyList: [] as itemObj[][],
    leftColWidth: [] as number[],
  });
  let rightConfig = reactive({
    bodyDataList: [] as bodyCol[][],
    lastLinkTree: [] as treeItemObj[][],
    rightSumList: [] as number[],
    bottomSumList: [] as number[],
    rightSumWidth: 0,
  });
  if (props.dataList.length && props.colKey.length && props.rowKey.length && props.valueKey) {
    if (props.dataList.length >= props.cellStyleOps.workerAutoLimit) {
      // 开启web Worker
      const cellStyleOps = JSON.parse(JSON.stringify(props.cellStyleOps));
      const propsRowKey = JSON.parse(JSON.stringify(props.rowKey));
      const propsColKey = JSON.parse(JSON.stringify(props.colKey));
      const dataList = JSON.parse(JSON.stringify(props.dataList));
      const work = getWebWorker(formDataWorker, [cellStyleOps, propsRowKey, propsColKey, props.valueKey, dataList]);
      work.then((res: any) => {
        leftConfig.rowBodyList = res.leftConfig.rowBodyList;
        leftConfig.leftColWidth = res.leftConfig.leftColWidth;
        leftConfig.rowHeaderList = res.leftConfig.rowHeaderList;
        rightConfig.bodyDataList = res.rightConfig.bodyDataList;
        rightConfig.lastLinkTree = res.rightConfig.lastLinkTree;
        rightConfig.rightSumList = res.rightConfig.rightSumList;
        rightConfig.bottomSumList = res.rightConfig.bottomSumList;
        rightConfig.rightSumWidth = res.rightConfig.rightSumWidth;
        nextTick(() => {
          getListLength(0); // 手动计算一次展示的条数
        });
      });
    } else {
      const fontSize = props.cellStyleOps.fontSize;
      const rowLeftWidthMap = new Map();
      const rowHeaderList: string[] = [];
      const rowBodyList: itemObj[][] = [];
      const treeList: treeItemObj[] = [];
      const lastLinkTree: treeItemObj[][] = []; // 变成行式结构
      const treeDataMap: Map<string, Map<string, number | string>> = new Map(); // 创建保存值的Map
      props.dataList.forEach((item: any, index: number) => {
        // 以下是处理左边列的逻辑
        const listItem: itemObj[] = [];
        let rowKey = '';
        props.rowKey.forEach((row: any, rowIndex: number) => {
          rowKey += item[row.value];
          if (index === 0) {
            rowLeftWidthMap.set(rowIndex, []);
            rowLeftWidthMap.get(rowIndex).push(getWidth(row.label, fontSize)); // 表头当前格宽度
            rowHeaderList.push(row.label);
          }
          listItem.push({
            label: item[row.value],
            height: props.cellStyleOps.height,
          });
          rowLeftWidthMap.get(rowIndex).push(getWidth(item[row.value], fontSize)); // 表头当前格宽度
        });
        rowBodyList.push(listItem);
        // 以下是处理右边列的逻辑
        const colList: string[] = [];
        props.colKey.forEach((col: any, colIndex: number) => {
          colList.push(item[col.value]);
        });
        const colKey = colList.join('-');
        if (treeDataMap.get(colKey)) {
          const dataItem = treeDataMap.get(colKey);
          if (dataItem) dataItem.set(rowKey, item[props.valueKey as keyof typeof item]);
        } else {
          const itemMap: Map<string, number | string> = new Map();
          itemMap.set(rowKey, item[props.valueKey as keyof typeof item]);
          treeDataMap.set(colKey, itemMap);
        }
        getTrees(colList, index, treeList, lastLinkTree);
      });
      const { rightSumList, bottomSumList, rightSumWidth, bodyDataList } = getRightData(treeList, lastLinkTree, props.cellStyleOps, rowBodyList, treeDataMap);
      rightConfig = reactive({
        lastLinkTree,
        rightSumList,
        bottomSumList,
        rightSumWidth,
        bodyDataList,
      });
      const leftColWidth: number[] = []; // 左边每一列的宽度
      rowHeaderList.forEach((v, i) => {
        const listItem: number[] = rowLeftWidthMap.get(i);
        listItem.sort((a: number, b: number) => b - a); // 从小到大排序
        leftColWidth.push(Math.min(props.cellStyleOps.maxWidth, listItem[0]) + 1); // 不能超过设定的最大宽度 + 1避免误差
      });

      leftConfig = {
        rowBodyList: rowBodyList,
        leftColWidth: leftColWidth,
        rowHeaderList: rowHeaderList,
      };
      nextTick(() => {
        getListLength(0); // 手动计算一次展示的条数
      });
    }
  }
  // 生成数据树节点
  function getTrees(col: string[], index: number, treeList: treeItemObj[], lastLinkTree: treeItemObj[][]) {
    let tamp = new TreeItem();
    col.forEach((v: string, i: number) => {
      if (index === 0) lastLinkTree.push([]); // 数组初始化
      if (i === 0) {
        // 是第一个分类
        if (index === 0) {
          // 数据树里面还没有数据
          tamp = new TreeItem();
          tamp.label = v;
          tamp.index = i;
          treeList.push(tamp);
        } else {
          // 数据树里面有数据了
          const item = treeList[treeList.length - 1];
          if (item.label === v) {
            // 合并
            tamp = item;
          } else {
            // 无需合并
            tamp = new TreeItem();
            tamp.label = v;
            tamp.index = i;
            treeList.push(tamp);
          }
        }
      } else {
        // 不是第一个分类
        const finItem = tamp.children.find((f) => f.label === v);
        if (finItem) {
          // 合并
          tamp = finItem;
        } else {
          // 无需合并
          const newTamp = {
            label: v,
            children: [],
            index: i,
          };
          tamp.children.push(newTamp);
          tamp = newTamp;
        }
      }
      // 最后一个分类了
      if (i === col.length - 1) {
        tamp.path = col.join('-');
      }
    });
  }
  return {
    leftConfig,
    rightConfig,
  };
}
const props = defineProps({
  showSum: {
    type: Boolean,
    default: true,
  },
  valueKey: {
    type: String,
    value: 'value',
  },
  rowKey: {
    type: Array,
    default: () => [],
  },
  colKey: {
    type: Array,
    default: () => [],
  },
  dataList: {
    type: Array,
    default: () => [],
  },
  cellStyleOps: {
    type: Object,
    default: () => {
      return {
        paddingLeft: 6,
        paddingRight: 6,
        height: 25,
        fontSize: 12,
        maxWidth: 150,
        workerAutoLimit: 1000,
      };
    },
  },
});

// 计算宽度
function getWidth(str: string, fontSize: number) {
  return getTextWidth(str, fontSize)[0] + props.cellStyleOps.paddingLeft + props.cellStyleOps.paddingRight + 1;
}

let { leftConfig, rightConfig } = formatData();
let changeData = computed(() => {
  return {
    dataList: props.dataList,
    colKey: props.colKey,
    rowKey: props.rowKey,
    valueKey: props.valueKey,
  };
});
watch(
  changeData,
  () => {
    const result = formatData();
    leftConfig = result.leftConfig;
    rightConfig = result.rightConfig;
  },
  {
    immediate: true,
    deep: true,
  },
);
const { scrollTop, indexArr, scrollLeft, getListLength } = scrollHandle();
let getTableHeight = computed(() => {
  const tableHeaderHeight = (rightConfig.lastLinkTree.length + 1) * props.cellStyleOps.height; // 表头高度
  let rowBodyList = (leftConfig['rowBodyList' as keyof typeof leftConfig] as []) || [];
  const tableBodyHeight = (rowBodyList.length + (props.showSum ? 1 : 0)) * props.cellStyleOps.height; // 表体高度
  return tableHeaderHeight + tableBodyHeight;
});
let getBodyLastColWidth = computed(() => {
  let width = 0;
  const leftColWidth = leftConfig.leftColWidth || [];
  if (leftColWidth.length) {
    const firstWidth = leftColWidth[leftColWidth.length - 1];
    let lastWidth = 0;
    props.colKey.forEach((v) => {
      lastWidth = Math.max(lastWidth, getWidth(v.label || '', props.cellStyleOps.fontSize));
    });
    width = firstWidth + lastWidth;
  }
  return width;
});
</script>
<style lang="scss" scoped>
$common-border: 1px solid rgba(204, 204, 204, 0.5);
$common-background-color: #fff;
.pivot-main {
  display: inline-block;
  max-width: 100%;
  height: 100%;
  .base-table-main {
    display: flex;
    flex-direction: column;
    max-width: 100%;
    max-height: 100%;
    line-height: 1;
    overflow: hidden;
    cursor: default;
    border: $common-border;
    background-color: $common-background-color;
    box-sizing: border-box;
    position: relative;
    .scroll-main {
      width: 1px;
      // float: left;
      position: absolute;
    }
  }
}
.scroll-main {
  width: 0px;
  float: left;
  position: relative;
}
</style>
