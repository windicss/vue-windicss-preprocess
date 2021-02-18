import { StyleSheet } from 'windicss/utils/style';
import type { loader } from "webpack";
import { Config as WindicssConfig } from "windicss/types/interfaces";

export function searchNotEscape(text:string, char = "{") {
  if (text.charAt(0) === char) return 0;
  const index = text.search(new RegExp(String.raw`([^\\]${char})`));
  if (index === -1) return -1;
  return index + 1;
}

export function searchGroup(text: string) {
  let level = 1;
  let index = 0;
  let endBracket = searchNotEscape(text, "}");
  while (endBracket !== -1) {
    let nextBracket = searchNotEscape(text.slice(index,), "{");
    if (endBracket < nextBracket || nextBracket === -1) {
      level--;
      index = endBracket + 1;
      if (level == 0) return endBracket;
    } else {
      level++;
      index = nextBracket + 1;
    }
    endBracket = searchNotEscape(text.slice(index,), "}");
  }
  return -1;
}

export function combineStyleList(stylesheets:StyleSheet[]) {
  return stylesheets.reduce((previousValue, currentValue) => previousValue.extend(currentValue), new StyleSheet()).combine();//.sort();
}

export function writeFileSync(path: string, data: string) {
  if (!process.env.BROWSER) return require('fs').writeFileSync(path, data);
}

/**
 * Resolve the WindicssConfig.
 * @param config File path to tailwind.config.js or object of WindicssConfig
 */
export function resolveConfig(config?: string | WindicssConfig) {
  // handle invalid config
  if (!config) {
    return undefined
  }
  /*
   * A type of string implies a file path to the tailwind.config.js. We check if it's a browser
   * context otherwise the load may fail.
   */
  if (typeof config === 'string' && !process.env.BROWSER) {
    return loadConfigFile(config)
  }
  // if it's already an object we can just return it as is
  return config
}

export function loadConfigFile(config: string) {
  return require(require('path').resolve(config));
}

export function getOptions(root:loader.LoaderContext) {
  if (process.env.BROWSER) return {};
  return require("loader-utils").getOptions(root);
}


