/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */

import holocronDevServer, { onLaunch } from '../../src/server';

import createRenderingMiddleware from '../../src/middleware/html';
import requestAcceptedMiddleware from '../../src/middleware/request-accepted';
import createMocksMiddleware from '../../src/middleware/parrot-scenarios';
import createModulesProxyRelayMiddleware from '../../src/middleware/proxy-relay';
import loadWebpackMiddleware from '../../src/middleware/webpack';

import { openBrowser } from '../../src/utils/helpers';
import {
  setLogLevel,
  logHotReloadReady,
  logServerUrl,
  logModuleBundlerAnalyzerUrl,
  logServerStart,
} from '../../src/utils/logs';
import { errorReportingUrlFragment } from '../../src/constants';

jest.mock('../../src/utils/logs');
jest.mock('../../src/utils/helpers', () => {
  const originalModule = jest.requireActual('../../src/utils/helpers');
  return {
    ...originalModule,
    openBrowser: jest.fn(),
  };
});
jest.mock('../../src/utils/statics');
jest.mock('../../src/utils/language-packs');
jest.mock('../../src/utils/module-map', () => ({
  createModuleMap: async () => ({
    moduleMap: 'module-map.json',
    localModuleMap: '../sample-module/module-map.json',
    remoteModuleMap: 'https://one-app-statics.surge.sh/module-map.json',
  }),
}));
jest.mock('../../src/middleware/html', () => jest.fn(() => ['createRenderingMiddleware']));
jest.mock('../../src/middleware/request-accepted', () => jest.fn(() => ['requestAcceptedMiddleware']));
jest.mock('../../src/middleware/parrot-scenarios', () => jest.fn(() => ['createMocksMiddleware']));
jest.mock('../../src/middleware/proxy-relay', () => jest.fn(() => ['createModulesProxyRelayMiddleware']));
jest.mock('../../src/middleware/webpack', () => jest.fn(() => ['webpackDevMiddleware', 'webpackHotMiddleware']));

jest.mock('express', () => {
  const app = {
    get: jest.fn(() => app),
    post: jest.fn(() => app),
    use: jest.fn(() => app),
    listen: jest.fn((listenArgs, onListeningFn) => {
      process.nextTick(onListeningFn);
    }),
  };
  const mockedExpress = jest.fn(() => app);
  mockedExpress.static = jest.fn(() => 'MOCK_EXPRESS_STATIC');
  return mockedExpress;
});
const { NODE_ENV } = process.env;
beforeEach(() => {
  jest.clearAllMocks();
  process.env.NODE_ENV = NODE_ENV;
});

describe('onLaunch', () => {
  process.env.NODE_ENV = 'development';
  test('returns a callback that logs when the server is up', () => {
    expect(onLaunch({})).toBeInstanceOf(Function);
    expect(() => onLaunch({})('error')).toThrow('error');
    expect(() => onLaunch({ port: 4000, serverAddress: 'http://link.some.where' })()).not.toThrow();
    expect(logHotReloadReady).toHaveBeenCalled();
    expect(logServerUrl).toHaveBeenCalled();
    expect(logModuleBundlerAnalyzerUrl).toHaveBeenCalled();
  });

  test('opens the browser when "openWhenReady" is configured to true', () => {
    const fn = onLaunch({
      openWhenReady: true,
      port: 4000,
      serverAddress: 'http://link.some.where',
    });
    expect(() => fn()).not.toThrow();
    expect(openBrowser).toHaveBeenCalled();
  });
});

describe('holocronDevServer', () => {
  it('dev server returns express app with a start method for listening on default port', async () => {
    process.env.NODE_ENV = 'development';
    const config = {
      rootModuleName: 'root-module',
      remoteModuleMap: 'https://one-app-statics.surge.sh/module-map.json',
      modules: ['root-module', 'child-module'],
      externals: [],
    };
    const app = await holocronDevServer(config);
    expect(setLogLevel).toHaveBeenCalled();
    expect(logServerStart).toHaveBeenCalled();

    const [devMiddleware, hotMiddleware] = loadWebpackMiddleware();
    expect(app.use).toHaveBeenCalledWith(devMiddleware);
    expect(app.use).toHaveBeenCalledWith(hotMiddleware);
    expect(app.use).toHaveBeenCalledWith(createModulesProxyRelayMiddleware());
    expect(app.use).toHaveBeenCalledWith(createMocksMiddleware());
    expect(app.get).toHaveBeenCalledWith('*', createRenderingMiddleware());
    expect(app.post).toHaveBeenCalledWith(errorReportingUrlFragment, requestAcceptedMiddleware);

    expect(app.listen).not.toHaveBeenCalled();
    expect(() => app.start()).not.toThrow();
    expect(app.listen).toHaveBeenCalled();
  });
  it('should stop node process and log message if NODE=production', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation((number) => number);
    process.env.NODE_ENV = 'production';
    const config = {
      rootModuleName: 'root-module',
      remoteModuleMap: 'https://one-app-statics.surge.sh/module-map.json',
      modules: ['root-module', 'child-module'],
      externals: [],
    };
    await holocronDevServer(config);
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
