bc-pivot-table
===
A pivot table rewriting table with div

  *Support virtual scrolling

  *Support the merging of left and upper grids

  *Enable webworker for calculation under big data

  *Total supported display

  *Support freezing the left column

  *Rewrite the layout and replace the unfriendly table with Div


![bc-pivot-table preview](https://github.com/beckhayu888/bc-pivot-table/blob/main/src/assets/preview.png)

## github
https://github.com/beckhayu888/bc-pivot-table
## Install
  `npm install --save bc-pivot-table`

## Components
BcBasePivotTable

BcFixedPivotTable

## Use

### Global import
`import bcPivotTable from 'bc-pivot-table'`


`createApp(App).use(bcPivotTable)`

`<bc-base-pivot-table></bc-base-pivot-table>`

`<bc-fixed-pivot-table></bc-fixed-pivot-table>`


### Local introduction
`import { BcBasePivotTable, BcFixedPivotTable } from 'bc-pivot-table'`


`<bc-base-pivot-table></bc-base-pivot-table>`

`<bc-fixed-pivot-table></bc-fixed-pivot-table>`


### Parameter description

parameter | type | default | remark
---------|------|---------|------------
`showSum` | `Boolean` | `true` | `Show total`
`valueKey` | `String` | `value` | `Use field of data value`
`rowKey` | `Array` | `[]` | `Configuration array in the left column`
`colKey` | `Array` | `[]` | `Configuration array of header column above`
`dataList` | `Array` | `[]` | `data`
`cellStyleOps` | `Object` | `{}` | `Pivot table configuration`

##### rowKey、colKey

parameter | type | default | remark
---------|------|---------|------------
`label` | `String` | ` ` | `label`
`value` | `String` | ` ` | `Use field of data value`

##### cellStyleOps

parameter | type | default | remark
---------|------|---------|------------
`paddingLeft` | `Number` | ` 6` | `padding-left`
`paddingRight` | `Number` | ` 6` | `padding-right`
`height` | `Number` | ` 25` | `Height attribute of each grid`
`fontSize` | `Number` | ` 12` | `fontSize`
`maxWidth` | `Number` | ` 150` | `Maximum width of each grid`
`workerAutoLimit` | `Number` | `1000 ` | `When the amount of data reaches how many pieces, start webworker to calculate (solution for multiple data)`

### important remark!!!
Remember!!! You can't change the CSS attribute that changes the width and height of the grid at will, otherwise the grid style will be disordered

Changing the color and other styles that do not change the width and height can be modified using the depth selector

The current version only supports vue3 X version
### example
![effect](https://github.com/beckhayu888/bc-pivot-table/blob/main/src/assets/preview.png)
![Example code](https://github.com/beckhayu888/bc-pivot-table/blob/main/src/assets/code1.png)
![Example code](https://github.com/beckhayu888/bc-pivot-table/blob/main/src/assets/code2.png)
![Example code](https://github.com/beckhayu888/bc-pivot-table/blob/main/src/assets/code3.png)

You can download the code to view the example