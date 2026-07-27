import "./styles.css";
import { createGameStore } from "./app/gameStore";
import { mountApp } from "./ui/App";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Application root #app was not found.");
}

const store = createGameStore();
mountApp(root, store);
