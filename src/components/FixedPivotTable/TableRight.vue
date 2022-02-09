<template>
  <div class="fixed-pivot-table-right" ref="fixed-main">
    <!-- 表头 -->
    <header class="header" :style="`margin-left: ${-scrollLeft}px`">
      <div>
        <div class="header-row" v-for="(row, rowIndex) in lastLinkTree" :key="rowIndex">
          <div
            class="header-col ellipsis"
            v-for="(col, colIndex) in row"
            :key="colIndex"
            :style="`height: ${rowIndex === lastLinkTree.length - 1 ? cellStyleOps.height * 2 : cellStyleOps.height}px;
        padding-left: ${cellStyleOps.paddingLeft}px;
        padding-right: ${cellStyleOps.paddingRight}px;
        width: ${col.width}px;${!showSum && colIndex === row.length - 1 ? 'border-right: none' : ''}`"
          >
            {{ col.label }}
          </div>
        </div>
      </div>
      <div class="sum-box" v-if="showSum" :style="`width: ${rightSumWidth}px;height: ${(lastLinkTree.length + 1) * cellStyleOps.height}px`">
        <span>合计</span>
      </div>
    </header>
    <!-- 表体 -->
    <section class="body" @scroll="bodyScroll" ref="rightTableBody">
      <div class="scroll-main" :style="`height: ${getTableBodyHeight}px`"></div>
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
    </section>
  </div>
</template>
<script lang="ts" setup>
import { computed, defineProps, getCurrentInstance, ref } from 'vue';
const props = defineProps({
  showSum: {
    type: Boolean,
    default: true,
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
  lastLinkTree: {
    type: Array,
    default: () => [],
  },
  cellStyleOps: {
    type: Object,
    default: () => {
      return {};
    },
  },
  scrollTop: {
    type: Number,
    default: 0,
  },
  indexArr: {
    type: Array,
    default: () => [0, 0],
  },
});
const _this = getCurrentInstance();
const scrollLeft = ref(0);
const getBodyMarginTop = computed(() => {
  return props.scrollTop > 0 ? props.scrollTop % props.cellStyleOps.height : 0;
});
const getBodyList = computed(() => {
  return props.bodyDataList.slice(...(props.indexArr as number[]));
});
const getRightSumList = computed(() => {
  return props.rightSumList.slice(...(props.indexArr as number[]));
});
function bodyScroll() {
  if (_this) {
    const rightTableBody = _this.refs.rightTableBody as HTMLFormElement;
    scrollLeft.value = rightTableBody.scrollLeft;
    if (props.scrollTop !== rightTableBody.scrollTop) _this.emit('getListLength', rightTableBody.scrollTop); // 重新计算该展示的条数
  }
}
const getTableBodyHeight = computed(() => {
  return (props.bodyDataList.length + (props.showSum ? 1 : 0)) * props.cellStyleOps.height;
});
</script>
<style lang="scss" scoped>
$common-border: 1px solid rgba(204, 204, 204, 0.5);
$common-base-background-color: #fff;
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
.fixed-pivot-table-right {
  border: none;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  overflow-x: hidden;
  position: relative;
  .header {
    display: flex;
    flex-wrap: nowrap;
    position: relative;
    z-index: 2;
    .header-row {
      background-color: $common-base-background-color;
      display: flex;
      .header-col {
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        @include common-font-style;
        border-right: $common-border;
        border-bottom: $common-border;
      }
    }
  }
  .body {
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-y: auto;
    overflow-x: auto;
    z-index: 1;
    .scroll-main {
      width: 1px;
      // float: left;
      position: absolute;
    }
    .body-row {
      display: flex;
      .body-col {
        background-color: $common-base-background-color;
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
  .sum-box {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background-color: $common-base-background-color;
    box-sizing: border-box;
    span {
      white-space: nowrap;
    }
    @include common-font-style;
    border-bottom: $common-border;
  }
}
</style>
