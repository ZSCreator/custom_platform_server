'use strict';

import {createAt} from './createAt';
import {lastMod} from './lastMod';

export const plugins = function(schema, options) {
	schema.plugin(createAt, options);
	schema.plugin(lastMod, options);
};
