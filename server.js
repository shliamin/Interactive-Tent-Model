import { interpolateSurface, circularArc, halfCircularArc, interpolateSurfaceUntilIntersection } from './model.js';

const socket = io('https://interactive-tent-0697ab02fbe0.herokuapp.com');

socket.on('task_status', (data) => {
    console.log(`Received update for task ${data.task_id}: ${data.status_msg} (${data.current}/${data.total})`);
    const progressElement = document.getElementById('progress');
    if (data.status === 'completed') {
        progressElement.style.display = 'none';
        const downloadLink = document.createElement('a');
        downloadLink.href = `https://interactive-tent-0697ab02fbe0.herokuapp.com/download/${data.task_id}`;
        downloadLink.click();
    } else if (data.status === 'failed') {
        progressElement.style.display = 'none';
        alert('Task failed: ' + data.error);
    } else {
        const percentage = (data.current / data.total) * 100;
        progressElement.innerText = `${data.status_msg} - ${percentage.toFixed(2)}%`;
        progressElement.style.display = 'block';
    }
});

export async function generateModel() {
    const width = parseFloat(document.getElementById('width').value);
    const depth = parseFloat(document.getElementById('depth').value);
    const height = parseFloat(document.getElementById('height').value);

    console.log('Current values for 3D Model:', { width, depth, height });

    const arc1 = circularArc([0, 0], [width, depth], height);
    const arc2 = circularArc([width, 0], [0, depth], height);
    const arc3 = circularArc([0, 0], [width, depth], height);
    const arc4 = circularArc([0, depth], [width, 0], height);
    const arc5 = halfCircularArc([0, 0], [width, depth], height);
    const arc6 = halfCircularArc([width, 0], [0, depth], height);
    const arc7 = halfCircularArc([0, 0], [width, depth], height);
    const arc8 = halfCircularArc([0, depth], [width, 0], height);

    const surface1 = interpolateSurface(arc1, arc2);
    const surface2 = interpolateSurface(arc3, arc4);
    const surface3 = interpolateSurfaceUntilIntersection(arc5, arc6);
    const surface4 = interpolateSurfaceUntilIntersection(arc7, arc8);

    const payload = {
        width,
        depth,
        height,
        surface1,
        surface2,
        surface3,
        surface4,
        enable_relaxation: true // Always enable relaxation
    };

    document.getElementById('spinner').style.display = 'block';

    try {
        const response = await fetch('https://interactive-tent-0697ab02fbe0.herokuapp.com/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'models.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    } finally {
        document.getElementById('spinner').style.display = 'none';
    }
}

export async function generatePattern() {
    const width = parseFloat(document.getElementById('width').value);
    const depth = parseFloat(document.getElementById('depth').value);
    const height = parseFloat(document.getElementById('height').value);

    const arc5 = halfCircularArc([0, 0], [width, depth], height);
    const arc6 = halfCircularArc([width, 0], [0, depth], height);
    const arc7 = halfCircularArc([0, 0], [width, depth], height);
    const arc8 = halfCircularArc([0, depth], [width, 0], height);

    const surface3 = interpolateSurfaceUntilIntersection(arc5, arc6);
    const surface4 = interpolateSurfaceUntilIntersection(arc7, arc8);

    const payload = {
        width,
        depth,
        height,
        surface3,
        surface4,
        enable_relaxation: true // Always enable relaxation
    };

    document.getElementById('spinner').style.display = 'block';

    try {
        const response = await fetch('https://interactive-tent-0697ab02fbe0.herokuapp.com/generate_pattern', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const taskId = data.task_id;
        console.log(`Task ID: ${taskId}`);

        document.getElementById('progress').innerText = `Task started with ID: ${taskId}`;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    } finally {
        document.getElementById('spinner').style.display = 'none';
    }
}
