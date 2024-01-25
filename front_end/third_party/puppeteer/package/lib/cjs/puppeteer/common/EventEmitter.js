"use strict";
/**
 * @license
 * Copyright 2022 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubscription = exports.EventEmitter = void 0;
const mitt_js_1 = __importDefault(require("../../third_party/mitt/mitt.js"));
const disposable_js_1 = require("../util/disposable.js");
/**
 * The EventEmitter class that many Puppeteer classes extend.
 *
 * @remarks
 *
 * This allows you to listen to events that Puppeteer classes fire and act
 * accordingly. Therefore you'll mostly use {@link EventEmitter.on | on} and
 * {@link EventEmitter.off | off} to bind
 * and unbind to event listeners.
 *
 * @public
 */
class EventEmitter {
    #emitter;
    #handlers = new Map();
    /**
     * If you pass an emitter, the returned emitter will wrap the passed emitter.
     *
     * @internal
     */
    constructor(emitter = (0, mitt_js_1.default)(new Map())) {
        this.#emitter = emitter;
    }
    /**
     * Bind an event listener to fire when an event occurs.
     * @param type - the event type you'd like to listen to. Can be a string or symbol.
     * @param handler - the function to be called when the event occurs.
     * @returns `this` to enable you to chain method calls.
     */
    on(type, handler) {
        const handlers = this.#handlers.get(type);
        if (handlers === undefined) {
            this.#handlers.set(type, [handler]);
        }
        else {
            handlers.push(handler);
        }
        this.#emitter.on(type, handler);
        return this;
    }
    /**
     * Remove an event listener from firing.
     * @param type - the event type you'd like to stop listening to.
     * @param handler - the function that should be removed.
     * @returns `this` to enable you to chain method calls.
     */
    off(type, handler) {
        const handlers = this.#handlers.get(type) ?? [];
        if (handler === undefined) {
            for (const handler of handlers) {
                this.#emitter.off(type, handler);
            }
            this.#handlers.delete(type);
            return this;
        }
        const index = handlers.lastIndexOf(handler);
        if (index > -1) {
            this.#emitter.off(type, ...handlers.splice(index, 1));
        }
        return this;
    }
    /**
     * Emit an event and call any associated listeners.
     *
     * @param type - the event you'd like to emit
     * @param eventData - any data you'd like to emit with the event
     * @returns `true` if there are any listeners, `false` if there are not.
     */
    emit(type, event) {
        this.#emitter.emit(type, event);
        return this.listenerCount(type) > 0;
    }
    /**
     * Remove an event listener.
     *
     * @deprecated please use {@link EventEmitter.off} instead.
     */
    removeListener(type, handler) {
        return this.off(type, handler);
    }
    /**
     * Add an event listener.
     *
     * @deprecated please use {@link EventEmitter.on} instead.
     */
    addListener(type, handler) {
        return this.on(type, handler);
    }
    /**
     * Like `on` but the listener will only be fired once and then it will be removed.
     * @param type - the event you'd like to listen to
     * @param handler - the handler function to run when the event occurs
     * @returns `this` to enable you to chain method calls.
     */
    once(type, handler) {
        const onceHandler = eventData => {
            handler(eventData);
            this.off(type, onceHandler);
        };
        return this.on(type, onceHandler);
    }
    /**
     * Gets the number of listeners for a given event.
     *
     * @param type - the event to get the listener count for
     * @returns the number of listeners bound to the given event
     */
    listenerCount(type) {
        return this.#handlers.get(type)?.length || 0;
    }
    /**
     * Removes all listeners. If given an event argument, it will remove only
     * listeners for that event.
     *
     * @param type - the event to remove listeners for.
     * @returns `this` to enable you to chain method calls.
     */
    removeAllListeners(type) {
        if (type !== undefined) {
            return this.off(type);
        }
        this[disposable_js_1.disposeSymbol]();
        return this;
    }
    /**
     * @internal
     */
    [disposable_js_1.disposeSymbol]() {
        for (const [type, handlers] of this.#handlers) {
            for (const handler of handlers) {
                this.#emitter.off(type, handler);
            }
        }
        this.#handlers.clear();
    }
}
exports.EventEmitter = EventEmitter;
/**
 * @internal
 */
class EventSubscription {
    #target;
    #type;
    #handler;
    constructor(target, type, handler) {
        this.#target = target;
        this.#type = type;
        this.#handler = handler;
        this.#target.on(this.#type, this.#handler);
    }
    [disposable_js_1.disposeSymbol]() {
        this.#target.off(this.#type, this.#handler);
    }
}
exports.EventSubscription = EventSubscription;
//# sourceMappingURL=EventEmitter.js.map