/**
 * Singleton Class representing the classic Publish/Subscribe Pattern
 */
class Hub {
    constructor() {
        if (!Hub.instance) {
            this.props = {
                subscriptions : {}
            }

            Hub.instance = this;
        }

        return Hub.instance;
    }

    /**
     * Subscribes to an event, and calls a function whenever that event is triggered
     * @param {string} eventName - Name of the Event to subscribe to
     * @param {function} callback - Function to call when event is triggered
     * @returns {object} An object with an unsubscribe function
     */
    subcribe(eventName, callback) {
        if (!this.props.subscriptions[eventName]) {
            this.props.subscriptions[eventName] = [];
        }

        this.props.subscriptions[eventName].push(callback);
        let callbackIdx = this.props.subscriptions[eventName].length - 1;

        return {
            unsubscribe() {
                this.props.subscriptions[eventName].splice(callbackIdx, 1);
            }
        }
    }

    /**
     * Triggers a named Event, causing subscribers to react
     * @param {string} eventName - Name of the event to trigger
     * @param {*} eventData - any even related data
     */
    publish(eventName, eventData) {
        if (this.props.subscriptions[eventName]) {
            this.props.subscriptions[eventName].forEach(callback => {
                if (callback) {
                    callback(eventData);
                }
            });
        }
    }
}

const hub = new Hub();
Object.freeze(hub);

export default hub;
