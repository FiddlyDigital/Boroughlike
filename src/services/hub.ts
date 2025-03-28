/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dictionary } from "../utilities";

/**
 * Singleton Class representing the classic Publish/Subscribe Pattern
 */
export class Hub {
    private static instance: Hub;
    subscriptions: Dictionary<any>;

    private constructor() {
        this.subscriptions = [];
    }

    /**
     * Gets the Singleton instance of the Hub if it exists, otherwise creates and stores it
     * @returns {Hub} - The Singleton instance of the Hub
     */
    public static getInstance(): Hub {
        if (!Hub.instance) {
            Hub.instance = new Hub();
        }

        return Hub.instance;
    }

    /**
     * Subscribes a callback to a named Event
     * @param {string} eventName - Name of the event to subscribe to
     * @param {Function} callback - Function to call when the event is triggered
     */
    public subscribe(eventName: string, callback: Function): void {
        if (!this.subscriptions[eventName]) {
            this.subscriptions[eventName] = [];
        }

        this.subscriptions[eventName].push(callback);
    }

    /**
     * Triggers a named Event, causing subscribers to react
     * @param {string} eventName - Name of the event to trigger
     * @param {*} eventData - any even related data
     */
    public publish(eventName: string, eventData: any): void {
        if (this.subscriptions[eventName]) {
            this.subscriptions[eventName]
                .forEach((callback: (arg: any) => void) => {
                    if (callback) {
                        callback(eventData);
                    }
                });
        }
    }
}
