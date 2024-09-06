'use strict';

const { exec } = require('child_process');
const gTTS = require('gtts');
const fs = require('fs');
const logger = require('./logger');

// Function to generate speech from text and play it
export function speakResponse(response) {
    return new Promise((fulfill, reject) => {
        const gtts = new gTTS(response, 'en');
        const outputFile = '/tmp/response.mp3';

        // Save the TTS output to an mp3 file
        gtts.save(outputFile, (err) => {
            if (err) {
                return reject(err);
            }

            logger.info('Audio file generated:', outputFile);

            // Play the audio using ffplay
            exec(`ffplay -nodisp -autoexit ${outputFile}`, (error, stdout, stderr) => {
                if (error) {
                    logger.error('Error playing audio:', stderr);
                    return reject(error);
                }
                logger.info('Response spoken via audio.');
                fulfill(stdout);
            });
        });
    });
}