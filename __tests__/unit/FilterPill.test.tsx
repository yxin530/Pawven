import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterPill } from '../../components/ui/FilterPill';

describe('FilterPill', () => {
  it('renders the label text', () => {
    const { getByText } = render(
      <FilterPill label="Events" active={false} onChange={jest.fn()} />
    );
    expect(getByText('Events')).toBeTruthy();
  });

  it('applies active visual state classes when active is true', () => {
    const { toJSON } = render(
      <FilterPill label="Feeders" active={true} onChange={jest.fn()} />
    );
    const tree = toJSON();
    expect(tree?.props.className).toContain('bg-primary');
    expect(tree?.props.className).not.toContain('bg-surface');
  });

  it('applies inactive visual state classes when active is false', () => {
    const { toJSON } = render(
      <FilterPill label="NGOs" active={false} onChange={jest.fn()} />
    );
    const tree = toJSON();
    expect(tree?.props.className).toContain('border-border');
    expect(tree?.props.className).not.toContain('bg-primary');
  });

  it('calls onChange with true when tapped while inactive', () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <FilterPill label="Vets" active={false} onChange={onChange} />
    );
    fireEvent.press(getByRole('button'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when tapped while active', () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <FilterPill label="Events" active={true} onChange={onChange} />
    );
    fireEvent.press(getByRole('button'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('renders with proper accessibility attributes', () => {
    const { getByRole, getByLabelText } = render(
      <FilterPill label="Feeders" active={true} onChange={jest.fn()} />
    );
    const button = getByRole('button');
    expect(button).toBeTruthy();
    expect(getByLabelText('Feeders filter')).toBeTruthy();
  });
});
