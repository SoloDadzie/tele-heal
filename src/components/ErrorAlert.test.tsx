import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ErrorAlert from './ErrorAlert';

describe('ErrorAlert Component', () => {
  it('should render error alert when visible is true', () => {
    const { getByText } = render(
      <ErrorAlert
        title="Test Error"
        message="This is a test error message"
        visible={true}
      />
    );

    expect(getByText('Test Error')).toBeTruthy();
    expect(getByText('This is a test error message')).toBeTruthy();
  });

  it('should not render error alert when visible is false', () => {
    const { queryByText } = render(
      <ErrorAlert
        title="Test Error"
        message="This is a test error message"
        visible={false}
      />
    );

    expect(queryByText('Test Error')).toBeNull();
  });

  it('should render dismiss button when onDismiss is provided', () => {
    const { getByLabelText } = render(
      <ErrorAlert
        title="Test Error"
        message="This is a test error message"
        visible={true}
        onDismiss={jest.fn()}
      />
    );

    expect(getByLabelText('Dismiss error')).toBeTruthy();
  });

  it('should call onDismiss when dismiss button is pressed', () => {
    const onDismiss = jest.fn();
    const { getByLabelText } = render(
      <ErrorAlert
        title="Test Error"
        message="This is a test error message"
        visible={true}
        onDismiss={onDismiss}
      />
    );

    fireEvent.press(getByLabelText('Dismiss error'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('should render retry button when onRetry is provided', () => {
    const { getByLabelText } = render(
      <ErrorAlert
        title="Test Error"
        message="This is a test error message"
        visible={true}
        onRetry={jest.fn()}
      />
    );

    expect(getByLabelText('Retry button')).toBeTruthy();
  });

  it('should call onRetry when retry button is pressed', () => {
    const onRetry = jest.fn();
    const { getByLabelText } = render(
      <ErrorAlert
        title="Test Error"
        message="This is a test error message"
        visible={true}
        onRetry={onRetry}
      />
    );

    fireEvent.press(getByLabelText('Retry button'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('should render both retry and dismiss buttons when both callbacks are provided', () => {
    const { getByLabelText } = render(
      <ErrorAlert
        title="Test Error"
        message="This is a test error message"
        visible={true}
        onRetry={jest.fn()}
        onDismiss={jest.fn()}
      />
    );

    expect(getByLabelText('Retry button')).toBeTruthy();
    expect(getByLabelText('Dismiss error')).toBeTruthy();
  });

  it('should use default title when not provided', () => {
    const { getByText } = render(
      <ErrorAlert
        message="This is a test error message"
        visible={true}
      />
    );

    expect(getByText('Error')).toBeTruthy();
  });

  it('should have accessibility role alert', () => {
    const { getByRole } = render(
      <ErrorAlert
        title="Test Error"
        message="This is a test error message"
        visible={true}
      />
    );

    expect(getByRole('alert')).toBeTruthy();
  });
});
