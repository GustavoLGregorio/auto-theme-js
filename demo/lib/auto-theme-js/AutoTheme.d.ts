type ColorType = "hex" | "hsl" | "rgb" | "oklab" | "oklch";
type ColorHEX = `#${string}`;
type ColorRGB = `rgba(${number}, ${number}, ${number}, ${number})`;
type ColorHSL = `hsla(${number}, ${number}%, ${number}%, ${number})`;
type ColorOKLAB = `oklab(${number}% ${number} ${number} / ${number})`;
type ColorOKLCH = `oklch(${number}% ${number} ${number}deg / ${number})`;
/** A type for CSS-based color patterns */
export type Color = ColorHEX | ColorRGB | ColorHSL | ColorOKLAB | ColorOKLCH;
/** Object color properties */
export type ThemeProperties = "primary" | "secondary" | "tertiary" | "accent" | "neutral";
/** Shading values. 50 is the brighthest and 900 the darkest */
export type Shade = "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900" | "950";
type ShadeColor = Partial<Record<Shade, Color>>;
type ThemePropertiesShades = Record<ThemeProperties, ShadeColor>;
/** A type for the object theme. When deserialized, this is the object type that is returned */
export type Theme = Partial<ThemePropertiesShades> & {
    version: string;
    colorType: ColorType;
    baseColor: Color;
};
/** A class that creates themes using a single color input and handles operations such as:
 * color conversion, custom serialization and deserialization.
 */
export declare class AutoTheme implements Theme {
    #private;
    static VERSION: string;
    version: string;
    colorType: ColorType;
    baseColor: Color;
    primary: {};
    secondary: {};
    tertiary: {};
    accent: {};
    neutral: {};
    /**
     * @param color The base color used to create the theme
     * @param inputType The input type of the base color
     * @param outputType The ouput of the color properties and serialization
     * @param minShade The minimum value on the shade range (50 is the brighthest)
     * @param maxShade The maximum value on the shade range (950 is the darkest)
     */
    constructor(color: Color, inputType?: ColorType, outputType?: ColorType, minShade?: Shade, maxShade?: Shade);
    /**
     * A static method to create custom serialized strings containing the theme
     * @param autoThemeObject The object that will be serialized
     * @param escapeChar An optional custom escape character (needs to be used the same in de deserialization method). Use with caution. Defaults to "|"
     * @returns A string containing a theme. Single escape character indicates simple properties, double escape characters indicates objects
     */
    static serialize(autoThemeObject: AutoTheme, escapeChar?: string): string;
    /**
     * A static method to deserialize a previously serialized theme object
     * @param serializedTheme The serialized object string that will be deserialized
     * @param escapeChar An optional escape character that is expected after using a specific escape character during the serialization process. Defaults to "|"
     * @returns A theme object ready to be used
     */
    static deserialize(serializedTheme: string, escapeChar?: string): Theme;
}
export {};
