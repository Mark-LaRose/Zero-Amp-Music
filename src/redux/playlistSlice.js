import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  playlists: {
    general: [], // General playlist
    1: [], // Playlist 1
    2: [], // Playlist 2
    3: [], // Playlist 3
    4: [], // Playlist 4
    5: [], // Playlist 5
  },
  activePlaylist: "general", // Default active playlist
  currentSong: null, // Currently playing song
  isPlaying: false, // Playback state
  volume: 50, // Default volume level
};

const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {
    addSongToPlaylist: (state, action) => {
      const { playlistId, song } = action.payload;
      if (state.playlists[playlistId]) {
        if (!state.playlists[playlistId].includes(song)) {
          state.playlists[playlistId].push(song);
        } else {
          console.warn(`Song already exists in Playlist ${playlistId}.`);
        }
      } else {
        console.warn(`Playlist ${playlistId} does not exist.`);
      }
    },
    removeSongFromPlaylist: (state, action) => {
      const { playlistId, song } = action.payload;
      if (state.playlists[playlistId]) {
        state.playlists[playlistId] = state.playlists[playlistId].filter(
          (item) => item !== song
        );
      } else {
        console.warn(`Playlist ${playlistId} does not exist.`);
      }
    },
    setActivePlaylist: (state, action) => {
      const playlistId = action.payload;
      if (state.playlists[playlistId] !== undefined) {
        state.activePlaylist = playlistId;
        state.currentSong = null; // Reset current song when switching playlists
      } else {
        console.warn(`Playlist ${playlistId} does not exist.`);
      }
    },
    setCurrentSong: (state, action) => {
      const song = action.payload;
      state.currentSong = song;
    },
    playSong: (state) => {
      if (state.currentSong) {
        state.isPlaying = true;
      } else {
        console.warn("No song selected to play.");
      }
    },
    pauseSong: (state) => {
      if (state.isPlaying) {
        state.isPlaying = false;
      } else {
        console.warn("No song is currently playing.");
      }
    },
    stopSong: (state) => {
      state.isPlaying = false;
      state.currentSong = null;
    },
    setVolume: (state, action) => {
      const volume = action.payload;
      if (volume >= 0 && volume <= 100) {
        state.volume = volume;
      } else {
        console.warn("Volume must be between 0 and 100.");
      }
    },
    createPlaylist: (state, action) => {
      const playlistId = action.payload;
      if (!state.playlists[playlistId]) {
        state.playlists[playlistId] = [];
      } else {
        console.warn(`Playlist ${playlistId} already exists.`);
      }
    },
    deletePlaylist: (state, action) => {
      const playlistId = action.payload;
      if (state.playlists[playlistId] && playlistId !== "general") {
        delete state.playlists[playlistId];
        if (state.activePlaylist === playlistId) {
          state.activePlaylist = "general";
        }
      } else {
        console.warn(
          `Cannot delete the playlist ${playlistId}. It may not exist or is protected.`
        );
      }
    },
  },
});

export const {
  addSongToPlaylist,
  removeSongFromPlaylist,
  setActivePlaylist,
  setCurrentSong,
  playSong,
  pauseSong,
  stopSong,
  setVolume,
  createPlaylist,
  deletePlaylist,
} = playlistSlice.actions;

export default playlistSlice.reducer;