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
  isShuffle: false, // Shuffle mode state
};

const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {
    // Toggle shuffle mode
    toggleShuffle: (state) => {
      state.isShuffle = !state.isShuffle;
      console.log(`🔀 Shuffle Mode: ${state.isShuffle ? "ON" : "OFF"}`);
    },

    // Select active playlist and ensure it's properly loaded
    setActivePlaylist: (state, action) => {
      const playlistName = action.payload;
      state.activePlaylist = playlistName;
      const playlist = state.playlists[playlistName] || [];

      if (playlist.length > 0) {
        state.currentSong = playlist[0]; // Set first song, but don't autoplay
        state.isPlaying = false; // ❌ Ensure it doesn't start playing automatically
      } else {
        state.currentSong = null;
      }

      console.log(`🎵 Active Playlist: ${state.activePlaylist}, First Song: ${state.currentSong || "None"}`);
    },

    // Stop playback when silver button "3" is deselected or "1"/"2" is selected
    stopPlaybackOnSilverButton: (state) => {
      state.isPlaying = false;
      state.currentSong = null;
      console.log("⏹️ Stopping music due to silver button selection/deselection.");
    },

    // Set a specific song as the current one and start playing
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload;
      if (state.isPlaying) {
        console.log(`🎶 Now Playing: ${state.currentSong}`);
      } else {
        console.log(`🎵 Selected: ${state.currentSong} (waiting for user to hit play)`);
      }
    },

    // Play current song
    playSong: (state) => {
      if (state.currentSong) {
        state.isPlaying = true;
        console.log(`▶️ Playing: ${state.currentSong}`);
      }
    },

    // Pause current song without resetting progress
    pauseSong: (state) => {
      if (state.isPlaying) {
        state.isPlaying = false;
        console.log(`⏸️ Paused: ${state.currentSong}`);
      }
    },

    // Stop playback and clear selection
    stopSong: (state) => {
      state.isPlaying = false;
      state.currentSong = null;
      console.log("⏹️ Stopped playback.");
    },

    // Play next song (shuffle-aware)
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
        state.currentSong = playlist[nextIndex];
        state.isPlaying = true;
        console.log(`⏭️ Next Song: ${state.currentSong}`);
      } else {
        console.warn("⚠️ No songs in the playlist.");
      }
    },

    // Play previous song and loop if needed
    playPreviousSong: (state) => {
      const playlist = state.playlists[state.activePlaylist] || [];
      if (playlist.length > 0) {
        const currentIndex = playlist.indexOf(state.currentSong);
        if (currentIndex !== -1) {
          const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
          state.currentSong = playlist[prevIndex];
          state.isPlaying = true;
          console.log(`⏮️ Previous Song: ${state.currentSong}`);
        } else {
          console.warn("⚠️ Current song not found in playlist.");
        }
      } else {
        console.warn("⚠️ No songs in the playlist.");
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
        console.log(`🔀 Shuffled Song: ${state.currentSong}`);
      } else {
        console.warn("⚠️ No songs in the playlist to shuffle.");
      }
    },

    // Update the playlist when songs are loaded from a directory
    updatePlaylist: (state, action) => {
      const { playlistName, songs } = action.payload;
      state.playlists[playlistName] = songs;

      console.log(`📂 Updated Playlist: ${playlistName}, Songs: ${songs.length}`);

      // Ensure active playlist gets updated if needed
      if (state.activePlaylist === playlistName && songs.length > 0) {
        state.currentSong = songs[0]; // Auto-select first song
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
  stopPlaybackOnSilverButton, // Exported new stop function
} = playlistSlice.actions;

export default playlistSlice.reducer;