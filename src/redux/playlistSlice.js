import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  playlists: {
    library: [], // Default Library
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  },
  activePlaylist: "library", // Default active playlist
  currentSong: null, // Currently playing song
  isPlaying: false, // Playback state
  volume: 50, // Default volume
};

const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {
    // Select active playlist and automatically choose the first song
    setActivePlaylist: (state, action) => {
      state.activePlaylist = action.payload;
      const playlist = state.playlists[action.payload] || [];
      state.currentSong = playlist.length > 0 ? playlist[0] : null;
      console.log(`Active Playlist set to: ${state.activePlaylist}`);
    },

    // Set a specific song as the current one and start playing
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload;
      state.isPlaying = true;
    },

    // Play current song
    playSong: (state) => {
      if (state.currentSong) {
        state.isPlaying = true;
      }
    },

    // Pause current song
    pauseSong: (state) => {
      state.isPlaying = false;
    },

    // Stop playback and reset the selected song
    stopSong: (state) => {
      state.isPlaying = false;
      state.currentSong = null;
    },

    // Play next song in the list, looping if at the end
    playNextSong: (state) => {
      const playlist = state.playlists[state.activePlaylist] || [];
      if (playlist.length > 0 && state.currentSong) {
        const currentIndex = playlist.indexOf(state.currentSong);
        if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
          state.currentSong = playlist[currentIndex + 1];
          state.isPlaying = true;
        }
      }
    },

    // Play previous song, looping if at the start
    playPreviousSong: (state) => {
      const playlist = state.playlists[state.activePlaylist] || [];
      if (playlist.length > 0 && state.currentSong) {
        const currentIndex = playlist.indexOf(state.currentSong);
        if (currentIndex > 0) {
          state.currentSong = playlist[currentIndex - 1];
          state.isPlaying = true;
        }
      }
    },

    // Shuffle playlist and play a random song
    shuffleSong: (state) => {
      const playlist = state.playlists[state.activePlaylist] || [];
      if (playlist.length > 0) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * playlist.length);
        } while (playlist[randomIndex] === state.currentSong); // Avoid repeating the same song
        state.currentSong = playlist[randomIndex];
        state.isPlaying = true;
      }
    },
  },
});

export const {
  setActivePlaylist,
  setCurrentSong,
  playSong,
  pauseSong,
  stopSong,
  playNextSong,
  playPreviousSong,
  shuffleSong,
} = playlistSlice.actions;

export default playlistSlice.reducer;