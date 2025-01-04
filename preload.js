const { CustomTitlebar, TitlebarColor } = require('custom-electron-titlebar')
const { ipcRenderer, contextBridge, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

if(localStorage.getItem('mcpath') == null) localStorage.setItem('mcpath', path.join(process.env.APPDATA, '/.minecraft/mods/'))
ipcRenderer.on('openfolder', (sender, msg)=>{
    const folder = msg[0];

    // document.body.innerHTML = crawlDir(folder);
    window.dispatchEvent(new CustomEvent('folderopened', {
        detail: crawlDir(folder)
    }))
})

function crawlDir(folder) {
    return fs.readdirSync(folder).map(f=>{
        try {
            return {type: 'file', name: f, data: fs.readFileSync(path.join(folder, f))};
        } catch (error) {
            return {type: 'folder', name: f, data: crawlDir(path.join(folder, f))};
        }
    })
}

window.addEventListener('DOMContentLoaded', () => {
	const replaceText = (selector, text) => {
		const element = document.getElementById(selector)
		if (element) element.innerText = text
	}

	for (const type of ['chrome', 'node', 'electron']) {
		replaceText(`${type}-version`, process.versions[type])
	}

	// eslint-disable-next-line no-new
	new CustomTitlebar({
		backgroundColor: TitlebarColor.fromHex('#29412a'),
		menuTransparency: 0.1
        // containerOverflow: ''
	})
})

contextBridge.exposeInMainWorld('downloadPack', (pack)=>{
    pack.files.forEach(file=>{
        fetch(file.url).then(v=>v.arrayBuffer()).then(buffer=>{
            fs.writeFileSync(path.join(localStorage.getItem('mcpath'), file.name), Buffer.from(buffer));
        });
    })
})

contextBridge.exposeInMainWorld('openInBrowser', (url)=>{
    shell.openExternal(url)
})