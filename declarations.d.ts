declare module '*.png' {
  const value: any;
  export default value;
}

declare module '@expo/vector-icons';

declare module '@react-native-community/datetimepicker' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';

  export interface DateTimePickerProps extends ViewProps {
    value: Date;
    mode?: 'date' | 'time' | 'datetime';
    display?: 'default' | 'spinner' | 'calendar' | 'clock';
    maximumDate?: Date;
    minimumDate?: Date;
    onChange?: (event: any, date?: Date) => void;
  }

  const DateTimePicker: React.ComponentType<DateTimePickerProps>;
  export default DateTimePicker;
}
