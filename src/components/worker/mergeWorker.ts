function leftMerge(list: any[][], cellStyleOps: any) {
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
          list[nowIndex][colIndex].height += cellStyleOps.height;
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
  return lastList;
}

export default leftMerge;
