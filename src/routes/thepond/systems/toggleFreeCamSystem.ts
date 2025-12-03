import type { System } from "./system";
import { KeyPress, type InputManager } from "../control/inputManager";
import type { GameState } from "../control/gameState";

export class ToggleFreeCamSystem implements System {

    private inputManager: InputManager;

    constructor(inputManager: InputManager) {
        this.inputManager = inputManager;
    }

    update(
        freeCamID: number,
        mainCamID: number,
        gameState: GameState,
    ) {


        if (this.inputManager.c == KeyPress.Up) {
            console.log("F PRESSED UP ")
            gameState.isFreeCamActive = !gameState.isFreeCamActive;

            if (gameState.isFreeCamActive) {
                gameState.activeCameraEntityID = freeCamID;
            }
            else {
                gameState.activeCameraEntityID = mainCamID;
            }
        }
    }
}
