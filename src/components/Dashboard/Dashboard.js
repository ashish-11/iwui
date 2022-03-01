/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React from "react";
import {
    Search,
    Button,
    // Checkbox,
    OverflowMenu,
    OverflowMenuItem
} from 'carbon-components-react';
import TrashCan16 from '@carbon/icons-react/lib/trash-can/16';
import Download16 from '@carbon/icons-react/lib/download/16';
import SettingsAdjust16 from '@carbon/icons-react/lib/settings--adjust/16';
import Add16 from '@carbon/icons-react/lib/add/16';
import CaretDown16 from '@carbon/icons-react/lib/caret--down/16';
import Files from "react-butterfiles";

import Arrows16 from '@carbon/icons-react/lib/arrows/16';
import ArrowDown16 from '@carbon/icons-react/lib/arrow--down/16';
import PropTypes from 'prop-types';
import { ReactSVG } from 'react-svg'
import * as _ from 'lodash';
import { Line } from 'rc-progress';
import { DashboardTable } from '../DashboardTable';

const Dashboard = (props) => {
    const { files } = props;

    const option1 = () => {
        return (
            <React.Fragment>
                <div className="dashboard__option">
                    <div className="dashboard__option_rectangle">
                        <ReactSVG src="assets/Rectangle-g-16.svg" />
                    </div>
                    <div className="dashboard__option_area">95 % - 100 %</div>
                </div>
            </React.Fragment>
        );
    };
    const option2 = () => {
        return (
            <React.Fragment>
                <div className="dashboard__option">
                    <div className="dashboard__option_rectangle">
                        <ReactSVG src="assets/Rectangle-y-16.svg" />
                    </div>
                    <div className="dashboard__option_area">70 % - 95 %</div>
                </div>
            </React.Fragment>
        );
    };
    const option3 = () => {
        return (
            <React.Fragment>
                <div className="dashboard__option">
                    <div className="dashboard__option_rectangle">
                        <ReactSVG src="assets/Rectangle-r-16.svg" />
                    </div>
                    <div className="dashboard__option_area">Below 70%</div>
                </div>
            </React.Fragment>
        );
    };

    const ConfidenceIcon = (value) => {
        if (value > '95%') {
            return (
                <React.Fragment>
                    <div className="bx--col-lg-2 dashboard__infobar_icon">
                        <ReactSVG src="assets/Rectangle-g.svg" />
                    </div>
                </React.Fragment>
            )
        } else if (value < '70%') {
            return (
                <React.Fragment>
                    <div className="bx--col-lg-2 dashboard__infobar_icon">
                        <ReactSVG src="assets/Rectangle-r.svg" />
                    </div>
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                    <div className="bx--col-lg-2 dashboard__infobar_icon">
                        <ReactSVG src="assets/Rectangle-y.svg" />
                    </div>
                </React.Fragment>
            )
        }
    }

    const stautsbar = (value) => {
        if (value === 'Completed') {
            return (
                <React.Fragment>
                    <div className="bx--col-lg-8">
                        <Line percent="100" strokeWidth="4" strokeColor="#0074FB" trailColor="#C6C6C6" trailWidth="4" />
                    </div>
                </React.Fragment>
            )
        } else if (value === 'In Progress') {
            return (
                <React.Fragment>
                    <div className="bx--col-lg-8">
                        <Line percent="50" strokeWidth="4" strokeColor="#0074FB" trailColor="#C6C6C6" trailWidth="4" />
                    </div>
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                    <div className="bx--col-lg-8">
                        <Line percent="0" strokeWidth="4" strokeColor="#C6C6C6" trailColor="#C6C6C6" trailWidth="4" />
                    </div>
                </React.Fragment>
            )
        }
    }

    return (
        <div className="bx--grid bx--grid--full-width">
            <div className="bx--row dashboard__banner">
                <div className="bx--col-lg-16">
                    <h1 className="dashboard__heading">
                        Dashboard
                    </h1>
                </div>
            </div>
            <div className="bx--row dashboard__infobar">
                <div className="bx--col-lg-3 dashboard__infobar_cell">
                    <div className="bx--row" >
                        <div className="bx--col-lg-16 dashboard__infobar_title">
                            Total Documents
                        </div>
                    </div>
                    <div className="bx--row" >
                        <div className="bx--col-lg-16 dashboard__infobar_value">
                            {files.length}
                        </div>
                    </div>
                </div>
                <div className="bx--col-lg-3 dashboard__infobar_cell">
                    <div className="bx--row" >
                        <div className="bx--col-lg-16 dashboard__infobar_title">
                            Not Started
                        </div>
                    </div>
                    <div className="bx--row" >
                        <div className="bx--col-lg-16 dashboard__infobar_value">
                            {_.filter(files, function (o) { return o.status === "Not Started"; }).length}
                        </div>
                    </div>
                </div>
                <div className="bx--col-lg-3 dashboard__infobar_cell">
                    <div className="bx--row" >
                        <div className="bx--col-lg-16 dashboard__infobar_title">
                            In Progress
                        </div>
                    </div>
                    <div className="bx--row" >
                        <div className="bx--col-lg-16 dashboard__infobar_value">
                            {_.filter(files, function (o) { return o.status === "In Progress"; }).length}
                        </div>
                    </div>
                </div>
                <div className="bx--col-lg-7 dashboard__infobar_cell">
                    <div className="bx--row" >
                        <div className="bx--col-lg-16 dashboard__infobar_title">
                            Extraction Confidence
                        </div>
                    </div>
                    <div className="bx--row" >
                        <div className="bx--col-lg-5 dashboard__infobar_subcell">
                            <div className="bx--row" >
                                <div className="bx--col-lg-4 dashboard__infobar_icon">
                                    <ReactSVG src="assets/Rectangle-g.svg" />
                                </div>
                                <div className="bx--col-lg-7 dashboard__infobar_area">
                                    95 % - 100 %
                                </div>
                                <div className="bx--col-lg-5 dashboard__infobar_subvalue">
                                    {_.filter(files, function (o) { return o.confidence > '95%'; }).length}
                                </div>
                            </div>
                        </div>
                        <div className="bx--col-lg-5 dashboard__infobar_subcell">
                            <div className="bx--row" >
                                <div className="bx--col-lg-4 dashboard__infobar_icon">
                                    <ReactSVG src="assets/Rectangle-y.svg" />
                                </div>
                                <div className="bx--col-lg-7 dashboard__infobar_area">
                                    70 % - 95 %
                                </div>
                                <div className="bx--col-lg-5 dashboard__infobar_subvalue">
                                    {_.filter(files, function (o) { return (o.confidence >= '70%' && o.confidence <= '95%'); }).length}
                                </div>
                            </div>
                        </div>
                        <div className="bx--col-lg-5 dashboard__infobar_subcell2">
                            <div className="bx--row" >
                                <div className="bx--col-lg-4 dashboard__infobar_icon">
                                    <ReactSVG src="assets/Rectangle-r.svg" />
                                </div>
                                <div className="bx--col-lg-7 dashboard__infobar_area">
                                    Below 70%
                                </div>
                                <div className="bx--col-lg-5 dashboard__infobar_subvalue">
                                    {_.filter(files, function (o) { return o.confidence < '70%'; }).length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bx--row dashboard__tabletool">
                <div className="bx--col-lg-11 dashboard__tabletool_info">
                    2 Documents Selected
                </div>
                <div className="bx--col-lg-2">
                    <Search
                        labelText={''}
                        id="search-1"
                        placeHolderText="Search for documents"
                    />
                </div>
                <div className="bx--col-lg-1">
                    <div className="bx--row">
                        <div className="bx--col-lg-5 dashboard__tabletool_icon">
                            <TrashCan16 />
                        </div>
                        <div className="bx--col-lg-5 dashboard__tabletool_icon">
                            <Download16 />
                        </div>
                        <div className="bx--col-lg-5 dashboard__tabletool_icon">
                            <SettingsAdjust16 />
                        </div>
                    </div>
                </div>
                <div className="bx--col-lg-2 dashboard__buttonarea">
                    <Files
                        multiple={true}
                        maxSize="40mb"
                        // multipleMaxSize="40mb"
                        // multipleMaxCount={3}

                        accept={["application/pdf", "image/jpg", "image/jpeg", "image/tiff", "image/png"]}
                        onSuccess={files => (console.log('files', files))}
                        onError={(errors, event) => (console.log('errors', errors))}
                    >
                        {({ browseFiles }) => (
                            <>
                                <Button kind='primary' renderIcon={Add16} onClick={browseFiles} className="dashboard__button">New Document</Button>
                            </>
                        )}
                    </Files>
                </div>
            </div>
            <div className="bx--row dashboard__tableheader">
                <div className="bx--col-lg-1 dashboard__tableheader_checkbox">
                    {/* <fieldset className="bx--fieldset">
                        <Checkbox hideLabel labelText="Checkbox label" id="all" />
                    </fieldset> */}
                </div>
                <div className="bx--col-lg-3">
                    <div className="bx--row dashboard__option_row">
                        <div className="bx--col-lg-8">
                            Name
                        </div>
                        <div className="bx--col-lg-8 dashboard__tableheader_icon">
                            <Arrows16 />
                        </div>
                    </div>
                </div>
                <div className="bx--col-lg-3">
                    <div className="bx--row dashboard__option_row">
                        <div className="bx--col-lg-8">
                            Extraction Confidence
                        </div>
                        <div className="bx--col-lg-8 dashboard__tableheader_icon">
                            <OverflowMenu
                                renderIcon={CaretDown16}
                            >
                                <OverflowMenuItem itemText={option1()} />
                                <OverflowMenuItem itemText={option2()} />
                                <OverflowMenuItem itemText={option3()} />
                            </OverflowMenu>
                        </div>
                    </div>
                </div>
                <div className="bx--col-lg-3">
                    <div className="bx--row dashboard__option_row">
                        <div className="bx--col-lg-8">
                            Review Status
                        </div>
                        <div className="bx--col-lg-8 dashboard__tableheader_icon">
                            <OverflowMenu
                                renderIcon={CaretDown16}
                            >
                                <OverflowMenuItem itemText='Not Started' />
                                <OverflowMenuItem itemText='In Progress' />
                                <OverflowMenuItem itemText='Completed' />
                            </OverflowMenu>
                        </div>
                    </div>
                </div>
                <div className="bx--col-lg-3">
                    <div className="bx--row dashboard__option_row">
                        <div className="bx--col-lg-8">
                            Updated By
                        </div>
                        <div className="bx--col-lg-8 dashboard__tableheader_icon">
                            <ArrowDown16 />
                        </div>
                    </div>
                </div>
                <div className="bx--col-lg-2">
                    <div className="bx--row dashboard__option_row">
                        <div className="bx--col-lg-8">
                            Last Updated
                        </div>
                        <div className="bx--col-lg-8 dashboard__tableheader_icon">
                            <ArrowDown16 />
                        </div>
                    </div>
                </div>
                <div className="bx--col-lg-1">
                </div>
            </div>

            <div>
                {files.map(data => (
                    <div key={data.id}>
                        <div className="bx--row dashboard__tablecontent">
                            <div className="bx--col-lg-1 dashboard__tableheader_checkbox">
                                {/* <fieldset className="bx--fieldset">
                                    <Checkbox hideLabel labelText="Checkbox label" id={"all_" + data.id} />
                                </fieldset> */}
                            </div>
                            <div className="bx--col-lg-3">
                                <div className="bx--row dashboard__option_row">
                                    <div className="bx--col-lg-16">
                                        {data.name}
                                    </div>
                                </div>
                            </div>
                            <div className="bx--col-lg-3">
                                <div className="bx--row dashboard__option_row">
                                    {ConfidenceIcon(data.confidence)}
                                    <div className="bx--col-lg-14">
                                        {data.confidence}
                                    </div>
                                </div>
                            </div>
                            <div className="bx--col-lg-3">
                                <div className="bx--row dashboard__option_row_column">
                                    <div className="bx--col-lg-8">
                                        {data.status}
                                    </div>
                                    {stautsbar(data.status)}
                                </div>
                            </div>
                            <div className="bx--col-lg-3">
                                <div className="bx--row dashboard__option_row">
                                    <div className="bx--col-lg-16">
                                        {data.user}
                                    </div>
                                </div>
                            </div>
                            <div className="bx--col-lg-2">
                                <div className="bx--row dashboard__option_row">
                                    <div className="bx--col-lg-16">
                                        {data.updts}
                                    </div>
                                </div>
                            </div>
                            <div className="bx--col-lg-1">
                                <OverflowMenu>
                                    <OverflowMenuItem
                                        itemText="Option 1"
                                        primaryFocus
                                    />
                                    <OverflowMenuItem
                                        itemText="Option 2"
                                        requireTitle
                                    />
                                    <OverflowMenuItem itemText="Option 3" />
                                    <OverflowMenuItem itemText="Option 4" hasDivider />
                                </OverflowMenu>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
};

Dashboard.propTypes = {
    files: PropTypes.any
};

export default Dashboard;