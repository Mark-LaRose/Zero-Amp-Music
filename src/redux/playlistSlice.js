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
    setActivePlaylist: (state, action) => {
      state.activePlaylist = action.payload;
      state.currentSong = null;
    },
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload;
    },
    playSong: (state) => {
      state.isPlaying = true;
    },
    pauseSong: (state) => {
      state.isPlaying = false;
    },
    stopSong: (state) => {
      state.isPlaying = false;
      state.currentSong = null;
    },
  },
});

//  Ensure these exports exist:
export const {
  setActivePlaylist,
  setCurrentSong,
  playSong,
  pauseSong,
  stopSong,
} = playlistSlice.actions;

export default playlistSlice.reducer;