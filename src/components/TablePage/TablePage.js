/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React from "react";
import PropTypes from "prop-types";
import Tooltip from 'rc-tooltip';
import {
  Toggle,
  Button,
  // Tooltip
} from "carbon-components-react";
import 'rc-tooltip/assets/bootstrap.css';
import Download20 from "@carbon/icons-react/lib/download/20";
// import Share20 from '@carbon/icons-react/lib/share/20';
// import Settings20 from '@carbon/icons-react/lib/settings/20';
import Close20 from "@carbon/icons-react/lib/close/20";
import Information20 from "@carbon/icons-react/lib/information/20";
import { ReactComponent as RectangleG } from "../../assets/Rectangle-g.svg";
import { ReactComponent as RectangleR } from "../../assets/Rectangle-r.svg";
import { ReactComponent as RectangleY } from "../../assets/Rectangle-y.svg";
import MyCanvas from "../../containers/MyCanvas";
import MessagePage from "../../containers/MessagePage";
import LoadingPage from "../../containers/LoadingPage";

const TablePage = (props) => {
  const {
    documentDatas,
    documentMetadata,
    onRedirectDashboard,
    onSingalDownloadFile,
    toggleMarkForReview,
    markedForReview,
    files,
    selectedId,
  } = props;

  const versions = documentDatas ? documentDatas.metadata ? documentDatas.metadata : null : null;

  const ConfidenceIcon = (value) => {
    if (value > 0.8) {
      return (
        <React.Fragment>
          <RectangleG className="dashboard__icon_svg" />
        </React.Fragment>
      );
    } else if (value < 0.5) {
      return (
        <React.Fragment>
          <RectangleR className="dashboard__icon_svg" />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <RectangleY className="dashboard__icon_svg" />
        </React.Fragment>
      );
    }
  };

  const renderProcessingTime = (name, time) => {
    if (name !== "Total") {
      return (
        <tr key={name}>
          <td>{name}</td>
          <td>{time}s</td>
        </tr>
      )
    }
  }


  const renderVersion = (name, version) => {
    return (
      <tr key={name}>
        <td>{name}</td>
        <td>{version}</td>
      </tr>
    );
  }

  /*
    1.To render The table page topbar.
    2.To add the enter of Canvas component：MyCanvas
    3.Add the common messgae component: MessagePage
    4.Add the common Loading component: LoadingPage
  */
  return (
    <div>
      <div className="tablePage__toolbar">
        <div className="bx--col-lg-12 tablePage__banner_area">
          <div className="bx--row tablePage__banner">
            <div className="bx--col-lg-4 tablePage__info">
              <div className="bx--row tablePage__icon_container">
                {/* <div className="bx--col-lg-6 ">
                                    <Button kind='primary'>Save</Button>
                                </div> */}
                {/* <div className="bx--col-lg-2 tablePage__toolbar_icon">

                                </div> */}
                <div className="tablePage__toolbar_icon">
                  <Button
                    kind="ghost"
                    hasIconOnly
                    renderIcon={Download20}
                    tooltipAlignment="start"
                    tooltipPosition="bottom"
                    iconDescription="Download document"
                    onClick={(event) => onSingalDownloadFile()}
                  />
                  {/* <Toggle
                    aria-label="toggle button"
                    id="toggle-1"
                    labelA="Mark Review Complete"
                    labelB="Revert Review Complete"
                    onToggle={(event) => {
                      toggleMarkForReview();
                    }}
                    toggled={markedForReview}
                    className="tablepage-toggle"
                  /> */}
                </div>
                {/* <div className="bx--col-lg-2 tablePage__toolbar_icon">
                                    <Button kind='ghost'
                                        disabled={true}
                                        hasIconOnly
                                        renderIcon={Share20}
                                        tooltipAlignment="center"
                                        tooltipPosition="bottom"
                                        iconDescription="Share document"
                                    />
                                </div>
                                <div className="bx--col-lg-2 tablePage__toolbar_icon">
                                    <Button kind='ghost'
                                        disabled={true}
                                        hasIconOnly
                                        renderIcon={Settings20}
                                        tooltipAlignment="center"
                                        tooltipPosition="bottom"
                                        iconDescription="Document settings"
                                    />
                                </div> */}
              </div>
              {/* <div className="bx--row"><span>Digitization: {documentDatas ? documentDatas.category.name : ""}</span></div> */}
              {/* <div className="bx--row"><span>Digitization: {documentDatas ? "name" : ""}</span></div> */}
            </div>
            <div className="bx--col-lg-4 tablePage__filename">
              {/* {props.match.params.id} */}
              {documentDatas
                ? documentDatas.document_original_name
                : null}
            </div>
            <div className="bx--col-lg-4 ">
              <div className="bx--row tablepage_confidence_container" >
                <div className="tablePage__close ">
                  <div>
                    {documentDatas
                      ? ConfidenceIcon(
                        "documentDatas.document_score.table"
                      )
                      : null}
                  </div>
                  <div className="tablePage__confidence">
                    Extraction Confidence :{" "}
                    {documentMetadata
                      ? 
                      (documentMetadata.ConfidenceScore * 100).toFixed(1)
                      : 0}{" "}
                    %
                  </div>
                </div>
                <div className="tablepage_tool_icon_withmenu">
                  <Tooltip
                    overlayClassName="tablepage_showOverlay"
                    animation="zoom"
                    trigger="click"
                    placement="bottomLeft"
                    // align={'tr'}
                    overlay={
                      <React.Fragment>
                        <div className="tablepage_tooltip_container">
                          <table className="tablePage__process_status_table">
                            <tbody>
                              <tr>
                                <td colSpan={2}>Time Spent:</td>
                              </tr>
                              <tr>
                                <td>Total</td>
                                {/* <td>{documentDatas ? documentDatas.processing_time ? documentDatas.processing_time.Total + 's' : "0s" : "0s"}</td> */}
                              </tr>
                              {/* {documentDatas ? documentDatas.processing_time ? Object.keys(documentDatas.processing_time).map(t => renderProcessingTime(t, documentDatas.processing_time[t])) : null : null} */}
                              <tr>
                                <td colSpan={2}>Service Versions</td>
                              </tr>
                              {versions
                                ? versions.services
                                  ? Object.keys(versions.services).map((t) =>
                                    renderVersion(t, versions.services[t])
                                  )
                                  : null
                                : null}
                              <tr>
                                <td colSpan={2}>Engine Versions</td>
                              </tr>
                              {versions
                                ? versions.external
                                  ? Object.keys(versions.external).map((t) =>
                                    renderVersion(t, versions.external[t])
                                  )
                                  : null
                                : null}
                            </tbody>
                          </table>
                        </div>
                      </React.Fragment>
                    }
                  >
                    <span></span>
                    {/* <Information20></Information20> */}
                  </Tooltip>
                </div>
                <div className="tablePage__toolbar_icon_close">

                  <Button
                    size="field"
                    kind="secondary"
                    hasIconOnly
                    renderIcon={Close20}
                    tooltipAlignment="end"
                    tooltipPosition="bottom"
                    iconDescription="Back to dashboard"
                    onClick={(event) => onRedirectDashboard()}
                  />

                  {/* <Close20 className="tablePage__toolbar_icon_close_fill"/> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="tablePage__content">
        <MyCanvas files={files} selectedId={selectedId} />
      </div>
      <MessagePage className="messagepage" />
      <LoadingPage />
    </div>
  );
};

TablePage.propTypes = {
  documentDatas: PropTypes.object,
  onRedirectDashboard: PropTypes.func,
  onSingalDownloadFile: PropTypes.func,
};

export default TablePage;