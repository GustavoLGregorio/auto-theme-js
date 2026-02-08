import { AutoTheme } from "../dist/AutoTheme.js";

const input_theme_base = document.getElementById("theme_base");
const colorValue = document.getElementById("color_value");
const colorRows = document.querySelectorAll(".color-row");
const toast = document.getElementById("toast");
const npmCopyBtn = document.getElementById("npm-copy");
const shadeValues = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

if (!input_theme_base || !colorValue) throw new Error("Input not found");

// Initialize shade boxes
colorRows.forEach(row => {
    const shadesContainer = row.querySelector(".shades");
    if (!shadesContainer) return;
    
    shadeValues.forEach(shade => {
        const box = document.createElement("div");
        box.className = "box-color";
        box.dataset.shade = shade;
        box.addEventListener("click", () => copyColor(box));
        shadesContainer.appendChild(box);
    });
});

// Color picker events
input_theme_base.addEventListener("change", handleColorPickerChange);
input_theme_base.addEventListener("input", handleColorPickerChange);

// Text input events
colorValue.addEventListener("input", handleTextInputChange);
colorValue.addEventListener("blur", handleTextInputBlur);
colorValue.addEventListener("keydown", handleTextInputKeydown);

// NPM copy button
if (npmCopyBtn) {
    npmCopyBtn.addEventListener("click", copyNpmInstall);
}

// Initial render
changeColors();

/**
 * Handle color picker change
 */
function handleColorPickerChange() {
    // @ts-ignore
    const color = input_theme_base.value;
    // @ts-ignore
    colorValue.value = color;
    // @ts-ignore
    colorValue.classList.remove("invalid");
    changeColors();
}

/**
 * Handle text input change
 */
function handleTextInputChange() {
    // @ts-ignore
    let value = colorValue.value.trim();
    
    if (value && !value.startsWith("#")) {
        value = "#" + value;
    }
    
    if (isValidHex(value)) {
        // @ts-ignore
        colorValue.classList.remove("invalid");
        const expandedHex = expandHex(value);
        // @ts-ignore
        input_theme_base.value = expandedHex;
        changeColors();
    } else if (value.length > 1) {
        // @ts-ignore
        colorValue.classList.add("invalid");
    }
}

/**
 * Handle text input blur
 */
function handleTextInputBlur() {
    // @ts-ignore
    let value = colorValue.value.trim();
    
    if (!value.startsWith("#") && value) {
        value = "#" + value;
    }
    
    if (isValidHex(value)) {
        const expandedHex = expandHex(value);
        // @ts-ignore
        colorValue.value = expandedHex;
        // @ts-ignore
        colorValue.classList.remove("invalid");
    } else if (value) {
        // @ts-ignore
        colorValue.value = input_theme_base.value;
        // @ts-ignore
        colorValue.classList.remove("invalid");
    }
}

/**
 * @param {KeyboardEvent} e 
 */
function handleTextInputKeydown(e) {
    if (e.key === "Enter") {
        // @ts-ignore
        colorValue.blur();
    }
}

/**
 * @param {string} hex 
 * @returns {boolean}
 */
function isValidHex(hex) {
    return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(hex);
}

/**
 * @param {string} hex 
 * @returns {string}
 */
function expandHex(hex) {
    if (hex.length === 4) {
        return "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    return hex;
}

/**
 * Copy npm install command
 */
async function copyNpmInstall() {
    try {
        await navigator.clipboard.writeText("npm install auto-theme-js");
        
        if (npmCopyBtn) {
            npmCopyBtn.classList.add("copied");
            setTimeout(() => {
                npmCopyBtn.classList.remove("copied");
            }, 2000);
        }
        
        showToast("npm install auto-theme-js");
    } catch (err) {
        console.error("Failed to copy:", err);
    }
}

/**
 * Apply theme colors to CSS custom properties
 * @param {object} theme 
 */
function applyThemeToPage(theme) {
    const root = document.documentElement;
    
    const properties = ["primary", "secondary", "tertiary", "accent", "neutral"];
    
    for (const prop of properties) {
        // @ts-ignore
        const shades = theme[prop];
        if (!shades) continue;
        
        for (const shade of shadeValues) {
            if (shades[shade]) {
                root.style.setProperty(`--color-${prop}-${shade}`, shades[shade]);
            }
        }
    }
    
    // @ts-ignore
    const primary950 = theme.primary?.["950"] || "#0a0a0a";
    // @ts-ignore
    const primary900 = theme.primary?.["900"] || "#121212";
    // @ts-ignore
    const primary800 = theme.primary?.["800"] || "#1a1a1a";
    // @ts-ignore
    const primary700 = theme.primary?.["700"] || "#262626";
    // @ts-ignore
    const primary500 = theme.primary?.["500"] || "#a855f7";
    // @ts-ignore
    const primary400 = theme.primary?.["400"] || "#c084fc";
    // @ts-ignore
    const primary300 = theme.primary?.["300"] || "#d8b4fe";
    // @ts-ignore
    const primary200 = theme.primary?.["200"] || "#e9d5ff";
    // @ts-ignore
    const primary100 = theme.primary?.["100"] || "#f3e8ff";
    
    // @ts-ignore
    const neutral950 = theme.neutral?.["950"] || "#0a0a0a";
    // @ts-ignore
    const neutral900 = theme.neutral?.["900"] || "#121212";
    // @ts-ignore
    const neutral800 = theme.neutral?.["800"] || "#1e1e1e";
    // @ts-ignore
    const neutral700 = theme.neutral?.["700"] || "#2d2d2d";
    // @ts-ignore
    const neutral600 = theme.neutral?.["600"] || "#404040";
    // @ts-ignore
    const neutral400 = theme.neutral?.["400"] || "#737373";
    // @ts-ignore
    const neutral300 = theme.neutral?.["300"] || "#a3a3a3";
    // @ts-ignore
    const neutral50 = theme.neutral?.["50"] || "#fafafa";

    root.style.setProperty("--color-bg-primary", primary950);
    root.style.setProperty("--color-bg-secondary", neutral950);
    root.style.setProperty("--color-bg-tertiary", neutral900);
    root.style.setProperty("--color-bg-elevated", hexToRgba(neutral800, 0.5));
    
    root.style.setProperty("--color-surface", hexToRgba(neutral800, 0.4));
    root.style.setProperty("--color-surface-hover", hexToRgba(neutral700, 0.5));
    root.style.setProperty("--color-border", hexToRgba(neutral600, 0.3));
    root.style.setProperty("--color-border-focus", primary400);
    
    root.style.setProperty("--color-text-primary", neutral50);
    root.style.setProperty("--color-text-secondary", neutral300);
    root.style.setProperty("--color-text-muted", neutral400);
    
    root.style.setProperty("--color-accent", primary400);
    root.style.setProperty("--color-accent-hover", primary300);
    root.style.setProperty("--color-accent-subtle", hexToRgba(primary500, 0.2));
    
    root.style.setProperty(
        "--gradient-title",
        `linear-gradient(135deg, ${primary300} 0%, ${primary500} 50%, ${primary700} 100%)`
    );
    
    root.style.setProperty("--color-neutral-800", neutral800);
    root.style.setProperty("--color-neutral-900", neutral900);
    
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
        themeColorMeta.setAttribute("content", primary950);
    }
}

/**
 * @param {string} hex 
 * @param {number} alpha 
 * @returns {string}
 */
function hexToRgba(hex, alpha) {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function changeColors() {
    // @ts-ignore
    const input_theme_current_color = input_theme_base.value;
    
    const theme = new AutoTheme(input_theme_current_color, "hex", "hex", "50", "950");

    applyThemeToPage(theme);

    colorRows.forEach(row => {
        // @ts-ignore
        const property = row.dataset.property;
        if (!property) return;
        
        const boxes = row.querySelectorAll(".box-color");
        
        boxes.forEach((box, index) => {
            const shade = shadeValues[index];
            // @ts-ignore
            const color = theme[property]?.[shade];
            
            if (color) {
                // @ts-ignore
                box.style.background = color;
                // @ts-ignore
                box.dataset.color = color;
                
                const shadeNum = parseInt(shade);
                if (shadeNum >= 500) {
                    box.classList.add("light-text");
                    box.classList.remove("dark-text");
                } else {
                    box.classList.add("dark-text");
                    box.classList.remove("light-text");
                }
            }
        });
    });
}

/**
 * @param {Element} box 
 */
async function copyColor(box) {
    // @ts-ignore
    const color = box.dataset.color;
    if (!color) return;
    
    try {
        await navigator.clipboard.writeText(color);
        showToast(color);
    } catch (err) {
        console.error("Failed to copy:", err);
    }
}

/**
 * @param {string} text 
 */
function showToast(text) {
    if (!toast) return;
    
    const colorPreview = toast.querySelector(".color-preview");
    const toastText = toast.querySelector(".toast-text");
    
    if (colorPreview) {
        // @ts-ignore
        colorPreview.style.background = text.startsWith("#") ? text : "var(--color-accent)";
    }
    if (toastText) {
        toastText.textContent = `Copied: ${text}`;
    }
    
    toast.classList.add("show");
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}