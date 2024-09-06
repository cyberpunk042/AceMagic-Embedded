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

    var _promise = Promise.resolve();

    switch (message.listen) {
        case True:
            _promise = microphone.listen();
            break;

        case False:
            _promise = microphone.stopListening();
            break;
    }

    return _promise;
});

logger.info('microphone_thread: started...');
