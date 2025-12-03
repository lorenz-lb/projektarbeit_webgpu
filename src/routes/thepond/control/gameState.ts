export class GameState {
    isFreeCamActive: boolean;
    activeCameraEntityID: number;


    // debug
    isDebug: boolean;
    selectedEntityID: number;

    constructor() {
        this.isFreeCamActive = false;
        this.activeCameraEntityID = -1;

        this.isDebug = true;
        this.selectedEntityID = -1;
    }
}
