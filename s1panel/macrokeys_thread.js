'use strict';
/*!
 * s1panel - macrokeys_thread
 * Copyright (c) 2024 Cyberpunk042
 * GPL-3 Licensed
 */
const threads     = require('worker_threads');
const macrokeys         = require('./macrokeys_device');
const logger      = require('./logger');

threads.parentPort.on('message', message => {

    var _promise = Promise.resolve();

    switch (message.listen) {
        case True:
            _promise = macrokeys.listen();
            break;
    }

    return _promise;
});

logger.info('macrokeys_thread: started...');
