import { updateModel } from './model.js';
import { generateModel } from './server.js';
import { generatePattern } from './server.js';

document.getElementById('generateModelButton').onclick = generateModel;
document.getElementById('generatePatternButton').onclick = generatePattern;
document.getElementById('width').onchange = updateModel;
document.getElementById('depth').onchange = updateModel;
document.getElementById('height').onchange = updateModel;
document.getElementById('surface1').onchange = updateModel; //  Surface 1
document.getElementById('surface2').onchange = updateModel; //  Surface 2

window.onload = () => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (!isMobile) {
        updateModel();
    } else {
        document.querySelector('.mobile-message').style.display = 'block';
    }
};
