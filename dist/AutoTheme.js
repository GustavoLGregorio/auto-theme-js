/** A class that creates themes using a single color input and handles operations such as:
 * color conversion, custom serialization and deserialization.
 */
export class AutoTheme {
    colorType;
    baseColor;
    primary = {};
    secondary = {};
    tertiary = {};
    accent = {};
    neutral = {};
    /**
     * @param color The base color used to create the theme
     * @param inputType The input type of the base color
     * @param outputType The ouput of the color properties and serialization
     * @param minShade The minimum value on the shade range (50 is the brighthest)
     * @param maxShade The maximum value on the shade range (950 is the darkest)
     */
    constructor(color, inputType = "hex", outputType = "hex", minShade = "50", maxShade = "900") {
        this.colorType = outputType;
        const parsedColor = AutoTheme.#parseToOKLCH(color, inputType);
        this.baseColor = AutoTheme.#oklchToColor(parsedColor, outputType);
        this.#addColors(color, inputType, minShade, maxShade);
    }
    #addColors(color, inputType, shadeMin, shadeMax) {
        const keys = [
            "primary",
            "secondary",
            "tertiary",
            "accent",
            "neutral",
        ];
        const shades = [
            "50",
            "100",
            "200",
            "300",
            "400",
            "500",
            "600",
            "700",
            "800",
            "900",
            "950",
        ];
        // Parse base color to OKLCH using the input type
        const baseOKLCH = AutoTheme.#parseToOKLCH(color, inputType);
        // Define hue rotations for color harmony
        // Primary: base hue (0°)
        // Secondary: analogous (+30°)
        // Tertiary: analogous (-30°)
        // Accent: complementary (+180°)
        // Neutral: desaturated base
        const hueRotations = {
            primary: 0,
            secondary: 30,
            tertiary: -30,
            accent: 180,
            neutral: 0,
        };
        // Lightness mapping for shades (Tailwind-like distribution)
        // 50 = very light, 500 = base, 950 = very dark
        const lightnessMap = {
            "50": 97,
            "100": 94,
            "200": 86,
            "300": 77,
            "400": 66,
            "500": 55,
            "600": 45,
            "700": 35,
            "800": 25,
            "900": 15,
            "950": 8,
        };
        // Filter shades within range
        const minIndex = shades.indexOf(shadeMin);
        const maxIndex = shades.indexOf(shadeMax);
        const filteredShades = shades.slice(minIndex, maxIndex + 1);
        for (const key of keys) {
            // Reset the property object
            this[key] = {};
            // Calculate the hue for this theme property
            const hue = (baseOKLCH.h + hueRotations[key] + 360) % 360;
            // For neutral, reduce chroma significantly
            const chroma = key === "neutral" ? baseOKLCH.c * 0.1 : baseOKLCH.c;
            for (const shade of filteredShades) {
                const lightness = lightnessMap[shade];
                // Adjust chroma based on lightness (reduce at extremes for natural look)
                const adjustedChroma = AutoTheme.#adjustChromaForLightness(chroma, lightness);
                const shadeColor = {
                    l: lightness,
                    c: adjustedChroma,
                    h: hue,
                    a: baseOKLCH.a,
                };
                const colorValue = AutoTheme.#oklchToColor(shadeColor, this.colorType);
                const shadeKey = `${shade}`;
                AutoTheme.#addColorProperty(this[key], shadeKey, colorValue);
            }
        }
    }
    // #region color_conversion
    static #parseToOKLCH(color, type) {
        switch (type) {
            case "hex":
                return AutoTheme.#hexToOKLCH(color);
            case "rgb":
                return AutoTheme.#rgbToOKLCH(color);
            case "hsl":
                return AutoTheme.#hslToOKLCH(color);
            case "oklch":
                return AutoTheme.#parseOKLCH(color);
            case "oklab":
                return AutoTheme.#oklabToOKLCH(color);
            default:
                return AutoTheme.#hexToOKLCH(color);
        }
    }
    static #hexToOKLCH(hex) {
        // Remove # and parse
        const cleanHex = hex.replace("#", "");
        let r, g, b, a = 1;
        if (cleanHex.length === 3) {
            r = parseInt(cleanHex[0] + cleanHex[0], 16) / 255;
            g = parseInt(cleanHex[1] + cleanHex[1], 16) / 255;
            b = parseInt(cleanHex[2] + cleanHex[2], 16) / 255;
        }
        else if (cleanHex.length === 6) {
            r = parseInt(cleanHex.slice(0, 2), 16) / 255;
            g = parseInt(cleanHex.slice(2, 4), 16) / 255;
            b = parseInt(cleanHex.slice(4, 6), 16) / 255;
        }
        else if (cleanHex.length === 8) {
            r = parseInt(cleanHex.slice(0, 2), 16) / 255;
            g = parseInt(cleanHex.slice(2, 4), 16) / 255;
            b = parseInt(cleanHex.slice(4, 6), 16) / 255;
            a = parseInt(cleanHex.slice(6, 8), 16) / 255;
        }
        else {
            return { l: 50, c: 0, h: 0, a: 1 };
        }
        return AutoTheme.#linearRGBToOKLCH(r, g, b, a);
    }
    static #rgbToOKLCH(rgb) {
        const match = rgb.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        if (!match)
            return { l: 50, c: 0, h: 0, a: 1 };
        const r = parseInt(match[1]) / 255;
        const g = parseInt(match[2]) / 255;
        const b = parseInt(match[3]) / 255;
        const a = parseFloat(match[4]);
        return AutoTheme.#linearRGBToOKLCH(r, g, b, a);
    }
    static #hslToOKLCH(hsl) {
        const match = hsl.match(/hsla\((\d+),\s*(\d+)%,\s*(\d+)%,\s*([\d.]+)\)/);
        if (!match)
            return { l: 50, c: 0, h: 0, a: 1 };
        const h = parseInt(match[1]);
        const s = parseInt(match[2]) / 100;
        const l = parseInt(match[3]) / 100;
        const a = parseFloat(match[4]);
        // HSL to RGB
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;
        if (h < 60) {
            r = c;
            g = x;
            b = 0;
        }
        else if (h < 120) {
            r = x;
            g = c;
            b = 0;
        }
        else if (h < 180) {
            r = 0;
            g = c;
            b = x;
        }
        else if (h < 240) {
            r = 0;
            g = x;
            b = c;
        }
        else if (h < 300) {
            r = x;
            g = 0;
            b = c;
        }
        else {
            r = c;
            g = 0;
            b = x;
        }
        return AutoTheme.#linearRGBToOKLCH(r + m, g + m, b + m, a);
    }
    static #parseOKLCH(oklch) {
        const match = oklch.match(/oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)deg\s*\/\s*([\d.]+)\)/);
        if (!match)
            return { l: 50, c: 0, h: 0, a: 1 };
        return {
            l: parseFloat(match[1]),
            c: parseFloat(match[2]),
            h: parseFloat(match[3]),
            a: parseFloat(match[4]),
        };
    }
    static #oklabToOKLCH(oklab) {
        const match = oklab.match(/oklab\(([\d.]+)%\s+([-\d.]+)\s+([-\d.]+)\s*\/\s*([\d.]+)\)/);
        if (!match)
            return { l: 50, c: 0, h: 0, a: 1 };
        const l = parseFloat(match[1]);
        const a = parseFloat(match[2]);
        const b = parseFloat(match[3]);
        const alpha = parseFloat(match[4]);
        const c = Math.sqrt(a * a + b * b);
        const h = (Math.atan2(b, a) * 180) / Math.PI;
        return { l, c, h: h < 0 ? h + 360 : h, a: alpha };
    }
    static #linearRGBToOKLCH(r, g, b, a) {
        // sRGB to linear RGB
        const toLinear = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        const lr = toLinear(r);
        const lg = toLinear(g);
        const lb = toLinear(b);
        // Linear RGB to OKLab
        const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
        const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
        const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
        const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
        const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
        const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
        // OKLab to OKLCH
        const c = Math.sqrt(A * A + B * B);
        let h = (Math.atan2(B, A) * 180) / Math.PI;
        if (h < 0)
            h += 360;
        return { l: L * 100, c, h, a };
    }
    static #adjustChromaForLightness(baseChroma, lightness) {
        // Reduce chroma at very light and very dark extremes for natural look
        // Maximum chroma at mid-lightness (around 50-60%)
        const factor = 1 - Math.pow(Math.abs(lightness - 55) / 55, 2) * 0.5;
        return baseChroma * Math.max(0.3, factor);
    }
    static #oklchToColor(oklch, outputType) {
        switch (outputType) {
            case "oklch":
                return `oklch(${oklch.l.toFixed(1)}% ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)} /${oklch.a})`;
            case "hex":
                return AutoTheme.#oklchToHex(oklch);
            case "rgb":
                return AutoTheme.#oklchToRGB(oklch);
            case "hsl":
                return AutoTheme.#oklchToHSL(oklch);
            case "oklab":
                return AutoTheme.#oklchToOKLAB(oklch);
            default:
                return AutoTheme.#oklchToHex(oklch);
        }
    }
    static #oklchToLinearRGB(oklch) {
        const L = oklch.l / 100;
        const hRad = (oklch.h * Math.PI) / 180;
        const A = oklch.c * Math.cos(hRad);
        const B = oklch.c * Math.sin(hRad);
        // OKLab to linear RGB
        const l_ = L + 0.3963377774 * A + 0.2158037573 * B;
        const m_ = L - 0.1055613458 * A - 0.0638541728 * B;
        const s_ = L - 0.0894841775 * A - 1.291485548 * B;
        const l = l_ * l_ * l_;
        const m = m_ * m_ * m_;
        const s = s_ * s_ * s_;
        let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
        let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
        let b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
        // Linear RGB to sRGB
        const toSRGB = (c) => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
        r = Math.max(0, Math.min(1, toSRGB(r)));
        g = Math.max(0, Math.min(1, toSRGB(g)));
        b = Math.max(0, Math.min(1, toSRGB(b)));
        return { r, g, b, a: oklch.a };
    }
    static #oklchToHex(oklch) {
        const { r, g, b, a } = AutoTheme.#oklchToLinearRGB(oklch);
        const toHex = (c) => Math.round(c * 255)
            .toString(16)
            .padStart(2, "0");
        if (a < 1) {
            return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
        }
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    static #oklchToRGB(oklch) {
        const { r, g, b, a } = AutoTheme.#oklchToLinearRGB(oklch);
        return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    }
    static #oklchToHSL(oklch) {
        const { r, g, b, a } = AutoTheme.#oklchToLinearRGB(oklch);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;
        let h = 0, s = 0;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                    break;
                case g:
                    h = ((b - r) / d + 2) / 6;
                    break;
                case b:
                    h = ((r - g) / d + 4) / 6;
                    break;
            }
        }
        return `hsla(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${a})`;
    }
    static #oklchToOKLAB(oklch) {
        const hRad = (oklch.h * Math.PI) / 180;
        const a = oklch.c * Math.cos(hRad);
        const b = oklch.c * Math.sin(hRad);
        return `oklab(${oklch.l.toFixed(1)}% ${a.toFixed(3)} ${b.toFixed(3)} / ${oklch.a})`;
    }
    // #endregion color_conversion
    // #region serialization
    /**
     * A static method to create custom serialized strings containing the theme
     * @param autoThemeObject The object that will be serialized
     * @param escapeChar An optional custom escape character (needs to be used the same in de deserialization method). Use with caution. Defaults to "|"
     * @returns A string containing a theme. Single escape character indicates simple properties, double escape characters indicates objects
     */
    static serialize(autoThemeObject, escapeChar = "|") {
        if (!(autoThemeObject instanceof AutoTheme))
            throw new Error("Object is not a AutoTheme instance");
        let serialized = "";
        // Simple properties
        for (const [key, value] of Object.entries(autoThemeObject)) {
            if (typeof value !== "string" ||
                (typeof value === "string" && value.length <= 1))
                continue;
            serialized += `${key}:${value}${escapeChar}`;
        }
        // Object properties
        for (const [key, value] of Object.entries(autoThemeObject)) {
            if (typeof value !== "object" ||
                (typeof value === "object" &&
                    Object.entries(value).length === 0))
                continue;
            let currentPropObject = `${escapeChar}${key}:{`;
            for (const [key2, value2] of Object.entries(value)) {
                currentPropObject += `${key2}:${value2}${escapeChar}`;
            }
            currentPropObject =
                currentPropObject
                    .trim()
                    .substring(0, currentPropObject.length - 1) + "}";
            serialized += `${currentPropObject}${escapeChar}`;
        }
        if (serialized.charAt(serialized.length - 1) === escapeChar)
            serialized = serialized.substring(0, serialized.length - 1);
        return serialized.trim();
    }
    /**
     * A static method to deserialize a previously serialized theme object
     * @param serializedTheme The serialized object string that will be deserialized
     * @param escapeChar An optional escape character that is expected after using a specific escape character during the serialization process. Defaults to "|"
     * @returns A theme object ready to be used
     */
    static deserialize(serializedTheme, escapeChar = "|") {
        if (!serializedTheme)
            throw new Error("Serialized Theme was not passed as a parameter");
        const theme = {};
        const objectsStart = serializedTheme.indexOf(`${escapeChar}${escapeChar}`);
        const themeSimpleString = serializedTheme.substring(0, objectsStart);
        const themeSimpleProps = themeSimpleString.split(escapeChar);
        const themeObjectString = serializedTheme.substring(objectsStart + 2, serializedTheme.length);
        const themeObjectProps = themeObjectString.split(`${escapeChar}${escapeChar}`);
        for (const prop of themeSimpleProps) {
            const [key, value] = prop.split(":");
            AutoTheme.#addColorProperty(theme, key, value);
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
                AutoTheme.#addColorProperty(
                // @ts-ignore
                theme[objKey], objValueKey, ObjValueValue);
            }
        }
        return theme;
    }
    // #endregion serialization
    // #region private_methods
    static #addColorProperty(theme, key, value) {
        Object.defineProperty(theme, key, {
            value: value,
            configurable: true,
            enumerable: true,
            writable: true,
        });
    }
    static #addObjectProperty(theme, key) {
        Object.defineProperty(theme, key, {
            value: {},
            configurable: true,
            enumerable: true,
            writable: true,
        });
    }
}
