import { createAction, handleActions } from "redux-actions";
import { createMessage } from "./message";
import { closeModal } from "./modal";
import * as _ from "lodash";
import * as moment from "moment-timezone";
const initialState = {
  users: [],
  currentUser: null,
  pagination: {
    current_page: 1,
    offset: 0,
    page_size: 10,
    total_number: 0,
  },
  nameSort: 0,
  createTimeSort: -1,
  addUserFlag: false,
  editRoleFlag: false,
  sort: {
    display_name: 0,
    email: 0,
    role: 0,
    created_at: -1,
  },
  filterField: undefined,
  filterValue: undefined,
  userEdited: {},
};

function getSortString(sort) {
  let sortField = undefined,
    sortOrder = undefined,
    zeroes = 0;
  Object.keys(sort).forEach((s) => {
    if (sort[s] !== 0) {
      sortField = s;
      sortOrder = sort[s];
    } else {
      zeroes += 1;
    }
  });
  if (sortField !== undefined && sortOrder !== undefined && zeroes === 3) {
    // found the sort values
    let orderSign;
    if (sortOrder === -1) {
      orderSign = "-";
    } else if (sortOrder === 1) {
      orderSign = "+";
    }
    return orderSign + sortField;
  }
}

function getDefaultParams(user) {
  // console.log(file)
  const pagination = user.pagination;
  const sort = getSortString(user.sort);
  return {
    size: pagination.page_size,
    page: pagination.current_page,
    sortBy: sort,
    filter_field: user.filterField,
    filter_value: user.filterValue,
  };
}

function mergeParamsWithDefault(old, now) {
  return Object.assign(old, now);
}

const processSingleUser = (u) => {
  let date1 = moment.tz(u.created_at, "YYYY-MM-DD HH:mm:ss", "UTC");
  let date2 = moment.tz(u.updated_at, "YYYY-MM-DD HH:mm:ss", "UTC");
  u.created_at = date1.tz(moment.tz.guess()).format("DD MMMM, YYYY, hh:mm a");
  u.updated_at = date2.tz(moment.tz.guess()).format("DD MMMM, YYYY, hh:mm a");
  return u;
};

const processUsers = (users) => {
  if (!users || users.length === 0) {
    return [];
  }

  users.forEach((u) => processSingleUser(u));
  return users;
};

export const getCurrentUser = createAction(
  "@@tf/user/getCurrentUser",
  () => (dispatch, getState, httpClient) => {
    return httpClient
      .get(`/auth/users/current`)
      .then((res) => {
        return res.data.data;
      })
      .catch((err) => {
        if (err) {
          dispatch(
            createMessage("error", {
              subtitle: "Get current user error",
              title: "Error",
            })
          );
        }
      });
  }
);

export const startLoading = createAction("@@tf/user/startLoading");

export const getUsers = createAction(
  "@@tf/user/getUsers",
  (p) => (dispatch, getState, httpClient) => {
    dispatch(startLoading());
    let pp = getDefaultParams(getState().user);
    if (!!p) {
      // params passed, use the passed value only
      pp = mergeParamsWithDefault(pp, p);
    }
    return httpClient
      .get(`/auth/users`, {
        headers: {
          need_loading: "true",
        },
        params: {
          page_size: pp.size,
          sort_by: pp.sortBy,
          filter_field: pp.filter_field,
          filter_value: pp.filter_value,
          page_no: pp.page - 1,
        },
      })
      .then((res) => {
        let pagination = res.data.data.pagination;
        pagination.total_number = parseInt(pagination.total_number);
        pagination.current_page = pagination.current_page + 1;
        return {
          pagination: pagination,
          users: processUsers(res.data.data.users),
        };
      })
      .catch((err) => {
        if (err) {
          dispatch(
            createMessage("error", {
              subtitle: "Get users error",
              title: "Error",
            })
          );
        }
        return null;
      });
  }
);

export const deleteUsers = createAction(
  "@@tf/user/deleteUsers",
  (rows) => (dispatch, getState, httpClient) => {
    const users = getState().user.users;
    const idsToDelete = _.filter(users, (f) => {
      // find in rows
      let user = _.find(rows, (r) => r.id === f.id);
      return user.isSelected;
    }).map((o) => o.id);
    return httpClient
      .delete(`/auth/users?ids=${idsToDelete}`)
      .then((res) => {
        dispatch(closeModal());
        dispatch(
          createMessage("success", {
            subtitle: "Delete users successful",
            title: "Deleted users",
          })
        );
        dispatch(getUsers());
        return res.data.data;
      })
      .catch((err) => {
        if (err) {
          dispatch(
            createMessage("error", {
              subtitle: "Delete users error",
              title: "Error",
            })
          );
        }
      });
  }
);

export const addUserRequest = createAction("@@tf/user/addUserRequest");
export const cancelAddUserRequest = createAction(
  "@@tf/user/cancelAddUserRequest"
);

export const editRoleRequest = createAction(
  "@@tf/user/editRoleRequest",
  (userId) => (dispatch, getState) => {
    const users = getState().user.users;
    const user = _.find(users, (user) => user.id === userId);
    return user;
  }
);
export const cancelEditRoleRequest = createAction(
  "@@tf/user/cancelEditRoleRequest"
);

export const editRole = createAction(
  "@@tf/user/editRole",
  (id, role) => (dispatch, getState, httpClient) => {
    let user = {
      id,
      role,
    };
    return httpClient
      .put(`/auth/users/${id}/roles`, user)
      .then((res) => {
        dispatch(
          createMessage("success", {
            subtitle: `Role changed successfully`,
            title: "Success",
          })
        );
        dispatch(getUsers());
      })
      .catch((err) => {
        if (err) {
          dispatch(
            createMessage("error", {
              subtitle: "Edit role error: " + err.msg,
              title: "Error",
            })
          );
        }
      });
  }
);

export const addUser = createAction(
  "@@tf/user/addUser",
  (user) => (dispatch, getState, httpClient) => {
    return httpClient
      .post(`/auth/users`, user)
      .then((res) => {
        return processSingleUser(res.data.data);
      })
      .catch((err) => {
        if (err) {
          dispatch(
            createMessage("error", {
              subtitle: "Add user error: " + err.msg,
              title: "Error",
            })
          );
        }
      });
  }
);

export const updatePagination = createAction(
  "@@tf/user/updatePagination",
  (p) => (dispatch, getState, httpClient) => {
    const currentPagination = getState().user.pagination;
    currentPagination.current_page = p.page;
    currentPagination.page_size = p.size;
    return currentPagination;
  }
);

export const updateSort = createAction(
  "@@tf/user/updateSort",
  (key) => (dispatch, getState, httpClient) => {
    const sort = getState().user.sort;
    if (!sort.hasOwnProperty(key)) {
      return sort;
    }
    let newOrder = getNextSortNumber(sort[key]);
    Object.keys(sort).forEach((s) => {
      sort[s] = 0;
    });
    sort[key] = newOrder;
    return sort;
  }
);
export const updateFilter = createAction(
  "@@tf/user/updateFilter",
  (field, value) => (dispatch, getState, httpClient) => {
    if(value === "All") {
      return {field: null, value: null};
    }else {
      return { field, value: value.toLowerCase() };
    }
    
  }
);

function getNextSortNumber(old) {
  if (old === -1) {
    return 1;
  } else if (old === 0) {
    return -1;
  } else {
    return 0;
  }
}

export const onSortClick = createAction(
  "@@tf/user/onSortClick",
  (key) => (dispatch, getState, httpClient) => {
    // get current sort
    dispatch(updateSort(key));
    dispatch(getUsers());
  }
);

export const onFilterClick = createAction(
  "@@tf/user/onFilterClick",
  (field, value) => (dispatch, getState, httpClient) => {
    // get current sort
    dispatch(updateFilter(field, value));
    dispatch(getUsers());
  }
);

export const onPaginationChange = createAction(
  "@@tf/user/onPaginationChange",
  (p) => (dispatch, getState, httpClient) => {
    dispatch(updatePagination(p));
    dispatch(getUsers());
  }
);

export const UserReducer = handleActions(
  {
    [getCurrentUser]: (state, { payload: user }) => {
      // console.log(user)
      return {
        ...state,
        currentUser: user,
      };
    },
    [getUsers]: (state, { payload: data }) => {
      return {
        ...state,
        users: data && data.users ? data.users : state.users,
        pagination:
          data && data.pagination ? data.pagination : state.pagination,
      };
    },

    [deleteUsers]: (state) => {
      return {
        ...state,
      };
    },

    [addUserRequest]: (state) => {
      // console.log("add user request")
      return {
        ...state,
        addUserFlag: true,
      };
    },
    [cancelAddUserRequest]: (state) => {
      // console.log("cancel add user")
      return {
        ...state,
        addUserFlag: false,
      };
    },
    [editRole]: (state) => {
      // console.log("cancel add user")
      return {
        ...state,
        editRoleFlag: false,
      };
    },
    [editRoleRequest]: (state, { payload: data }) => {
      // console.log("add user request")
      return {
        ...state,
        editRoleFlag: true,
        userEdited: data,
      };
    },
    [cancelEditRoleRequest]: (state) => {
      // console.log("cancel add user")
      return {
        ...state,
        editRoleFlag: false,
        userEdited: {},
      };
    },

    [addUser]: (state, { payload: user }) => {
      return {
        ...state,
        users: user ? [user, ...state.users] : state.users,
        addUserFlag: false,
      };
    },
    [updatePagination]: (state, { payload: pagination }) => {
      console.log(pagination);
      return {
        ...state,
        pagination: pagination,
      };
    },
    [startLoading]: (state) => {
      return {
        ...state,
        isloading: true,
      };
    },
    [updateSort]: (state, { payload: sort }) => {
      return {
        ...state,
        sort: sort,
        pagination: {...state.pagination, current_page: 1}
      };
    },
    [updateFilter]: (state, { payload: data }) => {
      return {
        ...state,
        filterField: data.field,
        filterValue: data.value,
        pagination: {...state.pagination, current_page: 1}
      };
    },
  },
  initialState
);
export default UserReducer;
