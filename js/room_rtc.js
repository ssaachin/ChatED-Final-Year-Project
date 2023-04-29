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
                    <div class="video__uid">${uid}</div>
                    <div class="video__slider"><input type="range" class="form-range" min="0" max="5" id="customRange1" disabled></div>
                    
                    
                </div>`;

    document.getElementById('streams__container').insertAdjacentHTML('beforeend', player);
    // <label for="customRange1" class="form-label"></label>
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
                    <div class="video__uid">${user.uid}</div>
                    <div class="video__slider">
                    <input type="range" class="form-range" min="0" max="5" id="customRange1" disabled></div>
                    
                    
                </div>`;

        document.getElementById('streams__container').insertAdjacentHTML('beforeend', player);
    }
{/* <label for="customRange1" class="form-label"></label> */}
    if (mediaType === 'video') {
        user.videoTrack.play(`user-${user.uid}`);
    }

    if (mediaType === 'audio') {
        user.audioTrack.play();
    }
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
            incrementSliderValue(uid, 1);
            sendMuteUpdate(1);
        }, 1000);

    } else {
        await localTracks[0].setMuted(true);
        button.classList.remove('active');
        sendMuteUpdate(-1);
        clearInterval(muteInterval); // Clear the interval when the microphone is muted

        // Start decreasing the slider value by 1 every second when the microphone is muted
        muteInterval = setInterval(() => {
            incrementSliderValue(uid, -1);
            sendMuteUpdate(-1);
        }, 1000);
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


document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('leave-btn').addEventListener('click', redirectToLobby);

joinRoomInit()














// const APP_ID = "a0000f05b787400693fdcb10a8e4acec"

// // random UID if none is found in sessionstorage
// let uid = sessionStorage.getItem('uid')
// if(!uid){
//     uid = String(Math.floor(Math.random() * 10000))
//     sessionStorage.setItem('uid', uid)
// }

// let token = null;
// let client;

// let rtmClient;
// let channel;

// const queryString = window.location.search
// const urlParams = new URLSearchParams(queryString)
// let roomId = urlParams.get('room')

// // if no roomname is given 
// if(!roomId){
//     roomId = 'main'
// }

// // no name redirected to home
// let displayName = sessionStorage.getItem('display_name')
// if(!displayName){
//     window.location = 'lobby.html'
// }

// let localTracks = []
// let remoteUsers = {}


// let joinRoomInit = async () => {
//     // RTM client instance
//     rtmClient = await AgoraRTM.createInstance(APP_ID)
//     await rtmClient.login({uid,token})

    
//     // channel with RTM client
//     channel = await rtmClient.createChannel(roomId)
//     await channel.join()

    
//     channel.on('ChannelMessage', handleChannelMessage)

   

//     client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})
//     await client.join(APP_ID, roomId, token, uid)

//     client.on('user-published', handleUserPublished)
//     client.on('user-left', handleUserLeft)

//     joinStream()
// }

// // join video chat
// let joinStream = async () => {
//     localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

//     let player = `<div class="video__container" id="user-container-${uid}">
//                     <div class="video-player" id="user-${uid}"></div>
//                     <div class="video__uid">${displayName}</div>
//                     <div class="video__slider"><input type="range" class="form-range" min="0" max="5" id="customRange1"></div>
//                     <label for="customRange1" class="form-label"></label>
                    
//                 </div>`;

//     document.getElementById('streams__container').insertAdjacentHTML('beforeend', player);

//     localTracks[1].play(`user-${uid}`);
//     await client.publish([localTracks[0], localTracks[1]]);
// };

// // let joinStream = async () => {
// //     localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
  
// //     let player = `<div class="video__container" id="user-container-${uid}">
// //                     <div class="video-player" id="user-${uid}"></div>
// //                     <div class="video__uid">${displayName}</div>
// //                     <div class="video__slider"><input type="range" class="form-range" min="0" max="10" id="customRange${uid}"></div>
// //                     <label for="customRange${uid}" class="form-label"></label>
// //                   </div>`;
  
// //     document.getElementById('streams__container').insertAdjacentHTML('beforeend', player);
  
// //     localTracks[1].play(`user-${uid}`);
// //     // localTracks[0].play(`user-${uid}`);
  
// //     localTracks[0].setVolumeIndicator({
// //       interval: 500,
// //       smooth: false,
// //     });
  
// //     localTracks[0].on("volume-indicator", (volume) => {
// //       if (volume > 0) {
// //         let slider = document.getElementById(`customRange${uid}`);
// //         let currentValue = parseInt(slider.value);
// //         slider.value = Math.min(currentValue + 1, 10);
// //       }
// //     });
  
// //     await client.publish([localTracks[0], localTracks[1]]);
// //   };

// let handleUserPublished = async (user, mediaType) => {
//     remoteUsers[user.uid] = user;

//     await client.subscribe(user, mediaType);
//     let player = document.getElementById(`user-container-${user.uid}`);
//     if (player === null) {
//         player = `<div class="video__container" id="user-container-${user.uid}">
//                     <div class="video-player" id="user-${user.uid}"></div>
//                     <div class="video__uid">${displayName}</div>
//                     <div class="video__slider"><input type="range" class="form-range" min="0" max="5" id="customRange1"></div>
//                     <label for="customRange1" class="form-label"></label>
                    
//                 </div>`;

//         document.getElementById('streams__container').insertAdjacentHTML('beforeend', player);
//     }

//     if (mediaType === 'video') {
//         user.videoTrack.play(`user-${user.uid}`);
//     }

//     if (mediaType === 'audio') {
//         user.audioTrack.play();
//     }
// };




// // remove user from DOM
// let handleUserLeft = async (user) => {
//     delete remoteUsers[user.uid]
//     document.getElementById(`user-container-${user.uid}`).remove()
// }

// // MUTE/UNMUTE
// let toggleMic = async (e) => {
//     let button = e.currentTarget

//     if(localTracks[0].muted){
//         await localTracks[0].setMuted(false)
//         button.classList.add('active')
//     }else{
//         await localTracks[0].setMuted(true)
//         button.classList.remove('active')
//     }
// }

// // Camera on/off
// let toggleCamera = async (e) => {
//     let button = e.currentTarget

//     if(localTracks[1].muted){
//         await localTracks[1].setMuted(false)
//         button.classList.add('active')
//     }else{
//         await localTracks[1].setMuted(true)
//         button.classList.remove('active')
//     }
// }

// // exit
// let redirectToLobby = async () => {
//     window.location = 'lobby.html';
// };


// document.getElementById('camera-btn').addEventListener('click', toggleCamera)
// document.getElementById('mic-btn').addEventListener('click', toggleMic)
// document.getElementById('leave-btn').addEventListener('click', redirectToLobby);

// joinRoomInit()
