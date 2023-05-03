const APP_ID = "a0000f05b787400693fdcb10a8e4acec"

const uid = sessionStorage.getItem('uid') || String(Math.floor(Math.random() * 10000));
sessionStorage.setItem('uid', uid);

let token = null;
let client;

let rtmClient;
let channel;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const roomId = urlParams.get('room') || 'main';

const displayName = sessionStorage.getItem('display_name');
if (!displayName) {
    window.location = 'lobby.html';
}

let localUser = [];
let otherUsers = {};

const photoFiles = {
    "one": "./images/emoji/cold-face-telegram.gif",
    "two": "./images/emoji/face-in-clouds-telegram.gif",
    "three": "./images/emoji/face-with-peeking-eye-telegram.gif",
    "four": "./images/emoji/star-struck-telegram.gif",
    "five": "./images/emoji/zany-face-telegram.gif",
    "six": "./images/emoji/exploding-head-telegram.gif",
    "seven": "./images/emoji/hot-face-telegram.gif"
};


async function joinRoomInit() {
    // RTM client instance
    rtmClient = await AgoraRTM.createInstance(APP_ID)
    await rtmClient.login({uid,token})

    
    // channel with RTM client
    channel = await rtmClient.createChannel(roomId)
    await channel.join()

    
    channel.on('ChannelMessage', handleChannelMessage)


    client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})
    await client.join(APP_ID, roomId, token, uid)

    client.on('user-published', addNewUsers)
    client.on('user-left', removeUserDom)

    addLocalUser()
}

// the local user join video chat
async function addLocalUser() {
    localUser = await AgoraRTC.createMicrophoneAndCameraTracks();

    let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"></div>
                    <div class="video__uid">${displayName}</div>
                    <div class="video__slider">
                        <input type="range" id="slider" min="0" max="1000" value="500" step="0.5" class="smiley-slider" disabled>
                        <span class="smiley-display">
                            <img src="./images/emoji/star-struck-telegram.gif" alt="smiley" />
                        </span>
                    </div>                    
                </div>`;

    document.getElementById('streams__container').insertAdjacentHTML('beforeend', player);
    
    localUser[1].play(`user-${uid}`);
    await client.publish([localUser[0], localUser[1]]);
};

// Adding users to the video chat
async function addNewUsers(user, mediaType) {
    otherUsers[user.uid] = user;

    await client.subscribe(user, mediaType);
    let player = document.getElementById(`user-container-${user.uid}`);
    if (player === null) {
        player = `<div class="video__container" id="user-container-${user.uid}">
                    <div class="video-player" id="user-${user.uid}"></div>
                    <div class="video__uid">${user.uid}</div>
                    <div class="video__slider">
                        <input type="range" id="slider" min="0" max="1000" value="500" step="0.5" class="smiley-slider" disabled>
                    <div class="smiley-display">
                        <img src="./images/emoji/star-struck-telegram.gif" alt="smiley" />
                    </div>
                    </div> 
                </div>`;

        document.getElementById('streams__container').insertAdjacentHTML('beforeend', player);
    }
    
    if (mediaType === 'video') {
        user.videoTrack.play(`user-${user.uid}`);
    }

    if (mediaType === 'audio') {
        user.audioTrack.play();
    }
};


function updateSmiley(uid, value) {
    let slider = document.getElementById(`user-container-${uid}`).querySelector('.smiley-slider');
    let smileyDisplay = document.getElementById(`user-container-${uid}`).querySelector('.smiley-display');
    let smileyImg = smileyDisplay.querySelector('img');
    
    
    if (value >= 0 && value <= 143) {
        smileyImg.src = photoFiles.one;
    } else if (value >= 144 && value <= 286) {
        smileyImg.src = photoFiles.two;
    } else if (value >= 287 && value <= 430) {
        smileyImg.src = photoFiles.three;
    } else if (value >= 431 && value <= 574) {
        smileyImg.src = photoFiles.four;
    } else if (value >= 575 && value <= 718) {
        smileyImg.src = photoFiles.five;
    } else if (value >= 719 && value <= 862) {
        smileyImg.src = photoFiles.six;
    } else if (value >= 863 && value <= 1000) {
        smileyImg.src = photoFiles.seven;
    } 

    slider.value = value;
}


document.querySelectorAll('.smiley-slider').forEach(slider => {
    slider.addEventListener('input', e => {
        let uid = e.target.closest('.video__container').id.split('-')[2];
        let newValue = parseFloat(e.target.value);
        updateSmiley(uid, newValue);
    });
});



// MUTE/UNMUTE
let muteInterval;

async function toggleMic(e) {
    let button = e.currentTarget;
    
    const inactiveMicSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-mic-mute-fill" viewBox="0 0 16 16">
        <path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879L5.158 2.037A3.001 3.001 0 0 1 11 3z"/>
        <path d="M9.486 10.607 5 6.12V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z"/>
    </svg>`;
    
    const activeMicSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-mic" viewBox="0 0 16 16">
      <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
      <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/>
    </svg>`;

    if (localUser[0].muted) {
        await localUser[0].setMuted(false);
        button.classList.add('active');
        button.innerHTML = activeMicSvg;
        clearInterval(muteInterval); // Clear the interval when the microphone is unmuted

        // Start increasing the slider value by 1 every second when the microphone is unmuted
        muteInterval = setInterval(() => {
            incrementSliderValue(uid, 5);
            sendMuteUpdate(5);
        }, 2000);

    } else {
        await localUser[0].setMuted(true);
        button.classList.remove('active');
        button.innerHTML = inactiveMicSvg;
        sendMuteUpdate(-1);
        clearInterval(muteInterval); // Clear the interval when the microphone is muted

        // Start decreasing the slider value by 1 every second when the microphone is muted
        muteInterval = setInterval(() => {
            incrementSliderValue(uid, -2);
            sendMuteUpdate(-2);
        }, 2000);
    }
};



// Camera on/off
async function toggleCamera(e) {
    let button = e.currentTarget


    const inactiveCameraSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#FF0000" class="bi bi-camera-video-off-fill" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l6.69 9.365zm-10.114-9A2.001 2.001 0 0 0 0 5v6a2 2 0 0 0 2 2h5.728L.847 3.366zm9.746 11.925-10-14 .814-.58 10 14-.814.58z"/>
    </svg>`;
    
    const activeCameraSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-camera-video" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/>
    </svg>`;

    if(localUser[1].muted){
        await localUser[1].setMuted(false);
        button.classList.add('active');
        button.innerHTML = activeCameraSvg;
    }else{
        await localUser[1].setMuted(true);
        button.classList.remove('active');
        button.innerHTML = inactiveCameraSvg;
    }
}

// async function toggleCamera() {

//     if(localUser[1].muted){
//         await localUser[1].setMuted(false);
//     }else{
//         await localUser[1].setMuted(true);
//     }
// }


// remove user from DOM
async function removeUserDom(user) {
    delete otherUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}


// exit
async function exit() {
    window.location = 'lobby.html';
};


document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('leave-btn').addEventListener('click', exit);


joinRoomInit()

