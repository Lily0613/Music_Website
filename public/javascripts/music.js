// Creates a function that retrieves songs based on the selected mood
async function getSongs(mood) {

    // Requests songs from your own Express server and retrives all songs that match the selected mood
    const response = await fetch(`/songs/` + mood);

    // Converts the response into JSON format
    const songs = await response.json();

    // Updates the playlist title to display the selected mood. Ex: Happy Playlist
    document.getElementById("playlist-title").innerText =
        mood.toUpperCase() + " PLAYLIST";

    // Gets the HTML element where the songs will be displayed
    const songList = document.getElementById("song-list");

    // Clears the previous playlist to prevent songs from the previously selected mood from remaining on the page
    songList.innerHTML = "";

    // Loops through each song retrieved from the database
    songs.forEach(function(song) {

        // Creates a div for each song
        const songDiv = document.createElement("div");

        // Assigns the CSS class "song" to the new div allowing CSS to style each song card 
        songDiv.className = "song";

        // Displays the song title, artist, and genre
        songDiv.innerHTML = `
            <h3>${song.title}</h3>
            <p>Artist: ${song.artist}</p>
            <p>Genre: ${song.genre}</p>
        `;

        // Adds the song to the webpage so the song card is visible on the page
        songList.appendChild(songDiv);

    });
}