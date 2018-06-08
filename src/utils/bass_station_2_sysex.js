
// offset 137, 16 bytes: Patch name (16 ASCII chars)

/**
 *
 * @param data Uint8Array
 */
function getInfos(data) {
    let infos = {};
    if (data.length >= 133 + 16) {  //FIXME: adapt offset for each device
        let s = "";
        for (let i = 0; i < 16; i++) {
            // console.log(`${i} ${data[137 + i]}`);
            s += String.fromCharCode(data[133 + i]);
        }
        infos.patch_name = s;
    } else {
        // console.log("no patch name", data.length);
        infos.patch_name = "";
    }
    infos.patch_number = data[5];
    return infos;
}

export default getInfos;
