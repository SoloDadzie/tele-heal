import React from 'react';
import { Image, ImageProps, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { theme } from '../theme';

export interface AvatarProps extends Omit<ImageProps, 'source'> {
  size?: number;
  source: ImageSourcePropType;
}

const Avatar: React.FC<AvatarProps> = ({ size = 48, source, style, ...rest }) => {
  const borderRadius = size / 2;
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius,
        },
      ]}
    >
      <Image
        source={source}
        style={[{ width: size, height: size, borderRadius }, style]}
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: theme.colors.neutral.white,
    overflow: 'hidden',
    backgroundColor: theme.colors.neutral.light,
  },
});

export default Avatar;
