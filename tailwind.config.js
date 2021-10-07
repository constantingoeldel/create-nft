module.exports = {
  plugins: [require('@tailwindcss/forms')],
  theme: {
    extend: {
      colors: {
        primary: {
          lighter: 'hsla(222, 100%, 34%, 0.4)',
          default: 'rgb(42, 97, 187)',
          darker: 'rgb(42, 97, 150)',
        },
      },
    },
  },
  variants: {},
  plugins: [],
  purge: false,
}
