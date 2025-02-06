import { createSlice } from "@reduxjs/toolkit";
import path from "path-browserify";

const initialState = {
  playlists: {
    library: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  },
  activePlaylist: "library",
  currentSong: null,
  isPlaying: false,
  volume: 50,
  isShuffle: false,
};

const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {
    // Toggle shuffle mode
    toggleShuffle: (state) => {
      state.isShuffle = !state.isShuffle;
    },

    // Select active playlist and ensure it's properly loaded
    setActivePlaylist: (state, action) => {
      const playlistName = action.payload;
      state.activePlaylist = playlistName;
      const playlist = state.playlists[playlistName] || [];

      if (playlist.length > 0) {
        state.currentSong = playlist[0];
        state.isPlaying = false;
      } else {
        state.currentSong = null;
      }
    },

    // Stop playback
    stopPlaybackOnSilverButton: (state) => {
      state.isPlaying = false;
      state.currentSong = null;
    },

    // Set a specific song as the current one and start playing
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload;
    },

    // Play current song
    playSong: (state) => {
      if (state.currentSong) {
        state.isPlaying = true;
      }
    },

    // Pause current song without resetting progress
    pauseSong: (state) => {
      if (state.isPlaying) {
        state.isPlaying = false;
      }
    },

    // Stop playback and clear selection
    stopSong: (state) => {
      state.isPlaying = false;
      state.currentSong = null;
    },

    // **Play next song (shuffle-aware) with correct path resolution**
    playNextSong: (state) => {
      const playlist = state.playlists[state.activePlaylist] || [];
      if (playlist.length > 0) {
        let nextIndex;
        if (state.isShuffle) {
          do {
            nextIndex = Math.floor(Math.random() * playlist.length);
          } while (playlist[nextIndex] === state.currentSong);
        } else {
          const currentIndex = playlist.indexOf(state.currentSong);
          nextIndex = (currentIndex + 1) % playlist.length;
        }

        // Ensure we format the full path correctly
        const baseDir = window.electron.baseDir || "";
        const correctPath = path.join(baseDir, state.activePlaylist === "library" ? "library" : state.activePlaylist, playlist[nextIndex]);

        state.currentSong = playlist[nextIndex];
        state.isPlaying = true;

        // Notify Electron to play next song
        window.electron.audio.play(correctPath);
      }
    },

    // **Play previous song and loop if needed with correct path**
    playPreviousSong: (state) => {
      const playlist = state.playlists[state.activePlaylist] || [];
      if (playlist.length > 0) {
        const currentIndex = playlist.indexOf(state.currentSong);
        if (currentIndex !== -1) {
          const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
          
          const baseDir = window.electron.baseDir || "";
          const correctPath = path.join(baseDir, state.activePlaylist, playlist[prevIndex]);

          state.currentSong = playlist[prevIndex];
          state.isPlaying = true;

          // Notify Electron to play previous song
          window.electron.audio.play(correctPath);
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
        } while (playlist[randomIndex] === state.currentSong);
        state.currentSong = playlist[randomIndex];
        state.isPlaying = true;
      }
    },

    // Update the playlist when songs are loaded from a directory
    updatePlaylist: (state, action) => {
      const { playlistName, songs } = action.payload;
      state.playlists[playlistName] = songs;

      // Ensure active playlist gets updated if needed
      if (state.activePlaylist === playlistName && songs.length > 0) {
        state.currentSong = songs[0];
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
  updatePlaylist,
  toggleShuffle,
  stopPlaybackOnSilverButton,
} = playlistSlice.actions;

export default playlistSlice.reducer;