export function stylesClassNames(styles: { readonly [key: string]: string }) {
	return function classNames(...names: (undefined | string | Record<string, boolean>)[]) {
		const classNames: string[] = [];

		for(var i = 0; i < names.length; i++) {
			const classes = names[i];

			if(!classes)
				continue; 

			if(typeof classes === 'string') {
				const fixedStyles = (classes as string).split(" ").map((className) => styles[className] ?? className);

				classNames.push(...fixedStyles);
				
				continue;
			}

			const conditionalClasses = classes as Record<string, boolean>;

			const conditionalStyles = Object
				.keys(classes)
				.filter((key) => conditionalClasses[key])
				.map((className) => styles[className]);
			
			classNames.push(...conditionalStyles);
		}

		return classNames.join(" ");
	}
}