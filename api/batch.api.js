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

        return Promise.all(methods.map(m => api.exec(m.method, m.params, request, api)))
            .then(
                response => response.map(data => responseFormatter.formatResponse(data)),
                reject => responseFormatter.formatError(reject)
            );
    }
});
