// PG: Exploring FSM
// Needs to be generic enough to handle the game loop, but also something like Monster AI

class FiniteStateMachine {
    /**
     * 
     * @param {!Object.<string, State>} stateMatrix 
     * @param {!string} startingStateName 
     */
    constructor(stateMatrix, startingStateName) {
        this.stateMatrix = stateMatrix;
        
        // Dummy Data, will be replaced via enterState below
        this.currentState = { name: "" }; 
        this.previousState = null;

        this.enterState(startingStateName);
    }

    /**
     * Raises an Event that can changes the Machine's current state
     * @param {string} eventName - Name of the Event to raise
     */
    triggerEvent(eventName) {
        let newStateName = this.currentState.getNewState(eventName);
        if (this.newStateName) {
            this.enterState(newStateName);
        }
    }

    // private
    enterState(newStateName) {
        // If we're coming back to the same state, we dont want to either:
        // - Call it's own OnEnter/OnExit
        // - Incorrectly mark the previous state as the current one        
        if (newStateName !== this.currentState.name) {
            if (this.currentState.onExit) {
                this.currentState.onExit();
            }

            this.previousState = this.currentState;
            this.currentState = this.stateMatrix(newStateName);

            if (this.currentState.onEnter) {
                this.currentState.onEnter();
            }
        }
    }
}

/**
 * Represents a State in a Finite State Machine
 */
class State {
    /**
     * 
     * @param {!string} name - Name of the State
     * @param {!Object.<string, string>} transformations - When a given event is raised, what state should we change to?
     * @param {?function} onEnter - Function to call when entering this state
     * @param {?function} onExit - Function to call when leaving this state
     */
    constructor(name, transformations, onEnter, onExit) {
        this.name = name || "";
        this.transformations = transformations || {},
            this.onEnter = onEnter;
        this.onExit = onExit;
    }

    /**
     * Given an eventName, see if there is a corresponding entry in transformations
     * @param {!*} eventName 
     * @returns The StateName of the corresponding entry if it exists, otherwise false
     */
    getNewState(eventName) {
        eventName = eventName || "";
        if (this.transformations[eventName]) {
            return this.transformations[eventName];
        } else {
            return false;
        }
    }
}

////////////////////////
// PG: Example Usage: //
////////////////////////
// function startGame() {
//     console.log("Game Started");
// }

// // TODO: replace strings with GAMESTATE Enum entries
// var stateMatrix = {
//     "LOADING": new State("LOADING", { "AssetsLoaded": "TITLE" }, startGame),
//     "TITLE": new State("TITLE", { "KeyPress": "RUNNING" }),
//     "RUNNING": new State("RUNNING", { "PlayerDie": "GAMELOSE", "PLAYERWIN": "GAMEWIN" }),
//     "GAMELOSE": new State("GAMELOSE", { "KeyPress": "TITLE" }),
//     "GAMEWIN": new State("GAMEWIN", { "KeyPress": "TITLE" })
// }

// var FSM = new FiniteStateMachine(stateMatrix, "LOADING");
// FSM.triggerEvent("AssetsLoaded");
// let changedSuccessfully = (FSM.currentState.name === "TITLE");
