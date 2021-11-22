declare namespace StyleCssNamespace {
	export interface IStyleCss {
		body: string;
		header: string;
		headshot: string;
		link: string;
		link_container: string;
		logo: string;
		plus: string;
		sep: string;
	}
}

declare const StyleCssModule: StyleCssNamespace.IStyleCss & {
	/** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
	locals: StyleCssNamespace.IStyleCss;
};

export = StyleCssModule;
