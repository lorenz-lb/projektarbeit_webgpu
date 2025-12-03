import { vec3 } from "gl-matrix";

export type AnimationData = {
  startFrame: number;
  frameCount: number;
  frameDuration: number;
}

export class AnimationComponent {
    state: string;
    frameIndex: number;
    timeElapsed: number;
    currentAnimation: AnimationData;
    animationMap: Map<string, AnimationData>

    constructor(state:string, currentAnimation: AnimationData, animationMap: Map<string,AnimationData>){
      this.state = state;
      this.frameIndex = 0;
      this.timeElapsed = 0;
      this.currentAnimation = currentAnimation;
      this.animationMap = animationMap;
    }
}
