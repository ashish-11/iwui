/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from "react";
import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
} from "carbon-components-react/es/components/UIShell";
import { OverflowMenu, OverflowMenuItem } from "carbon-components-react";
import UserAvatar16 from "@carbon/icons-react/lib/user--avatar/16";
import AppSwitcher16 from "@carbon/icons-react/lib/app-switcher/16";
import TokenUtil from "../../service/token";
import PropTypes from "prop-types";
import Tooltip from "rc-tooltip";
import Information20 from "@carbon/icons-react/lib/information/20";
import * as Constants from "../../service/constants";
class AppHeader extends Component {
  static propTypes = {
    versions: PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.state = {
      showList: false,
    };
  }

  componentDidMount() {
    window.addEventListener("mouseup", this.handleMouseUp, false);
    window.addEventListener("scroll", this.handleMouseSroll, false);
  }

  componentWillMount() {
    // if user has login
    if (TokenUtil.getAccessToken()) {
      this.props.getCurrentUser();
    }
  }

  handleMouseSroll = () => {
    this.setState({ showList: false });
  };

  handleMouseUp = (event) => {
    // console.log("evnet", event)
    // console.log("user info ", this.props.userInfo)
    // let adminResult =
    // event.target === findDOMNode(this.refs.refAdmin)
    // || (event.target.parentNode && event.target.parentNode === findDOMNode(this.refs.refAdmin));
    // let profileResult =
    // event.target === findDOMNode(this.refs.refProfile)
    // || (event.target.parentNode && event.target.parentNode === findDOMNode(this.refs.refProfile));
    // let logOutResult =
    // event.target === findDOMNode(this.refs.refLogout)
    // || (event.target.parentNode && event.target.parentNode === findDOMNode(this.refs.refLogout));
    // if(event.target.className==="bx--header__action"
    //   || (event.target.parentNode && event.target.parentNode.className==="bx--header__action")
    //   || (event.target.parentNode && event.target.parentNode.parentNode && event.target.parentNode.parentNode.className==="bx--header__action")) {
    //   this.setState({showList: !this.state.showList});
    // }else if(!adminResult && !profileResult && !logOutResult && this.state.showList) {
    //   this.setState({showList: false});
    // }
  };

  logOut(event) {
    event.stopPropagation();
    TokenUtil.clearTokens();
    this.setState({ showList: false });
    window.location.href = "/";
  }

  renderVersion(name, version) {
    return (
      <tr key={name}>
        <td>{name}</td>
        <td>{version}</td>
      </tr>
    );
  }

  render() {
    const { versions, currentUser } = this.props;
    // console.log(currentUser)
    return (
      <Header aria-label="APP Header">
        <SkipToContent />
        <HeaderName href="/#" prefix="IBM">
        Intelligent Workflow on Azure
        </HeaderName>
        <HeaderNavigation aria-label="APP Tutorial">
          <HeaderMenuItem href="/#/dashboard">Dashboard</HeaderMenuItem>
        </HeaderNavigation>
        <HeaderGlobalBar>
          {/* <HeaderGlobalAction aria-label="Search">
        <Search16 />
      </HeaderGlobalAction>
      <HeaderGlobalAction aria-label="Notifications">
        <NotificationNew16 />
      </HeaderGlobalAction> */}
          {/* <div className="appheader_tool_icon_withmenu">
            <Tooltip
              overlayClassName="appheader_showOverlay"
              animation="zoom"
              trigger="click"
              placement="bottomLeft"
              // align={'tr'}
              overlay={
                <React.Fragment>
                  <div className="appheader_tooltip_container">
                    <p>Service versions</p>
                    <table className="appheader__process_status_table">
                      <tbody>
                        <tr>
                          <td colSpan={2}>Services</td>
                        </tr>
                        <tr>
                          <td>ui</td>
                          <td>{Constants.VERSION}</td>
                        </tr>
                        {versions
                          ? versions.services
                            ? Object.keys(versions.services).map((t) =>
                                this.renderVersion(t, versions.services[t])
                              )
                            : null
                          : null}
                        <tr>
                          <td colSpan={2}>Engines</td>
                        </tr>
                        {versions
                          ? versions.external
                            ? Object.keys(versions.external).map((t) =>
                                this.renderVersion(t, versions.external[t])
                              )
                            : null
                          : null} */}
                        {/* <tr>
                            <td>Total</td>
                            <td>{documentDatas?documentDatas.processing_time?documentDatas.status_object.total: 0 : 0}</td>
                          </tr>
                          <tr>
                            <td>Pre-process</td>
                            <td>{documentDatas?documentDatas.status_object?documentDatas.status_object.pre_process: 0: 0}</td>
                          </tr>
                          <tr>
                            <td>OCR</td>
                            <td>{documentDatas?documentDatas.status_object?documentDatas.status_object.ocr: 0: 0}</td>
                          </tr>
                          <tr>
                            <td>Table-extraction</td>
                            <td>{documentDatas?documentDatas.status_object?documentDatas.status_object.table_extraction: 0: 0}</td>
                          </tr>
                          <tr>
                            <td>Post-process</td>
                            <td>{documentDatas?documentDatas.status_object?documentDatas.status_object.post_process: 0: 0}</td>
                          </tr> */}
                      {/* </tbody>
                    </table>
                  </div>
                </React.Fragment>
              }
            >
              <Information20 className="appheader-icon-white"></Information20>
            </Tooltip>
          </div> */}
          {!!currentUser && currentUser.role === "admin" ? (
            <HeaderGlobalAction
              onClick={(event) => {
                this.props.history.push("/user-management");
              }}
              aria-label="User Avatar"
            >
              {/* <OverflowMenu
                renderIcon={UserAvatar16}
            >
                <OverflowMenuItem itemText="1"/>
                <OverflowMenuItem itemText="2"/>
                <OverflowMenuItem itemText="3"/>
            </OverflowMenu> */}
              <UserAvatar16 />
            </HeaderGlobalAction>
          ) : null}
          {/* <HeaderGlobalAction aria-label="App Switcher">
            <AppSwitcher16 />
          </HeaderGlobalAction> */}
        </HeaderGlobalBar>
      </Header>
    );
  }
}

export default AppHeader;
