import React, {Component} from "react";
import "./Patches.css";
import Rating from "react-rating";

//TODO: add search/filter box
//TODO: if no name, try to get name from file
//TODO: add "last sent to"

class Patches extends Component {

    state = {
        sort_directions: {   // true == asc, false == desc
            index: false,
            name: false,
            filename: false,
            manufacturer_id: false
        }
    };

    sortPatches = (criteria) => {
        let directions = this.state.sort_directions;
        directions[criteria] = !directions[criteria];
        this.props.patches.sort(
            function(p1, p2) {
                let a = p1[criteria];
                let b = p2[criteria];
                if (a < b) {
                    return directions[criteria] ? -1 : 1;
                }
                if (a > b) {
                    return directions[criteria] ? 1 : -1;
                }
                return 0;
            }
        );
        this.setState({ sort_directions: directions });
    };

    isVisible = (index) => {
        if (this.props.files[this.props.patches[index].filehash].selected) return true;
        return false;
    };

    render() {

        const {patches, files, update, send, print, last_sent} = this.props;

        // if no file selected, display all patches
        let no_file_selected = !Object.keys(files).reduce((accumulator, currentValue) => accumulator || files[currentValue].selected, false);

        return (
            <div id="patches-list" className={"list"}>

                <div className={"patches-header"}>
                    <div className="patch-header-favorite">
                    </div>
                    <div className="patch-header-number">
                        <a href="#index" onClick={() => this.sortPatches("index")}>N</a>
                    </div>
                    <div className="patch-header-name">
                        <a href="#name" onClick={() => this.sortPatches("name")}>Name</a> {/*&#9650; &#9660;*/}
                    </div>
                    <div className="patch-header-filename">
                        <a href="#filename" onClick={() => this.sortPatches("filename")}>File</a> {/*&#9650; &#9660;*/}
                    </div>
                    <div className="patch-header-manufacturer">
                        <a href="#manufacturer_id" onClick={() => this.sortPatches("manufacturer_id")}>Manufacturer</a> {/*&#9650; &#9660;*/}
                    </div>
                    <div className={"patch-header-actions"}>
                    </div>
                </div>

                {patches.map((patch, index) => {
                    if (no_file_selected || this.isVisible(index)) {
                        return (
                            <div className={last_sent === index ? "patch selected" : "patch"} key={index}>
                                <div className="patch-favorite">
                                    <Rating
                                        stop={3}
                                        direction={"rtl"}
                                        emptySymbol={<span className="icon-text">&#x2606;</span>}
                                        fullSymbol={<span className="icon-text">&#x2605;</span>}
                                        initialRating={patch.rating}
                                        onChange={(rating) => update(index, 'rating', rating)}
                                    />&nbsp;
                                    <a href="#0" onClick={(e) => {console.log('rating click', e); update(index, 'rating', 0)}}>&#215;</a>
                                </div>
                                <div className="patch-number">
                                    {patch.index}
                                </div>
                                <div className="patch-name">
                                    {patch.name}
                                </div>
                                <div className="patch-filename">{files[patch.filehash].name}</div>
                                <div className="patch-manufacturer">{patch.manufacturer}</div>
                                <div className={"patch-actions"}>

                                    <span className="patch-print-link"><button type="button" className="btn" onClick={() => print(index)}>&#x2399;</button></span>
                                    <span className="patch-send-link"><button type="button" className="btn" onClick={() => send(index)}>SEND &#9654;</button></span>
                                </div>
                            </div>
                        );
                    } else {
                        return null;
                    }
                })}

            </div>
        );
    }

}

export default Patches;
