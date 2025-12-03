import type { System } from "./system";
import { KeyPress, type InputManager } from "../control/inputManager";
import type { GameState } from "../control/gameState";
import type { TransformComponent } from "../components/transformComponent";
import type { PlayerComponent } from "../components/playerComponent";
import type { SpriteComponent } from "../components/spriteComponent";

export class PlayerSystem implements System {

    private inputManager: InputManager;

    constructor(inputManager: InputManager) {
        this.inputManager = inputManager;
    }

    update(
        players: Map<number, PlayerComponent>,
        transforms: Map<number, TransformComponent>,
        sprites: Map<number, SpriteComponent>,
        gameState: GameState,
        deltaTime: number,
    ) {


        if (gameState.isFreeCamActive)
            return;

        for (let [id, player] of players.entries()) {

            let transform = transforms.get(id);

            if (!transform) {
                continue;
            }


            if (!player.fishing) {
                if (this.inputManager.a == KeyPress.Down || this.inputManager.a == KeyPress.Held) {
                    transform.position[0] -= player.playerSpeed * deltaTime;
                }

                if (this.inputManager.d == KeyPress.Down || this.inputManager.d == KeyPress.Held) {
                    transform.position[0] += player.playerSpeed * deltaTime;
                }
            }

            if (this.inputManager.f == KeyPress.Down) {
                player.fishing = !player.fishing;
            }


            // animations
            const sprite = sprites.get(id);
            if (!sprite) {
                continue
            }

            if (player.fishing) {
                sprite.currentAnimation = "fishing";
            }
            else {
                sprite.currentAnimation = "idle";
            }
        }

    }
}
