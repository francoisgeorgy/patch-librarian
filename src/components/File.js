import React from "react";
import "./File.css";

const File = ({ file, onclick, onremove }) => {
    return (
        <div className={file.selected ? "file selected" : "file"} onClick={onclick}>
            <div className="file-name">{file.name}</div>
            <div className="patches-count">{file.num_patches}&nbsp;patch{ file.num_patches > 1 ? "es" : ""}</div>
            <div className="file-remove"><a href="#remove" onClick={onremove}>remove&nbsp;&#x23CF;</a></div>
        </div>
    );
};

export default File;
