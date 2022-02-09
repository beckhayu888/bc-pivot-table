<template>
  <div class="fixed-pivot-table-left">
    <header class="header">
      <div class="row">
        <!-- 左上角空白格 -->
        <div class="null" :style="`height: ${colKey.length * cellStyleOps.height}px`"></div>
        <div class="row-box">
          <div
            class="header-row-item"
            :style="`height: ${cellStyleOps.height}px;
            padding-left: ${cellStyleOps.paddingLeft}px;
            padding-right: ${cellStyleOps.paddingRight}px;
            width: ${leftColWidth[index]}px`"
            v-for="(item, index) in rowHeaderList"
            :key="index"
          >
            <span class="ellipsis">{{ item }}</span>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="col-box">
          <div class="header-col-item" :style="`height: ${cellStyleOps.height}px;padding-left: ${cellStyleOps.paddingLeft}px;padding-right: ${cellStyleOps.paddingRight}px`" v-for="(item, index) in colKey" :key="index">
            <span>{{ item.label }}</span>
          </div>
          <!-- 加一个空白 -->
          <div class="header-col-item" :style="`height: ${cellStyleOps.height}px;padding-left: ${cellStyleOps.paddingLeft}px;padding-right: ${cellStyleOps.paddingRight}px`"></div>
        </div>
      </div>
    </header>
    <!-- 表体 -->
    <section class="body">
      <div class="body-box" :style="`position:relative;top:${-getBodyMarginTop}px`">
        <div>
          <div class="body-row" v-for="(row, index) in mergeRowsList" :key="index" :style="`${index === mergeRowsList.length - 1 ? 'flex-grow: 1' : ''}`">
            <div
              class="body-col"
              v-show="item.height !== 0"
              :style="`height: ${item.height}px;
            padding-left: ${cellStyleOps.paddingLeft}px;
            padding-right: ${cellStyleOps.paddingRight}px;
            width: ${index === mergeRowsList.length - 1 ? '100%' : leftColWidth[index] + 'px'};
            ${!showSum && rowIndex === row.length - 1 ? 'border-bottom:none' : ''}
            `"
              v-for="(item, rowIndex) in row"
              :key="rowIndex"
            >
              <span class="ellipsis">{{ item.label }}</span>
            </div>
          </div>
        </div>
        <!-- 合计 -->
        <div class="body-row" style="border-left: none" v-if="showSum">
          <div class="sum-box" :style="`width: 100%;height: ${cellStyleOps.height}px`">
            <span v-show="canShowSum">合计</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<script lang="ts" setup>
import { computed, defineProps, ref, watch } from 'vue';
import getWebWorker from '../worker/webWorker';
import leftMerge from '../worker/mergeWorker';
let handleMerge = function () {
  let mergeRowsList = ref([] as any[][]);
  // 判断航上下两个格子是否能合并
  function colEqual(list: any[], rowIndex: number, colIndex: number) {
    const topStr = list[rowIndex - 1]
      .slice(0, colIndex + 1)
      .map((v: any) => v.label)
      .join('');
    const bottomStr = list[rowIndex]
      .slice(0, colIndex + 1)
      .map((v: any) => v.label)
      .join('');
    return topStr === bottomStr;
  }
  let mergeChange = computed(() => {
    return {
      rowBodyList: props.rowBodyList,
      indexArr: props.indexArr,
    };
  });

  watch(
    mergeChange,
    () => {
      if (props.rowBodyList.length >= props.cellStyleOps.workerAutoLimit) {
        // 开启webWorker
        const cloneList = JSON.parse(JSON.stringify(props.rowBodyList)).slice(...props.indexArr);
        const work = getWebWorker(leftMerge, [cloneList, JSON.parse(JSON.stringify(props.cellStyleOps))]);
        work.then((res: any) => {
          mergeRowsList.value = res;
        });
      } else {
        getMergeRows();
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );
  function getMergeRows() {
    const list = JSON.parse(JSON.stringify(props.rowBodyList)).slice(...props.indexArr);
    const lastList = [];
    // 合并左边表头单元格
    if (list.length > 0) {
      let colIndex = 0;
      while (colIndex < list[0].length) {
        let nowLabel = ''; // 当前的label
        let nowIndex = 0; // 当前合并起始的数组索引
        let rowIndex = 0;
        const itemList = []; // 颠倒行列
        while (rowIndex < list.length) {
          // 一列一列由上至下遍历
          const item = list[rowIndex][colIndex];
          const label = item.label;
          if (nowLabel && nowLabel === label && colEqual(list, rowIndex, colIndex)) {
            // 合并
            list[nowIndex][colIndex].height += props.cellStyleOps.height;
            item.height = 0;
          } else {
            // 无需合并
            nowLabel = label;
            nowIndex = rowIndex;
          }
          itemList.push(item);
          rowIndex++;
        }
        lastList.push(itemList);
        colIndex++;
      }
    }
    mergeRowsList.value = lastList;
  }
  return mergeRowsList;
};
const props = defineProps({
  showSum: {
    type: Boolean,
    default: true,
  },
  rowHeaderList: {
    type: Array,
    default: () => [],
  },
  rowBodyList: {
    type: Array,
    default: () => [],
  },
  leftColWidth: {
    type: Array,
    default: () => [],
  },
  colKey: {
    type: Array,
    default: () => [],
  },
  cellStyleOps: {
    type: Object,
    default: () => {
      return {};
    },
  },
  indexArr: {
    type: Array,
    default: () => [0, 0],
  },
  scrollTop: {
    type: Number,
    default: 0,
  },
});
let getBodyMarginTop = computed(() => {
  return props.scrollTop > 0 ? props.scrollTop % props.cellStyleOps.height : 0;
});
// 能否展示底部两个字、避免滚动的时候闪烁 只有滚动到最后才能展示
let canShowSum = computed(() => {
  let indexArr = props.indexArr as number[];
  return indexArr.length > 1 ? indexArr[1] >= props.rowBodyList.length : false;
});
let mergeRowsList = handleMerge();
</script>
<style lang="scss" scoped>
$common-border: 1px solid rgba(204, 204, 204, 0.5);
$common-background-color: #fff;
@mixin common-font-style {
  color: #333;
  font-weight: normal;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  white-space: nowrap;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fixed-pivot-table-left {
  border: none;
  display: flex;
  flex-direction: column;
  .header {
    display: flex;
    background-color: $common-background-color;
    position: relative;
    z-index: 2;
    .row {
      display: flex;
      flex-direction: column;
      border-right: $common-border;
      .null {
        width: 100%;
        border-bottom: $common-border;
        box-sizing: border-box;
      }
      .row-box {
        display: flex;
        .header-row-item {
          display: flex;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          @include common-font-style;
          border-bottom: $common-border;
          .icon {
            height: 16px;
            position: relative;
            top: 1px;
          }
        }
        .header-row-item:nth-child(n + 2) {
          border-left: $common-border;
        }
      }
    }
    .col {
      border-right: $common-border;
      flex: 1;
      .col-box {
        display: flex;
        flex-direction: column;
        .header-col-item {
          display: flex;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          @include common-font-style;
          border-bottom: $common-border;
          span {
            white-space: nowrap;
          }
          .icon {
            height: 16px;
            position: relative;
            top: 1px;
          }
        }
      }
    }
  }
  .body {
    border-right: $common-border;
    background-color: $common-background-color;
    .body-box {
      display: flex;
      flex-direction: column;
    }
    .body-box > div:first-child {
      display: flex;
    }
    .body-row {
      display: flex;
      flex-direction: column;
    }
    .body-col {
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      @include common-font-style;
      border-bottom: $common-border;
    }
    .body-row:nth-child(n + 2) {
      .body-col {
        border-left: $common-border;
      }
    }
    .sum-box {
      display: flex;
      justify-content: center;
      align-items: center;
      // border-bottom: $common-border;
      @include common-font-style;
    }
  }
}
</style>
