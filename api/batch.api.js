var vow = require('vow');

var bla = require('../lib');
var responseFormatter = require('../lib/utils/response-formatter');

/**
 * @typedef {Object} BatchApiMethod
 * @property {String} method Method name.
 * @property {Object} params Method params.
 *
 * @example
 * {
 *      method: 'hello',
 *      params: {name: 'Master'}
 * }
 */

module.exports = new bla.ApiMethod({
    name: 'batch',
    description: 'Executes a set of methods',
    options: {
        allowUndeclaredParams: true,
        paramsValidation: 'normalize',
        showOnDocPage: false
    },
    params: {
        // Methods are passed as an array of BatchApiMethod objects.
        methods: {
            description: 'Set of methods',
            type: 'Array',
            required: true
        }
    },
    action: function (params, request, api) {
        const methods = params.methods;
        const resolved = [];
        const resolvedData = [];
        const failed = [];
        const failedReasons = [];

        const promises = methods.map(m =>
            api.exec(m.method, m.params, request, api)
                .then(
                    resolve => {
                        resolved.push(m);
                        resolvedData.push(resolve);
                        return resolve;
                    },
                    reject => {
                        failed.push(m);
                        failedReasons.push(reject);
                        return reject;
                    }
                )
        );

        return Promise.all(promises)
            .then(
                response => response.map(data => responseFormatter.formatResponse(data)),
                reject => {
                    return Promise.all(methods.map(m => {
                        const failedIndex = failed.indexOf(m);
                        if (failedIndex > -1) {
                            return Promise.resolve(responseFormatter.formatError(failedReasons[failedIndex]));
                        } else {
                            const resolvedIndex = resolved.indexOf(m);
                            return Promise.resolve(responseFormatter.formatResponse(resolvedData[resolvedIndex]));
                        }
                    }));
                }
            );
    }
});
