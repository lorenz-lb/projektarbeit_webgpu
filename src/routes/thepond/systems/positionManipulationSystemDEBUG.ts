import type { CameraComponent } from "../components/cameraComponent";
import type { MeshRenderComponent } from "../components/meshRenderComponent";
import type { TransformComponent } from "../components/transformComponent";
import { GameState } from "../control/gameState";
import { InputManager, KeyPress } from "../control/inputManager";
import type { MeshManager } from "../control/meshManager";
import type { System } from "./system";
import type { AssetReferenceComponent } from "../components/assetReferenceComponent";
import { Raycaster } from "../control/raycaster";

export class PositionManipulationSystemDEBUG implements System {

    inputManager: InputManager;
    meshManager: MeshManager;
    raycaster: Raycaster;

    constructor(inputManager: InputManager, meshManager: MeshManager) {
        this.inputManager = inputManager;
        this.meshManager = meshManager;
        this.raycaster = new Raycaster();
    }

    update(gameState: GameState,
        transforms: Map<number, TransformComponent>,
        cameras: Map<number, CameraComponent>,
        assetRefs: Map<number, AssetReferenceComponent>) {

        if (!gameState.isFreeCamActive) {
            gameState.selectedEntityID = -1;
            return;
        }


        // cast on key down
        if (this.inputManager.primary === KeyPress.Down) {

            console.log("doRaycast");
            const activeCamID = gameState.activeCameraEntityID;
            const camTransform = transforms.get(activeCamID);
            const camComponent = cameras.get(activeCamID);

            if (!camTransform || !camComponent) return;

            const rayOrigin = camTransform.position;
            const rayDirection = camComponent.forwards;

            let hitResult = this.raycaster.cast(rayOrigin, rayDirection, transforms, assetRefs, this.meshManager);
            gameState.selectedEntityID = hitResult.entityID;

            console.log("RESULT", gameState.selectedEntityID);

            if (gameState.selectedEntityID == -1)
                return;
        }

        if (this.inputManager.shift === KeyPress.Held || this.inputManager.shift === KeyPress.Down) {
            const transformToMove = transforms.get(gameState.selectedEntityID)!;
            const activeCameraComponent = cameras.get(gameState.activeCameraEntityID)!;

            if (!transformToMove || !activeCameraComponent)
                return;

            const mouseDelta = this.inputManager.consumeMouse();
            const moveScale = 0.005;

            const forward = activeCameraComponent.forwards;

            const absX = Math.abs(forward[0]);
            const absY = Math.abs(forward[1]);
            const absZ = Math.abs(forward[2]);

            let moveX = 0;
            let moveY = 0;
            let moveZ = 0;
            let deltaXMap = mouseDelta.x * moveScale;
            let deltaYMap = -mouseDelta.y * moveScale;

            if (absZ >= absX && absZ >= absY) {
                const signCorrection = forward[2] > 0 ? -1 : 1;

                moveX = deltaXMap * signCorrection;
                moveY = deltaYMap;

            }
            else if (absX >= absY && absX > absZ) {
                const signCorrection = forward[0] > 0 ? 1 : -1;
                moveZ = deltaXMap * signCorrection;
                moveY = deltaYMap;
            }
            else {
                const signCorrection = forward[1] > 0 ? 1 : -1;
                moveX = deltaXMap;
                moveZ = deltaYMap * signCorrection;
            }

            transformToMove.position[0] += moveX;
            transformToMove.position[1] += moveY;
            transformToMove.position[2] += moveZ;

            const pos = transformToMove.position;
            console.log(`Pos: X=${pos[0].toFixed(3)}, Y=${pos[1].toFixed(3)}, Z=${pos[2].toFixed(3)}`);
        }

    }
}
