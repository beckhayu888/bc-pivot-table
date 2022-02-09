import { getTextWidth } from './getTextWidth';
interface treeItemObj {
  children: treeItemObj[];
  index?: number;
  label?: string;
  path?: string;
  width?: number;
  childrenWidth?: number;
}
interface bodyCol {
  value: number | string;
  width: number;
}
interface itemObj {
  label: string;
  width?: number;
  height?: number;
}
// 计算每一个格子的宽度
function getWidth(treeList: treeItemObj[], lastLinkTree: treeItemObj[][], cellStyleOps: any) {
  treeList.forEach((v) => {
    if (v.children && v.children.length > 0) {
      getWidth(v.children, lastLinkTree, cellStyleOps);
    }
    const width = getTextWidth(v.label || '', cellStyleOps.fontSize)[0] + cellStyleOps.paddingLeft + cellStyleOps.paddingRight;
    let childMax = 0;
    v.children.forEach((f) => {
      childMax = Math.max(childMax, f.width || 0);
    });
    v.width = Math.max(width, childMax * v.children.length);
    v.childrenWidth = v.width / v.children.length;
    if (v.index !== undefined) {
      if (lastLinkTree.length - 1 < v.index) {
        lastLinkTree.push([v]);
      } else {
        lastLinkTree[v.index].push(v);
      }
    }
  });
}
// 设置子格子宽度，使格子对齐
function setChildrenWidth(treeList: treeItemObj[], width = 0) {
  treeList.forEach((v: treeItemObj) => {
    if (width && width > 0) v.width = width;
    v.childrenWidth = Math.max((v.width || 0) / v.children.length, v.childrenWidth || 0);
    if (v.children && v.children.length > 0) {
      setChildrenWidth(v.children, v.childrenWidth);
    }
  });
}
// 获取body数据
function getBodyDataList(lastLinkTree: treeItemObj[][], rowBodyList: itemObj[][], treeDataMap: Map<string, Map<string, number | string>>) {
  const list: bodyCol[][] = [];
  if (rowBodyList.length > 0 && lastLinkTree.length > 0) {
    const lastHeaderLine = lastLinkTree[lastLinkTree.length - 1]; // 表头最后一行
    rowBodyList.forEach((v) => {
      const row: bodyCol[] = []; // 一行数据
      const rowKey = v.map((v) => v.label).join('');
      // 列数据
      lastHeaderLine.forEach((col) => {
        let value: number | string = '';
        const itemMap = treeDataMap.get(col.path as string);
        if (itemMap) {
          if (itemMap.get(rowKey as string)) value = itemMap.get(rowKey as string) || '';
        }
        row.push({
          value: value,
          width: col.width || 0,
        });
      });
      list.push(row);
    });
  }
  return list;
}
// 格式化值
function formatNumber(value: number): number {
  const digit = 2; // 保留两位数字
  if (value && typeof value === 'number') {
    const str = value.toString();
    const arr = str.split('.');
    // 判断是否是小数
    if (arr.length > 1) {
      value = parseFloat(value.toFixed(digit));
    }
  }
  return value;
}
// 获取右边合计和下边合计
function getSumList(lastLinkTree: treeItemObj[][], bodyDataList: bodyCol[][], cellStyleOps: any) {
  const rightSumList: number[] = [];
  const bottomSumList: number[] = [];
  let lastMaxRightSum = 0; // 合计栏最后格子的合计
  let maxRightSum = 0; // 右边合计最长数字
  if (lastLinkTree.length > 0) {
    // 获取右边合计
    bodyDataList.forEach((row) => {
      let sum = 0;
      row.forEach((col) => {
        const value = col.value && !isNaN(col.value as number) ? parseFloat(col.value as string) : 0;
        sum += value;
      });
      // 寻找最长的数字（并非最大）
      if (maxRightSum.toString().length < sum.toString().length) maxRightSum = sum;
      rightSumList.push(formatNumber(sum));
      lastMaxRightSum += sum;
    });
    if (maxRightSum.toString().length < lastMaxRightSum.toString().length) maxRightSum = lastMaxRightSum;
    rightSumList.push(formatNumber(lastMaxRightSum));
    const lastHeaderLine = lastLinkTree[lastLinkTree.length - 1]; // 表头最后一行
    let colIndex = 0;
    while (colIndex < lastHeaderLine.length) {
      let sum = 0;
      let rowIndex = 0;
      while (rowIndex < bodyDataList.length) {
        const tampValue = bodyDataList[rowIndex][colIndex].value;
        const value = tampValue && !isNaN(tampValue as number) ? parseFloat(tampValue as string) : 0;
        sum += value as number;
        rowIndex++;
      }
      bottomSumList.push(formatNumber(sum));
      colIndex++;
    }
  }
  const rightSumWidth = getSumWidth(maxRightSum, bottomSumList, lastLinkTree, bodyDataList, cellStyleOps); // 计算合计的单元格宽度
  return {
    rightSumList,
    bottomSumList,
    rightSumWidth,
  };
}

function getSumWidth(maxRightSum: number, bottomSumList: number[], lastLinkTree: treeItemObj[][], bodyDataList: bodyCol[][], cellStyleOps: any) {
  const fontSize = cellStyleOps.fontSize;
  const headerWidth = getTextWidth('合计', fontSize)[0] + cellStyleOps.paddingLeft + cellStyleOps.paddingRight;
  const maxRightWidth = getTextWidth(maxRightSum.toString(), fontSize)[0] + cellStyleOps.paddingLeft + cellStyleOps.paddingRight;
  const lastHeaderLine = lastLinkTree[lastLinkTree.length - 1]; // 表头最后一行
  bottomSumList.forEach((v, i) => {
    const width = getTextWidth(v.toString(), fontSize)[0] + cellStyleOps.paddingLeft + cellStyleOps.paddingRight;
    if (width > (lastHeaderLine[i].width || 0)) {
      // 格子大了，要更新这一列的格子
      lastLinkTree.forEach((item) => {
        item[i].width = width;
      });
      bodyDataList.forEach((item) => {
        item[i].width = width;
      });
    }
  });
  return Math.min(Math.max(headerWidth, maxRightWidth), cellStyleOps.maxWidth);
}
function getRightData(treeList: treeItemObj[], lastLinkTree: treeItemObj[][], cellStyleOps: any, rowBodyList: itemObj[][], treeDataMap: Map<string, Map<string, number | string>>) {
  getWidth(treeList, lastLinkTree, cellStyleOps);
  setChildrenWidth(treeList);
  const bodyDataList = getBodyDataList(lastLinkTree, rowBodyList, treeDataMap); // 获取表体数据
  const sumResult = getSumList(lastLinkTree, bodyDataList, cellStyleOps);
  return {
    bodyDataList,
    ...sumResult,
  };
}
export { getRightData };
