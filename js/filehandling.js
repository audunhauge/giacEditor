// @ts-check

import { $ } from './util.js'

/**
 * Adds eventlistener to a button
 * for selecting from directory listing
 * @param {string} id element id for button
 * @param {function} cb handle the list of files
 */
export const showDirButton = (id, cb) => {
    const butDir = $(id);
    butDir.addEventListener('click', async () => {
        const files = [];
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker();
        for await (const entry of dirHandle.values()) {
            files.push(entry);
        }
        cb(files);
    });
}

export const readFileButton = (id, cb) => {
    const butOpenFile = $(id);
    const options = {
        types: [
            {
                description: 'Text Files',
                accept: {
                    'text/plain': ['.mxy','.txt'],
                },
            },
        ],
    };
    butOpenFile.addEventListener('click', async () => {
        // Destructure the one-element array.
        // @ts-ignore
        const [fileHandle] = await window.showOpenFilePicker(options);
        // Do something with the file handle.
        const file = await fileHandle.getFile();
        const contents = await file.text();
        cb(file,contents);
    });
}

async function getNewFileHandle(suggestedName) {
    const options = {
        suggestedName,
        types: [
            {
                description: 'Text Files',
                accept: {
                    'text/plain': ['.mxy'],
                },
            },
        ],
    };
    // @ts-ignore
    const handle = await window.showSaveFilePicker(options);
    return handle;
}

async function writeFile(fileHandle, contents) {
    // Create a FileSystemWritableFileStream to write to.
    const writable = await fileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(contents);
    // Close the file and write the contents to disk.
    await writable.close();
}

export const saveFileButton = (id,filename, cb) => {
    const saveButton = $(id);
    saveButton.addEventListener("click", async () => {
        const fh = await getNewFileHandle(filename);
        writeFile(fh,cb(fh.name));
    })
    
}