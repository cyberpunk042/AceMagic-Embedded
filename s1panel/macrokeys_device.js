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
                    const action = parseHIDData(data);
                    if (action) {
                        logger.info(`Action detected: ${action}`);
                    } else {
                        logger.info('Unknown data received:', data);
                    }
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

// Helper function to parse HID data (press/release)
function parseHIDData(data) {
    // Assuming the data contains key press/release info
    // Replace with your specific logic to parse data from the HID device
    const key = data[0]; // Example: first byte contains the key
    const isPressed = data[1] === 1; // Example: second byte indicates press/release

    if (isPressed) {
        return `Key ${key} pressed`;
    } else {
        return `Key ${key} released`;
    }
}

module.exports = {
    listen,
};
