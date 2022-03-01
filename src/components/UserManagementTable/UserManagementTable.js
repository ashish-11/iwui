/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from "react";
import * as _ from "lodash";
// import Add16 from "@carbon/icons-react/lib/add/16";
import {
  Button,
  Modal,
  OverflowMenu,
  OverflowMenuItem,
  DataTable,
  TableBatchActions,
  Pagination,
  Loading,
  TextInput,
  Form,
  RadioButton,
  RadioButtonGroup,
  FormGroup,
} from "carbon-components-react";
import TrashCan32 from "@carbon/icons-react/lib/trash-can/32";
import ArrowUp20 from "@carbon/icons-react/lib/arrow--up/20";
import ArrowsVertical20 from "@carbon/icons-react/lib/arrows--vertical/20";
import ArrowDown20 from "@carbon/icons-react/lib/arrow--down/20";
import CaretDown16 from "@carbon/icons-react/lib/caret--down/16";
import UserRole16 from "@carbon/icons-react/lib/user--role/16";
import PropTypes from "prop-types";
import Utils from "../../util/utils";
const {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableHeader,
  TableToolbar,
  TableToolbarContent,
  TableBatchAction,
  TableSelectAll,
  TableSelectRow,
} = DataTable;
const headers = [
  {
    header: "Email",
    key: "email",
    isSortable: true,
    isFilterable: false,
    width: "25%",
  },
  {
    header: "Full Name",
    key: "display_name",
    isSortable: true,
    isFilterable: false,
    width: "25%",
  },
  {
    header: "Role",
    key: "role",
    isSortable: false,
    isFilterable: true,
    filterFields: ["All","Admin", "User"],
    width: "10%",
  },
  {
    header: "Registered At",
    key: "created_at",
    isSortable: true,
    isFilterable: false,
    width: "20%",
  },
  {
    header: "Actions",
    key: "actions",
    isSortable: false,
    isFilterable: false,
    width: "20%",
  },
];
const defaultState = {
  newUserEmail: "",
  newUserRole: "user",
  newUserEmailValid: false,
  editUserRole: "user",
  editUserId: null,
  userEdited: {},
};
class UserManagementTable extends Component {
  // const { } = props;

  // const clientRef;
  constructor(props) {
    super(props);
    this.state = defaultState;
  }
  static propTypes = {
    files: PropTypes.any,
  };
  cancelBatchActions(event) {}

  onSortClick(event) {
    this.props.onSortClick(event.currentTarget.id);
  }

  onFilterClick(event) {
    this.props.onFilterClick(event.currentTarget.id, event.target.innerText);
  }

  showSort(key, sortable) {
    const { sort } = this.props;
    if (!sort || !sort.hasOwnProperty(key)) {
      return null;
    }
    const sortOrder = sort[key];
    return sortable ? (
      <React.Fragment>
        {(() => {
          switch (sortOrder) {
            case 1:
              return (
                <div
                  className="user_management__sort_button"
                  onClick={this.onSortClick.bind(this)}
                  id={key}
                >
                  <ArrowUp20 />
                </div>
              );
            case 0:
              return (
                <div
                  className="user_management__sort_button"
                  onClick={this.onSortClick.bind(this)}
                  id={key}
                >
                  <ArrowsVertical20 />
                </div>
              );
            case -1:
              return (
                <div
                  className="user_management__sort_button"
                  onClick={this.onSortClick.bind(this)}
                  id={key}
                >
                  <ArrowDown20 />
                </div>
              );
            default:
              return null;
          }
        })()}
      </React.Fragment>
    ) : null;
  }

  showFilters(header) {
    if (!header || !header.isFilterable) {
      return null;
    }
    return (
      <React.Fragment>
        <OverflowMenu
          flipped={true}
          className="user_management__filter-menu"
          renderIcon={CaretDown16}
        >
          {header.filterFields.map((f) => {
            return (
              <OverflowMenuItem
                onClick={this.onFilterClick.bind(this)}
                itemText={f}
                id={header.key}
                key={f}
              />
            );
          })}
        </OverflowMenu>
      </React.Fragment>
    );
  }

  onRequestRoleEdit(event) {
    const userId = event.currentTarget.id;
    const { users } = this.props;
    const user = _.find(users, (user) => user.id === userId);
    this.setState({
      editUserId: userId,
      userEdited: user,
      editUserRole: user.role,
    });
    this.props.editRoleRequest(userId);
  }

  renderTableRow(row, getSelectionProps) {
    // get the file using id
    // console.log(row)
    // console.log(uploadingFiles)
    // console.log(files)
    return (
      <TableRow key={row.id}>
        <TableSelectRow radio={false} {...getSelectionProps({ row })} />
        {row.cells.map((cell) => {
          switch (cell.id.split(":")[1]) {
            case "email":
              return <TableCell key={cell.id}>{cell.value}</TableCell>;
            case "display_name":
              return <TableCell key={cell.id}>{cell.value}</TableCell>;
            case "role":
              return <TableCell key={cell.id}>{cell.value}</TableCell>;
            case "created_at":
              return <TableCell key={cell.id}>{cell.value}</TableCell>;
            case "actions": 
              return (
                <TableCell key={cell.id}>
                  <div className="user_management__center">
                    <div
                      className="user_management__edit_role"
                      onClick={this.onRequestRoleEdit.bind(this)}
                      title={"Change User Role"}
                      id={row.id}
                    >
                      <UserRole16 />
                    </div>
                  </div>
                </TableCell>
              );
            default:
              return <TableCell key={cell.id}>{cell.value}</TableCell>;
          }
        })}
      </TableRow>
    );
  }

  onConfirmAddUser(event) {
    // check if everythin is valid
    if (!this.state.newUserEmailValid) {
      this.props.createMessage("error", {
        subtitle: "User input error: invalid Email Address",
        title: "Error",
      });
      return;
    }
    console.log(this.state.newUserRole)
    if (
      this.state.newUserRole !== "admin" &&
      this.state.newUserRole !== "user"
    ) {
      this.props.createMessage("error", {
        subtitle: "User input error: invalid User Role",
        title: "Error",
      });
      return;
    }
    this.props.addUser({
      email: this.state.newUserEmail,
      role: this.state.newUserRole.toLowerCase(),
    });
  }

  onConfirmEditRole(event) {
    // check if everythin is valid
    this.props.editRole(this.state.editUserId, this.state.editUserRole);
  }

  onNewUserEmailChange(event) {
    this.setState({
      newUserEmail: event.target.value,
      newUserEmailValid: Utils.emailIsValid(event.target.value),
    });
  }

  addUserRequest(event) {
    this.setState(defaultState);
    this.props.addUserRequest();
  }

  render() {
    const {
      users,
      onUserPaginationChange,
      pagination,
      addUserFlag,
      currentUser,
      editRoleFlag,
    } = this.props;
    // console.log(currentUser)
    if (!currentUser || currentUser.role !== "admin") {
      this.props.history.push("/dashboard");
      return null;
    }
    return currentUser && currentUser.role === "admin" ? (
      <div className="bx--grid bx--grid--full-width">
        <div className="bx--row user_management__banner">
          <div className="bx--col-lg-12">
            <h1 className="user_management__heading">User Management</h1>
          </div>
        </div>
        <DataTable
          size={"normal"}
          headers={headers}
          locale="en"
          // isSortable={true}
          rows={users}
          render={({
            rows,
            headers,
            getHeaderProps,
            getSelectionProps,
            getBatchActionProps,
          }) => (
            <TableContainer>
              <TableToolbar>
                <TableBatchActions
                  onCancel={this.cancelBatchActions.bind(this)}
                  {...getBatchActionProps()}
                >
                  {/* inside of you batch ac'tinos, you can include selectedRows */}
                  <TableBatchAction
                    renderIcon={TrashCan32}
                    onClick={(event) => this.props.deleteUsers(rows)}
                  >
                    Delete
                  </TableBatchAction>
                </TableBatchActions>
                {/* pass in `onInputChange` change here to make filtering work */}
                <TableToolbarContent className="dashboard__search_bar">
                  {/* <TableToolbarSearch
                  placeHolderText="Search for documents"
                  persistent={true}
                  onChange={(event) => toolBarSearch(event.target.value)}
                /> */}
                  <Button onClick={this.addUserRequest.bind(this)}>
                    Add User
                  </Button>
                </TableToolbarContent>
              </TableToolbar>
              <Table style={{ tableLayout: "fixed" }}>
                <TableHead className="dashboard__header">
                  <TableRow>
                    <TableSelectAll {...getSelectionProps()} />
                    {headers.map((header) => {
                      switch (header.key) {
                        case "actions":
                          return (
                            <TableHeader
                              className="user_management__center"
                              {...getHeaderProps({ header })}
                              // isSortable={header.isSortable}
                            >
                              <div className="user_management__header_container">
                                <div>{header.header}</div>
                              </div>
                            </TableHeader>
                          );
                        default:
                          return (
                            <TableHeader
                              className="user_management__sort_header"
                              style={{ width: header.width }}
                              {...getHeaderProps({ header })}
                              // isSortable={header.isSortable}
                            >
                              <div className="user_management__header_container">
                                <div>{header.header}</div>
                                {this.showSort(header.key, header.isSortable)}
                                {this.showFilters(header)}
                              </div>
                            </TableHeader>
                          );
                      }
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) =>
                    this.renderTableRow(row, getSelectionProps)
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        />
        <Pagination
          backwardText="Previous page"
          disabled={false}
          forwardText="Next page"
          isLastPage={false}
          // itemRangeText={(a ,b, c) => myItemRangeText(a,b,c)}
          // itemText={function noRefCheck(){}}
          itemsPerPageText="Documents per page:"
          onChange={(event) => onUserPaginationChange(event)}
          page={pagination.current_page}
          pageInputDisabled={false}
          pageNumberText="Page Number"
          // pageRangeText={(a, b) => myPageRangeText(a,b)}
          pageSize={pagination.page_size}
          pageSizes={[10, 20, 30, 40, 50]}
          // pageText={function noRefCheck(){}}
          pagesUnknown={false}
          totalItems={pagination.total_number}
        />
        <Modal
          danger={false}
          modalLabel={"Action"}
          modalHeading={"Register a new user"}
          primaryButtonText={"Confirm"}
          onRequestSubmit={this.onConfirmAddUser.bind(this)}
          open={addUserFlag}
          secondaryButtonText={"Cancel"}
          onRequestClose={this.props.cancelAddUserRequest.bind(this)}
          onSecondarySubmit={this.props.cancelAddUserRequest.bind(this)}
        >
          <Form>
            <FormGroup
              legendText={"Email Address"}
              style={{ marginBottom: "2rem" }}
            >
              <TextInput
                id={"new_user_email_input"}
                labelText={"Please input the user's email address"}
                onChange={this.onNewUserEmailChange.bind(this)}
                invalid={!this.state.newUserEmailValid}
                invalidText={"Please input a valid email address"}
                value={this.state.newUserEmail}
                autoComplete={"off"}
              />
            </FormGroup>

            <FormGroup legendText={"Please assign a role for this new user"}>
              <RadioButtonGroup
                defaultSelected="default-selected"
                legend="Group Legend"
                name="radio-button-group"
                valueSelected={"user"}
                onChange={(value) => this.setState({ newUserRole: value })}
              >
                <RadioButton id="radio-1" labelText="User" value="user" />
                <RadioButton id="radio-2" labelText="Admin" value="admin" />
              </RadioButtonGroup>
            </FormGroup>
          </Form>
        </Modal>
        <Modal
          danger={false}
          modalLabel={"Action"}
          modalHeading={"Edit User Role"}
          primaryButtonText={"Confirm"}
          onRequestSubmit={this.onConfirmEditRole.bind(this)}
          open={editRoleFlag}
          secondaryButtonText={"Cancel"}
          onRequestClose={this.props.cancelEditRoleRequest.bind(this)}
          onSecondarySubmit={this.props.cancelEditRoleRequest.bind(this)}
        >
          <Form>
            <FormGroup legendText={`Please assign a role for this user: ${this.state.userEdited.display_name}(${this.state.userEdited.email})`}>
              <RadioButtonGroup
                defaultSelected="default-selected"
                legend="Group Legend"
                name="radio-button-group-1"
                valueSelected={this.state.editUserRole}
                onChange={(value) => this.setState({ editUserRole: value })}
              >
                <RadioButton id="radio-3" labelText="User" value="user" />
                <RadioButton id="radio-4" labelText="Admin" value="admin" />
              </RadioButtonGroup>
            </FormGroup>
          </Form>
        </Modal>
      </div>
    ) : (
      <div className="bx--grid bx--grid--full-width">
        <div className="bx--row user_management__banner">
          <div className="bx--col-lg-12">
            <h1 className="user_management__heading">
              User is unauthorized to access this page
            </h1>
          </div>
        </div>
      </div>
    );
  }
}

export default UserManagementTable;
