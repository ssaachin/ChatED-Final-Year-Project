let form = document.getElementById('lobby__form')

// This checks if the user has put in a display name and if the user has put in a room name
// If the room name isn't entered then this code will generate a random 6 digit number
// which would be referred as the room name and saved to the localStorage

let displayName = sessionStorage.getItem('display_name')
if(displayName){
    form.name.value = displayName
}

form.addEventListener('submit', (e) => {
    e.preventDefault()

    sessionStorage.setItem('display_name', e.target.name.value)

    let inviteCode = e.target.room.value
    if(!inviteCode){
        inviteCode = String(Math.floor(Math.random() * 10000))
    }
    
    localStorage.setItem('current_room', inviteCode);

    window.location = `room.html?room=${inviteCode}`
})


