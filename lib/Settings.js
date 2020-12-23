'use babel';

import { each, isArray, isObject } from 'underscore-plus';

export default class Settings {
  update(settings = {}) {
    this.load(settings);
  }

  load(values = {}, src = undefined) {
    // use `*` instead of `global` as key 
    let settings = values;
    if ('global' in settings) {
      settings['*'] = settings.global;
      delete settings.global;
    }
    
    if ('*' in settings) {
      const scopedSettings = settings;
      settings = settings['*'];
      delete scopedSettings['*'];
      //  e.g., if settings = { '*' : {A:a, B:b}, C:c, D:{...}}
      // then we set settings := {A:a, B:b};  scopedSettings := {C:c, D:{...}}

      // and then use  this.set(C, c, src);
      console.log('setting scoped settings')
      each(scopedSettings, (k, v) => { this.set(k, v, src); }, this);
    }

    console.log('setting global settings')
    this.set(settings, undefined, src);
  }

  set(settings, scope/* , src */) {
    const flatSettings = {};
    const options = scope ? { scopeSelector: scope } : {};
    options.save = false;
    // options.source = src;
    // options.scopeSelector = "source.js"

    this.flatten(flatSettings, settings);
    
    console.log("settings with ", options, ": ")
    console.log(flatSettings)
    
    each(flatSettings, (value, key) => {
      atom.config.set(key, value, options);
    });
  }

  flatten(root, dict, path) {
    let dotPath;
    let valueIsObject;

    each(dict, (value, key) => {
      dotPath = path ? `${path}.${key}` : key;
      valueIsObject = !isArray(value) && isObject(value);

      if (valueIsObject) {
        this.flatten(root, dict[key], dotPath);
      } else {
        root[dotPath] = value; // eslint-disable-line no-param-reassign
      }
    }, this);
  }
}
