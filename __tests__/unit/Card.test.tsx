import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card } from '../../components/ui/Card';

describe('Card', () => {
  it('renders children inside a View when no onPress is provided', () => {
    const { getByText } = render(
      <Card>
        <Text>Hello</Text>
      </Card>
    );
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders as a Pressable when onPress is provided', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Card onPress={onPress}>
        <Text>Tappable</Text>
      </Card>
    );
    const button = getByRole('button');
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies base NativeWind classes', () => {
    const { toJSON } = render(
      <Card>
        <Text>Styled</Text>
      </Card>
    );
    const tree = toJSON();
    // The root element should have the className prop set
    expect(tree?.props.className).toContain('bg-surface');
    expect(tree?.props.className).toContain('rounded-xl');
    expect(tree?.props.className).toContain('p-4');
    expect(tree?.props.className).toContain('border-border');
  });

  it('merges custom style classes with base classes', () => {
    const { toJSON } = render(
      <Card style="mt-2 mx-4">
        <Text>Custom</Text>
      </Card>
    );
    const tree = toJSON();
    expect(tree?.props.className).toContain('bg-surface');
    expect(tree?.props.className).toContain('mt-2');
    expect(tree?.props.className).toContain('mx-4');
  });

  it('does not render as a button when onPress is not provided', () => {
    const { queryByRole } = render(
      <Card>
        <Text>No press</Text>
      </Card>
    );
    expect(queryByRole('button')).toBeNull();
  });
});
