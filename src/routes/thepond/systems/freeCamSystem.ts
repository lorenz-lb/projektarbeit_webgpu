import type { System } from "./system";
import { TransformComponent } from "../components/transformComponent";
import { KeyPress, type InputManager } from "../control/inputManager";
import type { FreeCamComponent } from "../components/freeCamComponent";
import type { CameraComponent } from "../components/cameraComponent";
import { vec3, mat4 } from "gl-matrix";
import { GameState } from "../control/gameState";


export class FreeCamSystem implements System {

    private inputManager: InputManager;

    constructor(inputManager: InputManager) {
        this.inputManager = inputManager;
    }

    update(
        freeCamComponents: Map<number, FreeCamComponent>,
        cameraComponents: Map<number, CameraComponent>,
        transforms: Map<number, TransformComponent>,
        gamestate: GameState,
        deltaTime: number,
    ) {

        if (!gamestate.isFreeCamActive)
            return;

        const worldUp = vec3.fromValues(0, 1, 0);

        // active camera has to be freecam because isFreeCamActive is true!
        const activeCameraID = gamestate.activeCameraEntityID;

        const freeCamComponent = freeCamComponents.get(activeCameraID);
        const cameraComponent = cameraComponents.get(activeCameraID)!;
        const transformComponent = transforms.get(activeCameraID);

        if (!freeCamComponent || !cameraComponent || !transformComponent)
            return;

        const movement = this.inputManager.consumeMouse();

        let forwardsAmount = 0;
        let rightAmount = 0;
        let upAmount = 0;

        // update camera
        transformComponent.eulers[0] -= movement.y * freeCamComponent.mouseSpeed * deltaTime;
        transformComponent.eulers[1] -= movement.x * freeCamComponent.mouseSpeed * deltaTime;

        const maxPitch = 89 * (Math.PI / 180);
        transformComponent.eulers[0] = Math.max(-maxPitch, Math.min(maxPitch, transformComponent.eulers[0]));

        const rotationMatrix = mat4.create();
        mat4.rotateY(rotationMatrix, rotationMatrix, transformComponent.eulers[1]);
        mat4.rotateX(rotationMatrix, rotationMatrix, transformComponent.eulers[0]);


        vec3.set(cameraComponent.right, rotationMatrix[0], rotationMatrix[1], rotationMatrix[2]);
        vec3.set(cameraComponent.forwards, rotationMatrix[8], rotationMatrix[9], rotationMatrix[10]);
        vec3.negate(cameraComponent.forwards, cameraComponent.forwards);

        const deltaSpeed = freeCamComponent.speed * deltaTime;
        const isWActive = this.inputManager.w === KeyPress.Held || this.inputManager.w === KeyPress.Down;
        const isAActive = this.inputManager.a === KeyPress.Held || this.inputManager.a === KeyPress.Down;
        const isSActive = this.inputManager.s === KeyPress.Held || this.inputManager.s === KeyPress.Down;
        const isDActive = this.inputManager.d === KeyPress.Held || this.inputManager.d === KeyPress.Down;
        const isQActive = this.inputManager.q === KeyPress.Held || this.inputManager.q === KeyPress.Down;
        const isEActive = this.inputManager.e === KeyPress.Held || this.inputManager.e === KeyPress.Down;

        // movement
        if (isWActive) {
            forwardsAmount += deltaSpeed;
        }

        if (isSActive) {
            forwardsAmount -= deltaSpeed;
        }

        if (isAActive) {
            rightAmount -= deltaSpeed;
        }

        if (isDActive) {
            rightAmount += deltaSpeed;
        }

        if (isQActive) {
            upAmount -= deltaSpeed / 2;
        }

        if (isEActive) {
            upAmount += deltaSpeed / 2;
        }


        const flatForwards = vec3.clone(cameraComponent.forwards);

        flatForwards[1] = 0;

        vec3.normalize(flatForwards, flatForwards);

        vec3.scaleAndAdd(
            transformComponent.position, transformComponent.position,
            flatForwards, forwardsAmount
        );

        vec3.scaleAndAdd(
            transformComponent.position, transformComponent.position,
            cameraComponent.right, rightAmount
        );

        vec3.scaleAndAdd(
            transformComponent.position, transformComponent.position,
            worldUp, upAmount
        );
    }
}
