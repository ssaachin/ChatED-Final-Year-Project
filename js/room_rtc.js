const APP_ID = "a0000f05b787400693fdcb10a8e4acec"

// random UID if none is found in sessionstorage
let uid = sessionStorage.getItem('uid')
if(!uid){
    uid = String(Math.floor(Math.random() * 10000))
    sessionStorage.setItem('uid', uid)
}

let token = null;
let client;

let rtmClient;
let channel;

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get('room')

// if no roomname is given 
if(!roomId){
    roomId = 'main'
}

// no name redirected to home
let displayName = sessionStorage.getItem('display_name')
if(!displayName){
    window.location = 'lobby.html'
}

let localTracks = []
let remoteUsers = {}


let joinRoomInit = async () => {
    // RTM client instance
    rtmClient = await AgoraRTM.createInstance(APP_ID)
    await rtmClient.login({uid,token})

    
    // channel with RTM client
    channel = await rtmClient.createChannel(roomId)
    await channel.join()

    
    channel.on('ChannelMessage', handleChannelMessage)

   

    client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})
    await client.join(APP_ID, roomId, token, uid)

    client.on('user-published', handleUserPublished)
    client.on('user-left', handleUserLeft)

    joinStream()
}

// join video chat
let joinStream = async () => {
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

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
    
    localTracks[1].play(`user-${uid}`);
    await client.publish([localTracks[0], localTracks[1]]);
};


let handleUserPublished = async (user, mediaType) => {
    remoteUsers[user.uid] = user;

    await client.subscribe(user, mediaType);
    let player = document.getElementById(`user-container-${user.uid}`);
    if (player === null) {
        player = `<div class="video__container" id="user-container-${user.uid}">
                    <div class="video-player" id="user-${user.uid}"></div>
                    <div class="video__uid">${displayName}</div>
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

const photoFiles = {
    "one": "./images/emoji/cold-face-telegram.gif",
    "two": "./images/emoji/face-in-clouds-telegram.gif",
    "three": "./images/emoji/face-with-peeking-eye-telegram.gif",
    "four": "./images/emoji/star-struck-telegram.gif",
    "five": "./images/emoji/zany-face-telegram.gif",
    "six": "./images/emoji/exploding-head-telegram.gif",
    "seven": "./images/emoji/hot-face-telegram.gif"
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

let raiseHand = async () => {
    let message = {
        messageType: 'raiseHand',
        uid: uid
    };
    channel.sendMessage({ text: JSON.stringify(message) });
};



// remove user from DOM
let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

// MUTE/UNMUTE
let muteInterval;

let toggleMic = async (e) => {
    let button = e.currentTarget;

    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false);
        button.classList.add('active');
        clearInterval(muteInterval); // Clear the interval when the microphone is unmuted

        // Start increasing the slider value by 1 every second when the microphone is unmuted
        muteInterval = setInterval(() => {
            incrementSliderValue(uid, 5);
            sendMuteUpdate(5);
        }, 2000);

    } else {
        await localTracks[0].setMuted(true);
        button.classList.remove('active');
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
let toggleCamera = async (e) => {
    let button = e.currentTarget

    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        button.classList.add('active')
    }else{
        await localTracks[1].setMuted(true)
        button.classList.remove('active')
    }
}

// exit
let redirectToLobby = async () => {
    window.location = 'lobby.html';
};

// document.getElementById('handsUp-btn').addEventListener('click', raiseHand);
document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('leave-btn').addEventListener('click', redirectToLobby);


joinRoomInit()
