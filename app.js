// Modern IPTV PWA - Vanilla JS + HLS.js + Tailwind
let channels = [];
let currentChannelIndex = -1;
let favorites = JSON.parse(localStorage.getItem('iptv-favorites') || '[]');
let hls = null;
const video = document.getElementById('video-player');

function initTailwind() {
    // Tailwind already CDN loaded
}

function loadDemoChannels() {
    channels = [
        {
            name: "Canal Demo 1",
            url: "https://test-streams.mux.dev/x264_720p_1500kbps_30fps.mp4",
            group: "General",
            logo: "https://picsum.photos/id/1015/200"
        },
        {
            name: "Canal Demo 2 - Live Test",
            url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny_720p.mp4",
            group: "Entretenimiento",
            logo: "https://picsum.photos/id/102/200"
        },
        {
            name: "Discovery",
            url: "https://test-streams.mux.dev/x264_1080p_30fps.mp4",
            group: "Documentales",
            logo: "https://picsum.photos/id/1036/200"
        }
    ];
    renderChannels();
}

function renderChannels(filteredChannels = channels) {
    const container = document.getElementById('channels-list');
    container.innerHTML = '';
    
    filteredChannels.forEach((channel, index) => {
        const globalIndex = channels.indexOf(channel);
        const isFav = favorites.includes(globalIndex);
        
        const div = document.createElement('div');
        div.className = `list-item flex gap-3 items-center p-3 rounded-3xl cursor-pointer channel-card ${globalIndex === currentChannelIndex ? 'active' : ''}`;
        div.innerHTML = `
            <img src="${channel.logo}" class="w-12 h-12 rounded-2xl object-cover flex-shrink-0" onerror="this.src='https://picsum.photos/200'">
            <div class="flex-1 min-w-0">
                <div class="font-medium truncate">${channel.name}</div>
                <div class="text-xs text-zinc-500">${channel.group || 'Sin grupo'}</div>
            </div>
            <button onclick="event.stopImmediatePropagation(); toggleFavorite(${globalIndex});" class="text-xl ${isFav ? 'text-yellow-400' : 'text-zinc-600'}">⭐</button>
        `;
        div.onclick = () => playChannel(globalIndex);
        container.appendChild(div);
    });
}

function playChannel(index) {
    if (index < 0 || index >= channels.length) return;
    
    currentChannelIndex = index;
    const channel = channels[index];
    
    document.getElementById('current-channel').textContent = channel.name;
    document.getElementById('channel-name').textContent = channel.name;
    document.getElementById('info-bar').classList.remove('hidden');
    
    renderChannels();
    
    // Destroy previous HLS if exists
    if (hls) {
        hls.destroy();
        hls = null;
    }
    
    video.src = '';
    
    if (channel.url.includes('.m3u8') || channel.url.includes('playlist')) {
        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(channel.url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = channel.url;
            video.play();
        }
    } else {
        video.src = channel.url;
        video.play().catch(e => console.log('Autoplay prevented', e));
    }
    
    // Simulate EPG
    updateEPG(channel);
}

function updateEPG(channel) {
    const epgContainer = document.getElementById('epg-now');
    epgContainer.innerHTML = `
        <div class="glass p-4 rounded-3xl">
            <div class="text-sm opacity-75">Ahora</div>
            <div class="font-medium">Programa en vivo: Noticias Globales</div>
            <div class="text-xs text-zinc-400 mt-1">18:30 - 19:45 • 75% completado</div>
        </div>
        <div class="text-xs text-zinc-500 mt-6">Próximos</div>
        <div class="space-y-4 mt-3 text-sm">
            <div>19:45 • Documental: Maravillas del Mundo</div>
            <div>21:00 • Serie: El Guardián</div>
        </div>
    `;
}

function togglePlay() {
    if (video.paused) {
        video.play();
        document.getElementById('play-btn').innerHTML = '⏸️';
    } else {
        video.pause();
        document.getElementById('play-btn').innerHTML = '▶️';
    }
}

function toggleMute() {
    video.muted = !video.muted;
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.getElementById('video-wrapper').requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function togglePictureInPicture() {
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
    } else if (video.requestPictureInPicture) {
        video.requestPictureInPicture();
    }
}

function toggleFavorite(index) {
    if (favorites.includes(index)) {
        favorites = favorites.filter(i => i !== index);
    } else {
        favorites.push(index);
    }
    localStorage.setItem('iptv-favorites', JSON.stringify(favorites));
    renderChannels();
}

function loadPlaylist() {
    document.getElementById('playlist-modal').classList.remove('hidden');
}

function hideModal() {
    document.getElementById('playlist-modal').classList.add('hidden');
}

async function loadM3UFromURL() {
    const url = document.getElementById('m3u-url').value.trim();
    if (!url) return;
    
    hideModal();
    
    try {
        // For demo, we simulate parsing
        alert('En producción se parsearía el M3U. Demo cargada.');
        loadDemoChannels();
    } catch(e) {
        alert('Error al cargar la lista');
    }
}

function switchTab(tab) {
    document.querySelectorAll('.tab-button').forEach((btn, i) => {
        if (i === tab) {
            btn.classList.add('border-blue-500', 'text-blue-400');
            btn.classList.remove('text-zinc-400');
        } else {
            btn.classList.remove('border-blue-500', 'text-blue-400');
            btn.classList.add('text-zinc-400');
        }
    });
    
    // For demo, only channels tab is fully functional
    if (tab === 2) {
        const favChannels = channels.filter((_, i) => favorites.includes(i));
        renderChannels(favChannels.length ? favChannels : channels);
    } else {
        renderChannels();
    }
}

function toggleSidebar() {
    // Mobile toggle
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('-translate-x-full');
}

function showSettings() {
    alert('Ajustes:\n• Calidad: Auto\n• Idioma: Español\n• Tema: Oscuro (iOS Style)\n• Notificaciones: Activadas');
}

// Keyboard shortcuts
document.addEventListener('keydown', e => {
    if (e.key === ' ' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        togglePlay();
    }
    if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
    }
});

// Video event listeners
video.addEventListener('timeupdate', () => {
    const progress = document.getElementById('progress-bar');
    const current = document.getElementById('current-time');
    const dur = document.getElementById('duration');
    
    if (video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        progress.style.width = percent + '%';
        
        current.textContent = formatTime(video.currentTime);
        dur.textContent = formatTime(video.duration);
    }
});

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Drag & Drop for M3U
const dropZone = document.getElementById('video-wrapper');
dropZone.addEventListener('dragover', e => e.preventDefault());
dropZone.addEventListener('drop', e => {
    e.preventDefault();
    // In real app parse file
    alert('Archivo M3U detectado. En versión completa se cargaría automáticamente.');
});

// PWA Install prompt simulation
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA installable - iOS style');
});

// Init
window.onload = () => {
    initTailwind();
    loadDemoChannels();
    
    // Make sidebar scrollable nicely
    document.getElementById('channels-list').scrollTop = 0;
    
    // Fake live status pulse
    setInterval(() => {
        // Could animate more
    }, 4000);
};