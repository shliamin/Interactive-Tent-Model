import { calculateArcLength, generateSemiEllipse, calculateDiagonals, linspace } from './model-utils.js';

export function updateModel() {
    // Convert values from centimeters to meters
    const width = parseFloat(document.getElementById('width').value) / 100;
    const depth = parseFloat(document.getElementById('depth').value) / 100;
    const height = parseFloat(document.getElementById('height').value) / 100;

    console.log(`Width: ${width}, Depth: ${depth}, Height: ${height}`);

    // Calculate the diagonals
    const [diagonal1, diagonal2] = calculateDiagonals(width, depth);
    console.log(`Diagonals: ${diagonal1}, ${diagonal2}`);

    // Generate semi-ellipses for both diagonals
    const semiEllipse1 = generateSemiEllipse(diagonal1 / 2, height, 100);
    const semiEllipse2 = generateSemiEllipse(diagonal2 / 2, height, 100);
    
    const x_fine1 = semiEllipse1.x;
    const z_fine1 = semiEllipse1.y;
    const x_fine2 = semiEllipse2.x;
    const z_fine2 = semiEllipse2.y;
    const y = linspace(0, depth, 100);

    console.log(`x_fine1: ${x_fine1}, z_fine1: ${z_fine1}`);
    console.log(`x_fine2: ${x_fine2}, z_fine2: ${z_fine2}`);
    console.log(`y: ${y}`);

    // Validate arc data
    if (!Array.isArray(x_fine1) || !Array.isArray(z_fine1) || !Array.isArray(x_fine2) || !Array.isArray(z_fine2) || !Array.isArray(y)) {
        console.error("Error in arc data.");
        return;
    }

    // Create arcs
    const arc1 = {
        x: x_fine1,
        y: y,
        z: z_fine1,
        type: 'scatter3d',
        mode: 'lines',
        line: { color: 'blue', width: 5 }
    };
    
    const arc2 = {
        x: x_fine1.map(x => -x),
        y: y,
        z: z_fine1,
        type: 'scatter3d',
        mode: 'lines',
        line: { color: 'blue', width: 5 }
    };

    console.log(`arc1: ${arc1}, arc2: ${arc2}`);
    
    // Scale axes based on arc end points
    const allX = arc1.x.concat(arc2.x);
    const allY = arc1.y.concat(arc2.y);
    const allZ = arc1.z.concat(arc2.z);
    
    // Scale axes based on width, depth, and height
    const minX = -width / 2;
    const maxX = width / 2;
    const minY = 0;
    const maxY = depth;
    const minZ = 0;
    const maxZ = height;
    
    console.log(`X range: [${minX}, ${maxX}], Y range: [${minY}, ${maxY}], Z range: [${minZ}, ${maxZ}]`);
    
    // Calculate arc lengths
    let arcLength1 = calculateArcLength(arc1);
    let arcLength2 = calculateArcLength(arc2);
    
    console.log(`Arc lengths: ${arcLength1}, ${arcLength2}`);
    
    // Initialize graph data
    let data = [];
    
    // Add arcs to graph
    data.push(arc1);
    data.push(arc2);
    
    // Visualize x, y, z axes separately
    const xAxis = {
        x: [minX, maxX],
        y: [0, 0],
        z: [0, 0],
        type: 'scatter3d',
        mode: 'lines',
        line: { color: 'red', width: 2 }
    };
    
    const yAxis = {
        x: [0, 0],
        y: [minY, maxY],
        z: [0, 0],
        type: 'scatter3d',
        mode: 'lines',
        line: { color: 'green', width: 2 }
    };
    
    const zAxis = {
        x: [0, 0],
        y: [0, 0],
        z: [minZ, maxZ],
        type: 'scatter3d',
        mode: 'lines',
        line: { color: 'blue', width: 2 }
    };
    
    data.push(xAxis);
    data.push(yAxis);
    data.push(zAxis);
    
    // Update arc lengths
    document.getElementById('arcLength').innerText = `Arcs length: ${(arcLength1 + arcLength2).toFixed(2)} m`;
    
    let layout = {
        scene: {
            xaxis: {
                title: 'Width',
                dtick: 0.1, // Grid step on X axis 10 cm
                range: [minX, maxX]
            },
            yaxis: {
                title: 'Depth',
                dtick: 0.1, // Grid step on Y axis 10 cm
                range: [minY, maxY]
            },
            zaxis: {
                title: 'Height',
                dtick: 0.1, // Grid step on Z axis 10 cm
                range: [minZ, maxZ]
            },
            aspectratio: {
                x: width / Math.max(width, depth, height),
                y: depth / Math.max(width, depth, height),
                z: height / Math.max(width, depth, height)
            },
            camera: {
                eye: {
                    x: 2, // Adjust these values to zoom out the camera
                    y: 1,
                    z: 2
                },
                center: {
                    x: 0.5, // Shift right (positive value)
                    y: 0,
                    z: 0.1 // Shift down (negative value)
                }
            }
        },
        legend: {
            y: -0.2,
            yanchor: 'top'
        },
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0
        }
    };
    
    Plotly.newPlot('tentModel', data, layout);

}
