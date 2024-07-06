import { updateModel } from './model.js';
import { generateModel } from './server.js';
import { generatePattern } from './server.js';

document.getElementById('generateModelButton').onclick = generateModel;
document.getElementById('generatePatternButton').onclick = generatePattern;
document.getElementById('width').onchange = validateAndUpdateModel;
document.getElementById('depth').onchange = validateAndUpdateModel;
document.getElementById('height').onchange = validateAndUpdateModel;
document.getElementById('surface1').onchange = updateModel; // Surface 1
document.getElementById('surface2').onchange = updateModel; // Surface 2

window.onload = () => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (!isMobile) {
        updateModel();
    } else {
        document.querySelector('.mobile-message').style.display = 'block';
    }
};

function validateAndUpdateModel(event) {
    const standardValues = {
        width: 140,
        depth: 230,
        height: 120
    };

    const target = event.target;
    const value = parseInt(target.value);
    let minValue, maxValue;

    switch(target.id) {
        case 'width':
            minValue = standardValues.width * 0.1;
            maxValue = standardValues.width * 2;
            break;
        case 'depth':
            minValue = standardValues.depth * 0.1;
            maxValue = standardValues.depth * 2;
            break;
        case 'height':
            minValue = standardValues.height * 0.1;
            maxValue = standardValues.height * 2;
            break;
        default:
            return;
    }

    if (value < minValue) {
        target.value = minValue;
    } else if (value > maxValue) {
        target.value = maxValue;
    }

    updateModel();
}
