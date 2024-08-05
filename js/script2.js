// Warning
gotIt.addEventListener("click", () => {
  document.querySelector(".warning").style.display = "none";
});
// This is it
var currentSong = new Audio(currentSong);
let card_container;
let songs,
  allFolders,
  folder = ``,playing=false;
let songsUL = document.querySelector(".playlist").getElementsByTagName("ul")[0];

function secToMinSec(seconds) {
  if (!(isNaN(seconds) || seconds < 0)) {
    const minutes = Math.floor(seconds / 60);
    const remSeconds = Math.floor(seconds % 60);
    const formatedMins = String(minutes).padStart(2, "0");
    const formatedSec = String(remSeconds).padStart(2, "0");
    return `${formatedMins}:${formatedSec}`;
  }
  return `00:00`;
}

async function getFolders() {
  card_container = document.querySelector(".card-container");
  allFolders = [];
  let getF = await fetch(
    `/Songs/`
  );
  let responseF = await getF.text();

  let div = document.createElement("div");
  div.innerHTML = responseF;
  let as = div.getElementsByTagName("a");
  // allFolders.push[elem.href.split("/").slice(-2)[0]];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.includes("/Songs") && !element.href.includes(".htaccess")) {
      allFolders.push(element.href);
    }
  }

  // Listing all the folders
  for (let index = 0; index < allFolders.length; index++) {
    const elem = allFolders[index];
    let getFInfo = await fetch(`${elem}/info.json`);
    let responseFInfo = await getFInfo.json();
    card_container.innerHTML += `<div class="card p-1 flex item-center rounded" data-folder="${
      elem.split("/").slice(-2)[0]
    }">
    <div class="card-image">
    <div class="card-play">
          <img src="Images/play.svg" alt="card-play" />
        </div>
        <img src="Songs/${
          elem.split("/").slice(-2)[0]
        }/cover.jfif" alt="feel good dinner" />
      </div>
      <h3>${responseFInfo.title}</h3>
      <p>${responseFInfo.description}</p>
      
    </div>`;
  }
}

async function getSongs() {
  songs = [];
  let data = await fetch(
    `/Songs/${folder}/`
  );
  let response = await data.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href);
    }
  }

  // Listing all the songs
  songsUL.innerHTML = ``;
  songs.forEach((oneSong) => {
    let songName = oneSong.split(`/${folder}/`)[1];
    songName = songName.split(".")[0];
    songName = songName.replaceAll("%20", " ");
    songsUL.innerHTML += ` <li>
        <img class="music invert " src="Images/music.svg" alt="music" />
        <div class="info">
          <div><span>${songName}</span></div>
        </div>
        <div class="play-now ">
          <img class="invert" src="Images/play.svg" alt="play">
        </div>
      </li>`;
  });
}

function playMusic() {
  playing = true;
  currentSong.play();
  document.getElementById("play").src = `Images/pause.svg`;
}
function pauseMusic() {
  playing = false;
  currentSong.pause();
  document.getElementById("play").src = `Images/play.svg`;
}
function playSong(oneSong) {
  currentSong.src = `/Songs/${folder}/${oneSong}.mp3`;
  if (playing) {
    playMusic();
  }
  else{
    pauseMusic();
  }
  document.querySelector(".song-info").innerHTML = oneSong;

  // Listen for time update function
  currentSong.addEventListener("timeupdate", () => {
    let songCurTime = secToMinSec(currentSong.currentTime);
    let songDuration = secToMinSec(currentSong.duration);
    document.querySelector(
      ".song-timer"
    ).innerHTML = `${songCurTime}|${songDuration}`;
    document.querySelector(".seek-baar-circle").style.left = `${
      (currentSong.currentTime / currentSong.duration) * 100
    }%`;
  });
}

(async function main() {
  let songList,warningC = 0,index;
  await getFolders();
  let cardss = Array.from(card_container.getElementsByClassName("card"));

  // listig songs from folder
  cardss.forEach((e) => {
    e.addEventListener("click", async (item) => {
      index = 0;
      if (warningC == 0) {
        warningC = 1;
        document.querySelector(".warning").style.display = "block";
      }
      folder = item.currentTarget.dataset.folder;
      await getSongs();
      songList = Array.from(songsUL.children);
      play.src = `Images/play.svg`;
      
      if (songList.length > 0) {
        playing = false;
        playSong(songList[0].querySelector(".info").innerText);
        let previous = songList[0];
        previous.querySelector(
          ".play-now"
        ).innerHTML = `<img class="invert" src="Images/playing.svg" alt="play">`;

        songList.forEach((elem) => {
          elem.addEventListener("click", () => {
            previous.querySelector(
              ".play-now"
            ).innerHTML = `<img class="invert" src="Images/play.svg" alt="play">`;
            elem.querySelector(
              ".play-now"
            ).innerHTML = `<img class="invert" src="Images/playing.svg" alt="play">`;
            let track = elem.querySelector(".info").innerText;
            previous = elem;
            playing = true;
            playSong(track.trim());
          });
        });

        //controlling the song from playbar
        play.addEventListener("click", () => {
          if (!playing) {
            playMusic();
          } else {
            pauseMusic();
          }
        });

        // next song contoller
        next.addEventListener("click", () => {
          index = songs.indexOf(currentSong.src);
          
          if (index + 1 < songs.length) {
            let nextS = songs[index + 1]
              .split("/")
              .slice(-1)[0]
              .split(".mp3")[0];
            nextS = nextS.replaceAll("%20", " ");
            // playing=true;
            playSong(nextS);

            songList.forEach((elem) => {
              if (elem.querySelector(".info").innerText == nextS) {
                elem.querySelector(
                  ".play-now"
                ).innerHTML = `<img class="invert" src="Images/playing.svg" alt="play">`;
              } else {
                elem.querySelector(
                  ".play-now"
                ).innerHTML = `<img class="invert" src="Images/play.svg" alt="play">`;
              }
            });
          }
        });
        //previous song controller
        prev.addEventListener("click", () => {
          let index = songs.indexOf(currentSong.src);

          if (index - 1 >= 0) {
            let nextS = songs[index - 1]
              .split("/")
              .slice(-1)[0]
              .split(".mp3")[0];
            nextS = nextS.replaceAll("%20", " ");
            // playing = true;1
            playSong(nextS);

            songList.forEach((elem) => {
              if (elem.querySelector(".info").innerText == nextS) {
                elem.querySelector(
                  ".play-now"
                ).innerHTML = `<img class="invert" src="Images/playing.svg" alt="play">`;
              } else {
                elem.querySelector(
                  ".play-now"
                ).innerHTML = `<img class="invert" src="Images/play.svg" alt="play">`;
              }
            });
          }
        });
        //jkjd
      }
    });
  });

  // seekbar event listner
  document.querySelector(".seek-bar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".seek-baar-circle").style.left = `${percent}%`;
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Hamburger thigns
  document.querySelector(".hamburg").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".home").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "-120%";
  });
})();
