import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

describe('App', () => {
  let button;
  
  beforeEach(() => {
    render(<App />)
    button = screen.getByRole('button');
  });

  test('shows decode url button', () => {
    expect(button).toBeInTheDocument();
  });

  test('button is disabled before html data is ready', () => {
    expect(button).toBeDisabled();
  });

  test('button becomes enabled once data is ready', async () => {
    await waitFor(() => expect(button).not.toBeDisabled()) 
  })

  test('shows the url when decode button is clicked', async () => {
    await waitFor(() => expect(button).not.toBeDisabled())

    fireEvent.click(button);
    expect(screen.getByText(/https/i, {exact: false})).toBeInTheDocument();
  
  });
})
