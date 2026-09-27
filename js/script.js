const albumCards = document.querySelectorAll('.card');
const baseUrl = "";
albumCards.forEach(albumCard => {
    const playButton = albumCard.querySelector('.playbutton');
    albumCard.addEventListener('mouseenter', () => {
        playButton.style.display = 'block';
    });
    albumCard.addEventListener('mouseleave', () => {
        playButton.style.display = 'none';
    });
});

const audioPlayer = new Audio();
const playTrackButton = document.getElementById("playTrackButton");
const playTrackButtonIcon = document.getElementById("playTrackButtonIcon");
const previousTrackButton = document.getElementById("previousTrackButton");
const nextTrackButton = document.getElementById("nextTrackButton");
let currentSongs;
let currentSongFolder;
audioPlayer.volume = 0.75;

/** Updates the seek bar position for a normalized playback ratio.
 * @param {number} progressRatio Playback position from 0 to 1.
 */
function updateSeekProgress(progressRatio) {
    const normalizedProgress = Math.min(Math.max(progressRatio, 0), 1);
    const progressBar = document.querySelector(".seek-progress");
    const grabber = document.querySelector(".grabber");
    const seekbar = document.querySelector(".seekbar");

    if (seekbar && grabber && progressBar) {
        const barWidth = seekbar.getBoundingClientRect().width || 1;
        const knobRadius = parseFloat(getComputedStyle(grabber).width) / 2;
        const barLimit = Math.max(0, barWidth - knobRadius);
        const knobCenter = Math.min(barLimit, normalizedProgress * barWidth);

        progressBar.style.width = `${knobCenter}px`;
        grabber.style.left = `${knobCenter}px`;
    }
}

/** Loads a playlist and renders its tracks in the library.
 * @param {string} songFolder Path to the playlist folder.
 * @returns {Promise<string[]>} The playlist's track filenames.
 */
async function getSongs(songFolder) {
    currentSongFolder = songFolder;

    const response = await fetch(`${songFolder}/songs.json`);
    currentSongs = await response.json();

    const songListElement = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songListElement.innerHTML = "";
    for (const trackFileName of currentSongs) {
        songListElement.innerHTML = songListElement.innerHTML + `<li> <div class="songinfo flex">
                  <div class="imgnameartist flex">
                    <img id="musicicon" src="logos/music.svg" alt="">
                    <div class="info flex">
                      <span title= "${trackFileName.replaceAll("%20", " ").replace(".mp3", "")}" class="songName">${trackFileName.replaceAll("%20", " ")}</span>
                      <span class="artist">Yash</span>
                    </div>
                  </div>
                  <img title = "play" class="playfromlib" src="logos/play2.svg" alt="" class="playsong">
                </div> </li>`;
    }

    Array.from(songListElement.getElementsByTagName("li")).forEach(songListItem => {
        songListItem.querySelector(".songinfo").querySelector(".playfromlib").addEventListener("click", () => {
            playMusic(songListItem.querySelector(".songinfo").querySelector(".imgnameartist").querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return currentSongs;
}

/** Starts a track and updates the player display.
 * @param {string} trackFileName Filename of the selected track.
 * @param {boolean} shouldPause Set to true to load the track without starting playback.
 */
const playMusic = (trackFileName, shouldPause = false) => {
    audioPlayer.src = `${currentSongFolder}/` + trackFileName;
    if (!shouldPause) {
        audioPlayer.play();
        playTrackButtonIcon.src = "logos/pause.svg";
    }
    document.querySelector(".currentSongInfo").innerHTML = decodeURI(trackFileName);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
    document.querySelector(".voldragger").style.height = (audioPlayer.volume * 100) + "%";
};

/** Loads album metadata and renders the playlist cards.
 * @returns {Promise<void>}
 */
async function displayAlbums() {
    const response = await fetch(`${baseUrl}/songs/albums.json`);
    const albums = await response.json();
    const albumCardContainer = document.querySelector(".cardContainer");

    for (const albumFolder of albums) {
        const albumResponse = await fetch(`${baseUrl}/songs/${albumFolder}/info.json`);
        const albumInfo = await albumResponse.json();
        albumCardContainer.innerHTML = albumCardContainer.innerHTML + `<div data-folder="${albumFolder}" class="card myfont flex">
                    <img src="songs/${albumFolder}/cover.jpeg" alt="" />
                    <button class="playbutton">
                        <img src="logos/playbutton.svg" alt="" />
                    </button>
                    <h3>${albumInfo.title}</h3>
                    <p>${albumInfo.description}</p>
                </div>`;
    }

    Array.from(document.getElementsByClassName("card")).forEach(albumCard => {
        albumCard.addEventListener("click", async event => {
            currentSongs = await getSongs(`${baseUrl}/songs/${event.currentTarget.dataset.folder}`);
        });
    });
}

/** Formats a duration in seconds as a zero-padded minute:second value.
 * @param {number} totalSeconds Duration to format.
 * @returns {string} Formatted duration.
 */
function secondsToTime(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = Math.round(totalSeconds % 60);
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
}

/** Initializes the default playlist and wires the player controls.
 * @returns {Promise<void>}
 */
async function main() {
    await getSongs(`${baseUrl}/songs/mySongs`);
    playMusic(currentSongs[0], true);
    displayAlbums();

    playTrackButton.addEventListener("click", () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playTrackButtonIcon.src = "logos/pause.svg";
        }
        else {
            audioPlayer.pause();
            playTrackButtonIcon.src = "logos/play.svg";
        }
    });

    audioPlayer.addEventListener("timeupdate", () => {
        const progressRatio = audioPlayer.duration ? audioPlayer.currentTime / audioPlayer.duration : 0;
        document.querySelector(".songTime").innerHTML = `${secondsToTime(audioPlayer.currentTime)}/${secondsToTime(audioPlayer.duration)}`;
        updateSeekProgress(progressRatio);
    });

    document.querySelector(".seekbar").addEventListener("click", event => {
        const seekbar = event.currentTarget;
        const progressRatio = (event.clientX - seekbar.getBoundingClientRect().left) / seekbar.getBoundingClientRect().width;
        updateSeekProgress(progressRatio);
        audioPlayer.currentTime = Math.min(Math.max(progressRatio, 0), 1) * audioPlayer.duration;
    });
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    });
    document.querySelector(".closeList").addEventListener("click", () => {
        document.querySelector(".left").style.left = -200 + "%";
    });

    previousTrackButton.addEventListener("click", () => {
        const currentTrackIndex = currentSongs.indexOf(audioPlayer.src.split("/").slice(-1)[0]);
        if (currentTrackIndex - 1 >= 0) {
            playMusic(currentSongs[currentTrackIndex - 1]);
        }
        else {
            playMusic(currentSongs[currentTrackIndex]);
        }
    });

    nextTrackButton.addEventListener("click", () => {
        const currentTrackIndex = currentSongs.indexOf(audioPlayer.src.split("/").slice(-1)[0]);
        if (currentTrackIndex + 1 < currentSongs.length) {
            playMusic(currentSongs[currentTrackIndex + 1]);
        }
        else {
            playMusic(currentSongs[0]);
        }
    });
    document.querySelector(".volume").addEventListener("click", () => {
        if (document.querySelector(".volumeseekbar").style.display == "none") {
            document.querySelector(".volumeseekbar").style.display = "block";
        }
        else {
            document.querySelector(".volumeseekbar").style.display = "none";
        }
    });

    document.querySelector(".exit").addEventListener("click", () => {
        document.querySelector(".volumeseekbar").style.display = "none";
    });

    document.querySelector(".seekvolume").addEventListener("click", event => {
        document.querySelector(".mute").src = "logos/unmute.svg";
        const volumeRatio = event.offsetY / event.target.getBoundingClientRect().height;
        document.querySelector(".voldragger").style.height = ((1 - volumeRatio) * 100) + "%";
        audioPlayer.volume = (1 - volumeRatio);
    });

    document.querySelector(".mute").addEventListener("click", () => {
        if (audioPlayer.volume != 0) {
            audioPlayer.volume = 0;
            document.querySelector(".voldragger").style.height = 0;
            document.querySelector(".mute").src = "logos/mute.svg";
        }
        else {
            audioPlayer.volume = 0.5;
            document.querySelector(".voldragger").style.height = "50%";
            document.querySelector(".mute").src = "logos/unmute.svg";
        }
    });

    audioPlayer.addEventListener('ended', () => {
        const currentTrackIndex = currentSongs.indexOf(audioPlayer.src.split("/").slice(-1)[0]);
        if (currentTrackIndex + 1 < currentSongs.length) {
            playMusic(currentSongs[currentTrackIndex + 1]);
        }
        else {
            playMusic(currentSongs[0], true);
            playTrackButtonIcon.src = "logos/play.svg";
            updateSeekProgress(0);
        }
    });
}

main();
