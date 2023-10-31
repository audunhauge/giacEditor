// @ts-check

import { $ } from './util.js'
import { getLocalJSON } from './Minos.js'
import { config } from './editor.js';

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
                    'text/plain': ['.mxy', '.txt'],
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
        cb(file, contents);
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

export const saveFileButton = (id, filename, cb) => {
    const saveButton = $(id);
    saveButton.addEventListener("click", async () => {
        const fh = await getNewFileHandle(filename);
        writeFile(fh, cb(fh.name));
    })

}


const _gitFiles = async (user, repo) => {
    try {
        const resp = await fetch(`https://api.github.com/search/code?q=extension:mxy+repo:${user}/${repo}`)
        const json = await resp.json();
        return json;
    } catch (err) {
        console.log(err);
        return ({ items: [] });  // empty array
    }
}


// used by python to fetch json api
export const getJSONurl = async (url, jsn) => {
    const init = {
        method: "POST",
        body: jsn,
        headers: {
            "Content-Type": "application/json",
            "Accept-Charset": "UTF-8"
        },
    };
    try {
        const resp = await fetch(url, init);
        //const txt = await resp.text();
        const json = await resp.json();
        return json;
        //return txt;
    } catch (err) {
        console.log(err);
        return ({ items: [] });  // empty array
    }
}

const userRepo = () => {
    const user = config["git_user"] || "";
    const repo = config["git_hub_repo"] || "";
    const token = config["git_st_token"] || "";
    return { user, repo, token };
}

export const gitFiles = async () => {
    const { user, repo } = userRepo();
    const files = await _gitFiles(user, repo);
    if (files.items) {
        return files.items.map(f => f.path);
    }
    return [];
}

export const getGitFile = async (filename) => {
    const { user, repo } = userRepo();
    try {
        const resp = await fetch(`https://raw.githubusercontent.com/${user}/${repo}/main/${filename}`)
        const text = await resp.text()
        return text;
    } catch (err) {
        console.log(err);
        return ''
    }
}


export const getGistFile = async (filename) => {
    //const {user,repo} = userRepo();
    try {
        const resp = await fetch(`${filename}`)
        const text = await resp.text()
        return text;
    } catch (err) {
        console.log(err);
        return ''
    }
}

export const updateGist = async (id, name, content, description = "mcas") => {
    const { token } = userRepo();
    const url = `https://api.github.com/gists/${id}`;
    const header = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
    }
    const gistInfo = {
        description,
        public: "true",
        files: {}
    };

    gistInfo.files[name] = { filename: name, content };
    try {
        fetch(url, {
            method: "PATCH",
            headers: header,
            body: JSON.stringify(gistInfo),
        });
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
    /*
    const init = {
        method: "PATCH",
        body: JSON.stringify(gistInfo),
        headers: {
            "Content-Type": "application/vnd.github.v3+json"
        },
    };
    // @ts-ignore
    fetch(`https://api.github.com/gists/${id}`, init).catch((e) =>
        console.log("Saving gist - virka ikke.", e)
    );
    */
}

export const writeGist = async (file, name, description = "mcas") => {
    const { token } = userRepo();
    const url = 'https://api.github.com/gists';
    const header = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
    }
    const gistInfo = {
        description,
        public: "true",
        files: {}
    };
    gistInfo.files[name] = { content: file };
    try {
        fetch(url, {
            method: "post",
            headers: header,
            body: JSON.stringify(gistInfo),
        });
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export const writeGit = async (content, path) => {
    const { token, user } = userRepo();
    const url = `https://api.github.com/repos/${user}/${path}/git/blobs`;
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
    }
    const gistInfo = {
        encoding:"utf-8",
        owner:`${user}`,
        repo:path,
        content,
    };

    try {
        fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(gistInfo),
        });
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const _gistFiles = async (user) => {
    try {
        const resp = await fetch(`https://api.github.com/users/${user}/gists?per_page=100`);
        const json = await resp.json();
        return json;
    } catch (err) {
        console.log(err);
        return ([]);  // empty array
    }
}

export const gistFiles = async () => {
    const { user } = userRepo();
    return gistList(user);
}

export const gistList = async (user) => {
    const files = await _gistFiles(user);
    const list = [];
    if (Array.isArray(files))
        files.forEach(f => {
            const id = f.id;
            const filenames = Object.values(f.files);
            const items = filenames.map(n => ({ id, name: n.filename, url: n.raw_url }))
            list.push(...items);
        });
    return list;
}