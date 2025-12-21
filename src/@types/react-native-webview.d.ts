declare module 'react-native-webview' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';

  export type WebViewMessageEvent = {
    nativeEvent: {
      data: string;
    };
  };

  export interface WebViewProps extends ViewProps {
    source: { html?: string } | { uri: string };
    originWhitelist?: string[];
    onMessage?: (event: WebViewMessageEvent) => void;
    startInLoadingState?: boolean;
    renderLoading?: () => React.ReactElement | null;
  }

  export class WebView extends React.Component<WebViewProps> {}
}
