type ColorTypes = "hex" | "hsl" | "rgb" | "oklab" | "oklch";
type ColorHEX = `#${string}`;
type ColorRGB = `rgba(${number}, ${number}, ${number}, ${number})`;
type ColorHSL = `hsla(${number}, ${number}%, ${number}%, ${number})`;
type ColorOKLAB = `oklab(${number}% ${number} ${number} / ${number})`;
type ColorOKLCH = `oklch(${number}% ${number} ${number}deg / ${number})`;
type Color = ColorHEX | ColorRGB | ColorHSL | ColorOKLAB | ColorOKLCH;
type ThemeProperties = "primary" | "secondary" | "tertiary" | "accent" | "neutral";
type ShadeSpaces = "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
type ShadeProperties = `${ThemeProperties}-${ShadeSpaces}`;
type ThemeShades = Partial<Record<ShadeProperties, Color>>;
type Theme = Record<ThemeProperties, ThemeShades> & {
    colorType: ColorTypes;
    baseColor: Color;
};
export declare class AutoTheme implements Theme {
    #private;
    colorType: ColorTypes;
    baseColor: Color;
    primary: ThemeShades;
    secondary: ThemeShades;
    tertiary: ThemeShades;
    accent: ThemeShades;
    neutral: ThemeShades;
    constructor(color: Color, type?: ColorTypes);
    addComplementary(): this;
    addTriade(): this;
    addShades(rangeStart: ShadeSpaces, rangeEnd: ShadeSpaces): this;
    convertColorsTo(type: ColorTypes): this;
    static serialize(autoThemeObject: AutoTheme, escapeChar?: string): string;
    static deserialize(serializedTheme: string, escapeChar?: string): Theme;
}
export {};
