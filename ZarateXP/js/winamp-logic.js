document.addEventListener('DOMContentLoaded', () => {
    const winampIcon = document.getElementById('winamp-desktop-icon');
    winampIcon.addEventListener('dblclick', () => {
        setTimeout(() => {
            const winampWindow = document.querySelector('.window[data-program-name="winamp"]');
            if (winampWindow) {
                const playButton = winampWindow.shadowRoot.querySelector('.play');
                const songTitle = winampWindow.shadowRoot.querySelector('.song-title'); 
                const audio = new Audio('assets/winamp/track.mp3');

                if (playButton) {
                    playButton.addEventListener('click', () => {
                        if (audio.paused) {
                            audio.play();
                            if(songTitle) songTitle.textContent = 'Paint It Black';
                        } else {
                            audio.pause();
                        }
                    });
                }
            }
        }, 500);
    });
});