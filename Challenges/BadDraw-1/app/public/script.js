const openWindowBtn = document.getElementById('open-draw-window');

consoleLog = (data) => console.log(data.msg);

openWindowBtn.addEventListener('click', function() {
    const drawingWindow = window.open('/draw', 'drawing_window', 'width=600,height=720,resizable=yes,scrollbars=yes');

    if (drawingWindow) {
        drawingWindow.focus();
    } else {
        alert('Popup blocked! Please allow popups for this site.');
    }
});

window.addEventListener('message', function(event) {
    if (event.data && event.data.action === 'log') {
        window[event.data.func](event.data)
    }
    if (event.data && event.data.action === 'drawingSaved') {
        location.reload();
        consoleLog({msg: 'Draw page has been closed!'})
    }
});


const token = localStorage.getItem('accessToken');
const username = localStorage.getItem('username');

if (!token) {
    window.location.href = '/login';
}

drawPixelAvatar(document.getElementById('markCanvas'), 'pixelboard-mark');
document.getElementById('welcome').textContent = 'Welcome, ' + (username || '') + '!';

document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    window.location.href = '/login';
});

let state = { drawings: [], palette: [], gridSize: 16 };

function renderDrawingThumb(canvas, grid) {
    const size = state.gridSize || 16;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const colorIndex = grid[y * size + x] || 0;
            ctx.fillStyle = state.palette[colorIndex] || '#000';
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

function renderGallery() {
    const gallery = document.getElementById('gallery');
    const emptyState = document.getElementById('emptyState');
    gallery.innerHTML = '';
    if (!state.drawings.length) {
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';
    state.drawings.forEach(function(drawing) {
        const card = document.createElement('div');
        card.className = 'card';
        const canvas = document.createElement('canvas');
        card.appendChild(canvas);
        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = drawing.title;
        card.appendChild(title);
        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = 'by ' + drawing.author;
        card.appendChild(meta);
        gallery.appendChild(card);
        renderDrawingThumb(canvas, drawing.grid);
    });
}

async function loadDrawings() {
    try {
        const res = await fetch('/api/drawings', {
            headers: { Authorization: 'Bearer ' + token }
        });
        if (!res.ok) {
            if (res.status === 401) window.location.href = '/login';
            return;
        }
        state = await res.json();
        renderGallery();
    } catch (err) {
        console.log('could not load drawings');
    }
}

loadDrawings();
