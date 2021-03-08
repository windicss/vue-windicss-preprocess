import MagicString from "magic-string";
import { Processor } from "windicss/lib";
import { CSSParser } from "windicss/utils/parser";
import { StyleSheet } from "windicss/utils/style";
import { default as HTMLParser } from "./parser";
import { getOptions, resolveConfig, combineStyleList } from "./utils";
import type { loader } from "webpack";
import type { Config as WindicssConfig } from "windicss/types/interfaces"

const OPTIONS: {
    config?: string | WindicssConfig;
    compile?: boolean;
    prefix?: string;
    bundle?: string;
    globalPreflight?: boolean;
    globalUtility?: boolean;
  } = {
    compile: false,
    prefix: "windi-",
    globalPreflight: true,
    globalUtility: true,
};

const REGEXP = {
    matchStyle: /<style[^>]*?(\/|(>([\s\S]*?)<\/style))>/g,
    matchTemplate: /<template>([\s\S]+)<\/template>/,
    matchClasses: /('[\s\S]+?')|("[\s\S]+?")|(`[\s\S]+?`)/g,
    isGlobalStyle: /<\/?style\s+global[^>]*>/,
};

const MODIFIED: { [key: string]: string } = {
    xxl: "2xl",
    "tw-disabled": "disabled",
    "tw-required": "required",
    "tw-checked": "checked",
};


function matchTemplate(content:string) {
    const matched = content.match(REGEXP.matchTemplate);
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


function addVariant(classNames: string, variant: string) {
    // prepend variant before each className
    if (variant in MODIFIED) variant = MODIFIED[variant];
    const groupRegex = /[\S]+:\([\s\S]*?\)/g;
    const groups = [...(classNames.match(groupRegex) ?? [])];
    const utilities = classNames
      .replace(groupRegex, "")
      .split(/\s+/)
      .filter((i) => i);
    return [...utilities, ...groups].map((i) => `${variant}:${i}`).join(" ");
}


function compileStyleList(styleList: StyleSheet[], global = false) {
    return `\n${global?"<style>":"<style scoped>"}\n${combineStyleList(styleList).build()}\n</style>`;
}


export default function (this: loader.LoaderContext, content:string) {
    const options = {...OPTIONS, ...(getOptions(this) || {})};
    const processor = new Processor(resolveConfig(options.config));
    const variants = [
        ...Object.keys(processor.resolveVariants()),
        ...Object.keys(MODIFIED),
      ].filter((i) => !Object.values(MODIFIED).includes(i)); // update variants to make vue happy

    const globalStyles:StyleSheet[] = [];
    const scopedStyles:StyleSheet[] = [];

    const template = matchTemplate(content)?.content;
    if (!(template && template.data)) return content;

    let styleBlocks = content.match(REGEXP.matchStyle);
    
    if (styleBlocks) {
        styleBlocks.forEach(async style => {
            let styleStr = style.replace(/<\/?style[^>]*>/g, "");
            (REGEXP.isGlobalStyle.test(style)? globalStyles : scopedStyles).push(new CSSParser(styleStr, processor).parse());
        });
        content = content.replace(REGEXP.matchStyle, "");
    }
    const code = new MagicString(content);
    const parser = new HTMLParser(content);
    parser.parse().forEach(tag => {
        let classes: string[] = [];
        let conditionClasses: string[] = [];
        let classStart: number | undefined;
        tag.value.forEach((node) => {
            if (node.type === "Attribute") {
                if (node.name === "class" || node.name === "tw") {
                    classStart = node.start;
                    code.overwrite(node.start, node.end, "");
                    if (!Array.isArray(node.value)) node.value = [node.value];
                    classes = [
                        ...classes,
                        ...node.value.filter((i) => i.type === "Text").map((i) => i.data),
                    ];
                } else if (variants.includes(node.name)) {
                    // handle variants attribute
                    classStart = node.start;
                    code.overwrite(node.start, node.end, "");
                    if (!Array.isArray(node.value)) node.value = [node.value];
                    classes = [
                        ...classes,
                        ...node.value
                        .filter((i) => i.type === "Text")
                        .map((i) => addVariant(i.data, node.name)),
                    ];
                }
            } else if (node.type === "Directive") {
                conditionClasses.push(node.name);
            }
        });

        if (classStart) {
            if (options.compile) {
                const utility = processor.compile(classes.join(" "), options.prefix, false);
                (options.globalUtility && !options.bundle) ? globalStyles.push(utility.styleSheet) : scopedStyles.push(utility.styleSheet);
                const className = utility.className ? [utility.className, ...utility.ignored].join(" ") : utility.ignored.join(" ");
                code.prependLeft(classStart, `class="${className}"`);
            } else {
                const className = classes.join(" ");
                const utility = processor.interpret(className);
                (options.globalUtility && !options.bundle) ? globalStyles.push(utility.styleSheet) : scopedStyles.push(utility.styleSheet);
                code.prependLeft(classStart, `class="${className}"`);
            }
        }

        if (conditionClasses.length > 0) {
            const utility = processor.interpret(conditionClasses.join(" "));
            globalStyles.push(utility.styleSheet);
        }
    });

    const preflights = processor.preflight(template.data, true, true, true, true);

    (options.globalPreflight && !options.bundle) ? globalStyles.push(preflights) : scopedStyles.push(preflights);

    const styles:string[] = [];
    if(globalStyles[0]) styles.push(compileStyleList(globalStyles, true));
    if(scopedStyles[0]) styles.push(compileStyleList(scopedStyles, false));
    code.trimEnd().append(styles.join('\n'));

    return code.toString();
};
