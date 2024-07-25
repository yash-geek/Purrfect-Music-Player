const cards = document.querySelectorAll('.card');
cards.forEach(card => {
    const playButton = card.querySelector('.playbutton');
    card.addEventListener('mouseenter', () => {
        playButton.style.display = 'block';
    });
    card.addEventListener('mouseleave', () => {
        playButton.style.display = 'none';
    });
});


let currentSong = new Audio();
let songs;
let currFolder;
currentSong.volume = 0.75; //later change 1
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);

    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".flac") || element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }


    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {

        songUL.innerHTML = songUL.innerHTML + `<li> <div class="songinfo flex">
                  <div class="imgnameartist flex">
                    <img id="musicicon" src="logos/music.svg" alt="">
                    <div class="info flex">
                      <span title= "${song.replaceAll("%20", " ").replace(".mp3","")}" class="songName">${song.replaceAll("%20", " ")}</span>
                      <span class="artist">Yash</span>
                    </div>
                  </div>
                  <img title = "play" class="playfromlib" src="logos/play2.svg" alt="" class="playsong">
                </div> </li>`;
    }


    //Attach an event listener to each song

    // Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {

    // })


    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {

        e.querySelector(".songinfo").querySelector(".playfromlib").addEventListener("click", element => {




            playMusic(e.querySelector(".songinfo").querySelector(".imgnameartist").querySelector(".info").firstElementChild.innerHTML.trim())
        })

    });
    return songs;
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track);
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play();
        playTrackButtonIcon.src = "logos/pause.svg"
    }
    let name;
    if(track.includes(".mp3")){
        name = track.replace(".mp3","")
    }
    else if(track.includes(".flac")){
        name = track.replace(".flac","")
    }
    document.querySelector(".currentSongInfo").innerHTML = decodeURI(name)
    console.log(track.replace(".mp3",""))
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
    //volumesetting
    //later change 1
    document.querySelector(".voldragger").style.height = ((currentSong.volume) * 100) + "%";
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0]
            console.log(e.href.split("/").slice(-1));
            console.log("d");
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card myfont flex">
                    <img src="/songs/${folder}/cover.jpeg" alt="" />
                    <button class="playbutton">
                        <img src="logos/playbutton.svg" alt="" />
                    </button>
                    <h3>${response.title}</h3>
                    <p>${response.description}</p>
                </div>`
        }
    }


    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])


        })
    })

}


function secondsToTime(seconds) {
    // Handle negative or non-numeric input
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    // Get whole minutes (discarding decimals)
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60); // Round remaining seconds

    // Format minutes and seconds with leading zeros
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

    // Combine minutes and seconds with colon separator
    return `${formattedMinutes}:${formattedSeconds}`;
}


async function main() {

    await getSongs("songs/mySongs")
    playMusic(songs[0], true);

    //showing all songs in the playlist section

    //Display All the albums on page
    displayAlbums();
    //Attach an event listener to play, next and previous
    playTrackButton.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playTrackButtonIcon.src = "logos/pause.svg"
        }
        else {
            currentSong.pause();
            playTrackButtonIcon.src = "logos/play.svg"
        }
    })




    //Event listener for song track
    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".songTime").innerHTML = `${secondsToTime(currentSong.currentTime)}/${secondsToTime(currentSong.duration)}`;
        document.querySelector(".grabber").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let grab = (e.offsetX / e.target.getBoundingClientRect().width);
        document.querySelector(".grabber").style.left = (grab * 100) + "%";
        


        // document.querySelector(".mute").addEventListener("click", () => {
        //     if (currentSong.volume != 0) {
        //         currentSong.volume = 0;
        //         document.querySelector(".voldragger").style.
        //             height = 0;
                
        //     }

        // document.querySelector(".songTime").innerHTML = `${secondsToTime(currentSong.duration*grab)}/${secondsToTime(currentSong.duration)}`;

        currentSong.currentTime = (grab) * currentSong.duration;
    })
    document.querySelector(".hamburger").addEventListener("click", () => {

        document.querySelector(".left").style.left = 0;

    })
    document.querySelector(".closeList").addEventListener("click", () => {
        document.querySelector(".left").style.left = -200 + "%";
    })

    //Event Listener for prevoius and next
    previousTrackButton.addEventListener("click", () => {

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        if (index - 1 >= 0) {
            playMusic(songs[index - 1])
        }
        else {
            playMusic(songs[index])
        }

    })

    nextTrackButton.addEventListener("click", () => {

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        if (index + 1 < songs.length) {
            playMusic(songs[index + 1])
        }
        else {
            playMusic(songs[0]);
        }
    })
    document.querySelector(".volume").addEventListener("click", () => {


        if (document.querySelector(".volumeseekbar").style.display == "none") {
            document.querySelector(".volumeseekbar").style.display = "block"
        }
        else {
            document.querySelector(".volumeseekbar").style.display = "none"
        }
    })

    document.querySelector(".exit").addEventListener("click", () => {



        document.querySelector(".volumeseekbar").style.display = "none"

    })

    document.querySelector(".seekvolume").addEventListener("click", e => {
        //if (document.querySelector(".mute").src == "logos/mute.svg") {
            document.querySelector(".mute").src = "logos/unmute.svg"
        //}
        let grab = (e.offsetY / e.target.getBoundingClientRect().height);
        document.querySelector(".voldragger").style.height = ((1 - grab) * 100) + "%";
        currentSong.volume = (1 - grab)

    })

    //Load Library When card is Clicked
    // Array.from(document.getElementsByClassName("card")).forEach(e => {
    //     e.addEventListener("click", async item => {
    //         songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
    //         console.log(`songs/${item.currentTarget.dataset.folder}`)

    //     })
    // })

    document.querySelector(".mute").addEventListener("click", () => {
        if (currentSong.volume != 0) {
            currentSong.volume = 0;
            document.querySelector(".voldragger").style.
                height = 0;
            document.querySelector(".mute").src = "logos/mute.svg"
        }
        else {
            currentSong.volume = 0.5
            document.querySelector(".voldragger").style.height = "50%";
            document.querySelector(".mute").src = "logos/unmute.svg"

        }

    })

    // Later modifications
    currentSong.addEventListener('ended', () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1])
        }
        else {
            playMusic(songs[0], true)
            playTrackButtonIcon.src = "logos/play.svg"
            document.querySelector(".grabber").style.left = 0;
        }
    })



}
main();
