import type { vec2 } from "gl-matrix";

export interface AnimationStep {
  id: number;
  time: number;
  uv: vec2;
}

export class SpriteComponent {
  animations: Map<string, AnimationStep[]>;
  currentAnimation: string;
  currentStep: number;

  timeSinceUpdate: number;

  constructor(animations: Map<string, AnimationStep[]>, currentAnimation: string, currentStep: number = 0) {
    this.animations = animations;
    this.currentStep = currentStep;
    this.currentAnimation = currentAnimation;

    this.timeSinceUpdate = 0;
  }
}
