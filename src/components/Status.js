import React, {Component} from "react";
import "./Status.css";

class Status extends Component {

    render() {

        const {status} = this.props;

        return (
            <div id="status">
                {status.map((msg, index) => {
                    return <div key={index} className={msg.isError ? "err" : ""}>{msg.message}</div>
                })}
            </div>
        );
    }

}

export default Status;
