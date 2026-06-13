/**
 * AjaxManager - AJAX utility module wrapping XMLHttpRequest
 * Provides GET, POST, and polling capabilities for Songo V2
 * Uses XMLHttpRequest (NOT fetch) as required
 */

'use strict';

class AjaxManager {
    /**
     * Create a new AjaxManager instance
     * @param {Object} options - Configuration options
     * @param {number} [options.timeout=10000] - Default request timeout in ms
     * @param {number} [options.maxRetries=2] - Maximum number of retries on failure
     * @param {number} [options.retryDelay=1000] - Delay between retries in ms
     */
    constructor(options = {}) {
        this.defaultTimeout = options.timeout || 10000;
        this.maxRetries = options.maxRetries || 2;
        this.retryDelay = options.retryDelay || 1000;
        this.activeRequests = new Map();
        this.pollTimers = new Map();
        this.requestIdCounter = 0;
    }

    /**
     * Generate a unique request ID
     * @returns {number}
     */
    _generateRequestId() {
        return ++this.requestIdCounter;
    }

    /**
     * Create and configure an XMLHttpRequest
     * @param {string} method - HTTP method (GET, POST, etc.)
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {XMLHttpRequest}
     */
    _createRequest(method, url, options = {}) {
        const xhr = new XMLHttpRequest();
        const timeout = options.timeout || this.defaultTimeout;

        xhr.open(method, url, true);
        xhr.timeout = timeout;
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        if (method === 'POST' && !options.skipContentType) {
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        }

        return xhr;
    }

    /**
     * Execute an AJAX GET request
     * @param {string} url - Request URL
     * @param {Function} callback - Callback function(success, data, message)
     * @param {Object} [options] - Additional options
     */
    get(url, callback, options = {}) {
        const requestId = this._generateRequestId();
        let retryCount = 0;

        const attemptRequest = () => {
            const xhr = this._createRequest('GET', url, options);

            this.activeRequests.set(requestId, xhr);

            xhr.onload = () => {
                this.activeRequests.delete(requestId);

                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (callback) {
                            callback(response.success !== false, response.data, response.message);
                        }
                    } catch (e) {
                        console.error('AjaxManager: Error parsing GET response', e);
                        if (callback) {
                            callback(false, null, 'Erreur de parsing de la réponse');
                        }
                    }
                } else {
                    // Try to parse error response
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (callback) {
                            callback(false, response.data, response.message || `Erreur HTTP ${xhr.status}`);
                        }
                    } catch (e) {
                        if (retryCount < (options.maxRetries || this.maxRetries)) {
                            retryCount++;
                            console.warn(`AjaxManager: GET retry ${retryCount} for ${url}`);
                            setTimeout(attemptRequest, this.retryDelay);
                            return;
                        }
                        if (callback) {
                            callback(false, null, `Erreur HTTP ${xhr.status}`);
                        }
                    }
                }
            };

            xhr.onerror = () => {
                this.activeRequests.delete(requestId);
                if (retryCount < (options.maxRetries || this.maxRetries)) {
                    retryCount++;
                    console.warn(`AjaxManager: GET network error, retry ${retryCount} for ${url}`);
                    setTimeout(attemptRequest, this.retryDelay);
                    return;
                }
                if (callback) {
                    callback(false, null, 'Erreur réseau');
                }
            };

            xhr.ontimeout = () => {
                this.activeRequests.delete(requestId);
                if (retryCount < (options.maxRetries || this.maxRetries)) {
                    retryCount++;
                    console.warn(`AjaxManager: GET timeout, retry ${retryCount} for ${url}`);
                    setTimeout(attemptRequest, this.retryDelay);
                    return;
                }
                if (callback) {
                    callback(false, null, 'Délai d\'attente dépassé');
                }
            };

            xhr.send();
        };

        attemptRequest();
    }

    /**
     * Execute an AJAX POST request
     * @param {string} url - Request URL
     * @param {Object} data - Data to send (will be JSON-stringified)
     * @param {Function} callback - Callback function(success, data, message)
     * @param {Object} [options] - Additional options
     */
    post(url, data, callback, options = {}) {
        const requestId = this._generateRequestId();
        let retryCount = 0;

        const attemptRequest = () => {
            const xhr = this._createRequest('POST', url, options);

            this.activeRequests.set(requestId, xhr);

            xhr.onload = () => {
                this.activeRequests.delete(requestId);

                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (callback) {
                            callback(response.success !== false, response.data, response.message);
                        }
                    } catch (e) {
                        console.error('AjaxManager: Error parsing POST response', e);
                        if (callback) {
                            callback(false, null, 'Erreur de parsing de la réponse');
                        }
                    }
                } else {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (callback) {
                            callback(false, response.data, response.message || `Erreur HTTP ${xhr.status}`);
                        }
                    } catch (e) {
                        if (retryCount < (options.maxRetries || this.maxRetries)) {
                            retryCount++;
                            console.warn(`AjaxManager: POST retry ${retryCount} for ${url}`);
                            setTimeout(attemptRequest, this.retryDelay);
                            return;
                        }
                        if (callback) {
                            callback(false, null, `Erreur HTTP ${xhr.status}`);
                        }
                    }
                }
            };

            xhr.onerror = () => {
                this.activeRequests.delete(requestId);
                if (retryCount < (options.maxRetries || this.maxRetries)) {
                    retryCount++;
                    console.warn(`AjaxManager: POST network error, retry ${retryCount} for ${url}`);
                    setTimeout(attemptRequest, this.retryDelay);
                    return;
                }
                if (callback) {
                    callback(false, null, 'Erreur réseau');
                }
            };

            xhr.ontimeout = () => {
                this.activeRequests.delete(requestId);
                if (retryCount < (options.maxRetries || this.maxRetries)) {
                    retryCount++;
                    console.warn(`AjaxManager: POST timeout, retry ${retryCount} for ${url}`);
                    setTimeout(attemptRequest, this.retryDelay);
                    return;
                }
                if (callback) {
                    callback(false, null, 'Délai d\'attente dépassé');
                }
            };

            xhr.send(JSON.stringify(data));
        };

        attemptRequest();
    }

    /**
     * Start periodic polling of a URL
     * @param {string} url - URL to poll
     * @param {number} interval - Polling interval in milliseconds
     * @param {Function} callback - Callback function(success, data, message)
     * @param {string} [pollId] - Optional identifier for this poll (to manage multiple polls)
     * @returns {string} The poll ID for this polling operation
     */
    poll(url, interval, callback, pollId) {
        const id = pollId || `poll_${this._generateRequestId()}`;

        // Clear any existing poll with the same ID
        this.stopPoll(id);

        const executePoll = () => {
            this.get(url, (success, data, message) => {
                if (callback) {
                    callback(success, data, message);
                }
            });
        };

        // Execute immediately
        executePoll();

        // Then set up interval
        const timerId = setInterval(executePoll, interval);
        this.pollTimers.set(id, timerId);

        return id;
    }

    /**
     * Stop a specific polling operation
     * @param {string} pollId - The poll ID to stop
     */
    stopPoll(pollId) {
        if (this.pollTimers.has(pollId)) {
            clearInterval(this.pollTimers.get(pollId));
            this.pollTimers.delete(pollId);
        }
    }

    /**
     * Stop all polling operations
     */
    stopAllPolls() {
        for (const [id, timerId] of this.pollTimers.entries()) {
            clearInterval(timerId);
        }
        this.pollTimers.clear();
    }

    /**
     * Abort all active requests
     */
    abort() {
        for (const [requestId, xhr] of this.activeRequests.entries()) {
            try {
                xhr.abort();
            } catch (e) {
                console.warn('AjaxManager: Error aborting request', e);
            }
        }
        this.activeRequests.clear();
        this.stopAllPolls();
    }

    /**
     * Get the number of active requests
     * @returns {number}
     */
    getActiveRequestCount() {
        return this.activeRequests.size;
    }

    /**
     * Get the number of active polls
     * @returns {number}
     */
    getActivePollCount() {
        return this.pollTimers.size;
    }

    /**
     * Build a URL with query parameters
     * @param {string} baseUrl - Base URL
     * @param {Object} params - Query parameters
     * @returns {string} URL with query string
     */
    static buildUrl(baseUrl, params = {}) {
        const queryString = Object.entries(params)
            .filter(([key, value]) => value !== undefined && value !== null)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');

        return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    }
}

// Export for use in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AjaxManager;
}
