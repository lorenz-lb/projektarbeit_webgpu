import { vec2 } from "gl-matrix";
import type { AnimationStep } from "./spriteComponent";

export class PlayerComponent {
  playerSpeed: number;
  fishing: boolean;

  constructor(playerSpeed: number = 1.0, fishing = false) {
    this.playerSpeed = playerSpeed;
    this.fishing = fishing;
  }
}

// ###########################
//    Concrete Player Data 
// ###########################
export function getPlayerAnimationData(): [vec2, Map<string, AnimationStep[]>] {
  let animationMap: Map<string, AnimationStep[]> = new Map();
  let baseSize = vec2.fromValues(46, 17);

  // IDLE
  let idleAnimation: AnimationStep[] = [];
  idleAnimation.push({ id: 0, time: 500, uv: vec2.fromValues(0, 0) });
  idleAnimation.push({ id: 1, time: 500, uv: vec2.fromValues(1 / 3, 0) });
  idleAnimation.push({ id: 2, time: 500, uv: vec2.fromValues(2 / 3, 0) });
  idleAnimation.push({ id: 3, time: 500, uv: vec2.fromValues(1 / 3, 0) });


  // FISHING
  let fishingAnimation: AnimationStep[] = [];
  fishingAnimation.push({ id: 0, time: 500, uv: vec2.fromValues(0, 0.5) });
  fishingAnimation.push({ id: 1, time: 500, uv: vec2.fromValues(1 / 3, 0.5) });
  fishingAnimation.push({ id: 2, time: 500, uv: vec2.fromValues(2 / 3, 0.5) });
  fishingAnimation.push({ id: 3, time: 500, uv: vec2.fromValues(1 / 3, 0.5) });

  animationMap.set("idle", idleAnimation);
  animationMap.set("fishing", fishingAnimation);

  return [baseSize, animationMap];
}

