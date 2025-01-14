let currentAudio = new Audio();
let CurrFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
      return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSong(folder) {
  CurrFolder = folder;
  try {
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let i = 0; i < as.length; i++) {
      const element = as[i];
      if (element.href.includes(".mp3")) {
        songs.push(element.href.split(`${folder}/`)[1]);
      }
    }
    return songs;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
}

const playmusic = (track, pause = false) => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentAudio = new Audio(`http://127.0.0.1:5500/${CurrFolder}/` + encodeURIComponent(decodeURIComponent(track)));
  if(!pause){
    currentAudio.play();
    console.log("Playing:", track);
    play.src = "pause.svg";
  }


  currentAudio.addEventListener('error', (e) => {
    console.error('Error playing the song:', e);
  });

  const songnameElement = document.querySelector(".songname").innerHTML = decodeURI(track);
  const songtimeElement = document.querySelector(".songtime").innerHTML = "00:00/00:00";
  currentAudio.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentAudio.currentTime)}/${secondsToMinutesSeconds(currentAudio.duration)}`;
    document.querySelector(".circle").style.left = (currentAudio.currentTime / currentAudio.duration) * 100 + "%";
})

document.querySelector(".seekbar").addEventListener("click", e => {
  let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
  document.querySelector(".circle").style.left = percent + "%";
  currentAudio.currentTime = ((currentAudio.duration) * percent) / 100;
})
}

async function main() {
  let songs = await getSong("songs/cs");
  playmusic(songs[0],true)

  let songUL = document.getElementsByClassName("songlist")[0];
  if (songUL) {
    for (const song of songs) {
      songUL.innerHTML = songUL.innerHTML + `
        <li class="songlist">
          <img class="invert" src="song.svg" alt="">
          <div class="info">
            <div>${decodeURIComponent(song.replaceAll("%20", " "))}</div>
            <div>Chirag</div>
          </div>
          <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="playnow.svg" alt="">
          </div>
        </li>`;
    }

    Array.from(document.querySelectorAll(".songlist .info")).forEach(e => {
      e.addEventListener("click", element => {
      const firstDiv = e.querySelector("div");
        playmusic(firstDiv.innerHTML);
    });
    });
  } 

  play.addEventListener("click", () => {
    if (currentAudio.paused) {
      currentAudio.play();
      play.src = "pause.svg";
    }
    else {
      currentAudio.pause();
      play.src = "playsong.svg";
    }
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".cross img").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  prev.addEventListener("click", () => {
    let currentSongIndex = songs.indexOf(currentAudio.src.split("/songs/")[1]);
    if (currentSongIndex > 0) {
      playmusic(songs[currentSongIndex - 1]);
    }
  });

  next.addEventListener("click", () => {
    let currentSongIndex = songs.indexOf(currentAudio.src.split("/songs/")[1]);
    if (currentSongIndex < songs.length - 1){ 
    playmusic(songs[currentSongIndex + 1]);
    }
    else if (currentSongIndex == songs.length -1 ) {
      playmusic(songs[0]);
    }
  });

  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", e => {
    currentAudio.volume = parseInt(e.target.value)/100;

  });

  Array.from(document.getElementsByClassName("card")).forEach(e => {
    console.log(e);
    e.addEventListener("click", async item=>{
      console.log(item,item.currentTarget.dataset)
      songs = await getSong(`songs/${item.currentTarget.dataset.folder}`);
    })
  });

}

main();