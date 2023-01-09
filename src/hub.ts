import { Dictionary } from "./utilities";

/**
 * Singleton Class representing the classic Publish/Subscribe Pattern
 */
export class Hub {
    private static instance: Hub;
    subscriptions: Dictionary<any>;

    private constructor() {
        this.subscriptions = [];
    }

    public static getInstance(): Hub {
        if (!Hub.instance) {
            Hub.instance = new Hub();
        }

        return Hub.instance;
    }

    public subscribe(eventName: string, callback: Function) {
        if (!this.subscriptions[eventName]) {
            this.subscriptions[eventName] = [];
        }

        this.subscriptions[eventName].push(callback);
        let callbackIdx = this.subscriptions[eventName].length - 1;

        return {
            unsubscribe() {
                Hub.getInstance().subscriptions[eventName].splice(callbackIdx, 1);
            }
        }
    }

    /**
     * Triggers a named Event, causing subscribers to react
     * @param {string} eventName - Name of the event to trigger
     * @param {*} eventData - any even related data
     */
    public publish(eventName: string, eventData: any) {
        if (this.subscriptions[eventName]) {
            this.subscriptions[eventName]
                .forEach((callback: (arg0: any) => void) => {
                    if (callback) {
                        callback(eventData);
                    }
                });
        }
    }
}

