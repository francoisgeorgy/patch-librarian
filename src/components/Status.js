import React, {Component} from "react";
import "./Status.css";

class Status extends Component {

    render() {

        const {status, clear} = this.props;

        return (
            <div id="status">
                <div style={{"float":"right"}}><button type="button" id="btn-clear-status-2" className="btn" onClick={clear}>clear status</button></div>
                {status.map((msg, index) => {
                    return <div key={index} className={msg.isError ? "err" : ""}>{msg.message}</div>
                })}
            </div>
        );
    }

}

export default Status;
