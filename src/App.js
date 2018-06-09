import React, {Component} from 'react';
import Dropzone from "react-dropzone";
import Patches from "./components/Patches.js";
import hash from "object-hash";
import "inter-ui";
import './App.css';
import {isSysexData, parseSysexData} from "./utils/sysex";
import File from "./components/File";
import Midi from "./components/Midi";
import MidiPorts from "./components/MidiPorts";
import {portFromId} from "./utils/ports";
import SimpleStorage from "react-simple-storage";
import fontawesome from '@fortawesome/fontawesome'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import brands from '@fortawesome/fontawesome-free-brands';
import Status from "./components/Status";

fontawesome.library.add(brands);

const MAX_FILE_SIZE = 5 * 1024*1024;

//TODO: skip duplicate files with the use of the hash
//TODO: use redux !

class App extends Component {

    state = {
        theme: "light",
        outputs: {},            // selected outputs
        files: {},              // key is file's hash; NOT a File object
        patches: [],            // list of patches
        stars: {},      // keep a list of starred patches' hashes
        last_sent: -1,          // index of last patch sent
        status: []              // status messages
    };

    async readFiles(files) {
        await Promise.all(files.map(
            async file => {
                if (file.size > MAX_FILE_SIZE) {
                    console.log(`${file.name}: too big, ${file.size}`);
                } else {
                    const data = await new Response(file).arrayBuffer();

                    if (isSysexData(data)) {

                        let patch_file = {};
                        patch_file.name = file.name;
                        patch_file.type = file.type;
                        patch_file.lastModified = file.lastModified;
                        patch_file.size = file.size;

                        patch_file.selected = false;  // default value

                        let patches = parseSysexData(data);
                        patch_file.num_patches = patches.length;        // number of patches found in file


                        //Object.keys(stars).map(patch_hash => patchesfiles[file_hash].selected = true);
                        patches.map(p => {
                            p.rating = this.state.stars.hasOwnProperty(p.hash) ? this.state.stars[p.hash] : 0;
                            return p;
                        });

                        //TODO: what to do if file (hash) already in list? Just override?

                        //TODO: if no name, try to get name from file
                        let f = this.state.files;

                        let file_hash = hash.sha1(data);
                        f[file_hash] = patch_file;
                        this.setState(prevState => ({
                            files : f,
                            patches: [...prevState.patches, ...patches.map(p => {p.filename = patch_file.name; p.filehash = file_hash; return p})] // keep filename to ease the sorting
                        }));
                    }
                    // non sysex files are ignored
                }
                // too big files are ignored
            }
        ));
    }

    clearStatus = () => {
        this.setState({status:[]});
    };

    updateStatus = (message, isError = false) => {
        this.setState(prevState => ({
            status: [{message, isError}, ...prevState.status]  // add at beginning because we display them in reverse chronological order
        }));
    };

    updatePatch = (index, key, value) => {
        let patches = this.state.patches;
        patches[index][key] = value;

        let stars = this.state.stars;
        if (key === 'rating') {

            console.log(index, value, patches[index].rating);

            // let stars = this.state.patches_starred;
            // if (stars.hasOwnProperty(patches[index].hash))
            // if (patches[index].rating === value) patches[index].rating = 0;
            stars[patches[index].hash] = value;
        }

        this.setState({ patches, stars });
    };

    // mark the latest patch sent
    updateLastSent = (index) => {
        this.setState({last_sent: index});
    };

    sendPatch = (index) => {
        if (this.state.outputs) {
            let s = false;
            for (let id of Object.getOwnPropertyNames(this.state.outputs)) {
                let port = portFromId(id);
                port.sendSysex(this.state.patches[index].manufacturer_id_bytes, Array.from(this.state.patches[index].data));
                s = true;
                this.updateLastSent(index);
                this.updateStatus(`patch ${this.state.patches[index].name} sent to ${port.name}`);
            }
            if (!s) {
                this.updateStatus("You need to enable an output in order the send a patch to it.", true);
            }
        } else {
            this.updateStatus("There are no output available.", true);
        }
    };

    onDrop = (files) => {
        this.readFiles(files);  // returned promise is ignored, this is normal.
    };

    onOutputChange = () => {
        console.log('onOutputChange');
        let outs = {};
        this.setState({ outputs: outs });
    };

    togglePort = (port_id) => {
        let p = portFromId(port_id);
        let outs = this.state.outputs;
        if (outs.hasOwnProperty(p.id)) {
            delete outs[p.id];
        } else {
            outs[p.id] = {
                manufacturer: p.manufacturer,
                name: p.name
            };
        }
        this.setState({ outputs: outs });
    };

    selectTheme = (theme) => {
        this.setState({ theme: theme });
    };

    selectFile = (file_hash) => {
        let files = this.state.files;
        //TODO: check index is valid
        files[file_hash].selected = !files[file_hash].selected;
        this.setState({ files });
    };

    selectAllFiles = () => {
        let files = this.state.files;
        Object.keys(files).map(file_hash => files[file_hash].selected = true);
        this.setState({ files });
    };

    deselectAllFiles = () => {
        let files = this.state.files;
        Object.keys(files).map(file_hash => files[file_hash].selected = false);
        this.setState({ files });
    };

    removeAllFiles = () => {
        this.setState({
            files: {},
            patches: []
        });
    };

    removeFile = (file_hash) => {

        let files = this.state.files;
        delete files[file_hash];

        // remove the patches of the removed file:
        let patches = this.state.patches;
        let index = null;
        do {
            index = patches.findIndex(patch => patch.filehash === file_hash);
            if (index > -1) {
                patches.splice(index, 1);
            }
        } while (index > -1);

        this.setState({ files, patches });
    };

    render() {

        const { theme, outputs, files, patches, status, last_sent } = this.state;

        document.documentElement.setAttribute('data-theme', theme);

        // TODO: remove file from list; ignore file from list

        let no_file_selected = !Object.keys(files).reduce((accumulator, currentValue) => accumulator || files[currentValue].selected, false);
        let n_sel_patches = no_file_selected ? patches.length : patches.reduce((accumulator, currentValue) => accumulator + (files[currentValue.filehash].selected ? 1 : 0), 0);

        return (
            <div className="App">

                <SimpleStorage parent={this} blacklist={["outputs", "files", "patches", "last_sent", "status"]} />

                <Midi onOutputChange={this.onOutputChange} />

                <div id={"header"}>
                    <div id={"app-name"}>SysEx librarian &bull; Version 0.2.0</div>
                    <button type="button" id="btn-clear-status" className="btn wide-spaced" onClick={this.clearStatus}>clear status</button>
                    <button type="button" id="btn-select-dark-theme" className="btn spaced" onClick={() => this.selectTheme("dark")}>dark theme</button>
                    <button type="button" id="btn-select-light-theme" className="btn wide-spaced" onClick={() => this.selectTheme("light")}>light theme</button>
                    <a href="https://github.com/francoisgeorgy" target="_blank" rel="noopener noreferrer"
                        title="Documentation, help and source code available on GitHub">
                        <FontAwesomeIcon icon={['fab', 'github']} size="2x" className="github" />
                    </a>
                </div>

                <div id="empty-row"/>

                <div id="empty-col-left"/>

                <div id="files-list-header" className="list-header">
                    <h2>Files</h2>
                    <button type="button" id="btn-select-all-files" className="btn" onClick={this.selectAllFiles}>select all</button>
                    <button type="button" id="btn-deselect-all-files" className="btn" onClick={this.deselectAllFiles}>deselect all</button>
                    <button type="button" id="btn-remove-all-files" className="btn" onClick={this.removeAllFiles}>remove all</button>
                </div>

                <div id="files-list" className="list">
                {
                    Object.keys(files).map(
                        (file_hash, index) => <File key={index} file={files[file_hash]}
                                                    onclick={() => this.selectFile(file_hash)}
                                                    onremove={(e) => {e.stopPropagation();e.nativeEvent.stopImmediatePropagation();this.removeFile(file_hash)}} />
                    )
                }
                </div>

                <Dropzone id="drop-zone" onDrop={this.onDrop} className="drop-zone">
                    Drop files here or click to open file dialog
                </Dropzone>

                <div id="empty-col-middle-left"/>

                <div id="patches-list-header" className="list-header">
                    <h2>Patches</h2>
                    <span id="patches-count">{ n_sel_patches } patch{ n_sel_patches > 1 ? "es" : "" }</span>
                </div>

                <Patches patches={patches} files={files} outputs={outputs} last_sent={last_sent} update={this.updatePatch} send={this.sendPatch} />

                <Status status={status} />

                <div id="empty-col-middle-right"/>

                <MidiPorts outputs={outputs} onToggle={this.togglePort} />

                <div id="empty-col-right"/>

{/*                <div id="debug">
                    <pre>{JSON.stringify(this.state, null, 4)}</pre>
                </div>*/}

            </div>
        );
    }
}

export default App;
