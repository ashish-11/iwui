/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import { createAction, handleActions } from "redux-actions";
import { createMessage } from "./message";
// import { createhttpMessage, createMessage } from "./message";
import * as _ from "lodash";
// import * as moment from "moment";
import * as moment from "moment-timezone";
import { closeModal } from "./modal";
import { addOneClient, openClients, clear } from './socket'
import * as Constants from '../../service/constants';
import FileUtil from "../../util/fileUtils";
import { createLoading, closeLoading } from './loading.js';
import { initializeMinioClient, downloadObject, getPresignedUrl } from '../../service/minioClient';

const confidenceFilterMap = {
  0: "0,100",
  1: "0,50",
  2: "50,80",
  3: "80,100"
}

const statusMap = {
  "requires_review": ["Requires Review"],
  "not_required": ["Not Required"],
  "in_progress": ["In Progress"],
  "Completed": ["Completed"],
  "Processed": ["Processed"],
  "Inprogress": ["Inprogress"],
  "Error": ["Error", "Error_MFA"]
}

const initialState = {
  isloading: false,
  files: [],
  uploadingFiles: [],
  currentConfidenceFilter: 0,
  currentStatusFilter: "All",
  currentDigiMethodFilter: "All",
  currentViaFilter: "All",
  filterField: undefined,
  statusField: undefined,
  viaField: undefined,
  pagination: {
    current_page: 1,
    offset: 0,
    page_size: 10,
    total_number: 0,
  },
  generalInfo: {
    total_count: 0,
    review_status: {
      in_progress: 0,
      requires_review: 0,
    },
    document_score: {
      table: {
        "0-70": 0,
        "70-95": 0,
        "95-100": 0,
      },
      kvp: {
        "0-70": 0,
        "70-95": 0,
        "95-100": 0,
      }
    },
  },
  nameSort: 0,
  updateTimeSort: 1,
  searchKeyword: "",
  categories: [],
  openUploadDialog: false,
  selectedCategoryId: null,
  versions: null
};

function getLastErrorStageAndStep(status) {
  const stages = Object.keys(status)
  let res = null
  stages.forEach(stageName => {
    let stage = status[stageName]
    const steps = Object.keys(stage)
    steps.forEach(stepName => {
      let step = stage[stepName]
      if (step.status === -1) {
        res = {
          stage: stageName,
          step: stepName,
          message: step.message
        }
      }
    })
  })
  return res;
}

function processSingleFile(o) {
  let date = moment.tz(
    o.uploadedOn,
    "YYYY-MM-DDTHH:mm:ss",
    "UTC"
  );
  // console.log(moment.tz.guess())
  o.uploadedOn = date.tz(moment.tz.guess()).format("DD MMMM, YYYY, hh:mm a");
  // o.document_score.kvp = Math.round((o.document_score.kvp * 100)) + "%";
  // o.document_score.table = Math.round((o.document_score.table * 100)) + "%";
  // let tmpStatus = o.status.final_status.status;
  // switch (tmpStatus) {
  //   case -1:
  //     o.final_status = "error"
  //     o.error_message = o.status.final_status.detail_message
  //     let errors = getLastErrorStageAndStep(o.status.stages)
  //     if (errors !== null) {
  //       o.error_stage = errors.stage
  //       o.error_step = errors.step
  //       o.error_message = errors.message
  //     }
  //     break;
  //   case 0:
  //   case 3:
  //     o.final_status = "processing"
  //     break;
  //   case 1:
  //     o.final_status = "completed"
  //     break;
  //   default:
  //     break;
  // }
  // digitization method
  if (o.category) {
    o.digitization_method = o.category.name
  }
  return o;
}

function processFileData(data) {
  // const files = data.documents;
  // const pagination = data.pagination;
  const files = data.data;
  const pagination = {
    "current_page": data.page_num,
    "offset": 0,
    "page_size": data.page_size,
    "total_number": data.total
  }
  pagination.total_number = parseInt(pagination.total_number);
  pagination.current_page = pagination.current_page + 1;
  let c = 0
  _.each(files, (o) => {
    // let date = moment(
    //   o.document_updated_datetime,
    //   "MM-DD-YYYY HH:mm:ss"
    // );
    // o.updated_at = date.format("DD MMMM, YYYY, hh:mm a");
    // Random id generator for Datatable. Change here for any other format
    o.id = String(c);
    processSingleFile(o)
    c++;
  });
  return { files, pagination };
}
export const getCategories = createAction(
  "@@tf/file/getCategories",
  () => (dispatch, getState, httpClient) => {
    return httpClient
       .get(`/categories`, {
     // .get(`http://localhost:3000/categories.json`, {
        headers: {
          need_loading: 'false'
        }
      })
      .then((res) => {
        let temp = res.data.data.filter(c => c.ui_display);
        temp.sort(function (a) {
          if (a.name.includes("SDU")) {
            return -1;
          }
          else {
            return 1;
          }
        })
        return temp;
      })
      .catch((err) => {
        // dispatch(createhttpMessage(err.response ? err.response : "", ""));
        if (err) {
          dispatch(createMessage('error', {
            subtitle: "Get categories error",
            title: "Error"
          }))
        }
      })
  }
);
export const selectCategory = createAction(
  "@@tf/file/selectCategory",
  (categoryId) => (dispatch, getState, httpClient) => {
    if (!categoryId) {
      return null
    }
    const categories = getState().file.categories
    const category = _.find(categories, c => c.id === categoryId)
    return category.id
  })
export const cleanFiles = createAction("@@tf/file/cleanFiles");
export const filterByConfidence = createAction(
  "@@tf/file/filterByConfidence",
  (target) => (dispatch, getState, httpClient) => {
    return {
      currentConfidenceFilter: target,
      filterField: "document_score"
    };
  }
);

export const filterByStatus = createAction(
  "@@tf/file/filterByStatus",
  (status) => (dispatch, getState, httpClient) => {
    if (status === 'All') {
      return {
        currentStatusFilter: status,
        statusField: undefined
      }
    }
    return {
      currentStatusFilter: status,
      statusField: "status"
    };
  }
);

export const filterByVia = createAction(
  "@@tf/file/filterByVia",
  (status) => (dispatch, getState, httpClient) => {
    if (status === 'All') {
      return {
        currentViaFilter: status,
        viaField: undefined
      }
    }
    return {
      currentViaFilter: status,
      viaField: "upload_via"
    };
  }
);

export const filterByDigiMethod = createAction(
  "@@tf/file/filterByDigiMethod",
  (method) => (dispatch, getState, httpClient) => {
    if (method === 'All') {
      return {
        currentDigiMethodFilter: method,
        filterField: undefined
      }
    }
    return {
      currentDigiMethodFilter: method,
      filterField: "category_id"
    };
  }
);

function getSortString(name, time) {
  let nameStr, timeStr, order;
  switch (name) {
    case -1:
      nameStr = "documentName"
      order = "ASC"
      break
    case 0:
      nameStr = undefined
      break
    case 1:
      nameStr = "documentName"
      order = "DESC"
      break
    default:
      nameStr = undefined
  }
  switch (time) {
    case -1:
      timeStr = "uploadedOn"
      order = "ASC"
      break
    case 0:
      timeStr = undefined
      break
    case 1:
      timeStr = "uploadedOn"
      order = "DESC"
      break
    default:
      timeStr = undefined
  }
  if (!nameStr && !timeStr) {
    //neither
    return [undefined, undefined]
  } else if (!!nameStr && !!timeStr) {
    //both
    return `${nameStr},${timeStr}`
  } else {
    //either
    if (nameStr) return [nameStr, order]
    if (timeStr) return [timeStr, order]
  }
}
function getRealStatusFilter(status) {
  let real;
  Object.keys(statusMap).forEach(s => {
    if (_.includes(statusMap[s], status)) {
      real = s;
    }
  })
  return real;
}

function getDefaultParams(file) {
  // console.log(file)
  const pagination = file.pagination
  const [sort, order] = getSortString(file.nameSort, file.updateTimeSort)
  let filterField = file.filterField
  let filterValue = null
  let statusField = file.statusField
  let statusFilter = null
  let viaField = file.viaField
  let emailFilter = null
  if (filterField === "document_score") {
    if (file.currentConfidenceFilter === 0) {
      filterField = null
    } else if (file.currentConfidenceFilter === -1) {
      filterField = "status.final_status.status"
      filterValue = -1
    }
    else {
      filterField = "document_score.table"
      filterValue = confidenceFilterMap[file.currentConfidenceFilter]
    }
  } else if (filterField === "status") {
    filterValue = getRealStatusFilter(file.currentStatusFilter)
  } else if (filterField === "category_id") {
    filterValue = file.currentDigiMethodFilter
  } else if (filterField === "category_id") {
    filterValue = file.currentDigiMethodFilter
  }

  if (statusField === "status") {
    statusFilter = getRealStatusFilter(file.currentStatusFilter)
  }

  if (viaField === "upload_via") {
    emailFilter = file.currentViaFilter
  }

  return {
    size: pagination.page_size,
    page: pagination.current_page,
    sortBy: sort,
    sortOrder: order,
    filter_field: filterField,
    filter_value: filterValue,
    email_type: emailFilter,
    status: statusFilter
  }
}

function mergeParamsWithDefault(old, now) {
  return Object.assign(old, now)
}



export const getFileDatas = createAction(
  "@@tf/file/getFileDatas",
  (p) => (
    dispatch,
    getState,
    httpClient
  ) => {
    // remove all the clients
    dispatch(clear())
    dispatch(startLoading());
    let pp = getDefaultParams(getState().file)
    if (!!p) {
      // params passed, use the passed value only
      pp = mergeParamsWithDefault(pp, p)
    }
    // console.log("params:")
    // console.log(pp)
    return httpClient
      .get(`${Constants.DATA_BASE_URL}/requests/list`, {
        headers: {
          need_loading: 'true',
        },
        params: {
          limit: (pp.page - 1) * pp.size + pp.size,
          start: (pp.page - 1) * pp.size,
          sortBy: pp.sortBy,
          email_type: pp.email_type,
          status: pp.status,
          sortOrder: pp.sortOrder,
        },
      })
      .then((res) => {
        dispatch(stopLoading());
        //start socket clients
        res.data['page_num'] = pp.page - 1;
        res.data['page_size'] = pp.size;
        const processedFiles = processFileData(res.data)
        dispatch(openClients(processedFiles.files))
        return processedFiles;
        // return res.data;
      })
      .catch((err) => {
        dispatch(stopLoading());
        // dispatch(createhttpMessage(err.response ? err.response : "", ""));
        if (err) {
          console.log(err.response.data.detail);
          dispatch(createMessage('error', {
            subtitle: `Get files error ${err.response.data.detail}`,
            title: "Error"
          }))
        }
      });
  }
);

export const getGeneralInfo = createAction(
  "@@tf/file/getGeneralInfo",
  () => (dispatch, getState, httpClient) => {
    // console.log("getGeneralInfo for category: " + categoryId);
    // dispatch(startLoading());
    return httpClient
     .get(`/documents/general-info`)
      //.get(`http://localhost:3000/general-info.json`)
      .then((res) => {
        // dispatch(stopLoading());
        // console.log(res.data);
        return res.data.data;
        // return res.data;
      })
      .catch((err) => {
        // dispatch(stopLoading());
        // dispatch(createhttpMessage(err.response ? err.response : "", ""));
        if (err) {
          dispatch(createMessage('error', {
            subtitle: "Get file metadatas error",
            title: "Error"
          }))
        }

      });
  }
);

export const startUploadFile = createAction(
  "@@tf/file/startUploadFile",
  (files, id) => (dispatch, getState) => {
    let uploadingFiles = _.cloneDeep(getState().file.uploadingFiles);
    // console.log("current uploadingFiles");
    // console.log(uploadingFiles);
    return [
      {
        id: id,
        final_status: "Uploading",
        document_original_name: files[0].name,
      },
      ...uploadingFiles,
    ];
  }
);

export const stopUploadFile = createAction(
  "@@tf/file/stopUploadFile",
  (id) => id
);

function verifyFileExtension(f) {
  const l = f.name.split('.')
  const ext = l[l.length - 1].toLowerCase();
  return _.includes(Constants.SUPPORTED_EXTENSIONS, ext)
}

export const uploadFile = createAction(
  "@@tf/file/uploadFile",
  (files) => (dispatch, getState, httpClient) => {
    // console.log(files);
    // check the size limit
    let exceedsMax = false;
    let fileExtensionSupported = false;
    files.forEach(f => {
      if (f.size > Constants.MAX_FILE_SIZE) {
        exceedsMax = true
      }
      fileExtensionSupported = verifyFileExtension(f)
    })
    if (exceedsMax) {
      dispatch(clearUploadRequest())
      dispatch(createMessage('error', {
        subtitle: "File upload error: Max file size limit exceeded: " + Constants.MAX_FILE_SIZE_MB + "Mb",
        title: "Error"
      }))
      return
    }
    if (!fileExtensionSupported) {
      dispatch(clearUploadRequest())
      dispatch(createMessage('error', {
        subtitle: "File upload error: File extension not supported. Supported extensions: " + _.join(Constants.SUPPORTED_EXTENSIONS, ","),
        title: "Error"
      }))
      return
    }

    dispatch(createLoading());
    console.log('step 1');
    //generate unique id for the file
    const id = moment().valueOf().toString();
    dispatch(startUploadFile(files, id));
    const formData = new FormData();
    // formData.append("file", files[0].src.file);
    formData.append("uploaded_file", files[0]);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    const categoryId = getState().file.selectedCategoryId;
    // return true;
    return httpClient
      .post(`${Constants.DATA_BASE_URL}/documents/new`, formData, config)
      .then((res) => {
        dispatch(closeLoading());
        dispatch(stopUploadFile(id));
        dispatch(createMessage('success', {
          subtitle: "File upload success",
          title: "Success"
        }))
        //fix #10
        //dispatch(getGeneralInfo(categoryId))
        // Required response from backend
        let obj = {
          documentId: 123,
          documentName: files[0]? files[0].name : "",
          requestId: 123,
          reviewStatus: "Waiting",
          status: "Waiting",
          uploadedBy: "ci-demo",
          uploadedOn: (new Date()).toUTCString(),
          via: "UI",
        }
        const processedFile = processSingleFile(obj)
        // dispatch(addOneClient(processedFile))
        //return processedFile
         return processFileData(obj)
      })
      .catch((err) => {
        console.log(err)
        dispatch(stopLoading());
        dispatch(stopUploadFile(id));
        // dispatch(createhttpMessage(err.response ? err.response : "", ""));
        if (err) {
          dispatch(createMessage('error', {
            subtitle: "File upload error: " + err.msg,
            title: "Error"
          }))
        }

      });
  }
);

export const uploadRequest = createAction("@@tf/file/uploadRequest");

export const clearUploadRequest = createAction("@@tf/file/clearUploadRequest");

function getNextSortNumber(old) {
  if (old === -1) {
    return 1
  } else if (old === 0) {
    return -1
  } else {
    return 0
  }
}

export const updateSort = createAction(
  "@@tf/file/updateSort",
  (target) => (dispatch, getState, httpClient) => {
    if (target === "name") {
      let old = getState().file.nameSort;
      let now = getNextSortNumber(old)
      return {
        nameSort: now,
        updateTimeSort: 0
      }
    } else {
      let old = getState().file.updateTimeSort;
      let now = getNextSortNumber(old)
      return {
        nameSort: 0,
        updateTimeSort: now
      }
    }
  }
);

export const nameSort = createAction(
  "@@tf/file/nameSort",
  () => (dispatch, getState, httpClient) => {
    dispatch(updateSort("name"))
    dispatch(getFileDatas())
  }
);

export const timeSort = createAction("@@tf/file/timeSort",
  () => (dispatch, getState, httpClient) => {
    dispatch(updateSort("time"))
    dispatch(getFileDatas())
  }
);

export const stopLoading = createAction("@@tf/file/stopLoading");

export const startLoading = createAction("@@tf/file/startLoading");

export const updatePagination = createAction("@@tf/file/updatePagination",
  (p) => (dispatch, getState, httpClient) => {
    const currentPagination = getState().file.pagination
    currentPagination.current_page = p.page
    currentPagination.page_size = p.size
    return currentPagination
  }
)

export const onPaginationChange = createAction("@@tf/file/onPaginationChange",
  (p) => (dispatch, getState, httpClient) => {
    dispatch(updatePagination(p))
    dispatch(getFileDatas())
  }
)

export const updateSearchKeyword = createAction("@@tf/file/updateSearchKeyword",
  (keyword) => (dispatch, getState, httpClient) => {
    return keyword
  }
)

export const searchDocs = createAction("@@tf/file/searchDocs",
  (keyword) => (dispatch, getState, httpClient) => {
    dispatch(updateSearchKeyword(keyword))
    dispatch(getFileDatas())
  }
)

export const onBatchDeleteFile = createAction("@@tf/file/deleteFiles",
  (rows) => (dispatch, getState, httpClient) => {

    const files = getState().file.files
    const idsToDelete = _.filter(files, f => {
      // find in rows
      let file = _.find(rows, r => r.id === f.id)
      return file.isSelected
    }).map(o => o.id)
    // console.log(idsToDelete)
    let ids = idsToDelete.join(',')
    //delete
    httpClient
      .delete(`/documents`, { params: { ids } })
      .then((res) => {
        dispatch(closeModal())
        dispatch(createMessage('success', {
          subtitle: "Delete file successful",
          title: "Deleted file"
        }))
        dispatch(getFileDatas());
        dispatch(getGeneralInfo())
      })
      .catch((err) => {
        dispatch(closeModal())
        if (err) {
          dispatch(createMessage('error', { subtitle: err.toString(), title: "Delete file failed" }));
        }
      });
  }
)

export const batchDownloadFile = createAction("@@tf/file/batchDownloadFile",
  (rows) => (dispatch, getState, httpClient) => {

    const files = getState().file.files
    const idsToDownload = _.filter(files, f => {
      // find in rows
      let file = _.find(rows, r => r.id === f.id)
      return file.isSelected
    }).map(o => o.id)
    // console.log(idsToDownload)
    let ids = idsToDownload.join(',')
    //download
    FileUtil.openNewTab(`${Constants.BASE_URL}/documents/download?ids=${ids}`);

  }
)

export const exportAll = createAction("@@tf/file/exportAll",
  (rows) => (dispatch, getState, httpClient) => {
    const files = getState().file.files
    const idsToDownload = _.filter(files, f => {
      // find in rows
      let file = _.find(rows, r => r.id === f.id)
      return file.isSelected
    }).map(o => o.id)
    // console.log(idsToDownload)
    let ids = idsToDownload.join(',')
    //download
    FileUtil.openNewTab(`${Constants.BASE_URL}/documents/export?ids=${ids}`);
  }
)

export const singalDownloadFile = createAction("@@tf/file/singalDownloadFile",
  (id) => (dispatch, getState, httpClient) => {
    // FileUtil.openNewTab(`${Constants.BASE_URL}/documents/download?ids=${id}`);
    // dispatch(createLoading());
    let {pdfPath} = getState().table;
    if(pdfPath && pdfPath != null && pdfPath != ""){

      let minioClient = initializeMinioClient();
      getPresignedUrl(
        minioClient,
        Constants.Minio_Bucket_Name,
        pdfPath,
      ).then(presignedUrl=>{
        try{
          let iframe = document.createElement("iframe");
          iframe.src = presignedUrl;
          iframe.style.display = "none";
          document.body.appendChild(iframe);
          dispatch(createMessage('info', {
            subtitle: "Starting the download",
            title: "Info"
          }))
        } catch(err){
          // dispatch(closeLoading());
          console.log(err);
          dispatch(createMessage('error', {
            subtitle: "File not found",
            title: "Error"
          }))
        }
      }).catch(err=>{
        // dispatch(closeLoading());
        dispatch(createMessage('error', {
          subtitle: "Unable to get path",
          title: "Error"
        }))
      })      
    }
  }
)



export const updateSingleFile = createAction("@@tf/file/updateSingleFile",
  (id) => (dispatch, getState, httpClient) => {
    // console.log("update single file, ", id)
    dispatch(getFileDatas())
  }
)
// Adding json data for Local 

export const getVersions = createAction("@@tf/file/getVersions",
  () => (dispatch, getState, httpClient) => {
    // debugger
    return httpClient
       .get(`/version`, {
      //.get(`http://localhost:3000/versions.json`, {
        headers: {
          need_loading: 'false'
        }
      })
      .then((res) => {
        console.log("invoice 3 data", res.data.data)
        return res.data.data;

      }
      )
      .catch((err) => {
        // dispatch(createhttpMessage(err.response ? err.response : "", ""));
        if (err) {
          dispatch(createMessage('error', {
            subtitle: "Get versions error",
            title: "Error"
          }))
        }
      });
  }
)

export const getEmails = createAction("@@tf/file/getEmails",
  (id) => (dispatch, getState, httpClient) => {
    return httpClient
      .get(`${Constants.DATA_BASE_URL}/email/${id}`)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        if (err) {
          dispatch(createMessage('error', {
            subtitle: "Get versions error",
            title: "Error"
          }))
        }
      });
  })

export const filesReducer = handleActions(
  {
    [getEmails]: (state, { payload: body }) => {
      return {
        ...state,
        emails: body
      }
    },
    [cleanFiles]: (state) => {
      return {
        ...state,
        files: [],
      };
    },
    [filterByConfidence]: (state, { payload: body }) => {
      let pagination = state.pagination;
      if (body.filterField !== state.filterField || body.currentConfidenceFilter !== state.currentConfidenceFilter) {
        pagination.current_page = 1
      }
      return {
        ...state,
        currentConfidenceFilter: body.currentConfidenceFilter,
        currentDigiMethodFilter: "All",
        currentStatusFilter: "All",
        filterField: body.filterField,
        pagination: pagination
      };
    },
    [filterByStatus]: (state, { payload: body }) => {
      let pagination = state.pagination;
      if (body.statusField !== state.statusField || body.currentStatusFilter !== state.currentStatusFilter) {
        pagination.current_page = 1
      }
      return {
        ...state,
        currentStatusFilter: body.currentStatusFilter,
        // currentDigiMethodFilter: "All",
        // currentConfidenceFilter: 0,
        statusField: body.statusField,
        pagination: pagination
      };
    },
    [filterByVia]: (state, { payload: body }) => {
      let pagination = state.pagination;
      if (body.viaField !== state.viaField || body.currentViaFilter !== state.currentViaFilter) {
        pagination.current_page = 1
      }
      return {
        ...state,
        currentViaFilter: body.currentViaFilter,
        // currentDigiMethodFilter: "All",
        // currentConfidenceFilter: 0,
        viaField: body.viaField,
        pagination: pagination
      };
    },
    [filterByDigiMethod]: (state, { payload: body }) => {
      let pagination = state.pagination;
      if (body.filterField !== state.filterField || body.currentDigiMethodFilter !== state.currentDigiMethodFilter) {
        pagination.current_page = 1
      }
      return {
        ...state,
        currentDigiMethodFilter: body.currentDigiMethodFilter,
        currentStatusFilter: "All",
        currentConfidenceFilter: 0,
        filterField: body.filterField,
        pagination: pagination
      };
    },
    [getFileDatas]: (state, { payload: data }) => {
      return {
        ...state,
        files: data ? data.files : state.files,
        pagination: data ? data.pagination : state.pagination,
      };
    },
    [startUploadFile]: (state, { payload: files }) => {
      return {
        ...state,
        uploadingFiles: files,
        openUploadDialog: false
      };
    },
    [stopUploadFile]: (state, { payload: id }) => {
      return {
        ...state,
        uploadingFiles: _.reject(state.uploadingFiles, (o) => o.id === id),
      };
    },
    [uploadFile]: (state, { payload: file }) => {
      console.log("file=========>>>>",file)
      return {
        ...state,
        files: file ? [file, ...state.files] : state.files,
      };
    },
    [startLoading]: (state) => {
      return {
        ...state,
        isloading: true,
      };
    },
    [stopLoading]: (state) => {
      return {
        ...state,
        isloading: false,
      };
    },
    [getGeneralInfo]: (state, { payload: info }) => {
      return {
        ...state,
        generalInfo: info ? info : state.generalInfo,
      };
    },
    [nameSort]: (state) => {
      return {
        ...state,
      };
    },
    [timeSort]: (state) => {
      return {
        ...state,
      };
    },
    [updateSort]: (state, { payload: updated }) => {
      return {
        ...state,
        updateTimeSort: updated.updateTimeSort,
        nameSort: updated.nameSort,
        pagination: { ...state.pagination, current_page: 1 }
      };
    },
    [updatePagination]: (state, { payload: pagination }) => {
      return {
        ...state,
        pagination: pagination
      };
    },
    [onPaginationChange]: (state) => {
      return {
        ...state,
      };
    },
    [updateSearchKeyword]: (state, { payload: keyword }) => {
      return {
        ...state,
        searchKeyword: keyword
      };
    },
    [searchDocs]: (state) => {
      return {
        ...state,
      };
    },
    [onBatchDeleteFile]: (state) => {
      return {
        ...state,
      };
    },
    [batchDownloadFile]: (state) => {
      return {
        ...state,
      }
    },
    [exportAll]: (state) => {
      return {
        ...state,
      }
    },
    [getCategories]: (state, { payload: data }) => {
      return {
        ...state,
        categories: data,
        selectedCategoryId: !!data && data.length > 0 ? data[0].id : null
      };
    },
    [selectCategory]: (state, { payload: data }) => {
      return {
        ...state,
        selectedCategoryId: data
      };
    },
    [uploadRequest]: (state) => {
      return {
        ...state,
        openUploadDialog: true
      };
    },
    [clearUploadRequest]: (state) => {
      return {
        ...state,
        openUploadDialog: false
      };
    },
    [getVersions]: (state, { payload: data }) => {
      return {
        ...state,
        versions: data
      };
    },
  },
  initialState
);

export default filesReducer;
