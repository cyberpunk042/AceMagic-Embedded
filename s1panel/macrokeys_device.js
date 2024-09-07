'use strict';
/*!
 * Macrokeys Device
 * Copyright (c) 2024 Cyberpunk042
 * GPL-3 Licensed
 */

const { usb, getDeviceList } = require('usb');
const HID = require('node-hid');
const logger = require('./logger');

// Specify the device name via environment variable
const LOOKUP_DEVICE = process.env.MACRO_USB_DEVICE || 'SayoDevice';

async function listen() {
    try {
        // Scan for already connected devices at startup
        const devices = getDeviceList();
        for (const device of devices) {
            await handleDevice(device);
        }

        // Monitor USB devices being plugged in
        usb.on('attach', async (device) => {
            await handleDevice(device);
        });

        // Monitor USB devices being removed
        usb.on('detach', (device) => {
            logger.info('Device detached:', device.deviceDescriptor);
        });

    } catch (error) {
        logger.error('Error in USB device monitoring:', error);
    }
}

// Handle device processing
async function handleDevice(device) {
    const deviceDescriptor = device.deviceDescriptor;

    try {
        const productName = await getStringDescriptor(device, deviceDescriptor.iProduct);
        logger.info(`Device attached: ${productName}`);

        if (productName && productName.includes(LOOKUP_DEVICE)) {
            logger.info(`Matched device name: ${LOOKUP_DEVICE}`);

            const vendorId = deviceDescriptor.idVendor;
            const productId = deviceDescriptor.idProduct;

            // Open HID device and listen for input
            try {
                const hidDevice = new HID.HID(vendorId, productId);
                logger.info(`Opened device ${vendorId}:${productId}`);

                // Listen for data (key press/release)
                hidDevice.on('data', (data) => {
                    logger.info(`Data received: ${data}`);  // Log the entire data buffer for inspection
                    handleHIDData(data);
                });

                hidDevice.on('error', (err) => {
                    logger.error('HID error:', err);
                });
            } catch (err) {
                logger.error('Failed to open HID device:', err);
            }
        } else {
            logger.info(`No match for device name ${LOOKUP_DEVICE}. Skipping ${productName}`);
        }
    } catch (error) {
        logger.error('Error fetching product name:', error);
    }
}

// Helper function to fetch string descriptor (iProduct contains the product name)
function getStringDescriptor(device, iDescriptor) {
    return new Promise((resolve, reject) => {
        if (iDescriptor) {
            device.open();
            device.getStringDescriptor(iDescriptor, (error, data) => {
                device.close();
                if (error) {
                    return reject(error);
                }
                resolve(data.toString());
            });
        } else {
            resolve(null);
        }
    });
}

// Helper function to handle HID data and call specific functions for press/release
/*
 * This function handles the raw data from the HID device and calls the appropriate function
 * depending on whether the key is pressed or released.
 *
 * Example:
 * - data[0]: Represents the key code or button identifier.
 * - data[1]: Represents the key state (e.g., 1 for pressed, 0 for released).
 * You may need to adjust this depending on your device's specific data format.
 */
function handleHIDData(data) {
    const key = data[0]; // First byte may contain the key/button identifier
    const state = data[1]; // Second byte typically represents the state (pressed/released)

    if (state === 1) {
        // Key press detected, call the press action
        onPress(key);
    } else if (state === 0) {
        // Key release detected, call the release action
        onRelease(key);
    } else {
        logger.info('Unknown state detected in HID data:', data);
    }
}

// Function to call on key press
function onPress(key) {
    logger.info(`Key ${key} pressed`);
    // Add your custom logic for handling key press here
}

// Function to call on key release
function onRelease(key) {
    logger.info(`Key ${key} released`);
    // Add your custom logic for handling key release here
}

module.exports = {
    listen,
};
