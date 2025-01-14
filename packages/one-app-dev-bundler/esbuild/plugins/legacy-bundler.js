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

import fs from 'fs';
import swc from '@swc/core';

import { getJsFilenamesFromKeys } from '../utils/get-js-filenames-from-keys.js';

const legacyBundler = (name) => ({
  name: 'legacyBundler',
  setup(build) {
    if (process.env.NODE_ENV === 'production') {
      build.onEnd(async (result) => {
        // we boldly assume there will be exactly 1 .js file emitted from the build
        const filePath = getJsFilenamesFromKeys(result.metafile.outputs)[0];

        if (!filePath) {
          return result;
        }

        const legacyFilePath = filePath.replace(new RegExp(`(${name})\\.(\\w*)\\.js$`), '$1.legacy.$2.js');
        const code = await fs.promises.readFile(filePath, 'utf-8');
        const output = await swc.transform(code, {
          jsc: {
            target: 'es5',
          },
        });

        await fs.promises.writeFile(legacyFilePath, output.code);

        return result;
      });
    }
  },
});

export default legacyBundler;
