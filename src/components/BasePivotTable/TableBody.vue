<template>
  <section class="bc-base-body" @scroll="bodyScroll()" ref="body">
    <div class="scroll-main" :style="`height: ${getTableBodyHeight}px`"></div>
    <div class="left-body">
      <div class="body-box" :style="`top: ${scrollTop - getBodyMarginTop}px;position: relative`">
        <div>
          <div class="body-row" v-for="(row, index) in getMergeRows" :key="index">
            <div
              class="body-col"
              v-show="item.height !== 0"
              :style="`height: ${item.height}px;
            padding-left: ${cellStyleOps.paddingLeft}px;
            padding-right: ${cellStyleOps.paddingRight}px;
            width: ${index === getMergeRows.length - 1 ? bodyLastColWidth + 'px' : leftColWidth[index] + 'px'};
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
    </div>
    <div class="right-body">
      <div :style="`top: ${scrollTop - getBodyMarginTop}px;position: relative`">
        <div class="body-row" v-for="(row, rowIndex) in getBodyList" :key="rowIndex">
          <div
            class="body-col ellipsis"
            v-for="(col, colIndex) in row"
            :key="colIndex"
            :style="`height: ${cellStyleOps.height}px;
        padding-left: ${cellStyleOps.paddingLeft}px;
        padding-right: ${cellStyleOps.paddingRight}px;
        width: ${col.width}px;${!showSum && colIndex === row.length - 1 ? 'border-right: none;' : ''}
        ${!showSum && rowIndex === getBodyList.length - 1 ? 'border-bottom:none' : ''}`"
          >
            {{ col.value }}
          </div>
          <!-- 右边合计 -->
          <div class="body-col ellipsis" v-if="showSum" :style="`width: ${rightSumWidth}px;height: ${cellStyleOps.height}px`" style="border-right: none">
            <span>{{ getRightSumList[rowIndex] }}</span>
          </div>
        </div>
        <!-- 底部合计 -->
        <div class="body-row" v-if="showSum">
          <div class="body-col ellipsis" v-for="(sum, sumIndex) in bottomSumList" :key="sumIndex" :style="`height: ${cellStyleOps.height}px;width: ${bodyDataList[0][sumIndex].width}px`" style="border-bottom: none">
            <span>{{ sum }}</span>
          </div>
          <div class="body-col ellipsis" :style="`width: ${rightSumWidth}px;height: ${cellStyleOps.height}px;border-bottom: none;border-right: none`">
            <span>{{ getRightSumList[getRightSumList.length - 1] }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineProps, getCurrentInstance, ref, watch } from 'vue';
import getWebWorker from '../worker/webWorker';
import leftMerge from '../worker/mergeWorker';
</script>
<script lang="ts" setup>
const _this = getCurrentInstance();
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
  bottomSumList: {
    type: Array,
    default: () => [],
  },
  rightSumList: {
    type: Array,
    default: () => [],
  },
  rightSumWidth: {
    type: Number,
    default: 0,
  },
  bodyDataList: {
    type: Array,
    default: () => [],
  },
  bodyLastColWidth: {
    type: Number,
    default: 0,
  },
  scrollLeft: {
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
let getMergeRows = handleMerge();
const getBodyList = computed(() => {
  return props.bodyDataList.slice(...(props.indexArr as number[]));
});
const getRightSumList = computed(() => {
  return props.rightSumList.slice(...(props.indexArr as number[]));
});
const getTableBodyHeight = computed(() => {
  return (props.bodyDataList.length + (props.showSum ? 1 : 0)) * props.cellStyleOps.height;
});
function bodyScroll() {
  if (_this) {
    const body = _this.refs.body as HTMLFormElement;
    if (_this.props.scrollTop !== body.scrollTop) _this.emit('getListLength', body.scrollTop); // 重新计算该展示的条数
    _this.emit('update:scrollLeft', body.scrollLeft); // 联动头部滚动
  }
}
</script>

<style lang="scss" scoped>
$common-border: 1px solid rgba(204, 204, 204, 0.5);
$common-background-color: #fff;
@mixin common-font-style {
  color: #333;
  font-weight: normal;
}
.bc-base-body {
  display: flex;
  overflow: auto;
  .scroll-main {
    width: 0px;
    float: left;
  }
  .left-body {
    background-color: $common-background-color;
    flex-shrink: 0;

    .body-box {
      display: flex;
      flex-direction: column;
      border-right: $common-border;
    }
    .body-box > div:first-child {
      display: flex;
    }
    .body-row {
      display: flex;
      flex-direction: column;
    }
    // .body-row:nth-child(2n - 1) { // 斑马格
    //   background-color: #fff;
    // }
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
  .right-body {
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
    .body-row {
      display: flex;
      .body-col {
        background-color: $common-background-color;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
        box-sizing: border-box;
        @include common-font-style;
        border-right: $common-border;
        border-bottom: $common-border;
      }
    }
  }
}
</style>
