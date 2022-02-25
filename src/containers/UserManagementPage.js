/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import Dashboard from '../components/Dashboard';
import UserManagementTable from '../components/UserManagementTable';
import { getUsers, deleteUsers, addUser, onPaginationChange, editRole,
  addUserRequest,cancelAddUserRequest, onSortClick, onFilterClick, editRoleRequest, cancelEditRoleRequest } from '../redux/modules/user';
import { createModal } from '../redux/modules/modal';
import { createMessage } from '../redux/modules/message';

class UserManagementPageContainer extends Component {
    static propTypes = {
      messages: PropTypes.any,
      // onPaginationChange: PropTypes.func,
    }


    componentDidMount() {
      if(!this.props.currentUser || this.props.currentUser.role !== "admin" ) {
        return;
      }
      this.props.getUsers();

    }

    onUserPaginationChange(event) {
      this.props.onPaginationChange({page: event.page, size: event.pageSize});
    }

    getUsersStringFromRows(rows){
      let string = "";
      rows.forEach((row) => {
        if(row.isSelected) {
          let name, email;
          row.cells.forEach(cell=> {
            if(cell.id.split(":")[1] === "email") {
              email = cell.value
            }
            if(cell.id.split(":")[1] === "display_name"){
              name = cell.value
            }
          })
          name = !name ? "Unknown" : name;
          email = !email ? "Unknown Email" : email;
          string += `${name}(${email}), `
        }
      })
      return string.slice(0,-2);
    }

    confirmBatchDelete(rows) {
      const usersString = this.getUsersStringFromRows(rows);
      this.props.createModal({
        danger: true,
        heading: 'Confirm Delete Users',
        title: 'Confirm',
        text: 'Please confirm you want to delete selected users. Once deleted, all the data related to the users will be removed. Users to be deleted: ' + usersString,
        button: "Delete",
      }, this.props.deleteUsers, rows)
    }

    render() {
      // console.log(this.props.categories)
      return (
        // <Dashboard
        //   files={this.props.files}
        //   createMessage={this.handleCreateMessage.bind(this)}/>
        <UserManagementTable
          users={this.props.users}
          pagination={this.props.pagination}
          getUsers={this.props.getUsers.bind(this)}
          deleteUsers={this.confirmBatchDelete.bind(this)}
          addUser={this.props.addUser.bind(this)}
          onUserPaginationChange={this.onUserPaginationChange.bind(this)}
          addUserRequest={this.props.addUserRequest.bind(this)}
          cancelAddUserRequest={this.props.cancelAddUserRequest.bind(this)}
          addUserFlag={this.props.addUserFlag}
          createMessage={this.props.createMessage.bind(this)}
          onSortClick={this.props.onSortClick.bind(this)}
          sort={this.props.sort}
          onFilterClick={this.props.onFilterClick.bind(this)}
          history={this.props.history}
          currentUser={this.props.currentUser}
          editRoleRequest={this.props.editRoleRequest.bind(this)}
          cancelEditRoleRequest={this.props.cancelEditRoleRequest.bind(this)}
          editRoleFlag={this.props.editRoleFlag}
          editRole={this.props.editRole.bind(this)}
          userEdited={this.props.userEdited}
        />
      );
    }
}

const mapStateToProps = (state) => {
  return {
    ...state.user
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getUsers: () => {
      dispatch(getUsers());
    },
    deleteUsers: (ids) => {
      dispatch(deleteUsers(ids));
    },
    addUser: (user) => {
      dispatch(addUser(user));
    },
    addUserRequest: () => {
      dispatch(addUserRequest());
    },
    cancelAddUserRequest: () => {
      dispatch(cancelAddUserRequest());
    },
    onPaginationChange: (page,size) => {
      dispatch(onPaginationChange(page,size));
    },
    createMessage: (kind,message) => {
      dispatch(createMessage(kind,message));
    },
    onSortClick: (key) => {
      dispatch(onSortClick(key));
    },
    onFilterClick: (field, value) => {
      dispatch(onFilterClick(field, value));
    },
    createModal: (modal, callback, data) => {
      dispatch(createModal(modal,callback,data))
    },
    editRoleRequest: (id) => {
      dispatch(editRoleRequest(id))
    },
    cancelEditRoleRequest: () => {
      dispatch(cancelEditRoleRequest())
    },
    editRole: (id, role) => {
      dispatch(editRole(id, role))
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserManagementPageContainer);
