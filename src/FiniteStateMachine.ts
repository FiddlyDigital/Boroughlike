// PG: Exploring FSM
// Needs to be generic enough to handle the game loop, but also something like Monster AI

export class FiniteStateMachine {
    stateMatrix: any;
    currentState: any;
    previousState: any;

    constructor(stateMatrix: any, startingStateName: string) {
        this.stateMatrix = stateMatrix;

        // Dummy Data, will be replaced via enterState below
        this.currentState = { name: "" };
        this.previousState = null;

        this.enterState(startingStateName);
    }

    public triggerEvent(eventName: string) {
        let newStateName = this.currentState.getNewState(eventName);
        if (newStateName) {
            this.enterState(newStateName);
        }
    }

    // private
    private enterState(newStateName: string) {
        // If we're coming back to the same state, we dont want to either:
        // - Call it's own OnEnter/OnExit
        // - Incorrectly mark the previous state as the current one        
        if (newStateName !== this.currentState.name) {
            if (this.currentState.onExit) {
                this.currentState.onExit();
            }

            this.previousState = this.currentState;
            this.currentState = this.stateMatrix[newStateName];

            if (this.currentState.onEnter) {
                this.currentState.onEnter();
            }
        }
    }
}

/**
 * Represents a State in a Finite State Machine
 */
export class State {
    name: string;
    transformations: any;
    onEnter: Function | null;
    onExit: Function | null

    constructor(name: string, transformations: any, onEnter: Function | null, onExit: Function | null) {
        this.name = name || "";
        this.transformations = transformations || {};
        this.onEnter = onEnter;
        this.onExit = onExit;
    }

    getNewState(eventName: string) {
        eventName = eventName || "";
        if (this.transformations[eventName]) {
            return this.transformations[eventName];
        } else {
            return false;
        }
    }
}