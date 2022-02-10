bc-pivot-table
===
一个用div重写table的透视表

  *支持虚拟滚动

  *支持左边和上面格子合并

  *支持大数据下开启webWorker进行计算

  *支持展示合计

  *支持冻结左边列

  *重写布局，用div代替不友好的table


![bc-pivot-table preview](https://github.com/beckhayu888/bc-pivot-table/blob/main/src/assets/preview.png)

## 安装
  `npm install --save bc-pivot-table`

## 组件
BcBasePivotTable：不固定表左边列的透视表
BcFixedPivotTable：固定左边列的透视表
## 使用

### 全局引入
`import bcPivotTable from 'bc-pivot-table'`
`import 'bc-pivot-table/lib/bc-pivot-table.css'`
`createApp(App).use(bcPivotTable)`
`<bc-base-pivot-table></bc-base-pivot-table>`
`<bc-fixed-pivot-table></bc-fixed-pivot-table>`

### 局部引入
`import { BcBasePivotTable, BcFixedPivotTable } from 'bc-pivot-table'`
`import 'bc-pivot-table/lib/bc-pivot-table.css'`
`<bc-base-pivot-table></bc-base-pivot-table>`
`<bc-fixed-pivot-table></bc-fixed-pivot-table>`


### 参数说明

参数 | 类型 | 默认 | 备注
---------|------|---------|------------
`showSum` | `Boolean` | `true` | `是否展示合计`
`valueKey` | `String` | `value` | `数据中值的使用字段`
`rowKey` | `Array` | `[]` | `左边列的配置数组`
`colKey` | `Array` | `[]` | `上面表头列的配置数组`
`dataList` | `Array` | `[]` | `data`
`cellStyleOps` | `Object` | `{}` | `透视表配置`


### 例子
![效果](https://github.com/beckhayu888/bc-pivot-table/blob/main/src/assets/preview.png)
![例子代码](https://github.com/beckhayu888/bc-pivot-table/blob/main/src/assets/code1.png)
![例子代码](https://github.com/beckhayu888/bc-pivot-table/blob/main/src/assets/code2.png)
![例子代码](https://github.com/beckhayu888/bc-pivot-table/blob/main/src/assets/code3.png)
可以自行下载代码查看例子