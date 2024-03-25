/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as ansiRegex from 'ansi-regex';
import { SeverityNumber } from '@opentelemetry/api-logs';

import {
  LoggerProvider,
  ConsoleLogRecordExporter,
  SimpleLogRecordProcessor,
} from './../../../src';

const isColorText = (text: string) => ansiRegex().test(text);

describe('ConsoleLogRecordExporter', () => {
  describe('config', () => {
    it('should not set the colors option by default', () => {
      const consoleExporter = new ConsoleLogRecordExporter();
      const consoleSpy = sinon.spy(console, 'dir');
      const provider = new LoggerProvider();
      provider.addLogRecordProcessor(
        new SimpleLogRecordProcessor(consoleExporter)
      );

      const stdoutStub = sinon.stub(process.stdout, 'write');
      provider.getLogger('default').emit({
        body: 'body1',
        severityNumber: SeverityNumber.DEBUG,
        severityText: 'DEBUG',
      });
      stdoutStub.restore();
      const consoleDirOpts = consoleSpy.args[0][1];
      consoleSpy.restore();

      assert.equal(consoleDirOpts?.colors, undefined);
    });

    it('should colorize log records when options.colors is true', () => {
      const consoleExporter = new ConsoleLogRecordExporter({ colors: true });
      const provider = new LoggerProvider();
      provider.addLogRecordProcessor(
        new SimpleLogRecordProcessor(consoleExporter)
      );

      const consoleSpy = sinon.spy(console, 'dir');
      const stdoutStub = sinon.stub(process.stdout, 'write');
      provider.getLogger('default').emit({
        body: 'body2',
        severityNumber: SeverityNumber.DEBUG,
        severityText: 'DEBUG',
      });
      const consoleOutput = stdoutStub.getCalls()[0].firstArg;
      const consoleDirOpts = consoleSpy.args[0][1];
      stdoutStub.restore();
      consoleSpy.restore();

      assert.equal(consoleDirOpts?.colors, true);
      const containsColor = isColorText(consoleOutput);
      assert.ok(containsColor);
    });

    it('should not colorize log records when options.colors is false', () => {
      const consoleExporter = new ConsoleLogRecordExporter({ colors: false });
      const provider = new LoggerProvider();
      provider.addLogRecordProcessor(
        new SimpleLogRecordProcessor(consoleExporter)
      );

      const consoleSpy = sinon.spy(console, 'dir');
      const stdoutStub = sinon.stub(process.stdout, 'write');
      provider.getLogger('default').emit({
        body: 'body3',
        severityNumber: SeverityNumber.DEBUG,
        severityText: 'DEBUG',
      });
      const consoleOutput = stdoutStub.getCalls()[0].firstArg;
      const consoleDirOpts = consoleSpy.args[0][1];
      stdoutStub.restore();
      consoleSpy.restore();

      assert.equal(consoleDirOpts?.colors, false);
      const doesNotContainColor = !isColorText(consoleOutput);
      assert.ok(doesNotContainColor);
    });
  });
});