const fs = require('fs-extra');
const path = require('path');
const xml = require('libxmljs');

console.log('Hello world');

const ICON_KEYS = [
    'Ultralight-S',
    'Thin-S',
    'Light-S',
    'Regular-S',
    'Medium-S',
    'Semibold-S',
    'Bold-S',
    'Heavy-S',
    'Black-S',
    'Ultralight-M',
    'Thin-M',
    'Light-M',
    'Regular-M',
    'Medium-M',
    'Semibold-M',
    'Bold-M',
    'Heavy-M',
    'Black-M',
    'Ultralight-L',
    'Thin-L',
    'Light-L',
    'Regular-L',
    'Medium-L',
    'Semibold-L',
    'Bold-L',
    'Heavy-L',
    'Black-L',
];
const TEMPLATE_SOURCE = path.join(process.cwd(), 'src/svg/templates');
const DESTINATION = path.join(process.cwd(), 'src/svg/dist');

function readTemplate(source, callback) {
    fs.readFile(source, 'utf8', (err, data) => {
        if (err) throw err;
        const template = parseTemplate(data);
        callback(template);
    });
}

function parseTemplate(template) {
    const document = xml.parseXmlString(template, { noblanks: true });

    let symbols;
    for(const node of document.childNodes()) {
        if (node.find('./@id="Symbols"')) symbols = node;
    }

    const symbol_object = symbols.childNodes().reduce((object, symbol) => {
        const id = symbol.attr('id').value();
        return Object.assign({
            ...object,
            [id]: symbol.toString()
        })
    });

    return symbol_object;
}

function templateToSvgCode(template) {
    return `<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="3300" height="2200">${template}</svg>`;
}

/**
 * Writes file contents to a directory
 * @param {*} filename - File name
 * @param {*} contents - Contents of the file
 */
async function writeToFile(filename, contents) {
    return new Promise((resolve, reject) => {
        fs.ensureFileSync(filename);
        fs.writeFile(filename, contents, (err) => {
            if (err) reject(err);
            resolve();
        })
    })
}

async function readTemplatesDirectory(dir, callback) {
    // return await fs.readdir(dir, (err, files) => {
    //     if (err) throw(err);

    //     const template_files = files.map(file => {
    //         const parsed = path.parse(file);
    //         if (parsed.ext === '.svg') {
    //             return ({
    //                 name: parsed.name,
    //                 path: `${dir}/${file}`
    //             });
    //         }
    //     });

    //     callback(template_files);
    // });
    const contents = await fs.readdir(dir);
    return contents.map(file => {
        const parsed = path.parse(file);
        if (parsed.ext === '.svg') {
            return ({
                name: parsed.name,
                path: `${dir}/${file}`
            });
        }
    }).filter(f => f !== undefined);
}

async function load() {
    console.log('Reading template...');

    let template_files = await readTemplatesDirectory(TEMPLATE_SOURCE);
    console.log(template_files);

    // readTemplatesDirectory(TEMPLATE_SOURCE, (files) => {
        // Object.keys(files).forEach(key => {
        //     if (files[key]) {
        //         const icon_name = files[key].name;
        //         readTemplate(files[key].path, template => {
        //             Object.keys(template).forEach(key => {
        //                 writeToFile(`${DESTINATION}/${icon_name}/${key}.svg`, templateToSvgCode(template[key]));
        //             });
        //         });
        //     }
        // })
    // });    
}

load();