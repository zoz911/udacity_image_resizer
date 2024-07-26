import { DisplayProcessor, SpecReporter, StacktraceOption } from "jasmine-spec-reporter";
import SuiteInfo = jasmine.SuiteInfo;

class CustomProcessor extends DisplayProcessor {
    public displayJasmineStarted(info: SuiteInfo, log: string): string {
        return `${log}`;
    }
}

// Ensure jasmine.getEnv() and other Jasmine-related calls are properly typed.
declare var jasmine: any;

jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(
    new SpecReporter({
        spec: {
            displayStacktrace: StacktraceOption.NONE,
        },
        customProcessors: [CustomProcessor],
    })
);
