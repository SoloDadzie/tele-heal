import type { TextStyle } from 'react-native';

export type Typography = {
  title1: TextStyle;
  headline1: TextStyle;
  headline2: TextStyle;
  headline3: TextStyle;
  body1: TextStyle;
  body2: TextStyle;
  body3: TextStyle;
  body4: TextStyle;
  caption1: TextStyle;
  caption2: TextStyle;
};

export const typography: Typography = {
  title1: {
    fontFamily: 'Avenir-Black',
    fontSize: 32,
    lineHeight: 40,
  },
  headline1: {
    fontFamily: 'Avenir-Black',
    fontSize: 28,
    lineHeight: 34,
  },
  headline2: {
    fontFamily: 'Avenir-Heavy',
    fontSize: 20,
    lineHeight: 28,
  },
  headline3: {
    fontFamily: 'Avenir-Heavy',
    fontSize: 18,
    lineHeight: 24,
  },
  body1: {
    fontFamily: 'Avenir-Medium',
    fontSize: 16,
    lineHeight: 22,
  },
  body2: {
    fontFamily: 'Avenir-Medium',
    fontSize: 18,
    lineHeight: 28,
  },
  body3: {
    fontFamily: 'Avenir-Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  body4: {
    fontFamily: 'Avenir-Medium',
    fontSize: 12,
    lineHeight: 16,
  },
  caption1: {
    fontFamily: 'Avenir-Medium',
    fontSize: 12,
    lineHeight: 14,
  },
  caption2: {
    fontFamily: 'Avenir-Medium',
    fontSize: 11,
    lineHeight: 13,
  },
};
