/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import { createAction, handleActions } from 'redux-actions';
import * as _ from 'lodash'
import { v4 as uuidv4 } from 'uuid';
import TableConverter from "../../util/tableConverter";
import TableUtil from "../../util/tableUtils";
import { createMessage } from "./message";
import { addImage } from './image';
import { resetFullScreen } from './setting'
import * as moment from "moment-timezone";
import FileUtil from "../../util/fileUtils";
import * as Constants from '../../service/constants';
const tableConverter = new TableConverter()

const initialState = {
  tableStore: [],
  selectedTable: [],
  selectedCell: [],
  splitCell: [],
  mergeCell: [],
  imageList: [],
  isCreateTable: false,
  tableJson: new Map(),
  documentDatas: null,
  isOverlayShow: true,
  markedForReview: false,
  documentId: '',
  overlayView: 'table', // table, gte, text
  gteTables: [],
  textTables: [],
  gteEnabled: false,
  legalHSplit: false,
  legalVSplit: false,
  vSplitMode: false,  // if the vertical split mode is on
  hSplitMode: false,  // if the horizontal split mode is on
  cellEdit: {},
  cellSelectionEnabled: true,
  undoStack: [],
  redoStack: [],
  undoRedoFlag: false,
  undoEnabled: false,
  redoEnabled: false,
  tableEditFlag: false,
  splitFlag: false,
}
export const selectTable = createAction('@@tf/table/selectTable');
export const clearSelectTable = createAction('@@tf/table/clearSelectTable');
export const clearGteTables = createAction('@@tf/table/clearGteTables');
export const clearTextTables = createAction('@@tf/table/clearTextTables');
export const addTable = createAction('@@tf/table/addTable');
export const clearTableStore = createAction('@@tf/table/clearTableStore');
export const deleteTableApi = createAction('@@tf/table/deleteTable',
  (tId) => (dispatch, getState, httpClient) => {
    // dispatch(startLoading());
    const state = getState();
    let indata = _.find(state.table.tableStore, { 'id': tId });
    let imgdata = _.find(state.table.imageList, { 'selected': true });
    return httpClient
      .delete(`/documents/${state.table.documentId}/pages/${imgdata.name}/tables/${indata.name}`,
        {
          headers: {
            need_loading: 'true'
          }
        })
      .then((res) => {
        // console.log(res.data);
        // dispatch(initImageList(res.data.data.digitization.ocr_output_uri));
        return Promise.all([dispatch(deleteTable({ pId: imgdata.name, tId: indata.name }))])
          .then(() => {

            dispatch(initExistData(imgdata));
          }
          )
          .catch(err => {
            dispatch(initExistData(imgdata));
            if (err) {
              dispatch(createMessage('error', {
                subtitle: "Delete table error",
                title: "Error"
              }))
            }
          });
      })
      .catch((err) => {
        // console.log(err);
        dispatch(initExistData(imgdata));
        if (err) {
          dispatch(createMessage('error', {
            subtitle: "delete Document data error",
            title: "Error"
          }))
        }

      });
  });
export const deleteTable = createAction('@@tf/table/deleteTable');
export const updateTable = createAction('@@tf/table/updateTable');
export const addChild = createAction('@@tf/table/addChild');
export const updateChild = createAction('@@tf/table/updateChild');
export const selectRightSideCells = createAction('@@tf/table/selectRightSideCells',
  (cells) => (dispatch, getState) => {
    let t = _.cloneDeep(getState().table.tableJson);
    if (!cells || cells.length === 0) {
      return t;
    }
    const tableStore = getState().table.tableStore;
    let tableName = TableUtil.findTableNameByCellId(cells[0].tableID, tableStore);
    if (!tableName) {
      return t;
    }
    //clear all the selected flags in other tables
    TableUtil.clearSelectedFlag(t)
    const table = t.get(tableName);
    let ids = cells.map(cell => {
      return cell.originalId;
    })
    for (let i = 0; i < table.length; i++) {
      const row = table[i];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (_.includes(ids, cell.tableID)) {
          cell.selected = true;
        } else {
          cell.selected = false;
        }
      }
    }
    t.set(tableName, table);

    return t;
  });
export const selectCell = createAction('@@tf/table/selectCell',
  (cells) => (dispatch, getState) => {
    dispatch(changeHSplitLegal(TableUtil.checkHSplitLegal(cells)));
    dispatch(changeVSplitLegal(TableUtil.checkVSplitLegal(cells)));
    dispatch(selectRightSideCells(cells));
    return cells;
  });

export const deSelectCell = createAction('@@tf/table/deSelectCell',
  (newTableJson) => (dispatch, getState) => {
    newTableJson = _.cloneDeep(getState().table.tableJson);
    TableUtil.clearSelectedFlag(newTableJson);
    return newTableJson;
  });

export const editCell = createAction('@@tf/table/editCell',
  (cellId, tableName) => (dispatch, getState) => {
    let tables = _.cloneDeep(getState().table.tableJson);
    let table = tables.get(tableName)
    let cellEdit;
    if (table) {
      TableUtil.clearSelectedFlag(tables)
      for (let i = 0; i < table.length; i++) {
        const row = table[i];
        for (let j = 0; j < row.length; j++) {
          const cell = row[j];
          if (cell.id === cellId) {
            cell.editFlag = true;
            cellEdit = _.cloneDeep(cell)
            cellEdit.tableName = tableName
            cellEdit.modified = false;
          } else {
            cell.editFlag = false;
          }
        }
      }
    }
    tables.set(tableName, table);
    return { tables, cellEdit };
  });
export const changeHSplitLegal = createAction('@@tf/table/changeHSplitLegal');
export const changeVSplitLegal = createAction('@@tf/table/changeVSplitLegal');
export const changeVSplitMode = createAction('@@tf/table/changeVSplitMode');
export const changeHSplitMode = createAction('@@tf/table/changeHSplitMode');
export const updateEditCell = createAction('@@tf/table/updateEditCell');
export const saveEditCell = createAction('@@tf/table/saveEditCell',
  () => (dispatch, getState, httpClient) => {
    let state = getState();
    let imgdata = _.find(state.table.imageList, { 'selected': true });
    let documentDatas = state.table.documentDatas
    let page = _.find(documentDatas.pages, p => parseInt(p.page_num) === imgdata.id)
    let cellEdit = state.table.cellEdit;
    let tableStore = _.cloneDeep(state.table.tableStore);
    let tableJson = _.cloneDeep(state.table.tableJson);
    if (!cellEdit.modified) {
      // clear the edit flag
      let tableToClear = tableJson.get(cellEdit.tableName);
      tableToClear.forEach(rows => {
        rows.forEach(cell => {
          if (cell.id === cellEdit.id) {
            cell.editFlag = false;
          }
        })
      })
      tableJson.set(cellEdit.tableName, tableToClear)
      return { tableJson, tableStore }
    }
    // 1. call api to save the value
    // 1.1. change the value in tableStore


    return httpClient
      .put(`${Constants.DATA_BASE_URL}/pages/${page.id}/tables/${cellEdit.tableName}/cells/${cellEdit.id}`, { target: cellEdit.name }, {
        headers: {
          need_loading: 'true'
        }
      })
      .then((res) => {
        // 2. update the table with the new value
        let tableStoreSingle = _.find(tableStore, table => table.name === cellEdit.tableName)
        let cellTableStore = _.find(tableStoreSingle.child, child => child.originalId === cellEdit.id)
        cellTableStore.value = cellEdit.name;
        // 1.2. change the value in tableJson
        let table = tableJson.get(cellEdit.tableName);
        table.forEach(row => {
          row.forEach(cell => {
            if (cell.id === cellEdit.id) {
              cell.name = cellEdit.name
              cell.editFlag = false;
            }
          })
        })
        tableJson.set(cellEdit.tableName, table);
        return { tableJson, tableStore }
      })
      .catch((err) => {
        // console.log(err);
        if (err) {
          dispatch(createMessage('error', {
            subtitle: "Update cell value error",
            title: "Error"
          }))
        }
        let table = tableJson.get(cellEdit.tableName);
        table.forEach(row => {
          row.forEach(cell => {
            if (cell.id === cellEdit.id) {
              cell.editFlag = false;
            }
          })
        })
        tableJson.set(cellEdit.tableName, table);
        return { tableJson, tableStore }
      });

  });
export const dropEditCell = createAction('@@tf/table/dropEditCell',
  (cellId, tableName) => (dispatch, getState, httpClient) => {
    let state = getState();

    let tableJson = _.cloneDeep(state.table.tableJson);
    let table = tableJson.get(tableName)
    table.forEach(row => {
      row.forEach(cell => {
        if (cell.id === cellId) {
          cell.editFlag = false
        }
      })
    })
    tableJson.set(tableName, table)
    return tableJson
    // clear all the cell editing flags 



  });
export const clearSelectedCell = createAction('@@tf/table/clearSelectedCell');

export const deleteCell = createAction('@@tf/table/deleteCell');
export const addCell = createAction('@@tf/table/addCell');
export const updateCell = createAction('@@tf/table/updateCell');
export const addSplitCell = createAction('@@tf/table/addSplitCell');
export const clearSplitCell = createAction('@@tf/table/clearSplitCell',
  () => (dispatch, getState) => {
    dispatch(changeHSplitMode(false))
    dispatch(changeVSplitMode(false))
  });
export const addMergeCell = createAction('@@tf/table/addMergeCell');
export const clearMergeCell = createAction('@@tf/table/clearMergeCell');
export const updateSplitCell = createAction('@@tf/table/updateSplitCell');
export const updateSplitCells = createAction('@@tf/table/updateSplitCells');
export const updateStatus = createAction('@@tf/table/updateStatus');
export const initImageList = createAction('@@tf/table/initImageList',
  (datas) => (dispatch, getState) => {
    let imageLists = []
    datas.forEach(async (page, index) => {
      // console.log(page)
      imageLists.push({
        id: parseInt(page.page_num),
        uniqId: uuidv4(),
        name: parseInt(page.page_num),
        confidence: 0.99,
        small_image: page.thumbnail,
        large_image: page.image_fullsize,
        selected: parseInt(page.page_num) === 1 ? true : false
      })

    })
    imageLists = imageLists.sort((a, b) => a.name - b.name);
    dispatch(addImage(imageLists[0]))
    return imageLists;
  }
);
export const updateimageList = createAction('@@tf/table/updateimageList');
export const updateIsCreateTable = createAction('@@tf/table/updateIsCreateTable');
export const convertTableData = createAction('@tf/table/convertTableData',
  (page_num) => (dispatch, getState) => {
    const state = getState();

    const res = new Map()
    // find the page by number
    if (!state.table.documentDatas) {
      return res
    }
    const page = _.find(state.table.documentDatas.pages, p => parseInt(p.page_num) === page_num)
    const tables = page.table ? page.table.extracted_tables : null
    //const tables = state.table ? state.table.documentDatas.table.extracted_tables : null

    if (tables) {
      tables
        .forEach((k) => {
          // console.log(k)
          let converted
          if (k.validated_data) {
            converted = tableConverter.mergeSameIds(k.validated_data.cells2d)
          } else {
            converted = tableConverter.mergeSameIds(k.cells)
          }

          res.set(k.table_num, converted)
        })
    }
    return res
  })
export const initExistData = createAction('@@tf/table/initExistData',
  (imgdata) => (dispatch, getState) => {
    const state = getState();
    // let imgdata=_.find(state.table.imageList, { 'id': id });
    let pages = state.table.documentDatas ? state.table.documentDatas.pages : []
    let documentKvp = state.table.documentKvp ? state.table.documentKvp : []

    // let orginalTableDatas = state.table.documentDatas.digitization.data[imgdata.name];
    dispatch(resetUndoRedo())
    dispatch(convertTableData(imgdata.id));
    var tabledatas = [];
    let gteTables = []
    let textTables = [];
    let tableStore = [];

    //*********** kvp */ 
    let kvpDatas = [];

    // changes by priyanka

    if (pages.length > 0) {
      for (let index = 0; index < pages.length; index++) {
        const page = pages[index];
        if (parseInt(page.page_num) !== imgdata.id) {
          continue;
        }
        if (!!page.table && !!page.table.extracted_tables) {
          let tables = page.table.extracted_tables
          tables.forEach(table => {
            let tableData = tableConverter.convertInitDataToTableCanvasData(table, table.table_num);
            tabledatas.push(tableData)

            let gteTable = tableConverter.convertGteDataToTableCanvasData(table, table.table_num);
            if (!!gteTable) {
              gteTables.push(gteTable)
            };
          })

        }

        //*********** kvp */ 
        if (documentKvp && Object.keys(documentKvp).length) {
          Object.keys(documentKvp).map(key => {
            if (documentKvp[key]['co-ordinate']) {
              let intdata = {
                coordinate: documentKvp[key]['co-ordinate'],
                type: "bordered",
                coordinate: {
                  x1: documentKvp[key]['co-ordinate'][0],
                  y1: documentKvp[key]['co-ordinate'][1],
                  x2: documentKvp[key]['co-ordinate'][2],
                  y2: documentKvp[key]['co-ordinate'][3],
                }
              }
              if (parseInt(page.page_num) == documentKvp[key]['page_num']) {
                let tableData = tableConverter.convertInitDataToTableCanvasData(intdata, key);
                kvpDatas.push(tableData)
              }
            }
          })
        }
        if (!!page.output.ocr) {
          let ocr = page.output.ocr[0];
          let textTable = tableConverter.convertOcrToTableCanvasData(ocr, 0)
          textTables.push(textTable);

        }
        tableStore = tabledatas.length > 0 ? tableStore.concat(tableConverter.convertTablesToTableStore(tabledatas, imgdata)) : tableStore;
        tableStore = gteTables.length > 0 ? tableStore.concat(tableConverter.convertTablesToTableStore(gteTables, imgdata)) : tableStore;
        tableStore = textTables.length > 0 ? tableStore.concat(tableConverter.convertTablesToTableStore(textTables, imgdata)) : tableStore;

        //*********** kvp */ 
        tableStore = kvpDatas.length > 0 ? tableStore.concat(tableConverter.convertTablesToTableStore(kvpDatas, imgdata)) : tableStore;
        kvpDatas.map(data => {
          tabledatas.push(data);
        })
      }
    }

    //changes by priyanka
    // if (state.table) {
    //  // for (let index = 0; index < pages.length; index++) {
    //     // const page = pages[index];
    //     // if (parseInt(page.page_num) !== imgdata.id) {
    //     //   continue;
    //     // }

    //   // changes pages to state by priyanka
    //     if (state.table.documentDatas.table.extracted_tables) {

    //       let tables = state.table.documentDatas.table.extracted_tables
    //       tables.forEach(table => {
    //         let tableData = tableConverter.convertInitDataToTableCanvasData(table, table.table_num);
    //         tabledatas.push(tableData)

    //         let gteTable = tableConverter.convertGteDataToTableCanvasData(table, table.table_num);
    //         if (!!gteTable) {
    //           gteTables.push(gteTable)
    //         };
    //       })

    //     }
    //     // changes pages to state by priyanka
    //     if (state.table.documentDatas.output.ocr) {
    //       let ocr = state.table.documentDatas.output.ocr[0];
    //       let textTable = tableConverter.convertOcrToTableCanvasData(ocr, 0)
    //       textTables.push(textTable);

    //     }
    //     tableStore = tabledatas.length > 0 ? tableStore.concat(tableConverter.convertTablesToTableStore(tabledatas, imgdata)) : tableStore;
    //     tableStore = gteTables.length > 0 ? tableStore.concat(tableConverter.convertTablesToTableStore(gteTables, imgdata)) : tableStore;
    //     tableStore = textTables.length > 0 ? tableStore.concat(tableConverter.convertTablesToTableStore(textTables, imgdata)) : tableStore;

    //     console.log(tableStore);
    //  // }
    // }
    // console.log(tabledatas)
    return { tabledatas, gteTables, textTables, tableStore }
  }
);
const getStageDuration = (stage) => {
  let min = moment.tz("UTC")
  let max = moment.tz("1970-01-01 00:00:00", "YYYY-MM-DD HH:mm:ss", "UTC")
  let minHit = false
  let maxHit = false
  Object.keys(stage).forEach(stepName => {
    let step = stage[stepName]
    let stepStart = step.start_time ? moment.tz(step.start_time, "YYYY-MM-DD HH:mm:ss", "UTC") : null
    let stepEnd = step.end_time ? moment.tz(step.end_time, "YYYY-MM-DD HH:mm:ss", "UTC") : null
    // console.log(stepEnd > max)
    if (stepStart && stepStart < min) {
      min = stepStart
      minHit = true
    }
    if (stepEnd && stepEnd > max) {
      max = stepEnd
      maxHit = true
    }
  })
  if (minHit && maxHit) {
    let res = moment.duration(max.unix() - min.unix()).asMilliseconds()
    return res
  }
}
const generateProcessingTime = (data) => {
  let stages = data.status.stages
  const fmt = "YYYY-MM-DD HH:mm:ss"
  const res = {}
  Object.keys(stages).forEach(stageName => {
    let stageDuration = getStageDuration(stages[stageName])
    res["Stage_" + stageName] = stageDuration
    Object.keys(stages[stageName]).forEach(stepName => {
      const step = stages[stageName][stepName]

      if (step.start_time && step.end_time) {
        res["Stage_" + stageName + "_Step_" + stepName] = moment.duration(
          moment.tz(step.end_time, fmt, "UTC").unix() - moment.tz(step.start_time, fmt, "UTC").unix())
          .asMilliseconds()
      }
    })
  })
  res["Total"] = data.status.final_status.start_time && data.status.final_status.end_time ?
    moment.duration(
      moment.tz(data.status.final_status.end_time, fmt, "UTC").unix() - moment.tz(data.status.final_status.start_time, fmt, "UTC").unix())
      .asMilliseconds() :
    "N/A"
  return res
}

const getIndexPageData = (pageIndex, pageData) => {
  return pageData[pageIndex].data;
}

const processDocumentData = (data) => {
  let page_data = [];
  if (data.page_data) {
    Object.keys(data.page_data).map(id => {
      page_data.push(data.page_data[id].data);
    })
  }
  let document_data = data.document_data.data;
  // cell_id change to id
  if (document_data.pages && document_data.pages.length > 0) {
    const pages = document_data.pages
    pages.forEach(p => {
      processPageData(p)
    })
  }
  // Enrich the processing time object
  //data.processing_time = generateProcessingTime(data)
  document_data.processing_time = {
    'Total': "00:00:00",
    'Stage_test': "00:00:01",
    'Stage_test_Step_1': "00:00:02"
  }

  return {
    document_data: document_data,
    pages_data: page_data,
    metadata: data.metadata,
    kvp: data.kvp
  }
}

export const updateDocumentId = createAction('@@tf/table/updateDocumentId');
export const getDocumentDatas = createAction("@@tf/table/getDocumentDatas",
  (id) => (dispatch, getState, httpClient) => {
    //reset the full screen settings
    dispatch(resetFullScreen())
    dispatch(initTableData())
    dispatch(updateDocumentId(id))
    // dispatch(startLoading());
    return httpClient
      .get(`${Constants.DATA_BASE_URL}/document/getTable/${id}`, {
        // .get(`http://localhost:3000/codination2.json`, {
        headers: {
          need_loading: 'true'
        },
        params: {
          with_category: true,
          with_pages: true,
          with_pages_detail: false,
        }
      })
      .then((res) => {
        // dispatch(getPageData(id, 0));
        dispatch(initImageList(res.data.document_data.data.pages));
        return processDocumentData(res.data);
      })
      .catch((err) => {
        console.log(err);
        if (err) {
          dispatch(createMessage('error', {
            subtitle: "Get Document data error",
            title: "Error"
          }))
        }
      });
  }
);


const processPageData = (page) => {
  if (page) {
    processTableData(page.table);
  }
  return page;
}

const processTableData = (table) => {
  if (table && table.extracted_tables) {
    const tables = table.extracted_tables
    tables.forEach(t => {
      if (t.cells && t.cells.length > 0) {
        const cells = t.cells
        cells.forEach(row => {
          row.forEach(cell => {
            cell.id = cell.cell_id
          })
        })
      }
      if (t.validated_data) {
        const vcells = t.validated_data.cells2d
        vcells.forEach(row => {
          row.forEach(cell => {
            cell.id = cell.cell_id
          })
        })
      }
    })
  }
  return table;
}

export const getPageData = createAction('@@tf/table/getPageData',
  (id, pageIndex) => (dispatch, getState, httpClient) => {
    try {
      let pagesDatas = getState().table.pagesDatas
      let pageData = processPageData(pagesDatas[pageIndex])
      let documentDatas = getState().table.documentDatas
      documentDatas.pages[pageIndex] = pageData;
      return documentDatas;
    } catch (err) {
      if (err) {
        console.log(err);
        dispatch(createMessage('error', {
          subtitle: "Get Page Data Error.",
          title: "Error"
        }))
      }
    }
    // return httpClient
    //   // .get(`http://localhost:3000/LiveData_page${pageIndex + 1}.json`, {
    //   .get(`${Constants.DATA_BASE_URL}/document/getTable/139_req_id_10512021092900004592_202201284239603294.pdf`, {
    //     headers: {
    //       need_loading: 'true'
    //     },
    //     params: {
    //       page_no: pageIndex + 1
    //     }
    //   })
    //   .then((res) => {
    //     // cell_id change to id
    //     let pageData = processPageData(res.data.data)
    //     let documentDatas = getState().table.documentDatas
    //     documentDatas.pages[pageIndex] = pageData
    //     return documentDatas
    //   })
    //   .catch((err) => {
    //     // console.log(err);
    //     if (err) {
    //       console.log(err);
    //       dispatch(createMessage('error', {
    //         subtitle: "Get Page Data Error.",
    //         title: "Error"
    //       }))
    //     }
    //   });
  }
);
export const initTableData = createAction('@@tf/table/initTableData');
export const updateOverlayShow = createAction('@@tf/table/updateOverlayShow');
export const updateDocumentDatas = createAction(
  "@@tf/table/updateDocumentDatas",
  (tId, imageX, imageY, operation, newtableData) => (dispatch, getState, httpClient) => {
    // dispatch(startLoading());
    dispatch(resetUndoRedo())
    const state = getState();
    let indata = newtableData.id ? newtableData : _.find(state.table.tableStore, { 'id': tId });
    let validation_data = newtableData.id ? newtableData : tableConverter.convertTableDataToParam(indata, imageX, imageY, operation);
    let imgdata = _.find(state.table.imageList, { 'selected': true });
    return httpClient
      .put(`${Constants.DATA_BASE_URL}/documents/${state.table.documentId}/pages/${imgdata.name}/tables/${indata.name}`, validation_data,
        {
          headers: {
            need_loading: 'true'
          }
        })
      .then((res) => {
        console.log(res);
        // get page index
        let documentDatas = getState().table.documentDatas
        let pages = documentDatas.pages
        let index = 0
        if (pages.length > 0) {
          for (index = 0; index < pages.length; index++) {
            if (parseInt(pages[index].page_num) === imgdata.name) {
              break;
            }
          }
        }

        if (res) {
          // // dispatch(initImageList(res.data.data.digitization.ocr_output_uri));
          // let pageTable = processTableData(res.data.data)
          // documentDatas.pages[index].table = pageTable
          // return Promise.all([dispatch(refreshDocumentData(documentDatas))])
          //   .then(() => {
          //     dispatch(initExistData(imgdata));
          //   }
          //   )
          //   .catch(err => {
          //     dispatch(initExistData(imgdata));
          //     if (err) {
          //       dispatch(createMessage('error', {
          //         subtitle: "Put Document data error when refreshing data.",
          //         title: "Error"
          //       }))
          //     }
          //   });
          dispatch(createMessage('success', {
            subtitle: "Data updated successfully.",
            title: "Success"
          }))

          return Promise.all([dispatch(getDocumentDatas(state.table.documentId))])
            .then(() => {
              dispatch(initExistData(imgdata));
            }
            )
            .catch(err => {
              dispatch(initExistData(imgdata));
              if (err) {
                dispatch(createMessage('error', {
                  subtitle: "Put Document data error when refreshing data.",
                  title: "Error"
                }))
              }
            });
        } else {
          dispatch(initExistData(imgdata));

          dispatch(createMessage('error', {
            subtitle: res.data.status.message,
            title: "Error"
          }))
        }

      })
      .catch((err) => {
        console.log(err);
        dispatch(initExistData(imgdata));
        if (err) {
          dispatch(createMessage('error', {
            subtitle: "Put Document data error when putting data.",
            title: "Error"
          }))
        }
      });
  }
);

export const refreshDocumentData = createAction('@@tf/table/refreshDocumentData');

export const toggleMarkForReview = createAction('@@tf/table/toggleMarkForReview',
  () => (dispatch, getState, httpClient) => {
    const state = getState()
    let current = state.table.markedForReview;
    // console.log(current)
    // request
    return httpClient
      .put(`/documents/${state.table.documentId}/reviews`, null, {
        headers: {
          need_loading: 'true'
        },
        params: {
          target: !current
        }
      }).then(res => {
        dispatch(initImageList(res.data.data.pages));
        return processDocumentData(res.data.data);
      }).catch((err) => {
        // console.log(err);
        if (err) {
          dispatch(createMessage('error', {
            subtitle: "Update review status error",
            title: "Error"
          }))
        }
      });

  }
)

export const updateOverlayView = createAction('@@tf/table/updateOverlayView',
  (data) => (dispatch, getState, httpClient) => {
    // request
    return data;
  }
)

export const addOrModifyTable = createAction('@@tf/table/addOrModifyTable',
  (newTableData) => (dispatch, getState, httpClient) => {
    // request
    console.log("AddorModifyData");
    const state = getState();
    let imgdata = _.find(state.table.imageList, { 'selected': true });
    // get the page id from page number
    let page = _.find(state.table.documentDatas.pages, p => parseInt(p.page_num) === imgdata.id);
    let pageId = page.id;
    return httpClient
      .post(`/pages/${pageId}/tables`, newTableData,
        {
          headers: {
            need_loading: 'true'
          }
        })
      .then((res) => {
        // get page index
        let documentDatas = getState().table.documentDatas
        let pages = documentDatas.pages
        let index = 0
        if (pages.length > 0) {
          for (index = 0; index < pages.length; index++) {
            if (parseInt(pages[index].page_num) === imgdata.name) {
              break;
            }
          }
        }
        // console.log(res.data);
        if (res.data.data) {
          // update the page data to documentDatas
          let pageTable = processTableData(res.data.data)
          documentDatas.pages[index].table = pageTable
          return Promise.all([dispatch(refreshDocumentData(documentDatas))])
            .then(() => {
              dispatch(initExistData(imgdata));
            })
            .catch(err => {
              console.error(err)
              dispatch(initExistData(imgdata));
              if (err) {
                dispatch(createMessage('error', {
                  subtitle: "Put Document data error",
                  title: "Error"
                }))
              }
            });
        }
        else {
          dispatch(initExistData(imgdata));

          dispatch(createMessage('error', {
            subtitle: "No data returned",
            title: "Error"
          }))
        }
        dispatch(finishTableEdit("All"))
      })
      .catch((err) => {
        console.error(err)
        dispatch(initExistData(imgdata));
        dispatch(finishTableEdit("All"))
        if (err) {
          dispatch(createMessage('error', {
            subtitle: "Put Document data error",
            title: "Error"
          }))
        }
      });
  }
)

export const deactivateCellSelection = createAction('@@tf/table/deactivateCellSelection');
export const activateCellSelection = createAction('@@tf/table/activateCellSelection');
export const addUndoHistory = createAction('@@tf/table/addUndoHistory',
  () => (dispatch, getState) => {
    dispatch(changeUndoRedoEnabled("undo", true))
    let tableStore = _.cloneDeep(getState().table.tableStore);
    let stack = getState().table.undoStack;
    stack.push(tableStore);
    // console.log("Undo stack:")
    // console.log(stack);
    return stack;
  });
export const addRedoHistory = createAction('@@tf/table/addRedoHistory');
export const resetUndoRedo = createAction('@@tf/table/resetUndoRedo');
export const changeUndoRedoEnabled = createAction('@@tf/table/changeUndoRedoEnabled',
  (target, status) => (dispatch, getState) => {
    return {
      undo: target === "undo" ? status : getState().table.undoEnabled,
      redo: target === "redo" ? status : getState().table.redoEnabled,
    };
  });
export const undo = createAction('@@tf/table/undo',
  () => (dispatch, getState) => {
    let undoStack = getState().table.undoStack;
    let redoStack = getState().table.redoStack;
    if (undoStack.length > 0) {
      // 1. pop out the undo stack
      let tableStore = undoStack.pop();
      // 2. save the current status to redoStack
      redoStack.push(getState().table.tableStore);
      dispatch(changeUndoRedoEnabled("redo", true))
      if (undoStack.length === 0) {
        dispatch(changeUndoRedoEnabled("undo", false))
      }
      let selectedTable = []
      tableStore.forEach(t => {
        if (t.format === "native") {
          selectedTable.push({
            id: t.id
          })
        }
      })
      return {
        undo: undoStack,
        table: tableStore,
        redo: redoStack,
        selectedTable: selectedTable
      };
    }
  });
export const redo = createAction('@@tf/table/redo',
  () => (dispatch, getState) => {
    let undoStack = getState().table.undoStack;
    let redoStack = getState().table.redoStack;
    if (redoStack.length > 0) {
      let tableStore = redoStack.pop();
      undoStack.push(getState().table.tableStore);
      dispatch(changeUndoRedoEnabled("undo", true))
      if (redoStack.length === 0) {
        dispatch(changeUndoRedoEnabled("redo", false))
      }
      let selectedTable = []
      tableStore.forEach(t => {
        if (t.format === "native") {
          selectedTable.push({
            id: t.id
          })
        }
      })
      return {
        undo: undoStack,
        table: tableStore,
        redo: redoStack,
        selectedTable: selectedTable
      };
    }
  });
export const startTableEdit = createAction('@@tf/table/startTableEdit',
  (tableId) => (dispatch, getState) => {
    let tables = getState().table.tableStore;
    let table = _.filter(tables, t => t.id === tableId)
    if (!!table && table.length > 0) {
      table[0].tableEditFlag = true;
    }
    return tables;
  });

export const finishTableEdit = createAction('@@tf/table/finishTableEdit',
  (tableId) => (dispatch, getState) => {
    let tables = getState().table.tableStore;
    if (tableId === 'All') {
      _.forEach(tables, t => {
        t.tableEditFlag = false;
      })
    } else {
      let table = _.filter(tables, t => t.id === tableId)
      if (!!table && table.length > 0) {
        table[0].tableEditFlag = false;
      }
    }
    return tables;
  });
export const checkTableEdit = createAction('@@tf/table/checkTableEdit', () => (dispatch, getState) => {
  // check if in edit state
  let res = getState().table.undoEnabled || getState().table.reduEnabled;
  if (!res) {
    dispatch(finishTableEdit("All"))
  }
});
export const startSplit = createAction('@@tf/table/startSplit');
export const endSplit = createAction('@@tf/table/endSplit', () => (dispatch) => {
  dispatch(checkTableEdit())
});
export const downloadCsv = createAction('@@tf/table/downloadCsv', (tableId) =>
  (dispatch, getState, httpClient) => {
    const pageNum = getState().image.imagefile.id;
    // get page Id from document
    const documentDatas = getState().table.documentDatas;
    const page = _.find(documentDatas.pages, (page) => page.page_num === `${pageNum}`)
    if (!!page) {
      // console.log(`downloading table for page: ${page.id}, table: ${tableId}`)
      FileUtil.openNewTab(`${Constants.BASE_URL}/pages/${page.id}/tables/${tableId}/csv`);
    } else {
      dispatch(createMessage('error', {
        subtitle: "Cannot find the page",
        title: "Error"
      }))
    }

  });
// Review Comment API & Functionality
export const updateReviewComment = createAction('@@tf/table/updateReviewComment', (data) =>
  (dispatch, getState, httpClient) => {
    console.log('updateReviewComment')
    const state = getState()
    let reviewData = {
      "document_id": state.table.documentId,
      "comment": data.comment,
      "reviewed_by": data.reviewed_by,
      "reviewed_on": new Date()
    }

    return httpClient
      .put(`${Constants.DATA_BASE_URL}/review/submit`, reviewData,
        {
          headers: {
            need_loading: 'true'
          }
        })
      .then((res) => {
        console.log(res);
        dispatch(createMessage('success', {
          subtitle: "Successfully updated Review Comment Data",
          title: "Success"
        }))
      })
      .catch((err) => {
        console.error(err)
        if (err) {
          dispatch(createMessage('error', {
            subtitle: "Post Review comment error",
            title: "Error"
          }))
        }
      });
  })
// KVP API & Functionality
export const updateKvpData = createAction('@@tf/table/updateKvpData', (data) =>
  (dispatch, getState, httpClient) => {
    const state = getState()
    let updatedkvpData = {
      "document_id": state.table.documentId,
      "data": data.updatedkvpData,
      "reviewed_by": data.reviewed_by
    }
    return httpClient
      .put(`${Constants.DATA_BASE_URL}/kvp/submit`, updatedkvpData,
        {
          headers: {
            need_loading: 'true'
          }
        })
      .then((res) => {
        console.log(res);
        dispatch(createMessage('success', {
          subtitle: "Successfully updated Kvp Data",
          title: "Success"
        }))
      })
      .catch((err) => {
        console.error(err)
        if (err) {
          dispatch(createMessage('error', {
            subtitle: "Post Kvp update data error",
            title: "Error"
          }))
        }
      });
  })

// Actions

export const TableReducer = handleActions(
  {
    [initTableData]: (state) => {
      return {
        ...state,
        tableStore: [],
        selectedTable: [],
        selectedCell: [],
        splitCell: [],
        mergeCell: [],
        imageList: [],
        isCreateTable: false,
        tableJson: new Map(),
        documentDatas: null,
        isOverlayShow: true,
        documentId: '',
        cellSelectionEnabled: true,
        undoStack: [],
        redoStack: [],
        undoRedoFlag: false,
        undoEnabled: false,
        redoEnabled: false,
        tableEditFlag: false,
      }
    },
    [selectTable]: (state, { payload: Table }) => {
      return {
        ...state,
        selectedTable: Table
      }
    },
    [clearSelectTable]: (state) => {
      return {
        ...state,
        selectedTable: []
      }
    },
    [clearGteTables]: (state) => {
      return {
        ...state,
        gteTables: []
      }
    },
    [clearTextTables]: (state) => {
      return {
        ...state,
        textTables: []
      }
    },
    [selectCell]: (state, { payload: cell }) => {
      return {
        ...state,
        selectedCell: cell
      }
    },
    [deSelectCell]: (state, { payload: newTableJson }) => {
      return {
        ...state,
        tableJson: newTableJson,
        selectedCell: []
      }
    },
    [clearSelectedCell]: (state) => {
      return {
        ...state,
        selectedCell: []
      }
    },
    [addTable]: (state, { payload: Table }) => {
      Table.scaleX = 1;
      Table.scaleY = 1;
      Table.status = Table.status ? Table.status : 'init';
      return {
        ...state,
        tableStore: [...state.tableStore, Table]
      };
    },
    [updateStatus]: (state, { payload: data }) => {
      let thisTable = _.find(state.tableStore, { 'id': data.id });
      thisTable.status = data.status ? data.status : 'processed'
      return {
        ...state
      };
    },
    [deleteTable]: (state, { payload: data }) => {
      // console.log('deleteTable',data);
      if (data) {
        let page = _.find(state.documentDatas.pages, p => parseInt(p.page_num) === data.pId)
        if (page) {
          _.remove(page.table.extracted_tables, t => t.table_num === data.tId)
        }
      }
      return {
        ...state,
      };
    },
    [updateTable]: (state, { payload: Table }) => {
      // console.log(Table)
      // console.log(state.tableStore)
      let thisTable = _.find(state.tableStore, { 'id': Table.id });
      thisTable.x1 = Table.x ? Table.x : thisTable.x1;
      thisTable.y1 = Table.y ? Table.y : thisTable.y1;
      thisTable.width = Table.width ? Table.width : thisTable.width;
      thisTable.height = Table.height ? Table.height : thisTable.height;
      thisTable.scaleX = Table.scaleX ? Table.scaleX : thisTable.scaleX;
      thisTable.scaleY = Table.scaleY ? Table.scaleY : thisTable.scaleY;
      thisTable.x2 = Table.scaleX ? (thisTable.x1 + thisTable.width * Table.scaleX) : (thisTable.x1 + thisTable.width * thisTable.scaleX);
      thisTable.y2 = Table.scaleY ? (thisTable.y1 + thisTable.height * Table.scaleY) : (thisTable.y1 + thisTable.height * thisTable.scaleY);
      return {
        ...state
      };
    },
    [updateChild]: (state, { payload: data }) => {
      // console.log(data)
      let thisTable = _.find(state.tableStore, { 'id': data.id });
      thisTable.child = [];

      let raitoX = 1920 - data.canvasWidth;
      let raitoY = 979 - data.canvasHeight;
      thisTable.child.forEach((cell) => {
        cell.x1 = (cell.x1 === thisTable.x1) ? cell.x1 : (cell.x1 - raitoX);
        cell.y1 = (cell.y1 === thisTable.y1) ? cell.y1 : (cell.y1 - raitoY);
        cell.x2 = (cell.x2 === thisTable.x2) ? cell.x2 : (cell.x2 - raitoX);
        cell.y2 = (cell.y2 === thisTable.y2) ? cell.y2 : (cell.y2 - raitoY);
      })
      return {
        ...state
      };
    },
    [addChild]: (state, { payload: data }) => {
      let thisTable = _.find(state.tableStore, { 'id': data.id });
      thisTable.child = data.child;

      return {
        ...state
      };
    },
    [addCell]: (state, { payload: data }) => {
      let table = _.find(state.tableStore, { 'id': data.id })
      table.child.push(data.cell);
      return {
        ...state
      };
    },
    [deleteCell]: (state, { payload: id }) => {
      let temptable = {};
      if (state.tableStore.length === 1) {
        temptable = state.tableStore[0]
      } else {
        state.tableStore.forEach((table) => {
          if (_.find(table.child, { 'id': id })) {
            temptable = table;
          }
        })
      }
      temptable.child = _.reject(temptable.child, function (o) { return o.id === id; })
      return {
        ...state
      };
    },
    [updateCell]: (state, { payload: cell }) => {
      let temptable = {};
      if (state.tableStore.length === 1) {
        temptable = state.tableStore[0]
      } else {
        state.tableStore.forEach((table) => {
          if (_.find(table.child, { 'id': cell.id })) {
            temptable = table;
          }
        })
      }
      let thisCell = _.find(temptable.child, { 'id': cell.id });
      thisCell.x1 = cell.x1;
      thisCell.x2 = cell.x2;
      thisCell.y1 = cell.y1;
      thisCell.y2 = cell.y2;
      thisCell.label = cell.label;
      return {
        ...state
      };
    },
    [addSplitCell]: (state, { payload: cell }) => {
      return {
        ...state,
        splitCell: [...state.splitCell, cell]
      }
    },
    [clearSplitCell]: (state) => {
      return {
        ...state,
        splitCell: []
      }
    },
    [addMergeCell]: (state, { payload: cell }) => {
      return {
        ...state,
        mergeCell: [...state.mergeCell, cell]
      }
    },
    [clearMergeCell]: (state) => {
      return {
        ...state,
        mergeCell: []
      }
    },
    [clearTableStore]: (state) => {
      return {
        ...state,
        tableStore: []
      }
    },
    [updateSplitCell]: (state, { payload: cell }) => {
      let thisCell = _.find(state.splitCell, { 'id': cell.id });
      thisCell.x1 = cell.x1;
      thisCell.x2 = cell.x2;
      thisCell.y1 = cell.y1;
      thisCell.y2 = cell.y2;
      return {
        ...state
      };
    },
    [updateSplitCells]: (state, { payload: cells }) => {
      cells.forEach(cell => {
        let thisCell = _.find(state.splitCell, { 'id': cell.id });
        thisCell.x1 = cell.x1;
        thisCell.x2 = cell.x2;
        thisCell.y1 = cell.y1;
        thisCell.y2 = cell.y2;
      })
      return {
        ...state
      };
    },

    [initExistData]: (state, { payload: data }) => {
      return {
        ...state,
        selectedTable: data.tabledatas,
        gteTables: data.gteTables,
        textTables: data.textTables,
        tableStore: data.tableStore,
        gteEnabled: data.gteTables.length > 0,
        tableEditFlag: false
      }
    },

    // Setting /updatingthe imagelist
    [initImageList]: (state, { payload: imageLists }) => {
      return {
        ...state,
        imageList: imageLists
      }
    },

    [updateimageList]: (state, { payload: id }) => {
      let oldCell = _.find(state.imageList, { 'selected': true });
      oldCell.selected = false;
      let newCell = _.find(state.imageList, { 'id': id });
      newCell.selected = true;
      return {
        ...state
      }
    },

    [convertTableData]: (state, { payload: data }) => {
      return {
        ...state,
        tableJson: data
      }
    },
    [selectRightSideCells]: (state, { payload: data }) => {
      return {
        ...state,
        tableJson: data
      }
    },
    [updateIsCreateTable]: (state, { payload: data }) => {
      return {
        ...state,
        isCreateTable: data
      }
    },
    [getDocumentDatas]: (state, { payload: datas }) => {
      return {
        ...state,
        documentDatas: datas.document_data,
        pagesDatas: datas.pages_data,
        documentMetadata: datas.metadata,
        documentKvp: datas.kvp,
        markedForReview: datas.document_data ? datas.document_data.review_status.toLowerCase() === 'completed' : false
      };
    },
    [getPageData]: (state, { payload: data }) => {
      return {
        ...state,
        documentDatas: data,

      };
    },

    [updateOverlayShow]: (state, { payload: datas }) => {
      console.log('updateOverlayShow', datas);
      return {
        ...state,
        isOverlayShow: datas
      };
    },
    [updateOverlayView]: (state, { payload: datas }) => {
      return {
        ...state,
        overlayView: datas
      };
    },
    [updateDocumentId]: (state, { payload: datas }) => {
      return {
        ...state,
        documentId: datas
      };
    },
    [refreshDocumentData]: (state, { payload: datas }) => {
      return {
        ...state,
        documentDatas: datas
      };
    },
    [toggleMarkForReview]: (state, { payload: data }) => {
      return {
        ...state,
        markedForReview: !state.markedForReview,
        documentDatas: data
      }
    },
    [changeVSplitLegal]: (state, { payload: datas }) => {
      return {
        ...state,
        legalVSplit: datas
      };
    },
    [changeHSplitLegal]: (state, { payload: datas }) => {
      return {
        ...state,
        legalHSplit: datas
      };
    },
    [changeHSplitMode]: (state, { payload: datas }) => {
      return {
        ...state,
        hSplitMode: datas
      };
    },
    [changeVSplitMode]: (state, { payload: datas }) => {
      return {
        ...state,
        vSplitMode: datas
      };
    },
    [editCell]: (state, { payload: datas }) => {
      return {
        ...state,
        tableJson: datas.tables,
        cellEdit: datas.cellEdit
      };
    },
    [updateEditCell]: (state, { payload: datas }) => {

      let cellEdit = _.cloneDeep(state.cellEdit);
      if (cellEdit.name !== datas) {
        cellEdit.modified = true;
      }
      cellEdit.name = datas;
      return {
        ...state,
        cellEdit: cellEdit
      };
    },
    [saveEditCell]: (state, { payload: datas }) => {
      return {
        ...state,
        tableJson: datas.tableJson,
        tableStore: datas.tableStore,
        cellEdit: {}
      };
    },
    [dropEditCell]: (state, { payload: datas }) => {
      return {
        ...state,
        tableJson: datas,
        cellEdit: {}
      };
    },
    // activateCellSelection
    [activateCellSelection]: (state) => {
      return {
        ...state,
        cellSelectionEnabled: true,
      };
    },
    [deactivateCellSelection]: (state) => {
      return {
        ...state,
        cellSelectionEnabled: false,
      };
    },
    [addUndoHistory]: (state, { payload: data }) => {
      // console.log(payload)
      return {
        ...state,
        undoStack: data,
        // clear the redo stack because this is creating another branch
        redoStack: [],
        redoEnabled: false
      }
    },
    [addRedoHistory]: (state, { payload: data }) => {
      return {
        ...state,
        redoStack: data
      }
    },
    [resetUndoRedo]: (state,) => {
      return {
        ...state,
        redoStack: [],
        undoStack: [],
        redoEnabled: false,
        undoEnabled: false
      }
    },
    [changeUndoRedoEnabled]: (state, { payload: data }) => {
      return {
        ...state,
        undoEnabled: data.undo,
        redoEnabled: data.redo,
      }
    },
    [undo]: (state, { payload: data }) => {
      // console.log("undo payload: ");
      // console.log(data);
      if (!data) {
        return {
          ...state
        }
      }
      return {
        ...state,
        undoStack: data.undo,
        tableStore: data.table,
        redoStack: data.redo,
        selectedTable: data.selectedTable
      }
    },
    [redo]: (state, { payload: data }) => {
      // console.log("redo payload: ");
      // console.log(data);
      if (!data) {
        return {
          ...state
        }
      }
      return {
        ...state,
        undoStack: data.undo,
        tableStore: data.table,
        redoStack: data.redo,
        selectedTable: data.selectedTable
      }
    },
    [startTableEdit]: (state, { payload: data }) => {
      // console.log("table edit started ");
      return {
        ...state,
        tableEditFlag: true,
        tableStore: data
      }
    },
    [finishTableEdit]: (state, { payload: data }) => {
      return {
        ...state,
        tableEditFlag: false,
        tableStore: data
      }
    },
    [checkTableEdit]: (state) => {
      // console.log("table edit checked ");
      // console.log(data);
      return {
        ...state,
        tableEditFlag: state.undoEnabled || state.redoEnabled,
      }
    },
    [startSplit]: (state) => {
      // console.log("table edit checked ");
      // console.log(data);
      return {
        ...state,
        splitFlag: true,
      }
    },
    [endSplit]: (state) => {
      // console.log("table edit checked ");
      // console.log(data);
      return {
        ...state,
        splitFlag: false,
      }
    },
  },
  initialState
)

export default TableReducer