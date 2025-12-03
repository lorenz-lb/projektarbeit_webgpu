import { vec3, mat4 } from "gl-matrix"
import type { System } from "./system";
import type { InputManager } from "../control/inputManager";
import type { CameraComponent } from "../components/cameraComponent";
import type { TransformComponent } from "../components/transformComponent";


export class CameraSystem implements System {
    update(
        cameraComponents: Map<number, CameraComponent>,
        transforms: Map<number, TransformComponent>,
    ) {

        for (let [k, v] of cameraComponents.entries()) {
            let transform = transforms.get(k)!;
            const cameraComponent = cameraComponents.get(k)!;
            const cameraTransform = transforms.get(k);

            if (!cameraComponent || !cameraTransform || !transform)
                continue;

            const maxPitch = 89 * (Math.PI / 180);
            cameraTransform.eulers[0] = Math.max(-maxPitch, Math.min(maxPitch, cameraTransform.eulers[0]));

            const rotationMatrix = mat4.create();
            mat4.rotateY(rotationMatrix, rotationMatrix, cameraTransform.eulers[1]);
            mat4.rotateX(rotationMatrix, rotationMatrix, cameraTransform.eulers[0]);

            vec3.set(cameraComponent.right, rotationMatrix[0], rotationMatrix[1], rotationMatrix[2]);
            vec3.set(cameraComponent.forwards, rotationMatrix[8], rotationMatrix[9], rotationMatrix[10]);
            vec3.negate(cameraComponent.forwards, cameraComponent.forwards);
    }
}
}
