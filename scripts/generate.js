const fs = require('fs-extra');
const path = require('path');
const xml = require('libxmljs');

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
const TEMPLATE_SOURCE = path.join(process.cwd(), 'src/svg/templates-test');
const DESTINATION = path.join(process.cwd(), 'src/svg/dist');

/**
 * Read a template from a system path
 * @param {*} source - source path
 * @returns {Object} libxmljs template object
 */
async function readTemplate(source) {
    return fs.readFile(source, 'utf8').then(data => {
        const template = parseTemplate(data);
        return template;
    }).catch(error => { throw error });
}

/**
 * Parse the SF Symbols template for necessary components
 * @param {*} template 
 * @returns {Object} Symbol object
 */
function parseTemplate(template) {
    const document = xml.parseXmlString(template, { noblanks: true });

    let symbols;
    let guides;
    for(const node of document.childNodes()) {
        if (node.find('./@id="Symbols"')) symbols = node;
        if (node.find('./@id="Guides"')) guides = node;
    }

    /**
     * Returns a symbol object with the name as the key and the svg code as the value
     */
    const symbol_object = symbols.childNodes().reduce((object, symbol) => {
        const id = symbol.attr('id').value();
        return Object.assign({
            ...object,
            [id]: symbol.toString()
        })
    });

    /**
     * Parse the margins for each symbol
     */
    let margins = {};
    guides.childNodes().forEach((guide) => {
        const id = guide.attr('id').value();
        if (id === 'left-margin') {
            margins.left = guide.attr('width').value();
        }
        if (id === 'right-margin') {
            margins.right = guide.attr('width').value();
        }
    })

    return {
        symbols: symbol_object,
        margins
    };
}

/**
 * TODO: Fix the dimensions by reading from the margins inside the template
 * @param {string} template - libxmljs xml string
 */
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

/**
 * Reads the template directory and returns a template directory object
 * @param {*} dir - Directory containing templates
 * @returns {Object} - { name: string, path: string }
 */
async function readTemplatesDirectory(dir) {
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

/**
 * Generates the individual svg files into the destination directory
 */
async function generate() {
    let template_files = await readTemplatesDirectory(TEMPLATE_SOURCE);

    for (const file of template_files) {
        console.log(`Generating ${file.name}`);
        let template = await readTemplate(file.path);

        let { symbols, margins } = template;
        Object.keys(symbols).forEach(key => {
            writeToFile(`${DESTINATION}/${file.name}/${key}.svg`, templateToSvgCode(symbols[key]));
        });
    }  
}

generate();