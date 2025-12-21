import React from 'react';
import { Text, TextProps } from 'react-native';
import { theme, typography } from '../theme';

export type TextVariant =
  | 'title1'
  | 'headline1'
  | 'headline2'
  | 'headline3'
  | 'body1'
  | 'body2'
  | 'body3'
  | 'body4'
  | 'caption1'
  | 'caption2';

export type TextColor = 'primary' | 'secondary' | 'inverse' | 'accent';

export interface ThemedTextProps extends TextProps {
  variant?: TextVariant;
  color?: TextColor;
}

const colorMap: Record<TextColor, string> = {
  primary: theme.colors.text.primary,
  secondary: theme.colors.text.secondary,
  inverse: theme.colors.text.inverse,
  accent: theme.colors.accent.main,
};

const ThemedText: React.FC<ThemedTextProps> = ({
  variant = 'body1',
  color = 'primary',
  style,
  ...rest
}) => {
  return (
    <Text
      style={[typography[variant], { color: colorMap[color] }, style]}
      {...rest}
    />
  );
};

export default ThemedText;
