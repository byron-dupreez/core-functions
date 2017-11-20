'use strict';

/**
 * Utilities and classes for working with timers and timeouts created through {@linkcode setTimeout} or
 * {@linkcode setInterval}.
 *
 * @module core-functions/timers
 * @author Byron du Preez
 */
exports._$_ = '_$_'; //IDE workaround
exports.cancelTimeout = cancelTimeout;
exports.cancelInterval = cancelInterval;

/**
 * Attempts to cancel the given normal timeout, which was created by a call to {@linkcode setTimeout} using the
 * {@linkcode clearTimeout} function as instructed (and if the timeout looks like an interval timeout also using the
 * {@linkcode clearInterval} function).
 *
 * @param {Timeout} timeout - a timeout to be cancelled
 * @returns {boolean} the value of timeout._called, which will be true if the cancel was too late and the timeout had
 * already triggered; or false if the timeout was cancelled successfully; or undefined if timeout._called is no longer
 * supported.
 */
function cancelTimeout(timeout) {
  // Clear timeout seems to currently stop both types of timeouts
  try {
    clearTimeout(timeout);
  } catch (err) {
    console.error(`Failed to clear timeout`, err);
  }
  // ... but in case behaviour changes, if it looks like an interval timeout, clear it as one
  if (typeof timeout._repeat === 'function') {
    try {
      console.warn('Timeout appears to be an interval timeout - calling clearInterval too');
      clearInterval(timeout);
    } catch (err) {
      console.error(`Failed to clear interval timeout`, err);
    }
  }
  return timeout._called; // just in case
}

/**
 * Attempts to cancel the given interval timeout, which was created by a call to {@linkcode setInterval}, by using the
 * {@linkcode clearInterval} function as instructed (and if the timeout looks like an normal timeout also using the
 * {@linkcode clearTimeout} function).
 *
 * @param {Timeout} timeout - an interval timeout to be cancelled
 * @returns {boolean} the value of timeout._called, which will be true if the interval timeout had triggered at least
 * once before it was cancelled; or false if the interval timeout was cancelled before it was first triggered; or
 * undefined if timeout._called is not supported.
 */
function cancelInterval(timeout) {
  // Clear interval timeout does NOT stop normal timeouts!
  // ... so if this looks like a normal timeout, clear it as one
  if (timeout._repeat === null) {
    try {
      console.warn('Timeout appears to be a normal timeout - calling clearTimeout too');
      clearTimeout(timeout);
    } catch (err) {
      console.error(`Failed to clear normal timeout`, err);
    }
  }
  try {
    clearInterval(timeout);
  } catch (err) {
    console.error(`Failed to clear interval timeout`, err);
  }
  return timeout._called;
}
