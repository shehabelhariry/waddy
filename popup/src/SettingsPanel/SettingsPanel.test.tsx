import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPanel from './SettingsPanel'; // Adjust path as necessary

describe('SettingsPanel Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    // Clear mocks and localStorage before each test
    mockOnClose.mockClear();
    mockOnSave.mockClear();
    localStorage.clear();
  });

  test('renders correctly when visible', () => {
    render(<SettingsPanel visible={true} onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.getByText('Settings')).toBeInTheDocument(); // Modal title
    expect(screen.getByPlaceholderText('Enter your OpenAI API Key')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('does not render when not visible', () => {
    render(<SettingsPanel visible={false} onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  test('loads API key from localStorage on mount if visible', () => {
    localStorage.setItem('openai_api_key', 'test-key-from-storage');
    render(<SettingsPanel visible={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const input = screen.getByPlaceholderText('Enter your OpenAI API Key') as HTMLInputElement;
    expect(input.value).toBe('test-key-from-storage');
  });

  test('updates input value on change', () => {
    render(<SettingsPanel visible={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const input = screen.getByPlaceholderText('Enter your OpenAI API Key') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'new-api-key' } });
    expect(input.value).toBe('new-api-key');
  });

  test('calls onSave with API key and then onClose when save button is clicked', async () => {
    render(<SettingsPanel visible={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const input = screen.getByPlaceholderText('Enter your OpenAI API Key');
    const saveButton = screen.getByRole('button', { name: /save/i });

    fireEvent.change(input, { target: { value: 'save-this-key' } });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith('save-this-key');
    
    // Antd Modal's default behavior might involve animations or async actions for closing.
    // The success message is also antd specific.
    // We check if onClose is called, which is the important part of our component's logic.
    await waitFor(() => {
      expect(screen.getByText('API Key saved!')).toBeInTheDocument(); // antd message
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('does not call onSave if API key is empty and shows error', async () => {
    render(<SettingsPanel visible={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const saveButton = screen.getByRole('button', { name: /save/i });

    fireEvent.click(saveButton); // Click with empty input

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(await screen.findByText('API Key cannot be empty.')).toBeInTheDocument(); // antd message
    expect(mockOnClose).not.toHaveBeenCalled(); // Panel should not close
  });
  
  test('calls onClose when cancel button is clicked', () => {
    render(<SettingsPanel visible={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when modal`s native close (onCancel) is triggered', () => {
    // This is usually an 'x' button or an escape key press, handled by Antd Modal
    // We simulate it by calling the onCancel prop directly as if Antd did it.
    const { rerender } = render(
      <SettingsPanel visible={true} onClose={mockOnClose} onSave={mockOnSave} />
    );
    
    // Find the Modal's cancel button (often an 'x' icon)
    // Antd Modals often have a close button with an aria-label "Close"
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('input field is reset to stored API key if modal is closed without saving a new value', () => {
    localStorage.setItem('openai_api_key', 'initial-key');
    render(<SettingsPanel visible={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const input = screen.getByPlaceholderText('Enter your OpenAI API Key') as HTMLInputElement;
    
    expect(input.value).toBe('initial-key'); // Loaded from storage

    fireEvent.change(input, { target: { value: 'new-unsaved-key' } });
    expect(input.value).toBe('new-unsaved-key'); // Changed value

    // Simulate closing the modal (e.g., clicking Cancel button)
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // If the panel were to re-open, the input should revert to 'initial-key' because 'new-unsaved-key' wasn't saved.
    // The SettingsPanel's useEffect handles this by re-reading from localStorage when 'visible' becomes true.
    // Let's simulate reopening
    render(<SettingsPanel visible={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const reopenedInput = screen.getByPlaceholderText('Enter your OpenAI API Key') as HTMLInputElement;
    expect(reopenedInput.value).toBe('initial-key');
  });

  test('input field is updated with new saved key if modal is re-opened after saving', () => {
    localStorage.setItem('openai_api_key', 'initial-key');
    render(<SettingsPanel visible={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const input = screen.getByPlaceholderText('Enter your OpenAI API Key') as HTMLInputElement;
    const saveButton = screen.getByRole('button', { name: /save/i });

    fireEvent.change(input, { target: { value: 'new-saved-key' } });
    fireEvent.click(saveButton); // This will call onSave, which should update localStorage

    // Simulate onSave actually saving to localStorage
    // In a real scenario, onSave (passed from JobTracker) would do this.
    // For this component's test, we can assume onSave in SettingsPanel itself updates localStorage if we wanted to test that directly,
    // but the responsibility is on the parent. For this test, we'll manually set it to simulate the parent's action.
    localStorage.setItem('openai_api_key', 'new-saved-key'); 


    // Simulate reopening
    render(<SettingsPanel visible={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const reopenedInput = screen.getByPlaceholderText('Enter your OpenAI API Key') as HTMLInputElement;
    expect(reopenedInput.value).toBe('new-saved-key');
  });
});
