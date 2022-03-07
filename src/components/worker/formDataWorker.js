export default function (cellStyleOps, propsRowKey, propsColKey, valueKey, dataList) {
  //以下是getTextWidth的逻辑内容
  const wordWidth = {
    ' ': 0.3329986572265625,
    a: 0.5589996337890625,
    A: 0.6569992065429687,
    b: 0.58599853515625,
    B: 0.6769989013671875,
    c: 0.5469985961914062,
    C: 0.7279998779296875,
    d: 0.58599853515625,
    D: 0.705999755859375,
    e: 0.554998779296875,
    E: 0.63699951171875,
    f: 0.37299957275390627,
    F: 0.5769989013671875,
    g: 0.5909988403320312,
    G: 0.7479995727539063,
    h: 0.555999755859375,
    H: 0.7199996948242188,
    i: 0.255999755859375,
    I: 0.23699951171875,
    j: 0.26699981689453123,
    J: 0.5169998168945312,
    k: 0.5289993286132812,
    K: 0.6899993896484375,
    l: 0.23499908447265624,
    L: 0.5879989624023437,
    m: 0.854998779296875,
    M: 0.8819992065429687,
    n: 0.5589996337890625,
    N: 0.7189987182617188,
    o: 0.58599853515625,
    O: 0.7669998168945312,
    p: 0.58599853515625,
    P: 0.6419998168945312,
    q: 0.58599853515625,
    Q: 0.7669998168945312,
    r: 0.3649993896484375,
    R: 0.6759994506835938,
    s: 0.504998779296875,
    S: 0.6319992065429687,
    t: 0.354998779296875,
    T: 0.6189987182617187,
    u: 0.5599990844726562,
    U: 0.7139999389648437,
    v: 0.48199920654296874,
    V: 0.6389999389648438,
    w: 0.754998779296875,
    W: 0.929998779296875,
    x: 0.5089996337890625,
    X: 0.63699951171875,
    y: 0.4959991455078125,
    Y: 0.66199951171875,
    z: 0.48699951171875,
    Z: 0.6239990234375,
    0: 0.6,
    1: 0.40099945068359377,
    2: 0.6,
    3: 0.6,
    4: 0.6,
    5: 0.6,
    6: 0.6,
    7: 0.5469985961914062,
    8: 0.6,
    9: 0.6,
    '[': 0.3329986572265625,
    ']': 0.3329986572265625,
    ',': 0.26399993896484375,
    '.': 0.26399993896484375,
    ';': 0.26399993896484375,
    ':': 0.26399993896484375,
    '{': 0.3329986572265625,
    '}': 0.3329986572265625,
    '\\': 0.5,
    '|': 0.19499969482421875,
    '=': 0.604998779296875,
    '+': 0.604998779296875,
    '-': 0.604998779296875,
    _: 0.5,
    '`': 0.3329986572265625,
    ' ~': 0.8329986572265625,
    '!': 0.3329986572265625,
    '@': 0.8579986572265625,
    '#': 0.6,
    $: 0.6,
    '%': 0.9699996948242188,
    '^': 0.517999267578125,
    '&': 0.7259994506835937,
    '*': 0.505999755859375,
    '(': 0.3329986572265625,
    ')': 0.3329986572265625,
    '<': 0.604998779296875,
    '>': 0.604998779296875,
    '/': 0.5,
    '?': 0.53699951171875,
  };
  function getEnglishWidth(letter, fontSize) {
    return fontSize * (wordWidth[letter] || 1);
  }
  function getTextWidth(text, fontSize) {
    let width = 0;
    const pattern = new RegExp('[\u4E00-\u9FA5]+');
    text &&
      text
        .toString()
        .split('')
        .forEach(function (letter) {
          if (pattern.test(letter)) {
            width += fontSize;
          } else {
            width += getEnglishWidth(letter, fontSize);
          }
        });
    width = Math.ceil(width);
    return [width, fontSize];
  }
  // 计算宽度
  function getLastWidth(str, fontSize, cellStyleOps) {
    return getTextWidth(str, fontSize)[0] + cellStyleOps.paddingLeft + cellStyleOps.paddingRight + 1;
  }
  //以下是getRightData的逻辑内容
  // 计算每一个格子的宽度
  function getWidth(treeList, lastLinkTree, cellStyleOps) {
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
  function setChildrenWidth(treeList, width = 0) {
    treeList.forEach((v) => {
      if (width && width > 0) v.width = width;
      v.childrenWidth = Math.max((v.width || 0) / v.children.length, v.childrenWidth || 0);
      if (v.children && v.children.length > 0) {
        setChildrenWidth(v.children, v.childrenWidth);
      }
    });
  }
  // 获取body数据
  function getBodyDataList(lastLinkTree, rowBodyList, treeDataMap) {
    const list = [];
    if (rowBodyList.length > 0 && lastLinkTree.length > 0) {
      const lastHeaderLine = lastLinkTree[lastLinkTree.length - 1]; // 表头最后一行
      rowBodyList.forEach((v) => {
        const row = []; // 一行数据
        const rowKey = v.map((v) => v.label).join('');
        // 列数据
        lastHeaderLine.forEach((col) => {
          let value = '';
          const itemMap = treeDataMap[col.path];
          if (itemMap) {
            if (itemMap[rowKey]) value = itemMap[rowKey] || '';
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
  function formatNumber(value) {
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
  function getSumList(lastLinkTree, bodyDataList, cellStyleOps) {
    const rightSumList = [];
    const bottomSumList = [];
    let lastMaxRightSum = 0; // 合计栏最后格子的合计
    let maxRightSum = 0; // 右边合计最长数字
    if (lastLinkTree.length > 0) {
      // 获取右边合计
      bodyDataList.forEach((row) => {
        let sum = 0;
        row.forEach((col) => {
          const value = col.value && !isNaN(col.value) ? parseFloat(col.value) : 0;
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
          const value = tampValue && !isNaN(tampValue) ? parseFloat(tampValue) : 0;
          sum += value;
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

  function getSumWidth(maxRightSum, bottomSumList, lastLinkTree, bodyDataList, cellStyleOps) {
    const fontSize = cellStyleOps.fontSize;
    const headerWidth = getTextWidth('合计', fontSize)[0] + cellStyleOps.paddingLeft + cellStyleOps.paddingRight;
    const maxRightWidth = getTextWidth(maxRightSum.toString(), fontSize)[0] + cellStyleOps.paddingLeft + cellStyleOps.paddingRight;
    const lastHeaderLine = lastLinkTree[lastLinkTree.length - 1]; // 表头最后一行
    bottomSumList.forEach((v, i) => {
      const width = getTextWidth(v.toString(), fontSize)[0] + cellStyleOps.paddingLeft + cellStyleOps.paddingRight;
      if (width > (lastHeaderLine[i].width || 0)) {
        // 格子大了，要更新这一列的格子
        lastHeaderLine[i].width = width
        bodyDataList.forEach((item) => {
          item[i].width = width;
        });
      }
    });
    updateLastLinkTree(lastLinkTree[0]) // 最后再次更新表头单元格宽度
    return Math.min(Math.max(headerWidth, maxRightWidth), cellStyleOps.maxWidth);
  }
  function updateLastLinkTree (lastLinkTree) {
    let sumWidth = 0
    lastLinkTree.forEach(v => {
      if (Array.isArray(v.children) && v.children.length > 0) {
        v.width = Math.max(v.width, updateLastLinkTree(v.children))
      }
      sumWidth += v.width
    })
    return sumWidth
  }
  function getRightData(treeList, lastLinkTree, cellStyleOps, rowBodyList, treeDataMap) {
    getWidth(treeList, lastLinkTree, cellStyleOps);
    setChildrenWidth(treeList);
    const bodyDataList = getBodyDataList(lastLinkTree, rowBodyList, treeDataMap); // 获取表体数据
    const sumResult = getSumList(lastLinkTree, bodyDataList, cellStyleOps);
    return Object.assign({ bodyDataList }, sumResult);
  }
  // 生成数据树节点
  function getTrees(col, index, treeList, lastLinkTree) {
    let tamp = {
      children: [],
    };
    col.forEach((v, i) => {
      if (index === 0) lastLinkTree.push([]); // 数组初始化
      if (i === 0) {
        // 是第一个分类
        if (index === 0) {
          // 数据树里面还没有数据
          tamp = {
            children: [],
          };
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
            tamp = {
              children: [],
            };
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
  // 以下是主逻辑 main
  const fontSize = cellStyleOps.fontSize;
  const rowLeftWidthMap = {};
  const rowHeaderList = [];
  const rowBodyList = [];
  const treeList = [];
  const lastLinkTree = []; // 变成行式结构
  const treeDataMap = {}; // 创建保存值的Map
  dataList.forEach((item, index) => {
    // 以下是处理左边列的逻辑
    const listItem = [];
    let rowKey = '';
    propsRowKey.forEach((row, rowIndex) => {
      rowKey += item[row.value];
      if (index === 0) {
        rowLeftWidthMap[rowIndex] = [];
        rowLeftWidthMap[rowIndex].push(getLastWidth(row.label, fontSize, cellStyleOps)); // 表头当前格宽度
        rowHeaderList.push(row.label);
      }
      listItem.push({
        label: item[row.value],
        height: cellStyleOps.height,
      });
      rowLeftWidthMap[rowIndex].push(getLastWidth(item[row.value], fontSize, cellStyleOps)); // 表头当前格宽度
    });

    rowBodyList.push(listItem);
    // 以下是处理右边列的逻辑
    const colList = [];
    propsColKey.forEach((col, colIndex) => {
      colList.push(item[col.value]);
    });
    const colKey = colList.join('-');
    if (treeDataMap[colKey]) {
      const dataItem = treeDataMap[colKey];
      if (dataItem) dataItem[rowKey] = item[valueKey];
    } else {
      const itemMap = {};
      itemMap[rowKey] = item[valueKey];
      treeDataMap[colKey] = itemMap;
    }
    getTrees(colList, index, treeList, lastLinkTree);
  });
  const { rightSumList, bottomSumList, rightSumWidth, bodyDataList } = getRightData(treeList, lastLinkTree, cellStyleOps, rowBodyList, treeDataMap);
  const leftColWidth = []; // 左边每一列的宽度
  rowHeaderList.forEach((v, i) => {
    const listItem = rowLeftWidthMap[i];
    listItem.sort((a, b) => b - a); // 从小到大排序
    leftColWidth.push(Math.min(cellStyleOps.maxWidth, listItem[0]) + 1); // 不能超过设定的最大宽度 + 1避免误差
  });
  return {
    leftConfig: {
      rowBodyList: rowBodyList,
      leftColWidth: leftColWidth,
      rowHeaderList: rowHeaderList,
    },
    rightConfig: {
      lastLinkTree,
      rightSumList,
      bottomSumList,
      rightSumWidth,
      bodyDataList,
    },
  };
}
