'use strict';
/*!
 * s1panel - sensor/interactions
 * Copyright (c) 2024 Cyberpunk042
 * GPL-3 Licensed
 */
var _last_sampled = 0;
var _value = new Date();

function getCurrentInteractionStatus() {

    return new Promise(fulfill => {

        const _diff = Math.floor(Number(process.hrtime.bigint()) / 1000000) - _last_sampled;

        if (!_last_sampled || _diff > 10) {

            _last_sampled = Math.floor(Number(process.hrtime.bigint()) / 1000000);
            _value = new Date();
        }

        var _output = {} ; // Value loaded from filesystem, writtent by another process

        fulfill(_output);
    });
}

function init(config) {
    return 'interactions';
}

module.exports = {
    init,
    getCurrentInteractionStatus
};