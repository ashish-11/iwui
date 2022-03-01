/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React from "react";
import {
  Button,
  OverflowMenu,
  OverflowMenuItem,
  DataTable,
  TableBatchActions,
  Pagination,
  Loading,
} from "carbon-components-react";
// import Add16 from "@carbon/icons-react/lib/add/16";
import Warning20 from "@carbon/icons-react/lib/warning/20";
import CaretDown16 from "@carbon/icons-react/lib/caret--down/16";
import TrashCan32 from "@carbon/icons-react/lib/trash-can/32";
import Download32 from "@carbon/icons-react/lib/download/32";
import DocumentExport32 from "@carbon/icons-react/lib/document--export/32";
import Edit16 from "@carbon/icons-react/lib/edit/16";
import CheckmarkFilled32 from "@carbon/icons-react/lib/checkmark--filled/32";
import ArrowsVertical20 from "@carbon/icons-react/lib/arrows--vertical/20";
import ArrowUp20 from "@carbon/icons-react/lib/arrow--up/20";
import ArrowDown20 from "@carbon/icons-react/lib/arrow--down/20";
// import Files from "react-butterfiles";
import { ReactComponent as RectangleG } from "../../assets/Rectangle-g.svg";
import { ReactComponent as RectangleR } from "../../assets/Rectangle-r.svg";
import { ReactComponent as RectangleY } from "../../assets/Rectangle-y.svg";
import { ReactComponent as RectangleG16 } from "../../assets/Rectangle-g-16.svg";
import { ReactComponent as RectangleR16 } from "../../assets/Rectangle-r-16.svg";
import { ReactComponent as RectangleY16 } from "../../assets/Rectangle-y-16.svg";
import PropTypes from "prop-types";
import * as _ from "lodash";
import { Line } from "rc-progress";
import { NOT_REQUIRED_THRESHOLD } from "../../service/constants";
// import Upload from "rc-upload";
// import Dropzone from 'react-dropzone'
import UploadButton from "../UploadButton/UploadButton";
import Tooltip from "rc-tooltip";

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

const DashboardTable = (props) => {
  const {
    files,
    onUploadFile,
    uploadingFiles,
    filterByConfidence,
    filterByStatus,
    filterByDigiMethod,
    filterByVia,
    onUploadRequest,
    reportFileTypeError,
    onDeleteFile,
    onBatchDeleteFile,
    onBatchDownloadFile,
    onPaginationChange,
    onEditDoc,
    currentConfidenceFilter,
    currentStatusFilter,
    currentViaFilter,
    currentDigiMethodFilter,
    pagination,
    generalInfo,
    nameSort,
    updateTimeSort,
    onNameSortClick,
    onTimeSortClick,
    onEditDocName,
    socketClients,
    exportAll,
    categories,
  } = props;

  // const clientRef;

  const headers = [
    {
      header: "Document Name",
      key: "documentName",
      isSortable: true,
      width: "25%",
    },
    {
      header: "Uploaded Via",
      key: "via",
      isSortable: true,
      width: "15%",
    },
    {
      header: "Status",
      key: "status",
      isSortable: false,
      width: "20%",
    },
    {
      header: "Review Status",
      key: "reviewStatus",
      isSortable: false,
      width: "20%",
    },
    {
      header: "Uploaded By",
      key: "uploadedBy",
      isSortable: true,
      width: "20%",
    },
    {
      header: "Uploaded on",
      key: "uploadedOn",
      isSortable: true,
      width: "20%",
    },
    // {
    //   header: "",
    //   key: "actions",
    // },
  ];

  // Confidence filter 80% - 100%
  const option1 = () => {
    return (
      <React.Fragment>
        <div className="dashboard__option">
          <div className="dashboard__option_rectangle">
            <RectangleG16 />
          </div>
          <div className="dashboard__option_area dashboard__option_with_checkmark">
            <span>80 % - 100 %</span>
            {currentConfidenceFilter === 3 ? (
              <CheckmarkFilled32
                style={{ fill: "#0F62FE" }}
                className="dashboard__filter_checkmark"
              />
            ) : null}
          </div>
        </div>
      </React.Fragment>
    );
  };

  // Confidence filter 50% - 80%
  const option2 = () => {
    return (
      <React.Fragment>
        <div className="dashboard__option">
          <div className="dashboard__option_rectangle">
            <RectangleY16 />
          </div>
          <div className="dashboard__option_area dashboard__option_with_checkmark">
            <span>50 % - 80 %</span>
            {currentConfidenceFilter === 2 ? (
              <CheckmarkFilled32
                style={{ fill: "#0F62FE" }}
                className="dashboard__filter_checkmark"
              />
            ) : null}
          </div>
        </div>
      </React.Fragment>
    );
  };

  // Confidence filter 0% - 50%
  const option3 = () => {
    return (
      <React.Fragment>
        <div className="dashboard__option">
          <div className="dashboard__option_rectangle">
            <RectangleR16 />
          </div>
          <div className="dashboard__option_area dashboard__option_with_checkmark">
            <span>Below 50%</span>
            {currentConfidenceFilter === 1 ? (
              <CheckmarkFilled32
                style={{ fill: "#0F62FE" }}
                className="dashboard__filter_checkmark"
              />
            ) : null}
          </div>
        </div>
      </React.Fragment>
    );
  };

  // Failed processing
  const optionFailed = () => {
    return (
      <React.Fragment>
        <div className="dashboard__option">
          <div className="dashboard__option_rectangle">
            <RectangleR16 />
          </div>
          <div className="dashboard__option_area dashboard__option_with_checkmark">
            <span>Failed</span>
            {currentConfidenceFilter === -1 ? (
              <CheckmarkFilled32
                style={{ fill: "#0F62FE" }}
                className="dashboard__filter_checkmark"
              />
            ) : null}
          </div>
        </div>
      </React.Fragment>
    );
  };

  // Confidence filter 0% - 100%
  const optionClear = () => {
    return (
      <React.Fragment>
        <div className="dashboard__option">
          <div className="dashboard__option_rectangle">
            {/* <RectangleB16 /> */}
          </div>
          <div className="dashboard__option_area dashboard__option_with_checkmark">
            <span>All</span>
            {currentConfidenceFilter === 0 ? (
              <CheckmarkFilled32
                style={{ fill: "#0F62FE" }}
                className="dashboard__filter_checkmark"
              />
            ) : null}
          </div>
        </div>
      </React.Fragment>
    );
  };

  const showConfidenceFilter = () => {
    return (
      <React.Fragment>
        <OverflowMenu
          flipped={true}
          className="filter-menu"
          renderIcon={CaretDown16}
        >
          <OverflowMenuItem
            onClick={(event) => filterByConfidence(0)}
            itemText={optionClear()}
          />
          <OverflowMenuItem
            onClick={(event) => filterByConfidence(3)}
            itemText={option1()}
          />
          <OverflowMenuItem
            onClick={(event) => filterByConfidence(2)}
            itemText={option2()}
          />
          <OverflowMenuItem
            onClick={(event) => filterByConfidence(1)}
            itemText={option3()}
          />
          <OverflowMenuItem
            onClick={(event) => filterByConfidence(-1)}
            itemText={optionFailed()}
          />
        </OverflowMenu>
      </React.Fragment>
    );
  };

  const mergeCheckmarkWithStatus = (status) => {
    return (
      <React.Fragment>
        <div className="dashboard__option_with_checkmark">
          <span>{status}</span>
          {status === currentStatusFilter ? (
            <CheckmarkFilled32
              style={{ fill: "#0F62FE" }}
              className="dashboard__filter_checkmark"
            />
          ) : null}
        </div>
      </React.Fragment>
    );
  };

  const mergeCheckmarkWithVia = (status) => {
    return (
      <React.Fragment>
        <div className="dashboard__option_with_checkmark">
          <span>{status}</span>
          {status === currentViaFilter ? (
            <CheckmarkFilled32
              style={{ fill: "#0F62FE" }}
              className="dashboard__filter_checkmark"
            />
          ) : null}
        </div>
      </React.Fragment>
    );
  };

  const mergeCheckmarkWithDigiMethod = (category) => {
    let displayName;
    if (category === "All") {
      displayName = "All";
    } else {
      displayName = category.name;
    }
    return category === "All" ? (
      <React.Fragment>
        <div className="dashboard__option_with_checkmark">
          <span>{displayName}</span>
          {category === currentDigiMethodFilter ? (
            <CheckmarkFilled32
              style={{ fill: "#0F62FE" }}
              className="dashboard__filter_checkmark"
            />
          ) : null}
        </div>
      </React.Fragment>
    ) : (
      <React.Fragment>
        <div className="dashboard__option_with_checkmark">
          <span>{displayName}</span>
          {category.id === currentDigiMethodFilter ? (
            <CheckmarkFilled32
              style={{ fill: "#0F62FE" }}
              className="dashboard__filter_checkmark"
            />
          ) : null}
        </div>
      </React.Fragment>
    );
  };

  const showReviewStatusFilter = () => {
    return (
      <React.Fragment>
        <OverflowMenu
          flipped={true}
          className="filter-menu"
          renderIcon={CaretDown16}
        >
          <OverflowMenuItem
            onClick={(event) => filterByStatus("All")}
            itemText={mergeCheckmarkWithStatus("All")}
          />
          <OverflowMenuItem
            onClick={(event) => filterByStatus("Not Required")}
            itemText={mergeCheckmarkWithStatus("Not Required")}
          />
          <OverflowMenuItem
            onClick={(event) => filterByStatus("Requires Review")}
            itemText={mergeCheckmarkWithStatus("Requires Review")}
          />
          <OverflowMenuItem
            onClick={(event) => filterByStatus("In Progress")}
            itemText={mergeCheckmarkWithStatus("In Progress")}
          />
          <OverflowMenuItem
            onClick={(event) => filterByStatus("Completed")}
            itemText={mergeCheckmarkWithStatus("Completed")}
          />
        </OverflowMenu>
      </React.Fragment>
    );
  };

  const showDigiMethodFilter = (key) => {
    return (
      <React.Fragment>
        <OverflowMenu
          flipped={true}
          className="filter-menu"
          renderIcon={CaretDown16}
        >
          <OverflowMenuItem
            key={"0"}
            onClick={(event) => filterByDigiMethod("All")}
            itemText={mergeCheckmarkWithDigiMethod("All")}
          />
          {!!categories
            ? categories.map((c) => {
              if (c.ui_display) {
                return (
                  <OverflowMenuItem
                    key={c.id}
                    onClick={(event) => filterByDigiMethod(c.id)}
                    itemText={mergeCheckmarkWithDigiMethod(c)}
                  />
                );
              }
              return null;
            })
            : null}
        </OverflowMenu>
      </React.Fragment>
    );
  };

  const showUploadViaFilter = (key) => {
    return (
      <React.Fragment>
        <OverflowMenu
          flipped={true}
          className="filter-menu"
          renderIcon={CaretDown16}
        >
          <OverflowMenuItem
            onClick={(event) => filterByVia("All")}
            itemText={mergeCheckmarkWithVia("All")}
          />
          <OverflowMenuItem
            onClick={(event) => filterByVia("Email")}
            itemText={mergeCheckmarkWithVia("Email")}
          />
          <OverflowMenuItem
            onClick={(event) => filterByVia("ChatBot")}
            itemText={mergeCheckmarkWithVia("ChatBot")}
          />
          <OverflowMenuItem
            onClick={(event) => filterByVia("UI")}
            itemText={mergeCheckmarkWithVia("UI")}
          />
        </OverflowMenu>
      </React.Fragment>
    );
  }

  const showStatusFilter = () => {
    return (
      <React.Fragment>
        <OverflowMenu
          flipped={true}
          className="filter-menu"
          renderIcon={CaretDown16}
        >
          <OverflowMenuItem
            onClick={(event) => filterByStatus("All")}
            itemText={mergeCheckmarkWithStatus("All")}
          />
          <OverflowMenuItem
            onClick={(event) => filterByStatus("Completed")}
            itemText={mergeCheckmarkWithStatus("Completed")}
          />
          <OverflowMenuItem
            onClick={(event) => filterByStatus("Processed")}
            itemText={mergeCheckmarkWithStatus("Processed")}
          />
          <OverflowMenuItem
            onClick={(event) => filterByStatus("Inprogress")}
            itemText={mergeCheckmarkWithStatus("Inprogress")}
          />
          <OverflowMenuItem
            onClick={(event) => filterByStatus("Error")}
            itemText={mergeCheckmarkWithStatus("Error")}
          />
          <OverflowMenuItem
            onClick={(event) => filterByStatus("Error_MFA")}
            itemText={mergeCheckmarkWithStatus("Error_MFA")}
          />
        </OverflowMenu>
      </React.Fragment>
    );
  };

  const showFilters = (key) => {
    switch (key) {
      case "document_score":
        return showConfidenceFilter();
      case "review_status":
        return showReviewStatusFilter();
      case "digitization_method":
        return showDigiMethodFilter();
      case "via":
        return showUploadViaFilter()
      case "reviewStatus1":
        return showReviewStatusFilter()
      case "status":
        return showStatusFilter()
      default:
        return null;
    }
  };

  const showSortButton = (target) => {
    if (target === "name") {
      return (
        <React.Fragment>
          {(() => {
            switch (nameSort) {
              case 1:
                return (
                  <div
                    className="dashboard__sort_button"
                    onClick={(event) => onNameSortClick()}
                  >
                    <ArrowUp20 />
                  </div>
                );
              case 0:
                return (
                  <div
                    className="dashboard__sort_button"
                    onClick={(event) => onNameSortClick()}
                  >
                    <ArrowsVertical20 />
                  </div>
                );
              case -1:
                return (
                  <div
                    className="dashboard__sort_button"
                    onClick={(event) => onNameSortClick()}
                  >
                    <ArrowDown20 />
                  </div>
                );
              default:
                return null;
            }
          })()}
        </React.Fragment>
      );
    } else if (target === "time") {
      return (
        <React.Fragment>
          {(() => {
            switch (updateTimeSort) {
              case 1:
                return (
                  <div
                    className="dashboard__sort_button"
                    onClick={(event) => onTimeSortClick(target)}
                  >
                    <ArrowUp20 />
                  </div>
                );
              case 0:
                return (
                  <div
                    className="dashboard__sort_button"
                    onClick={(event) => onTimeSortClick(target)}
                  >
                    <ArrowsVertical20 />
                  </div>
                );
              case -1:
                return (
                  <div
                    className="dashboard__sort_button"
                    onClick={(event) => onTimeSortClick(target)}
                  >
                    <ArrowDown20 />
                  </div>
                );
              default:
                return null;
            }
          })()}
        </React.Fragment>
      );
    }
  };

  //This method is used to show sorting icon for particular column
  const showSort = (key) => {
    switch (key) {
      case "documentName":
        return showSortButton("name");
      case "uploadedOn":
        return showSortButton("time");
      default:
        return null;
    }
  };

  const convertReviewStatus = (id, value) => {
    //get the file
    if (!value) {
      console.log("status value is null, id:", id);
      return;
    }
    const realId = id.split(":")[0];
    const f = _.find(files, (e) => {
      return e.id === realId;
    });
    if (
      f.document_score.table.replace("%", "") >= NOT_REQUIRED_THRESHOLD &&
      f.review_status.toLowerCase() === "not started"
    ) {
      return "Not Required";
    }
    switch (value.replace(" ", "").toLowerCase()) {
      case "completed":
        return "Completed";
      case "notstarted":
        return "Requires Review";
      case "inprogress":
        return "In Progress";
      case "in_progress":
        return "In Progress";
      case "error":
        return "Error";
      default:
        return value;
    }
  };

  const ConfidenceIcon = (value) => {
    let figure = value.replace("%", "");
    if (figure > 80) {
      return (
        <React.Fragment>
          <div className="dashboard__center_cell">
            <RectangleG className="dashboard__icon_svg" />
            <span>{value}</span>
          </div>
        </React.Fragment>
      );
    } else if (figure < 50) {
      return (
        <React.Fragment>
          <div className="dashboard__center_cell">
            <RectangleR className="dashboard__icon_svg" />
            <span>{value}</span>
          </div>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <div className="dashboard__center_cell">
            <RectangleY className="dashboard__icon_svg" />
            <span>{value}</span>
          </div>
        </React.Fragment>
      );
    }
  };

  const stautsbar = (cell) => {
    let { id, value } = cell;
    // if (value.toLowerCase() === "completed" || value.toLowerCase() === "error") {
    //   return (
    //     <React.Fragment>
    //       <div className="bx--col-lg-12 dashboard__status_bar_container">
    //         <span>{value}</span>
    //         {/* <Line
    //           percent="100"
    //           strokeWidth="4"
    //           strokeColor="#0074FB"
    //           trailColor="#C6C6C6"
    //           trailWidth="4"
    //           className="dashboard__status_bar"
    //         /> */}
    //       </div>
    //     </React.Fragment>
    //   );
    // } else if (value === "Processing" || value ==="in_progress") {
    //   return (
    //     <React.Fragment>
    //       <div className="bx--col-lg-12 dashboard__status_bar_container">
    //         <span>In Progress</span>
    //         {/* <Line
    //           percent="50"
    //           strokeWidth="4"
    //           strokeColor="#0074FB"
    //           trailColor="#C6C6C6"
    //           trailWidth="4"
    //           className="dashboard__status_bar"
    //         /> */}
    //       </div>
    //     </React.Fragment>
    //   );
    // } else {
    return (
      <React.Fragment>
        <div className="bx--col-lg-12 dashboard__status_bar_container">
          <span>{convertReviewStatus(id, value)}</span>
          {/* <Line
              percent="0"
              strokeWidth="4"
              strokeColor="#C6C6C6"
              trailColor="#C6C6C6"
              trailWidth="4"
              className="dashboard__status_bar"
            /> */}
        </div>
      </React.Fragment>
    );
    // }
  };
  const cancelBatchActions = (event) => { };

  const renderRowActions = (row) => {
    return (
      <React.Fragment>
        <div className="dashboard__center_cell">
          <OverflowMenu flipped={true} iconDescription="">
            <OverflowMenuItem
              itemText="Edit"
              requireTitle
              onClick={(event) => {
                onEditDoc(_.find(files, (o) => row.id === o.id));
              }}
            />
            <OverflowMenuItem
              itemText="Delete"
              isDelete
              onClick={(event) => {
                onDeleteFile(event, row);
              }}
            />
          </OverflowMenu>
        </div>
      </React.Fragment>
    );
  };

  const docName = (row, value, f) => {
    return (
      <div className="dashboard__center_cell dashboard__document_name_container">
        <span
          title={value}
          className="dashboard__front-line"
          onClick={(event) => onEditDoc(_.find(files, (o) => row.id === o.id))}
        >
          {value}
        </span>
        <Edit16
          onClick={(event) => onEditDocName(f)}
          className="dashboard__rename_doc"
        />
      </div>
    );
  };

  const renderProcessingLine = (f) => {
    // get the status from clients
    const status = socketClients.get(f.id)
      ? socketClients.get(f.id).status
      : { percentage: 1, stage: "unknown" };
    return (
      <td colSpan="2">
        <Line
          percent={status.percentage}
          strokeWidth="6"
          strokeColor="#78A9FF"
          trailColor="#C6C6C6"
          trailWidth="6"
          strokeLinecap="butt"
          className="dashboard__full_line"
        ></Line>{" "}
        <div className="dashboard__full_line">
          <span>
            {status.percentage}% {status.stage}
          </span>
        </div>
      </td>
    );
  };

  const renderTableRow = (row, getSelectionProps) => {
    // get the file using id
    // console.log(uploadingFiles)
    // console.log(files)
    let f = _.find([...uploadingFiles, ...files], (o) => {
      return o.id === row.id;
    });
    if (!f) {
      return;
    }
    if (!f.final_status) {
      f.final_status = "";
    }
    switch (f.status) {
      case "Completed":
        return (
          <TableRow key={row.id}>
            <TableSelectRow radio={false} {...getSelectionProps({ row })} />
            {row.cells.map((cell) => {
              switch (cell.id.split(":")[1]) {
                case "document_score":
                  return (
                    <TableCell key={cell.id}>
                      {ConfidenceIcon(cell.value.table)}
                    </TableCell>
                  );
                case "documentName":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "status":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "via":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "reviewStatus":
                  // return <TableCell key={cell.id}>{stautsbar(cell)}</TableCell>;
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "uploadedBy":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "uploadedOn":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "actions":
                  return (
                    <TableCell key={cell.id}>{renderRowActions(row)}</TableCell>
                  );
                default:
                  return (
                    <TableCell key={cell.id}>
                      <div
                        className="dashboard__center_cell"
                      // onClick={(event) =>
                      //   onEditDoc(_.find(files, (o) => row.id === o.id))
                      // }
                      >
                        <span>{cell.value}</span>
                      </div>
                    </TableCell>
                  );
              }
            })}
          </TableRow>
        );
      case "Processed":
        return (
          <TableRow key={row.id}>
            <TableSelectRow radio={false} {...getSelectionProps({ row })} />
            {row.cells.map((cell) => {
              switch (cell.id.split(":")[1]) {
                case "document_score":
                  return (
                    <TableCell key={cell.id}>
                      {ConfidenceIcon(cell.value.table)}
                    </TableCell>
                  );
                case "documentName":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "status":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "via":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "reviewStatus":
                  // return <TableCell key={cell.id}>{stautsbar(cell)}</TableCell>;
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "uploadedBy":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "uploadedOn":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "actions":
                  return (
                    <TableCell key={cell.id}>{renderRowActions(row)}</TableCell>
                  );
                default:
                  return (
                    <TableCell key={cell.id}>
                      <div
                        className="dashboard__center_cell"
                      // onClick={(event) =>
                      //   onEditDoc(_.find(files, (o) => row.id === o.id))
                      // }
                      >
                        <span>{cell.value}</span>
                      </div>
                    </TableCell>
                  );
              }
            })}
          </TableRow>
        );
      case "Inprogress":
        return (
          <TableRow key={row.id}>
            <TableSelectRow radio={false} {...getSelectionProps({ row })} />
            {row.cells.map((cell) => {
              switch (cell.id.split(":")[1]) {
                case "document_score":
                  return (
                    <TableCell key={cell.id}>
                      {ConfidenceIcon(cell.value.table)}
                    </TableCell>
                  );
                case "documentName":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "status":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "via":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "reviewStatus":
                  // return <TableCell key={cell.id}>{stautsbar(cell)}</TableCell>;
                  return (
                    <TableCell key={cell.id}>
                      Status in Progress{docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "uploadedBy":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "uploadedOn":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "actions":
                  return (
                    <TableCell key={cell.id}>{renderRowActions(row)}</TableCell>
                  );
                default:
                  return (
                    <TableCell key={cell.id}>
                      <div
                        className="dashboard__center_cell"
                      // onClick={(event) =>
                      //   onEditDoc(_.find(files, (o) => row.id === o.id))
                      // }
                      >
                        <span>{cell.value}</span>
                      </div>
                    </TableCell>
                  );
              }
            })}
          </TableRow>
        );
      case "Error":
        return (
          <TableRow key={row.id}>
            <TableSelectRow radio={false} {...getSelectionProps({ row })} />
            {row.cells.map((cell) => {
              switch (cell.id.split(":")[1]) {
                case "document_score":
                  return (
                    <TableCell key={cell.id}>
                      {ConfidenceIcon(cell.value.table)}
                    </TableCell>
                  );
                case "documentName":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "status":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "via":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "reviewStatus":
                  // return <TableCell key={cell.id}>{stautsbar(cell)}</TableCell>;
                  return (
                    <TableCell key={cell.id}>
                      Status in Progress{docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "uploadedBy":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "uploadedOn":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "actions":
                  return (
                    <TableCell key={cell.id}>{renderRowActions(row)}</TableCell>
                  );
                default:
                  return (
                    <TableCell key={cell.id}>
                      <div
                        className="dashboard__center_cell"
                      // onClick={(event) =>
                      //   onEditDoc(_.find(files, (o) => row.id === o.id))
                      // }
                      >
                        <span>{cell.value}</span>
                      </div>
                    </TableCell>
                  );
              }
            })}
          </TableRow>
        );
      case "Error (Multiple failed attempts)":
        return (
          <TableRow key={row.id}>
            <TableSelectRow radio={false} {...getSelectionProps({ row })} />
            {row.cells.map((cell) => {
              switch (cell.id.split(":")[1]) {
                case "document_score":
                  return (
                    <TableCell key={cell.id}>
                      {ConfidenceIcon(cell.value.table)}
                    </TableCell>
                  );
                case "documentName":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "status":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "via":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "reviewStatus":
                  // return <TableCell key={cell.id}>{stautsbar(cell)}</TableCell>;
                  return (
                    <TableCell key={cell.id}>
                      Status in Progress{docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "uploadedBy":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "uploadedOn":
                  return (
                    <TableCell key={cell.id}>
                      {docName(row, cell.value, f)}
                    </TableCell>
                  );
                case "actions":
                  return (
                    <TableCell key={cell.id}>{renderRowActions(row)}</TableCell>
                  );
                default:
                  return (
                    <TableCell key={cell.id}>
                      <div
                        className="dashboard__center_cell"
                      // onClick={(event) =>
                      //   onEditDoc(_.find(files, (o) => row.id === o.id))
                      // }
                      >
                        <span>{cell.value}</span>
                      </div>
                    </TableCell>
                  );
              }
            })}
          </TableRow>
        );
      case "error":
      case "processed_error":
        return (
          <TableRow key={row.id}>
            <TableSelectRow radio={false} {...getSelectionProps({ row })} />
            <TableCell key={f.id + ":document_original_name"}>
              {docName(row, f.document_original_name, f)}
            </TableCell>
            <TableCell key={f.id + ":digitization_method"}>
              <div
                className="dashboard__center_cell"
              // onClick={(event) =>
              //   onEditDoc(_.find(files, (o) => row.id === o.id))
              // }
              >
                <span>{f.digitization_method}</span>
              </div>
            </TableCell>
            <td colSpan="2">
              <div className="dashboard__adding_doc_container">
                <Tooltip
                  placement="right"
                  trigger="click"
                  // overlayClassName="iconOverlay"
                  overlay={f.status.final_status.detail_message}
                >
                  <div>
                    <Warning20 className="dashboard__warning" />
                  </div>
                </Tooltip>
                {f.error_stage ? (
                  <div className="dashboard__text_container">
                    Error | Stage: {f.error_stage} | Step: {f.error_step} |
                    Message: {f.error_message}
                  </div>
                ) : (
                  <div className="dashboard__text_container">
                    Error with message: {f.error_message}
                  </div>
                )}
              </div>
            </td>
            <TableCell key={f.id + ":updated_at"}>
              <div className="dashboard__center_cell">
                <span>{f.updated_at}</span>
              </div>
            </TableCell>
          </TableRow>
        );
      case "uploading":
        return (
          <TableRow key={row.id}>
            <TableSelectRow radio={false} {...getSelectionProps({ row })} />
            <TableCell key={f.id + ":document_original_name"}>
              {docName(row, f.document_original_name, f)}
            </TableCell>
            <td colSpan="4">
              <div className="dashboard__adding_doc_container">
                <Loading
                  className="dashboard__adding_doc"
                  description="Active loading indicator"
                  withOverlay={false}
                />
                <span>Adding Document</span>
              </div>
            </td>
          </TableRow>
        );
      case "starting digitization engine":
      case "processing":
        return (
          <TableRow key={row.id}>
            <TableSelectRow radio={false} {...getSelectionProps({ row })} />
            <TableCell key={f.id + ":document_original_name"}>
              {docName(row, f.document_original_name, f)}
            </TableCell>
            <TableCell key={f.id + ":digitization_method"}>
              <div
                className="dashboard__center_cell"
              // onClick={(event) =>
              //   onEditDoc(_.find(files, (o) => row.id === o.id))
              // }
              >
                <span>{f.digitization_method}</span>
              </div>
            </TableCell>
            {renderProcessingLine(f)}
            <TableCell key={f.id + ":updated_at"}>
              <div className="dashboard__center_cell">
                <span>{f.updated_at}</span>
              </div>
            </TableCell>
          </TableRow>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bx--grid bx--grid--full-width">
      {/* <div className="bx--row dashboard__banner">
        <div className="bx--col-lg-12">
          <h1 className="dashboard__heading">Dashboard</h1>
        </div>
      </div> */}
      {/* <div className="bx--row dashboard__infobar">
        <div className="bx--col-lg-2 dashboard__infobar_cell">
          <div className="bx--row">
            <div className="bx--col-lg-12 dashboard__infobar_title">
              Total Documents
            </div>
          </div>
          <div className="bx--row">
            <div className="bx--col-lg-12 dashboard__infobar_value">
              {generalInfo.total_count}
            </div>
          </div>
        </div>
        <div className="bx--col-lg-2 dashboard__infobar_cell">
          <div className="bx--row">
            <div className="bx--col-lg-12 dashboard__infobar_title">
              Requires Review
            </div>
          </div>
          <div className="bx--row">
            <div className="bx--col-lg-12 dashboard__infobar_value">
              {generalInfo.review_status.requires_review
                ? generalInfo.review_status.requires_review
                : 0}
            </div>
          </div>
        </div>
        <div className="bx--col-lg-2 dashboard__infobar_cell">
          <div className="bx--row">
            <div className="bx--col-lg-12 dashboard__infobar_title">
              Review In Progress
            </div>
          </div>
          <div className="bx--row">
            <div className="bx--col-lg-12 dashboard__infobar_value">
              {generalInfo.review_status.in_progress
                ? generalInfo.review_status.in_progress
                : 0}
            </div>
          </div>
        </div>
        <div className="bx--col-lg-6 dashboard__infobar_cell_noborder">
          <div className="bx--row">
            <div className="bx--col-lg-12 dashboard__infobar_title">
              Extraction Confidence
            </div>
          </div>
          <div className="bx--row">
            <div className="bx--col-lg-4 dashboard__infobar_subcell">
              <div className="bx--row">
                <div className="bx--col-lg-3 dashboard__infobar_icon">
                  <RectangleG />
                </div>
                <div className="bx--col-lg-5 dashboard__infobar_area">
                  80 % - 100 %
                </div>
                <div className="bx--col-lg-4 dashboard__infobar_subvalue">
                  {generalInfo.document_score.table["80-100"]}
                </div>
              </div>
            </div>
            <div className="bx--col-lg-4 dashboard__infobar_subcell">
              <div className="bx--row">
                <div className="bx--col-lg-3 dashboard__infobar_icon">
                  <RectangleY />
                </div>
                <div className="bx--col-lg-5 dashboard__infobar_area">
                  50 % - 80 %
                </div>
                <div className="bx--col-lg-4 dashboard__infobar_subvalue">
                  {generalInfo.document_score.table["50-80"]}
                </div>
              </div>
            </div>
            <div className="bx--col-lg-4 dashboard__infobar_subcell2">
              <div className="bx--row">
                <div className="bx--col-lg-3 dashboard__infobar_icon">
                  <RectangleR />
                </div>
                <div className="bx--col-lg-5 dashboard__infobar_area">
                  Below 50%
                </div>
                <div className="bx--col-lg-4 dashboard__infobar_subvalue">
                  {generalInfo.document_score.table["0-50"]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
      <DataTable
        size={"normal"}
        headers={headers}
        locale="en"
        // isSortable={true}
        rows={[...uploadingFiles, ...files]}
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
                onCancel={(event) => cancelBatchActions(event)}
                {...getBatchActionProps()}
              >
                {/* inside of you batch ac'tinos, you can include selectedRows */}
                {/* <TableBatchAction
                  renderIcon={TrashCan32}
                  onClick={(event) => onBatchDeleteFile(rows)}
                >
                  Delete
                </TableBatchAction> */}

                {/* <TableBatchAction
                  renderIcon={Download32}
                  onClick={(event) => onBatchDownloadFile(rows)}
                >
                  Download
                </TableBatchAction>
                <TableBatchAction
                  renderIcon={DocumentExport32}
                  onClick={(event) => exportAll(rows)}
                >
                  Export
                </TableBatchAction> */}
              </TableBatchActions>
              {/* pass in `onInputChange` change here to make filtering work */}
              <TableToolbarContent className="dashboard__search_bar">
                {/* <TableToolbarSearch
                  placeHolderText="Search for documents"
                  persistent={true}
                  onChange={(event) => toolBarSearch(event.target.value)}
                /> */}
                <UploadButton
                  categories={categories}
                  onUploadRequest={onUploadRequest}
                  onUploadFile={onUploadFile}
                />
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
                            style={{ width: "2rem" }}
                            {...getHeaderProps({ header })}
                          // isSortable={header.isSortable}
                          ></TableHeader>
                        );
                      default:
                        return (
                          <TableHeader
                            className="dashboard__sort_header"
                            style={{ width: header.width }}
                            {...getHeaderProps({ header })}
                          // isSortable={header.isSortable}
                          >
                            <div className="dashboard__header_container">
                              <div>{header.header}</div>
                              <div>
                                {showSort(header.key)}
                                {showFilters(header.key)}
                              </div>
                            </div>
                          </TableHeader>
                        );
                    }
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => renderTableRow(row, getSelectionProps))}
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
        onChange={(event) => onPaginationChange(event)}
        page={pagination.current_page}
        pageInputDisabled={false}
        pageNumberText="Page Number"
        // pageRangeText={(a, b) => myPageRangeText(a,b)}
        pageSize={pagination.page_size}
        pageSizes={[10, 20, 30, 40, 50]}
        // pageText={function noRefCheck(){}}
        pagesUnknown={false}
        totalItems={pagination.total_number + uploadingFiles.length}
      />
    </div>
  );
};

DashboardTable.propTypes = {
  files: PropTypes.any,
  uploadingFiles: PropTypes.any,
  createMessage: PropTypes.func,
  filterByConfidence: PropTypes.func,
  filterByStatus: PropTypes.func,
  filterByVia: PropTypes.func,
  onUploadFile: PropTypes.func,
  onUploadRequest: PropTypes.func,
  reportFileTypeError: PropTypes.func,
  toolBarSearch: PropTypes.func,
  onPaginationChange: PropTypes.func,
  onEditDoc: PropTypes.func,
  isloading: PropTypes.bool,
  currentConfidenceFilter: PropTypes.number,
  currentStatusFilter: PropTypes.string,
  currentViaFilter: PropTypes.string,
  currentDigiMethodFilter: PropTypes.string,
  pagination: PropTypes.any,
  generalInfo: PropTypes.any,
  onNameSortClick: PropTypes.func,
  onTimeSortClick: PropTypes.func,
  searchKeyword: PropTypes.string,
  onEditDocName: PropTypes.func,
  categories: PropTypes.any,
};

export default DashboardTable;
