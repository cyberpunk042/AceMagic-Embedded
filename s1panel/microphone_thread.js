'use strict';
/*!
 * s1panel - microphone_thread
 * Copyright (c) 2024 Cyberpunk042
 * GPL-3 Licensed
 */
const threads     = require('worker_threads');
const microphone         = require('./microphone_device');
const logger      = require('./logger');

threads.parentPort.on('message', message => {
    logger.info('microphone: ', JSON.stringify(message));

    var _promise = Promise.resolve();

    switch (message.listen) {
        case true:
            _promise = microphone.startRecording();
            break;

        case false:
            _promise = microphone.stopRecording();
            break;
    }

    if(message.process){
        _promise = microphone.processRecording();
    }

    return _promise;
});

logger.info('microphone_thread: started...');
