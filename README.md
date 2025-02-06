# 🎵 Zero Amp Music 🎵

## 🎧 About the Project
Zero Amp Music is a sleek, **Electron-based music player** designed for simplicity and performance. It allows users to create and manage playlists, play audio files, and visualize music effects. Built with **React, Redux, and Electron**, it provides a smooth desktop experience for music lovers.

## 🚀 Features
✅ **Playlist Management** – Create and organize playlists dynamically  
✅ **Audio Playback** – Play, pause, stop, and skip songs seamlessly  
✅ **Shuffle Mode** – Randomize playback order for a fresh experience  
✅ **Custom Themes** – Pick colors to personalize the UI  
✅ **Visual Effects** – Dynamic visualizer reacts to music (coming soon)  
✅ **Minimalist Design** – Simple yet powerful user interface  

## 🛠️ Tech Stack
- **Electron** (for cross-platform desktop app functionality)
- **React + Redux** (for frontend UI and state management)
- **Tailwind CSS** (for styling and responsive design)
- **Node.js + Electron IPC** (for filesystem and backend integration)

## 📂 Project Structure
```
ZeroAmpMusic/
├── public/       # Fonts, images, and music folders
├── src/
│   ├── components/  # React components (Player, Speaker, Visuals, etc.)
│   ├── redux/       # Redux store and slices
│   ├── styles/      # CSS stylesheets
│   ├── App.jsx      # Main React application
│   ├── main.js      # Electron main process
│   ├── preload.js   # Electron preload script
│   ├── renderer.js  # Renderer process
│   ├── index.html   # Base HTML file
│   ├── index.js     # React entry point
│   ├── package.json # Dependencies and scripts
└── README.md        # Project documentation
```

## 🛠️ Installation & Setup
To run Zero Amp Music on your system:

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/Mark-LaRose/Zero-Amp-Music.git
cd Zero-Amp-Music
```

### **2️⃣ Install Dependencies**
```sh
npm install
```

### **3️⃣ Start the Application**
```sh
npm start
```

The app should now launch as a **desktop application**!

## 🎮 Usage
- **Double-click** a song to start playing it
- Use the **buttons** to play/pause, stop, skip, or shuffle songs
- Click on the **color picker** to customize the theme
- **Right-click** a song for additional options (Rename, Delete, etc.)

## 🚀 Future Enhancements
🔹 **Better Visual Effects** (Syncing animations with music)  
🔹 **Equalizer** (Advanced sound customization)  
🔹 **Streaming Support** (YouTube API integration)  

## 📜 License
This project is released under the MIT License. You are free to use, modify, and distribute the code, but there is no active support or contribution process.

🎶 _Enjoy your music with Zero Amp Music!_ 🎵