

let accessToken;
const clientId = "2de7d019e5fa41ce929eb9a7a362ce57";
const redirectUri = "http://makkiah-playlist-project.surge.sh/";



const Spotify = {
    getAccessToken(){
        if(accessToken){
            return accessToken;
        }

        //Checks for access token Match
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expirationTimeMatch = window.location.href.match(/expires_in=([^&]*)/);

        
        if(accessTokenMatch && expirationTimeMatch){
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expirationTimeMatch[1]);

            // This clears the peremeters, allowing us to grab a new access token once ours expires
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            const accessURL = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
            window.location = accessURL;
        }
    },

    search(term){
        const accessToken = Spotify.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,
        {
            headers: {Authorization: `Bearer ${accessToken}`}
        } ).then(response => {
            return response.json();
        }).then(jsonResponse => {
            if(!jsonResponse.tracks){
                return [];
            } 
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri,
            }))
        })
    },

    savePlaylist(name, trackUris){
        if(!name || !trackUris.length){
            return ;
        }

        const accessToken = Spotify.getAccessToken();
        const headers = {Authorization: `Bearer ${accessToken}`};
        let userId;

        return fetch(`https://api.spotify.com/v1/me`, {headers: headers}
        ).then(response => response.json()
        ).then(jsonResponse => {
            userId = jsonResponse.id;
            return fetch(`https://api.Spotify.com/v1/users/${userId}/playlists`, 
            {
                headers: headers,
                method: "POST",
                body: JSON.stringify({name: name}),
            })
        }).then(response => response.json()
        ).then(jsonResponse => {
            const playlistId = jsonResponse.id;
            return fetch(`https://api.Spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, 
            {
                headers: headers,
                method: "POST",
                body: JSON.stringify({uris: trackUris})
            })
        })

    },

}

export default Spotify;