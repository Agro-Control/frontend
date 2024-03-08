import type {Config} from "tailwindcss";

const config = {
    darkMode: ["class"],
    content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                poppins: "var(--font-poppins)",
                jakarta: "var(--font-jakarta)",
            },
            colors: {
                background: "#f5f6f8 ",
                sidebar: "#ffffff",
                divider: "#e4e4e7",
                dark: "#0d1117",
                green: {
                    50: "#f0fdf5",
                    100: "#dcfce8",
                    200: "#bbf7d1",
                    300: "#86efad",
                    400: "#4ade81",
                    500: "#22c55e",
                    600: "#16a34a",
                    700: "#15803c",
                    800: "#166533",
                    900: "#14532b",
                    950: "#052e14",
                },

                black: {
                    50: "#777676",
                    100: "#888787",
                    200: "#666565",
                    300: "#4d4c4b",
                    400: "#343332",
                    500: "#1b1a19",
                    600: "#020101",
                    700: "#08070b",
                    800: "#060609",
                    900: "#040406",
                    950: "#030303",
                },
            },
            dropShadow: {
                side: "0 2px 2px rgba(0, 0, 0, 0.2)",
            },
            keyframes: {
                "accordion-down": {
                    from: {height: "0"},
                    to: {height: "var(--radix-accordion-content-height)"},
                },
                "accordion-up": {
                    from: {height: "var(--radix-accordion-content-height)"},
                    to: {height: "0"},
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
