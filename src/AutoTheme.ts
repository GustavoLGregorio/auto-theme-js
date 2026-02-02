// Color types/patterns
type ColorTypes = "hex" | "hsl" | "rgb" | "oklab" | "oklch";

type ColorHEX = `#${string}`;
type ColorRGB = `rgba(${number}, ${number}, ${number}, ${number})`;
type ColorHSL = `hsla(${number}, ${number}%, ${number}%, ${number})`;
type ColorOKLAB = `oklab(${number}% ${number} ${number} / ${number})`;
type ColorOKLCH = `oklch(${number}% ${number} ${number}deg / ${number})`;

type Color = ColorHEX | ColorRGB | ColorHSL | ColorOKLAB | ColorOKLCH;

// Design Systems common properties/theme names
type ThemeGroups = "analogous" | "monochromatic" | "triad" | "complementary" | "splitComplementary" | "square" | "compound" | "shades";
type ThemeProperties = "primary" | "secondary" | "tertiary" | "accent" | "neutral";

// Shading types
type ShadeSpaces = "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
type ShadeProperties = `${ThemeProperties}-${ShadeSpaces}`;
type ThemeShades = Partial<Record<ShadeProperties, Color>>;

type Theme = Record<ThemeProperties, ThemeShades> & {
    colorType: ColorTypes;
    baseColor: Color;
};

type ThemeGroup = (ThemeGroups);

export class AutoTheme implements Theme {
    colorType: ColorTypes;
    baseColor: Color;

    primary: ThemeShades = {};
    secondary: ThemeShades = {};
    tertiary: ThemeShades = {};
    accent: ThemeShades = {};
    neutral: ThemeShades = {};

    constructor(color: Color, type: ColorTypes = "hex") {
        this.colorType = type;
        this.baseColor = color;

        this.#addColors(color, "50", "900");
    }

    #addColors(color: Color, shadeMin: ShadeSpaces, shadeMax: ShadeSpaces) {
        const keys: ThemeProperties[] = ["primary", "secondary", "tertiary", "accent", "neutral"];
        const shades: ShadeSpaces[] = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
        const values: Color[] = [];

        for (let i = 0; i < keys.length; ++i) {
            AutoTheme.#addObjectProperty(this, keys[i]);

            for (let y = 0; y < 10; ++y) {
                AutoTheme.#addColorProperty(this[keys[i]], String(keys[i] + "-" +shades[y]), this.baseColor);
            }
        }
    }

    // addAnalogous() {
    //     const keys: string[] = ["a", "b", "c", "d", "e"];
    //     const colors: Color[] = [this.baseColor, this.baseColor, this.baseColor, this.baseColor, this.baseColor];

    //     AutoTheme.#forPropColorArrays(this.analogous, keys, colors);

    //     return this;
    // }

    addComplementary() {
        const keys: ThemeProperties[] = ["primary", "secondary", "tertiary", "accent", "neutral"];
        const colors: Color[] = [this.baseColor, this.baseColor, this.baseColor, this.baseColor, this.baseColor];

        AutoTheme.#forPropColorArrays(this, keys, colors);

        return this;
    }

    addTriade() {
        return this;
    }

    addShades(rangeStart: ShadeSpaces, rangeEnd: ShadeSpaces) {

        const min = Number(rangeStart) / 10;
        const max = Number(rangeEnd) / 10;

        return this;
    }

    convertColorsTo(type: ColorTypes) {
        switch (type) {
            case "hex": break;
            case "hsl": break;
            case "rgb": break;
            case "oklab": break;
            case "oklch": break;

            default: break;
        }

        return this;
    }

    // #region serialization
    static serialize(autoThemeObject: AutoTheme, escapeChar = "|") {
        if (!(autoThemeObject instanceof AutoTheme)) throw new Error("Object is not a AutoTheme instance");

        let serialized = "";

        // Simple properties
        for (const [key, value] of Object.entries(autoThemeObject)) {
            if (
                typeof value !== "string" ||
                (typeof value === "string" && value.length <= 1)
            ) continue;
            
            serialized += `${key}:${value}${escapeChar}`;
        }

        // Object properties
        for (const [key, value] of Object.entries(autoThemeObject)) {
            if (
                typeof value !== "object" ||
                (typeof value === "object" && Object.entries(value).length === 0)
            ) continue;
            
            let currentPropObject = `${escapeChar}${key}:{`;
            for (const [key2, value2] of Object.entries(value)) {
                currentPropObject += `${key2}:${value2}${escapeChar}`;
            }
            currentPropObject = currentPropObject.trim().substring(0, currentPropObject.length - 1) + "}";

            serialized += `${currentPropObject}${escapeChar}`;
        }

        if (serialized.charAt(serialized.length - 1) === escapeChar) serialized = serialized.substring(0, serialized.length - 1);

        return serialized.trim();
    }

    static deserialize(serializedTheme: string, escapeChar: string = "|") {
        if (!serializedTheme) throw new Error("Serialized Theme was not passed as a parameter");

        const theme: object = {};

        const objectsStart = serializedTheme.indexOf(`${escapeChar}${escapeChar}`);

        const themeSimpleString = serializedTheme.substring(0, objectsStart);
        const themeSimpleProps = themeSimpleString.split(escapeChar);

        const themeObjectString = serializedTheme.substring(objectsStart + 2, serializedTheme.length);
        const themeObjectProps = themeObjectString.split(`${escapeChar}${escapeChar}`);

        for (const prop of themeSimpleProps) {
            const [key, value] = prop.split(":");
            AutoTheme.#addColorProperty(theme, key, value as Color);
        }

        for (const prop of themeObjectProps) {
            const separatorIndex = prop.indexOf(":");
            const objKey = prop.substring(0, separatorIndex);
            const objValue = prop.substring(separatorIndex + 2, prop.length - 1);

            // Creates the internal object
            AutoTheme.#addObjectProperty(theme, objKey);
            
            // Assigns the internal object properties
            const objValueProps = objValue.split(escapeChar);
            for (const objValueProp of objValueProps) {
                const [objValueKey, ObjValueValue] = objValueProp.split(":");
                // @ts-ignore
                AutoTheme.#addColorProperty(theme[objKey], objValueKey, ObjValueValue as Color);
            }
        }

        return theme as Theme;
    }
    // #endregion serialization

    // #region private_methods
    static #addColorGroups(theme: AutoTheme) {
        const groups: ThemeGroups[] = ["analogous", "monochromatic", "triad", "complementary", "splitComplementary", "square", "compound", "shades"];

        for (const group of groups) {
            Object.defineProperty(theme, group, {
                "value": {},
                "writable": true,
                "enumerable": true,
                "configurable": true
            })
        }
    }

    static #addColorProperty(theme: object, key: string, value: Color) {
        Object.defineProperty(theme, key, {
            "value": value,
            "configurable": true,
            "enumerable": true,
            "writable": true
        })
    }

    static #addObjectProperty(theme: object, key: string) {
        Object.defineProperty(theme, key, {
            "value": {},
            "configurable": true,
            "enumerable": true,
            "writable": true
        })
    }

    static #forPropColorArrays(themeProp: object, keys: string[], colors: Color[]) {
        for (let i = 0; i < keys.length; ++i) {
            AutoTheme.#addColorProperty(themeProp, keys[i], colors[i]);
        }
    }
    // #endregion private_methods
}