'use strict';
/*!
 * Macrokeys Device
 * Copyright (c) 2024 Cyberpunk042
 * GPL-3 Licensed
 */

const HID = require('node-hid');
const usb = require('usb');
const logger = require('./logger');
const threads = require('worker_threads');

// Universal handling for any HID device
async function listen() {
    try {
        // Listen for existing devices
        initializeHIDDevices();

        // Monitor USB devices being plugged in
        usb.on('attach', () => {
            logger.info('USB device plugged in.');
            initializeHIDDevices(); // Reinitialize devices when a new one is plugged in
        });

        // Monitor USB devices being removed
        usb.on('detach', (device) => {
            logger.info('USB device unplugged.');
            // Optionally handle detachment logic here if needed
        });

    } catch (error) {
        logger.error('Error in HID device monitoring:', error);
    }
}

// Initialize connected HID devices
function initializeHIDDevices() {
    // Get the list of all connected HID devices
    const devices = HID.devices();

    devices.forEach((deviceInfo) => {
        // Check if the device is an input device (keyboard, macro keys, etc.)
        if (deviceInfo.usagePage === 1 && deviceInfo.usage) {
            try {
                const device = new HID.HID(deviceInfo.path);
                logger.info(`Opened device: ${deviceInfo.product} (${deviceInfo.vendorId}:${deviceInfo.productId})`);

                // Listen for data (key press/release)
                device.on('data', (data) => {
                    // Convert raw data to readable format and handle HID data
                    const dataArray = Array.from(data).map(byte => byte.toString(16));
                    logger.debug(`Data received from ${deviceInfo.product}: ${dataArray}`);
                    handleHIDData(data, deviceInfo.product);
                });

                device.on('error', (err) => {
                    logger.error(`HID error on ${deviceInfo.product}:`, err);
                });
            } catch (err) {
                logger.error(`Failed to open HID device: ${deviceInfo.product}`, err);
            }
        }
    });
}

// Universal function to handle HID data for any device
function handleHIDData(data, deviceName) {
    // Example: Assume that key presses are in the third byte (this may vary by device)
    const key = data[2]; // Example byte for key/button identifier

    if (key !== 0) {
        // Key press detected
        onPress(key, deviceName);
    } else {
        // Key release detected
        onRelease(deviceName);
    }
}

// Function to call on key press
function onPress(key, deviceName) {
    logger.info(`Key ${key} pressed on ${deviceName}`);
    threads.parentPort.postMessage({ type: 'key', action: 'press' });
}

// Function to call on key release
function onRelease(deviceName) {
    logger.info(`Key released on ${deviceName}`);
    threads.parentPort.postMessage({ type: 'key', action: 'release' });
}

module.exports = {
    listen,
};
