const { SpecReporter } = require('jasmine-spec-reporter');

module.exports = {
    spec_dir: 'dist/tests',   // Directory where your test specs are located after compilation
    spec_files: [
        '**/*[sS]pec.js'     // Pattern to match your test files
    ],
    helpers: [
        'helpers/**/*.js'    // Optional: Directory for helper files
    ],
    stopSpecOnExpectationFailure: false,
    random: false,
    reporters: [
        new SpecReporter({
            spec: {
                displayPending: true,
            },
        }),
    ],
};
