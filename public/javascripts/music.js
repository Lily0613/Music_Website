// Creates a function that retrieves songs based on the selected mood
async function getSongs(mood) {

    // Requests songs from your own Express server
    const response = await fetch(`/songs/` + mood);

    // Converts the response into JSON format
    const songs = await response.json();

    // Updates the playlist title to display the selected mood
    document.getElementById("playlist-title").innerText =
        mood.toUpperCase() + " PLAYLIST";

    // Gets the HTML element where the songs will be displayed
    const songList = document.getElementById("song-list");

    // Clears the previous playlist
    songList.innerHTML = "";

    // Loops through each song retrieved from the database
    songs.forEach(function(song) {

        // Creates a div for each song
        const songDiv = document.createElement("div");

        songDiv.className = "song";

        // Displays the song title, artist, and genre
        songDiv.innerHTML = `
            <h3>${song.title}</h3>
            <p>Artist: ${song.artist}</p>
            <p>Genre: ${song.genre}</p>
        `;

        // Adds the song to the webpage
        songList.appendChild(songDiv);

    });
}