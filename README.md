<div align="center">
  <img src="./assets/inicon.png" alt="SolView Logo" width="200" />
  <p>A mobile application built with React Native and Expo to track and explore Solana wallets seamlessly.</p>
</div>

---

## 📖 About

**SolView** is a cross-platform mobile wallet explorer for the Solana blockchain. It allows users to connect their mobile wallets, view SOL balances, monitor token holdings, track recent transaction history, and maintain a list of favorite addresses.

Built with **Expo** and the **Solana Mobile Wallet Adapter**, SolView acts as a lightweight tracking and portfolio viewing tool right from your mobile device.

## ✨ Features

- **Wallet Connection:** Connect to any Solana mobile wallet directly via the Mobile Wallet Adapter (MWA) protocol.
- **Portfolio Tracking:** View your current SOL balance and SPL token holdings in real time.
- **Transaction History:** Explore recent transactions with detailed, swipeable history items (`react-native-gesture-handler`).
- **Favorites Management:** Save your frequently visited wallet addresses for quick access using persistent local storage.
- **Solscan Integration:** Direct links to the Solscan explorer for deep-dive analysis of transactions and accounts.
- **Responsive UI:** Smooth, native-feeling animations using Reanimated and an intuitive navigation flow with Expo Router.

## 🛠 Tech Stack

- **Framework:** React Native + [Expo](https://expo.dev) 
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/)
- **Blockchain:** `@solana/web3.js` + `@solana-mobile/mobile-wallet-adapter-protocol`
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Local Storage:** AsyncStorage (`@react-native-async-storage/async-storage`)
- **Gestures & Animations:** `react-native-gesture-handler` & `react-native-reanimated`

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- An Android Emulator / iOS Simulator, or a physical device with the Expo Go app.

### Installation

1. Clone or download the repository to your local machine:
   ```bash
   git clone <repository_url>
   cd SolView
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the Expo development server:

```bash
npx expo start
```

Press one of the following commands in the terminal based on your target device:

- **`a`** - To run on an Android device or emulator
- **`i`** - To run on an iOS simulator
- **`w`** - To run on the web
