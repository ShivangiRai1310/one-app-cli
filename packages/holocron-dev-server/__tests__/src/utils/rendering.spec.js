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

import { fromJS } from 'immutable';
import transit from 'transit-immutable-js';

import {
  renderDocument,
  createInitialState,
  getWebpackScriptsForLocalModules,
} from '../../../src/utils/rendering';

jest.mock('transit-immutable-js', () => ({
  toJSON: jest.fn((obj) => obj),
}));

describe('renderDocument', () => {
  test('renders static html from the props passed', () => {
    const rootModuleName = 'root-module';
    const props = {
      moduleMap: {
        modules: {
          [rootModuleName]: {
            browser: 'root-module.js',
          },
        },
      },
      rootModuleName,
      errorReportingUrl: '/error',
      modules: [
        {
          name: 'child-module',
          src: 'child-module',
        },
        // having root module in the middle ensures that the module scripts are
        // ordered correctly where root module script is last
        {
          rootModule: true,
          name: 'child-module',
          src: 'child-module',
        },
        {
          name: 'another-child-module',
          src: 'another-child-module',
        },
      ],
    };
    const document = renderDocument(props);
    expect(document).toMatchSnapshot();
  });
});

describe('createInitialState', () => {
  test('creates the initial state for One App client side', () => {
    const lang = 'en-US';
    const rootModuleName = 'root-module';
    const errorReportingUrl = '/';
    const initialState = createInitialState({
      rootModuleName,
      errorReportingUrl,
      lang,
    });
    expect(initialState).toEqual(
      fromJS({
        config: {
          cdnUrl: '/static/modules/',
          rootModuleName,
          reportingUrl: errorReportingUrl,
        },
        intl: {
          activeLocale: lang,
        },
      })
    );
    expect(transit.toJSON).toHaveBeenCalledTimes(2);
  });
});

describe('getWebpackScriptsForLocalModules', () => {
  test('generates script meta data for modules to be rendered as script tags', () => {
    const rootModule = true;
    const name = 'root-module';
    const moduleName = name;
    const modulePath = '/path/to/module';
    const src = '/static/modules/root-module/root-module.js';
    const modules = [
      //  only the root module
      {
        rootModule, moduleName, modulePath, name, src,
      },
    ];
    const moduleMap = {
      modules: {
        [moduleName]: {
          browser: {
            url: src,
          },
        },
      },
    };
    const webpackScriptsResult = [
      {
        name: 'runtime',
        src: '/static/modules/runtime/runtime.js',
      },
      {
        name,
        src,
      },
    ];
    expect(
      getWebpackScriptsForLocalModules({
        modules,
        moduleMap,
        rootModuleName: moduleName,
      })
    ).toEqual(webpackScriptsResult);
    expect(
      getWebpackScriptsForLocalModules({
        moduleMap,
        rootModuleName: moduleName,
      })
    ).toEqual(webpackScriptsResult);
  });

  test('returns runtime and root module scripts if no modules supplied', () => {
    const name = 'root-module';
    const src = '/static/modules/root-module/root-module.js';
    const modules = [];
    const moduleMap = {
      modules: {
        [name]: {
          browser: {
            url: src,
          },
        },
      },
    };
    const webpackScripts = getWebpackScriptsForLocalModules({
      modules,
      moduleMap,
      rootModuleName: name,
    });
    expect(webpackScripts).toEqual([
      {
        name: 'runtime',
        src: '/static/modules/runtime/runtime.js',
      },
      {
        name,
        src,
      },
    ]);
  });

  test('orders the scripts correctly', () => {
    const rootModule = true;
    const name = 'root-module';
    const moduleName = name;
    const modulePath = '/path/to/module';
    const src = '/static/modules/root-module/root-module.js';
    const modules = [
      {
        name: 'child-module',
        src: 'child-module',
      },
      {
        name: 'another-child-module',
        src: 'another-child-module',
      },
      {
        name: 'yet-another-child-module',
        src: 'yet-another-child-module',
      },
      {
        rootModule, moduleName, modulePath, name, src,
      },
      {
        name: 'last-child-module',
        src: 'last-child-module',
      },
    ];
    const moduleMap = {
      modules: {
        [moduleName]: {
          browser: {
            url: src,
          },
        },
      },
    };
    const webpackScripts = getWebpackScriptsForLocalModules({
      modules,
      moduleMap,
      rootModuleName: moduleName,
    });
    expect(webpackScripts).toEqual([
      {
        name: 'runtime',
        src: '/static/modules/runtime/runtime.js',
      },
      {
        name: 'root-module',
        src,
      },
      {
        name: 'child-module',
        src: 'child-module',
      },
      {
        name: 'another-child-module',
        src: 'another-child-module',
      },
      {
        name: 'yet-another-child-module',
        src: 'yet-another-child-module',
      },
      {
        name: 'last-child-module',
        src: 'last-child-module',
      },
    ]);
  });

  test('root module remains as first module', () => {
    const name = 'root-module';
    const src = '/static/modules/root-module/root-module.js';
    const modules = [
      {
        name: 'child-module',
        src: 'child-module',
      },
      {
        name: 'another-child-module',
        src: 'another-child-module',
      },
      { rootModule: true, name, src },
    ];
    const moduleMap = {};
    const webpackScripts = getWebpackScriptsForLocalModules({
      modules,
      moduleMap,
      rootModuleName: name,
    });
    expect(webpackScripts).toEqual([
      {
        name: 'runtime',
        src: '/static/modules/runtime/runtime.js',
      },
      {
        name,
        src,
      },
      {
        name: 'child-module',
        src: 'child-module',
      },
      {
        name: 'another-child-module',
        src: 'another-child-module',
      },
    ]);
  });

  test('orders root module when not local', () => {
    const rootModuleName = 'root-module';
    const rootModuleSrc = '/static/modules/root-module/root-module.js';
    const modules = [
      {
        name: 'child-module',
        src: 'child-module',
      },
      {
        name: 'another-child-module',
        src: 'another-child-module',
      },
      {
        name: 'last-child-module',
        src: 'last-child-module',
      },
    ];
    const moduleMap = {
      modules: {
        [rootModuleName]: {
          browser: {
            url: rootModuleSrc,
          },
        },
      },
    };
    const webpackScripts = getWebpackScriptsForLocalModules({
      modules,
      moduleMap,
      rootModuleName,
    });
    expect(webpackScripts).toEqual([
      {
        name: 'runtime',
        src: '/static/modules/runtime/runtime.js',
      },
      {
        name: 'root-module',
        src: rootModuleSrc,
      },
      {
        name: 'child-module',
        src: 'child-module',
      },
      {
        name: 'another-child-module',
        src: 'another-child-module',
      },
      {
        name: 'last-child-module',
        src: 'last-child-module',
      },
    ]);
  });
});
