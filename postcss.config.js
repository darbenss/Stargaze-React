export default {
  plugins: {
    '@tailwindcss/postcss': {}, // <--- This is the fix (was just 'tailwindcss')
    autoprefixer: {},
  },
}