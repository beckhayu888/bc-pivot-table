<template>
  <header class="bc-base-header" :style="{ marginLeft: -scrollLeft + 'px' }">
    <div class="left-header">
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
    </div>
    <div class="right-header">
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
    </div>
  </header>
</template>
<script lang="ts" setup>
import { defineProps } from 'vue';
const props = defineProps({
  rightSumWidth: {
    type: Number,
    default: 0,
  },
  lastLinkTree: {
    type: Array,
    default: () => [],
  },
  rowHeaderList: {
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
  showSum: {
    type: Boolean,
    default: true,
  },
  scrollLeft: {
    type: Number,
    default: 0,
  },
});
</script>
<style lang="scss" scoped>
$common-border: 1px solid rgba(204, 204, 204, 0.5);
$common-background-color: #fff;
@mixin common-font-style {
  color: #333;
  font-weight: normal;
}
.bc-base-header {
  display: flex;
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
  .left-header {
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
  .right-header {
    display: flex;
    flex-wrap: nowrap;
    position: relative;
    z-index: 2;
    .header-row {
      background-color: $common-background-color;
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
  .sum-box {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background-color: $common-background-color;
    box-sizing: border-box;
    span {
      white-space: nowrap;
    }
    @include common-font-style;
    border-bottom: $common-border;
  }
}
</style>
