# Implementation notes.

## Data structures

    files {
        hash {
            name
            size
            isSysex
            selected
        }
    }

Patches has it owns array where all patches are consolidated. This is the simplest solution to sort the patches.

    patches [
        patch {
            .index
            .hash
            .filename --> filehash
            .rating                    
            .manufacturer_id
            .manufacturer
            .name
            .number
            .data: Uint8Array       // without manufacturer ID byte(s)
        }
    ]

### PropTypes:
    
TODO

# MIDI IDs

- https://www.midi.org/specifications-old/item/manufacturer-id-numbers
- https://github.com/jazz-soft/JZZ-midi-Gear

# File access

- https://w3c.github.io/FileAPI/
- https://developer.mozilla.org/en-US/docs/Web/API/File

It is not possible to get the path of a file. This is protection put in place by the browser. 

See https://github.com/react-dropzone/react-dropzone/issues/477 for more infos.

# Hash

https://github.com/puleos/object-hash

# UI

- https://github.com/FortAwesome/react-fontawesome
- https://thenounproject.com/term/synthesizer/145742/

