/*
 * IBM Services Content Intelligence Toolkit - Document Digitization (6949-08M)
 * (C) Copyright IBM Corp. 2021, 2022  All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getEmails } from '../redux/modules/file';
import EmailForm from '../components/EmailForm';

class EmailFormContainer extends Component {
    //   static propTypes = {
    //     emails: PropTypes.object,
    //   }

    constructor(props) {
        super(props);
        this.state = {
            emailText: []
        }
        this.OnTextChange = this.OnTextChange.bind(this)
    }

    OnTextChange = (prop) => (event) => {
        this.setState({ ...this.state.emailText, [prop]: event.target.value })
    }

    componentDidMount = () => {
        console.log(this.props);
        this.props.getEmails(this.props.match.params.id);
    }

    render() {
        return (
            <EmailForm
                emails={this.props.emails}
                OnTextChange={this.OnTextChange}
            />
        );
    }
}

const mapStateToProps = (state) => {
    return {
        emails: state.file.emails
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getEmails: (id) => {
            dispatch(getEmails(id));
        }
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EmailFormContainer);
