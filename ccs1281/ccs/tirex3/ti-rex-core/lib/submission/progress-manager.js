'use strict';
require('rootpath')();

const EventEmitter = require('events');

const async = require('async');

class ProgressManagerEventEmitter extends EventEmitter {}

const ProgressManagerEvents = {
    PROGRESS_UPDATED: 'progressUpdated'
};

// States with special meaning
const ProgressState = {
    LOADING: 'loading', /* The first state of a task */
    DONE: 'done' /* The final state of a task */
}; exports.ProgressState = ProgressState;

/**
 * For managing the progress of tasks.
 * 
 */
class ProgressManager {

    /**
     * 
     * 
     */
    constructor() {
        this._tasks = {}; // key {String} submissionId value {String} state
        this._progressEventEmitter = new ProgressManagerEventEmitter();
    }

    /**
     * Set the state of the task.
     * 
     * @param {String} submissionId
     * @param {String} state
     */
    setTaskState(submissionId, state) {
        if (state === ProgressState.DONE) {
            delete this._tasks[submissionId];
        }
        else {
            this._tasks[submissionId] = state;
        }
        this._progressEventEmitter.emit(
            ProgressManagerEvents.PROGRESS_UPDATED, submissionId, state
        );
    }

    /**
     * Get the state of the task.
     * 
     * @param {String} submissionId
     * @returns {String} state
     */
    getTaskState(submissionId) {
        const task = this._tasks[submissionId];
        if (!task) {
            return ProgressState.DONE;
        }
        else {
            return task;
        }
    }

    /**
     * Triggered when all tasks, at the time of calling this function, are passed the LOADING state.
     * 
     * @param {ErrorCallback} callback
     */
    onAllDoneLoading(callback) {
        const loadingTasks = Object.keys(this._tasks).filter((submissionId) => {
            return this._tasks[submissionId] === ProgressState.LOADING;
        });
        if (loadingTasks.length === 0) {
            return setImmediate(callback);
        }
        async.doUntil((callback) => {
            this._progressEventEmitter.once(
                ProgressManagerEvents.PROGRESS_UPDATED, (submissionId, state) => {
                    const idx = loadingTasks.indexOf(submissionId);
                    if (idx !== -1 && state !== ProgressState.LOADING) {
                        loadingTasks.splice(idx, 1);
                    }
                    callback();
                });
        }, () => {
            return loadingTasks.length === 0;
        }, callback);
    }

    /**
     * Triggered when all tasks, at the time of calling this function, are passed the DONE state.
     * 
     * @param {ErrorCallback} callback
     */
    onAllDone(callback) {
        const tasks = Object.keys(this._tasks);
        if (tasks.length === 0) {
            return setImmediate(callback);
        }
        async.doUntil((callback) => {
            this._progressEventEmitter.once(
                ProgressManagerEvents.PROGRESS_UPDATED, (submissionId, state) => {
                    const idx = tasks.indexOf(submissionId);
                    if (idx !== -1 && state === ProgressState.DONE) {
                        tasks.splice(idx, 1);
                    }
                    callback();
                });
        }, () => {
            return tasks.length === 0;
        }, callback);
    }
} exports.ProgressManager = ProgressManager;
