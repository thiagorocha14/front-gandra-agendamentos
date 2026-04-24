import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'

/**
 * Paleta baseada em #1b7e45, #105626, #02220d, #031009, #bbd3b9
 */
export const gandraPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f0f7f2',
      100: '#dceee1',
      200: '#bbd3b9',
      300: '#8fb89a',
      400: '#5a9d6f',
      500: '#1b7e45',
      600: '#176f3d',
      700: '#105626',
      800: '#073518',
      900: '#02220d',
      950: '#031009',
    },
    secondary: {
      50: '#f8f7f0',
      100: '#efebda',
      200: '#dcd4b9',
      300: '#c5b88f',
      400: '#a3945a',
      500: '#7e741b',
      600: '#6f6617',
      700: '#564f10',
      800: '#353007',
      900: '#221f02',
      950: '#100e03',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f6faf7',
          100: '#e8f0ea',
          200: '#d4e3d8',
          300: '#bbd3b9',
          400: '#8fb89a',
          500: '#5a8f6a',
          600: '#3d6b4d',
          700: '#105626',
          800: '#062816',
          900: '#02220d',
          950: '#031009',
        },
      },
    },
  },
})
