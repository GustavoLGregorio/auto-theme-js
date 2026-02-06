type ColorTypes = "hex" | "hsl" | "rgb" | "oklab" | "oklch";
type ColorHEX = `#${string}`;
type ColorRGB = `rgba(${number}, ${number}, ${number}, ${number})`;
type ColorHSL = `hsla(${number}, ${number}%, ${number}%, ${number})`;
type ColorOKLAB = `oklab(${number}% ${number} ${number} / ${number})`;
type ColorOKLCH = `oklch(${number}% ${number} ${number}deg / ${number})`;
type Color = ColorHEX | ColorRGB | ColorHSL | ColorOKLAB | ColorOKLCH;
type ThemeProperties = "primary" | "secondary" | "tertiary" | "accent" | "neutral";
type Shades = "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
type ShadeSpaces = Partial<Record<Shades, Shades>>;
type ShadeProperties = `${ThemeProperties}-${Shades}`;
type ThemeShades = Partial<Record<ShadeProperties, Color>>;
type Theme = Record<Shades, ThemeShades> & {
    colorType: ColorTypes;
    baseColor: Color;
};
export declare class AutoTheme {
    #private;
    colorType: ColorTypes;
    baseColor: Color;
    primary: ShadeSpaces;
    secondary: ShadeSpaces;
    tertiary: ShadeSpaces;
    accent: ShadeSpaces;
    neutral: ShadeSpaces;
    constructor(color: Color, inputType?: ColorTypes, outputType?: ColorTypes);
    static serialize(autoThemeObject: AutoTheme, escapeChar?: string): string;
    static deserialize(serializedTheme: string, escapeChar?: string): Theme;
}
export {};
