
import type { System } from "./system";
import { SpriteComponent } from "../components/spriteComponent";
import type { MeshRenderComponent } from "../components/meshRenderComponent";

export class SpriteSystem implements System {

    update(
        sprites: Map<number, SpriteComponent>,
        render: Map<number, MeshRenderComponent>,
        deltaTime: number,
    ) {
        for (let [k, sprite] of sprites) {

            const meshComponent = render.get(k);

            if (!meshComponent) {
                continue;
            }

            sprite.timeSinceUpdate += deltaTime;


            const currentAnimation = sprite.animations.get(sprite.currentAnimation)!;


            if (sprite.timeSinceUpdate > currentAnimation[sprite.currentStep].time) {
                sprite.currentStep = (sprite.currentStep + 1) % currentAnimation.length;
                sprite.timeSinceUpdate = 0;
            }

            meshComponent.material.setAnimationData(currentAnimation[sprite.currentStep].uv);
        }
    }
}
