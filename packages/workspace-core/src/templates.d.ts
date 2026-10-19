export interface TemplateFile {
    relativePath: string;
    content: string;
}
export type SupportedTemplate = "REACT" | "NEXTJS" | "NODEJS" | "PYTHON" | "NESTJS_API" | "HTML_CSS_JS" | "BLANK";
export declare function getTemplateFiles(template: SupportedTemplate, projectName: string): TemplateFile[];
//# sourceMappingURL=templates.d.ts.map