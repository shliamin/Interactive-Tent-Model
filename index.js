import { updateModel } from './model.js';
import { generateSemiEllipse, interpolateSurface, calculateDiagonals, linspace } from './model-utils.js';

document.getElementById('generateModelButton').onclick = () => savePayloadAndRedirect(3);
document.getElementById('generatePatternButton').onclick = () => savePayloadAndRedirect(10);
document.getElementById('width').onchange = validateAndUpdateModel;
document.getElementById('depth').onchange = validateAndUpdateModel;
document.getElementById('height').onchange = validateAndUpdateModel;
document.getElementById('surface1').onchange = updateModel;
document.getElementById('surface2').onchange = updateModel;
document.getElementById('applyPromoCodeButton').onclick = applyPromoCode;

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

    switch (target.id) {
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

    if (value < minValue || value > maxValue) {
        showPopup();
        target.value = value < minValue ? minValue : maxValue;
    }

    updateModel();
}

function showPopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'block';
    document.body.classList.add('blurred');

    const closeButton = document.getElementById('closePopup');
    closeButton.onclick = function () {
        popup.style.display = 'none';
        document.body.classList.remove('blurred');
        removeBackgroundBlur();
    };

    window.onclick = function (event) {
        if (event.target == popup) {
            popup.style.display = 'none';
            document.body.classList.remove('blurred');
            removeBackgroundBlur();
        }
    };

    addBackgroundBlur();
}

function addBackgroundBlur() {
    const blurDiv = document.createElement('div');
    blurDiv.classList.add('background-blur');
    blurDiv.id = 'backgroundBlur';
    document.body.appendChild(blurDiv);
}

function removeBackgroundBlur() {
    const blurDiv = document.getElementById('backgroundBlur');
    if (blurDiv) {
        document.body.removeChild(blurDiv);
    }
}

function showSpinner() {
    document.getElementById('spinner').style.display = 'block';
}

function hideSpinner() {
    document.getElementById('spinner').style.display = 'none';
}

async function savePayloadAndRedirect(amount) {
    showSpinner();

    const payload = getPayload();

    try {
        const response = await fetch('https://interactive-tent-0697ab02fbe0.herokuapp.com/save_payload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ payload, amount })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (data.status === 'success') {
                redirectToPaypalMe(amount);
            }
        } else if (contentType && contentType.includes('application/zip')) {
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'models.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    } finally {
        hideSpinner();
    }
}

function getPayload() {
    const width = parseFloat(document.getElementById('width').value);
    const depth = parseFloat(document.getElementById('depth').value);
    const height = parseFloat(document.getElementById('height').value);

    const numPoints = 100;

    const { lengths: [diagonal1, diagonal2] } = calculateDiagonals(width, depth);
    const semiEllipse1 = generateSemiEllipse(diagonal1 / 2, height, numPoints);
    const semiEllipse2 = generateSemiEllipse(diagonal2 / 2, height, numPoints);
    const x_fine1 = semiEllipse1.x;
    const z_fine1 = semiEllipse1.y;
    const x_fine2 = semiEllipse2.x;
    const z_fine2 = semiEllipse2.y;
    const y = linspace(0, depth, numPoints);

    const arc1 = {
        x: x_fine1,
        y: y,
        z: z_fine1
    };

    const arc2 = {
        x: x_fine1.map(x => -x),
        y: y,
        z: z_fine1
    };

    const arc3 = {
        x: [...arc1.x].reverse(),
        y: [...arc1.y].reverse(),
        z: [...arc1.z].reverse()
    };

    const surface1 = interpolateSurface(arc1, arc2, numPoints);
    const surface2 = interpolateSurface(arc2, arc3, numPoints);
    const surface3 = interpolateSurface(arc1, arc2, numPoints, 5, true);
    const surface4 = interpolateSurface(arc2, arc3, numPoints, 5, true);

    return {
        width,
        depth,
        height,
        surface1,
        surface2,
        surface3,
        surface4,
        enable_relaxation: true
    };
}

function redirectToPaypalMe(amount) {
    let paypalMeLink = `https://www.paypal.me/efimsh/${amount}`;
    window.location.href = paypalMeLink;
}

async function applyPromoCode() {
    showSpinner();

    const promoCode = document.getElementById('promoCode').value;
    const payload = getPayload();

    try {
        const response = await fetch('https://interactive-tent-0697ab02fbe0.herokuapp.com/promo/check_promo_code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ promo_code: promoCode, payload })
        });

        if (!response.ok) {
            throw new Error('Invalid promo code');
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (data.status === 'success') {
                window.location.href = data.redirect_url;
            } else {
                alert('Invalid promo code');
            }
        } else if (contentType && contentType.includes('application/zip')) {
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'My_tent.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        alert('Invalid promo code');
    } finally {
        hideSpinner();
    }
}
