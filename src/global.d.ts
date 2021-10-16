declare module "*.jpg";
declare module "*.png";
declare module "../*.css";
declare module '*.css' {
    interface IClassNames {
      [className: string]: string
    }
    const classNames: IClassNames
    export = classNames;
}