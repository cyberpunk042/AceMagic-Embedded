'use strict';

/*!
 * GPT-CLI Module with Validation
 * Copyright (c) 2024 Cyberpunk042
 * GPL-3 Licensed
 */

const { exec } = require('child_process');
const { speakResponse } = require('./speaker_module');
const logger = require('./logger');

// Flag to track whether GPT-CLI is available
let isGptCliAvailable = false;

// Function to check if GPT-CLI is installed
function validateGptCli() {
    return new Promise((fulfill, reject) => {
        // Check if the GPT-CLI command is available by running a simple help command
        exec('gpt --help', (error, stdout, stderr) => {
            if (error) {
                logger.error('GPT-CLI not found. Please ensure it is installed.');
                isGptCliAvailable = false;
                return reject(new Error('GPT-CLI is not available.'));
            }

            logger.info('GPT-CLI is available.');
            isGptCliAvailable = true;
            fulfill();
        });
    });
}
'use strict';

/*!
 * GPT-CLI Module with Reliable Terminal Output Handling
 * Copyright (c) 2024 Cyberpunk042
 */

const { exec } = require('child_process');

// Function to check if a display (terminal) is connected
function isDisplayConnected() {
    return Boolean(process.stdout.isTTY);  // Check if connected to a terminal
}

// Function to send the transcript to GPT-CLI and handle the response output
function sendToGptCli(transcript) {
    return new Promise((fulfill, reject) => {
        if (!transcript) {
            return reject(new Error('No transcript provided.'));
        }

        // Prepare the GPT-CLI command
        const gptCommand = `gpt --prompt "${transcript}" assistant`; 
        // assistant (default interpreter for the vocal)
        // alert-generator & tool to update status(a file on fs?)
        // email-generator & email-sender combined?(use email tool?)
        // ticket-creator & ticket-manager combined?(use a tool?)

        // Execute the GPT-CLI command
        exec(gptCommand, (error, stdout, stderr) => {
            if (error) {
                logger.error(`Error running GPT-CLI: ${stderr}`);
                return reject(error);
            }

            const response = stdout.trim();

            // Ensure we output to the terminal (console) properly
            if (isDisplayConnected()) {
                // Print to the terminal if display is connected
                logger.info(`GPT-CLI Response (Terminal): ${response}`);
                fulfill(response);
            } else {
                // In cases where there is no display, fallback to basic logging
                logger.info(`Fallback Response (No TTY): ${response}`);
                 // Speak the response via audio if no terminal is connected
                 speakResponse(response).then(() => {
                    logger.info('Response spoken via audio.');
                    fulfill(response);
                }).catch((err) => {
                    logger.error('Failed to speak response:', err);
                    reject(err);
                });
            }
        });
    });
}
// Validate GPT-CLI availability on startup
validateGptCli().catch((err) => {
    logger.error(err.message);
});

module.exports = {
    sendToGptCli,
    isDisplayConnected,
    validateGptCli
};
