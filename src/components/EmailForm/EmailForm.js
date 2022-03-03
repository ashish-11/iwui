import React from "react";
import "./index.scss";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const EmailForm = (props) => {

    const { emails } = props;
    return (
        <div className="App">
            <div className="bx--header">
            <h5 className="DetailEmail">Details of Email Received</h5>
            </div>
            <div className="container-fluid py-5 mx-auto">
                <div className="row d-flex justify-content-center">
                    <div className="col-xl-9 col-lg-10 col-md-11 col-12 text-center">
                        {emails ?
                            <div className="card">
                                <form className="form-card">
                                    <div className="row justify-content-between text-left">
                                        <div className="form-group col-sm-6 flex-column d-flex">
                                            {" "}
                                            <label className="form-control-label px-3 text">
                                                From
                                            </label>{" "}
                                            <input
                                                type="text"
                                                name="from"
                                                value={emails.emailFrom}
                                                className="form-control"
                                                // onBlur="validate(1)"
                                                disabled
                                            />{" "}
                                        </div>
                                        <div className="form-group col-sm-6 flex-column d-flex">
                                            <label className="form-control-label px-3 text">
                                                Email Type
                                            </label>
                                            <input
                                                type="text"
                                                name="emailtype"
                                                value={emails.emailType}
                                                className="form-control"
                                            // onBlur="validate(2)"
                                            // disabled={(this.state.disabled) ? "disabled" : ""}
                                            />
                                            <button className="Editbutton" > <span className="glyphicon glyphicon-pencil"></span> </button>
                                        </div>
                                    </div>
                                    <div className="row justify-content-between text-left">
                                        <div className="form-group col-sm-6 flex-column d-flex">
                                            {" "}
                                            <label className="form-control-label px-3 text">
                                                Subject
                                            </label>{" "}
                                            <input
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                value={emails.emailSubject}
                                                className="form-control"
                                                placeholder=""
                                                // onBlur="validate(3)"
                                                disabled
                                            />{" "}
                                        </div>
                                        <div className="form-group col-sm-6 flex-column d-flex">
                                            {" "}
                                            <label className="form-control-label px-3 text">
                                                Attachments
                                            </label>{" "}
                                            <ul className="attachment-list">
                                                {emails.attachments.map((attachment) => {
                                                    return <li key={attachment.documentName}
                                                        id="attachment"
                                                        name="attachment"
                                                    >
                                                        <Link
                                                            to={`/tablePage/${attachment.documentId}`}
                                                        >{attachment.documentName}
                                                        </Link>
                                                    </li>
                                                })}
                                            </ul>
                                            {/* <input
                                                type="text"
                                                id="attachment"
                                                name="attachment"
                                                value={emails.attachments}
                                                className="form-control"
                                                placeholder=""
                                            // onBlur="validate(4)"
                                            />{" "} */}
                                        </div>
                                    </div>
                                    <div className="row justify-content-between text-left">
                                        <div className="form-group col-sm-6 flex-column d-flex">
                                            {" "}
                                            <label className="form-control-label px-3 text">
                                                Body
                                            </label>{" "}
                                            <textarea
                                                value={emails.emailBody}
                                                className="form-control"
                                                rows="10"
                                                // onBlur="validate(6)"
                                                disabled
                                            ></textarea>{" "}
                                        </div>
                                        <div className="form-group col-sm-6 flex-column d-flex">
                                        </div>
                                    </div>
                                </form>
                            </div>
                            :
                            <>No Emails Found</>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

EmailForm.propTypes = {
    emails: PropTypes.object
};

export default EmailForm;