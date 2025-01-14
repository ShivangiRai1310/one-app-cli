/*
 * Copyright 2022 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import { BUNDLE_TYPES } from '../../constants/enums.js';
import getAppCompatibility from '../../utils/get-app-compatibility.js';

export default class AppCompatibilityInjector {
  constructor({ bundleType, packageJson }) {
    this.willInject = bundleType === BUNDLE_TYPES.SERVER;
    this.moduleName = packageJson.name;
    this.appCompatibility = getAppCompatibility();
  }

  inject = async (content, { rootComponentName }) => {
    if (!this.willInject) {
      return content;
    }

    return `${content};
  ${rootComponentName}.appConfig = Object.assign({}, ${rootComponentName}.appConfig, {
    appCompatibility: "${this.appCompatibility}",
  });
`;
  }
}
