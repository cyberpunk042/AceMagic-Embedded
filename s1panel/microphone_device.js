'use strict';

/*!
 * Microphone Device with Whisper Integration and Command Control
 * Copyright (c) 2024 Cyberpunk042
 * GPL-3 Licensed
 */
const whisper = require('whisper-node');
const fs = require('fs');
const { exec } = require('child_process');
const { sendToGptCli } = require('./gpt_cli_module.js');
const logger = require('./logger');

// Path to save recorded audio
const filePath = './test.wav';

// Recording state
let isRecording = false;

// Start recording using arecord (with your working command)
function startRecording() {
    return new Promise((fulfill, reject) => {
        if (isRecording) {
            return reject(new Error('Recording is already in progress.'));
        }

        logger.info('Starting recording...');
        const recordCommand = `arecord -D plughw:1,0 -f cd -t wav -d 0 -q ${filePath}`;

        const recordingProcess = exec(recordCommand, (error) => {
            if (error) {
                return reject(error);
            }
            isRecording = true;
            fulfill('Recording started.');
        });

        recordingProcess.on('error', reject);
    });
}

// Stop recording process
function stopRecording() {
    return new Promise((fulfill, reject) => {
        if (!isRecording) {
            return reject(new Error('No recording in progress.'));
        }

        logger.info('Stopping recording...');
        exec('pkill -f arecord', (error) => {
            if (error) {
                return reject(error);
            }
            isRecording = false;
            fulfill('Recording stopped.');
        });
    });
}

// Process the last recorded audio file using Whisper
function processRecording() {
    return new Promise(async (fulfill, reject) => {
        logger.info('Process Recording Being');
        try {
            if (!fs.existsSync(filePath)) {
                return reject(new Error('No recorded audio file found.'));
            }

            const options = {
                modelName: 'base.en',
                whisperOptions: {
                    language: 'auto',
                    word_timestamps: true
                }
            };

            const transcript = await whisper(filePath, options);
            logger.info('Transcription complete:', transcript);

            // Send the transcript to GPT-CLI for further processing
            sendToGptCli(transcript.map(t => t.speech).join(' ')).then(fulfill).catch(reject);

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    startRecording,
    stopRecording,
    processRecording
};
