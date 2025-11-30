/**
 * Shared Test Utilities for Popover/Command/Dialog Components
 * 
 * These helpers are designed for testing components that use:
 * - @radix-ui/react-popover (Popover, PopoverTrigger, PopoverContent)
 * - @radix-ui/react-dialog (Dialog, DialogTrigger, DialogContent)
 * - @radix-ui/react-alert-dialog (AlertDialog, AlertDialogTrigger, AlertDialogContent)
 * - @radix-ui/react-dropdown-menu (DropdownMenu, DropdownMenuTrigger, DropdownMenuContent)
 * - cmdk (Command, CommandInput, CommandItem, CommandList)
 * 
 * @example
 * import { openCombobox, selectOption, clearSelection } from '@/tests/utils/popover-test-helpers';
 * 
 * // In test
 * await openCombobox(); // Opens the combobox dropdown
 * await selectOption('Option 1'); // Selects an option
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

/**
 * Opens a combobox/popover by clicking the trigger button
 * @param triggerText - Optional text to find specific trigger (default: finds by role)
 */
export async function openCombobox(triggerText?: string | RegExp) {
  const user = userEvent.setup();
  
  let trigger: HTMLElement;
  if (triggerText) {
    trigger = screen.getByRole('combobox', { name: triggerText });
  } else {
    trigger = screen.getByRole('combobox');
  }
  
  await user.click(trigger);
  
  // Wait for popover content to appear
  await waitFor(() => {
    // CommandList or PopoverContent should be visible
    expect(screen.queryByRole('listbox') || screen.queryByRole('dialog')).toBeInTheDocument();
  });
  
  return trigger;
}

/**
 * Opens a popover by clicking any button trigger
 * @param buttonText - Text or regex to find the button
 */
export async function openPopover(buttonText: string | RegExp) {
  const user = userEvent.setup();
  const button = screen.getByRole('button', { name: buttonText });
  await user.click(button);
  
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  
  return button;
}

/**
 * Opens a dropdown menu by clicking the trigger
 * @param triggerLabel - Accessible name of the trigger button
 */
export async function openDropdownMenu(triggerLabel: string | RegExp) {
  const user = userEvent.setup();
  const trigger = screen.getByRole('button', { name: triggerLabel });
  await user.click(trigger);
  
  // Wait for dropdown menu content to appear
  await waitFor(() => {
    expect(trigger).toHaveAttribute('data-state', 'open');
  });
  
  return trigger;
}

/**
 * Clicks a menu item in an open dropdown menu
 * @param itemText - Text of the menu item to click
 */
export async function clickMenuItem(itemText: string | RegExp) {
  const user = userEvent.setup();
  
  const menuItem = await screen.findByText(itemText);
  await user.click(menuItem);
  
  return menuItem;
}

/**
 * Opens a dialog by clicking a trigger
 * @param triggerText - Text of the button that opens the dialog
 */
export async function openDialog(triggerText: string | RegExp) {
  const user = userEvent.setup();
  const trigger = screen.getByRole('button', { name: triggerText });
  await user.click(trigger);
  
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  
  return screen.getByRole('dialog');
}

/**
 * Opens an alert dialog by clicking a trigger
 * @param triggerText - Text of the button that opens the alert dialog
 */
export async function openAlertDialog(triggerText: string | RegExp) {
  const user = userEvent.setup();
  const trigger = screen.getByRole('button', { name: triggerText });
  await user.click(trigger);
  
  await waitFor(() => {
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
  
  return screen.getByRole('alertdialog');
}

/**
 * Closes a dialog by clicking the close button or pressing Escape
 * @param method - Method to close: 'button' or 'escape'
 */
export async function closeDialog(method: 'button' | 'escape' = 'escape') {
  const user = userEvent.setup();
  
  if (method === 'escape') {
    await user.keyboard('{Escape}');
  } else {
    // Try to find close button
    const closeButton = screen.queryByRole('button', { name: /close|cancel/i });
    if (closeButton) {
      await user.click(closeButton);
    }
  }
  
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
}

/**
 * Confirms an alert dialog by clicking the confirm button
 * @param confirmText - Text of the confirm button (default: 'confirm', 'delete', 'yes')
 */
export async function confirmAlertDialog(confirmText: string | RegExp = /confirm|delete|yes/i) {
  const user = userEvent.setup();
  const dialog = screen.getByRole('alertdialog');
  
  const confirmButton = within(dialog).getByRole('button', { name: confirmText });
  await user.click(confirmButton);
  
  await waitFor(() => {
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
}

/**
 * Cancels an alert dialog by clicking the cancel button
 * @param cancelText - Text of the cancel button (default: 'cancel', 'no')
 */
export async function cancelAlertDialog(cancelText: string | RegExp = /cancel|no/i) {
  const user = userEvent.setup();
  const dialog = screen.getByRole('alertdialog');
  
  const cancelButton = within(dialog).getByRole('button', { name: cancelText });
  await user.click(cancelButton);
  
  await waitFor(() => {
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
}

/**
 * Types in a dialog input field
 * @param inputLabel - Label or placeholder of the input
 * @param text - Text to type
 */
export async function typeInDialogInput(inputLabel: string | RegExp, text: string) {
  const user = userEvent.setup();
  const dialog = screen.getByRole('dialog');
  
  // Try to find by label first, then by placeholder
  let input = within(dialog).queryByLabelText(inputLabel);
  if (!input) {
    input = within(dialog).queryByPlaceholderText(inputLabel);
  }
  if (!input) {
    // Fallback to textbox
    input = within(dialog).getByRole('textbox');
  }
  
  await user.clear(input);
  await user.type(input, text);
  
  return input;
}

/**
 * Selects an option from Command/Listbox by clicking
 * @param optionText - The text of the option to select
 */
export async function selectOption(optionText: string | RegExp) {
  const user = userEvent.setup();
  
  // Wait for option to be visible
  const option = await screen.findByText(optionText);
  await user.click(option);
  
  return option;
}

/**
 * Selects an option from Command/Listbox by role
 * @param optionText - The accessible name of the option
 */
export async function selectOptionByRole(optionText: string | RegExp) {
  const user = userEvent.setup();
  
  const option = await screen.findByRole('option', { name: optionText });
  await user.click(option);
  
  return option;
}

/**
 * Types into Command search input
 * @param searchText - Text to type
 */
export async function searchInCommand(searchText: string) {
  const user = userEvent.setup();
  
  // Command input usually has specific placeholder
  const input = screen.getByPlaceholderText(/cari|search|filter/i);
  await user.type(input, searchText);
  
  return input;
}

/**
 * Clears selection by clicking X button (if visible)
 */
export async function clearSelection() {
  const user = userEvent.setup();
  
  // Find X button - usually an SVG with lucide-x class or aria-label
  const clearButtons = screen.queryAllByRole('button');
  const clearButton = clearButtons.find(btn => {
    const svg = btn.querySelector('svg');
    return svg?.classList.contains('lucide-x') || btn.getAttribute('aria-label')?.includes('clear');
  });
  
  if (clearButton) {
    await user.click(clearButton);
    return true;
  }
  
  return false;
}

/**
 * Waits for popover/dropdown to close
 */
export async function waitForPopoverClose() {
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
}

/**
 * Waits for dropdown menu to close
 * @param trigger - The trigger element to check state
 */
export async function waitForDropdownClose(trigger: HTMLElement) {
  await waitFor(() => {
    expect(trigger).toHaveAttribute('data-state', 'closed');
  });
}

/**
 * Gets all visible options in a Command/Listbox
 */
export function getVisibleOptions(): HTMLElement[] {
  return screen.queryAllByRole('option');
}

/**
 * Gets all menu items in an open dropdown menu
 */
export function getMenuItems(): HTMLElement[] {
  return screen.queryAllByRole('menuitem');
}

/**
 * Checks if a specific option is selected (has checkmark)
 * @param optionText - The text of the option to check
 */
export async function isOptionSelected(optionText: string | RegExp): Promise<boolean> {
  const option = await screen.findByText(optionText);
  const parent = option.closest('[role="option"]') || option.parentElement;
  
  if (!parent) return false;
  
  // Check for Check icon (lucide-check) or aria-selected
  const hasCheck = parent.querySelector('.lucide-check, [data-state="checked"]');
  const isAriaSelected = parent.getAttribute('aria-selected') === 'true';
  
  return !!hasCheck || isAriaSelected;
}

/**
 * Creates a test user with userEvent.setup()
 * Use this at the start of each test for consistent behavior
 */
export function createTestUser() {
  return userEvent.setup();
}

/**
 * Helper to render and open a Select-like component
 * @param renderFn - Function that renders the component
 */
export async function renderAndOpenSelect(renderFn: () => void) {
  renderFn();
  await openCombobox();
}

/**
 * Helper for testing multi-select badge removal
 * @param badgeText - Text of the badge to remove
 */
export async function removeBadge(badgeText: string | RegExp) {
  const user = userEvent.setup();
  
  // Find the badge
  const badge = screen.getByText(badgeText);
  const badgeContainer = badge.closest('[class*="badge"]') || badge.parentElement;
  
  if (!badgeContainer) {
    throw new Error(`Badge with text "${badgeText}" not found`);
  }
  
  // Find X button within badge
  const removeButton = within(badgeContainer as HTMLElement).queryByRole('button') 
    || badgeContainer.querySelector('svg.lucide-x')?.parentElement;
  
  if (removeButton) {
    await user.click(removeButton);
    return true;
  }
  
  return false;
}

/**
 * Helper to interact with a dialog form
 * @param inputs - Array of { label, value } for form inputs
 * @param submitText - Text of the submit button
 */
export async function fillAndSubmitDialog(
  inputs: Array<{ label: string | RegExp; value: string }>,
  submitText: string | RegExp = /save|submit|confirm/i
) {
  const user = userEvent.setup();
  const dialog = screen.getByRole('dialog');
  
  // Fill all inputs
  for (const { label, value } of inputs) {
    let input = within(dialog).queryByLabelText(label);
    if (!input) {
      input = within(dialog).queryByPlaceholderText(label);
    }
    if (input) {
      await user.clear(input);
      await user.type(input, value);
    }
  }
  
  // Submit
  const submitButton = within(dialog).getByRole('button', { name: submitText });
  await user.click(submitButton);
}

/**
 * Asserts that a dialog contains specific text
 * @param texts - Array of text patterns to check
 */
export function assertDialogContains(texts: Array<string | RegExp>) {
  const dialog = screen.getByRole('dialog');
  
  for (const text of texts) {
    expect(within(dialog).getByText(text)).toBeInTheDocument();
  }
}

/**
 * Asserts that an alert dialog contains specific text
 * @param texts - Array of text patterns to check
 */
export function assertAlertDialogContains(texts: Array<string | RegExp>) {
  const dialog = screen.getByRole('alertdialog');
  
  for (const text of texts) {
    expect(within(dialog).getByText(text)).toBeInTheDocument();
  }
}
