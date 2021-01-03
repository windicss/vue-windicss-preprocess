import MagicString from 'magic-string';
import { loader } from 'webpack';
import { getOptions } from 'loader-utils';
import { HTMLParser } from 'windicss/src/utils/html';
import { StyleSheet } from 'windicss/src/utils/style';
import { preflight, interpret, compile } from 'windicss';


const OPTIONS = {
    compile: false, // true: compilation mode; false: interpretation mode
    globalPreflight: true,  // preflight style is global or scoped
    globalUtility: false, // utility style is global or scoped, recommend true for interpretation mode, false for compilation mode
    prefix: 'windi-' // compiled style name prefix
};


function matchTemplate(content:string) {
    const matched = content.match(/<template>([\s\S]+)<\/template>/);
    const start = matched?.index;
    const data = matched?.[0];
    if (!data) return;
    const end = data.length-1;
    const contentStart = (data.substring(10,).match(/\S/)?.index ?? 0) + 10;
    const contentEnd = data.match(/\S\s*<\/template>/)?.index ?? end;
    return { start, end, data, content: {
        start: contentStart,
        end: contentEnd,
        data: data.substring(contentStart, contentEnd)
    }};
}


function compileStyle(preflight:string, utility:string, globalPreflight=true, globalUtility=false) {
    const tag = (global:boolean) => global ? "<style>" : "<style scoped>";
    return `\n${tag(globalPreflight)}\n${preflight}\n</style>\n${tag(globalUtility)}\n${utility}\n</style>`;
}


export default function (this: loader.LoaderContext, content:string) {
    const options = {...OPTIONS, ...(getOptions(this) || {})};
    const matched = matchTemplate(content)?.content;
    if (!matched) return content;
    const template = matched.data;
    if (!template) return content;
    const parser = new HTMLParser(template);
    const preflights = preflight(parser.parseTags(), true);
    if (options.compile) {
        // compilation mode
        const magicTemplate = new MagicString(template);
        const styleList:StyleSheet[] = [ new StyleSheet() ]; // Fix "Reduce of empty array with no initial value"
        parser.parseClasses().forEach(classes=>{
            const utilities = compile(classes.result, options.prefix);
            styleList.push(utilities.styleSheet);
            magicTemplate.overwrite(classes.start, classes.end, [utilities.className, ...utilities.ignored].join(' '));
        });
        const styleScoped = styleList.reduce((previousValue: StyleSheet, currentValue: StyleSheet) => previousValue.extend(currentValue)).combine().build()
        return new MagicString(content)
                .overwrite(matched.start, matched.end, magicTemplate.toString())
                .append(compileStyle(preflights.build(), styleScoped, options.globalPreflight, options.globalUtility))
                .toString();
    } else {
        // interpretation mode
        const utilities = interpret(parser.parseClasses().map(i=>i.result).join(' '));
        // there is a duplicated classes error need to be fixed. Although vuejs will remove all duplicated classes after build
        return content + compileStyle(preflights.build(), utilities.styleSheet.build(), options.globalPreflight, options.globalUtility);
    }
};