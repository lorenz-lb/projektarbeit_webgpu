import type { Component } from "../components/component";

export class EntityManager {
    private nextEntity: number;
    private componentStore: Map<string, Map<number, any>>;


    constructor() {
        this.nextEntity = 0;
        this.componentStore = new Map();
    }

    createEntity(): number {
        return this.nextEntity++;
    }


    addComponent<T extends Component>(entity: number, component: T): void {

        const typeName = component.constructor.name;

        if (!this.componentStore.has(typeName)) {
            this.componentStore.set(typeName, new Map());
        }

        this.componentStore.get(typeName)!.set(entity, component);
    }

    getComponents<T extends Component>(type: new (...args: any[]) => T): Map<number, T> {
        const typeName = type.name;
        return this.componentStore.get(typeName) || new Map<number, T>();
    }
}
