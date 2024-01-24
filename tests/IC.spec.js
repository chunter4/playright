// @ts-check
const { test, expect } = require('@playwright/test');
const { TIMEOUT } = require('dns');
test.setTimeout(120000);

test('Google for \'Aira Las Vegas\', click link containing \'guestreservations.com\' and attempt to book with fake info', async ({ page }) => {
  await page.goto('https://www.google.com/');
  await expect(page).toHaveTitle(/Google/);

  //Search for 'Aira Las Vegas' and click on link containing 'guestreservations.com'
  await page.getByLabel('Search', { exact: true }).fill('aira las vegas');
  await page.getByLabel('Search', { exact: true }).press('Enter');

  //if the guestreservations.com site isn't available, search again
  const modal1 = page.getByText('guestreservations.com');
  if (!await modal1.isVisible({timeout: 3000})) {
    await page.getByLabel('Search', { exact: true }).first().clear();
    await page.getByLabel('Search', { exact: true }).first().fill('aira las vegas');
    await page.getByLabel('Search', { exact: true }).first().press('Enter');
  }

  await page.getByText('guestreservations.com').first().scrollIntoViewIfNeeded;
  await page.getByText('guestreservations.com').first().click();

  //pick the 1st and 3rd of the next month
  await page.getByRole('dialog').locator('#check_in_view').click();
  await page.getByRole('table').getByRole('img').locator('path').click();
  await page.getByRole('cell', { name: '1', exact: true }).first().click();
  await page.getByRole('cell', { name: '3', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Find Rooms' }).click();

  await page.getByText('Rooms & Rates').first().click();
  await page.getByText('BOOK NOW').first().click({timeout: 60000});

  //fill out using only fake cc info
  await page.getByLabel('First Name on Card *').fill('test');
  await page.getByLabel('Last Name on Card *').fill('user');
  await page.getByLabel('Credit Card Number *').fill('4111111111111111');
  await page.getByLabel('Security Code *').fill('444');
  await page.getByRole('button', { name: 'Complete reservation >>' }).click();

  //occasional server error when clicking the complete reservation button, attempt to handle it
  const modal = page.getByRole('button', { name: 'BACK' });
  if (await modal.isVisible({timeout: 3000})) {
    await page.getByRole('button', { name: 'BACK' }).click();
    await page.getByRole('button', { name: 'Select' }).click();
    await page.getByRole('button', { name: 'Visa' }).click();
  }

  //verify errors on page
  await page.getByText('Please enter a valid first name between 1-30 characters.').click();
  await page.getByText('Please enter a valid last name between 1-30 characters.').click();
  await page.getByText('Please enter a valid email address.').click();
  await page.getByText('Please enter a valid phone number.').click();
  await page.getByText('Please enter a valid address under 121 characters.').click();
  await page.getByText('Please enter a town or city between 3-25 characters.').click();
  await page.getByText('Please enter a valid Billing ZIP/Postal Code.').click();

  //fill in missing fields
  await page.getByPlaceholder('First Name').fill('test');
  await page.getByPlaceholder('Last Name').fill('user');
  await page.getByPlaceholder('Double-check for typos').fill('test@test.com');
  await page.getByLabel('Contact Phone *').fill('1235551234');
  await page.getByLabel('Street Address *').fill('123 test way');
  await page.getByLabel('City *').fill('somecity');
  await page.getByLabel('Billing ZIP/Postal Code *').fill('12345');
  await page.getByRole('button', { name: 'Complete reservation >>' }).click();
  
  //some times clicking complete reservation button will return and the card type field is set to default
  const modal2 = page.getByRole('button', { name: 'Select' });
  if (await modal2.isVisible()) {
    await page.getByRole('button', { name: 'Select' }).click();
    await page.getByRole('button', { name: 'Visa' }).click();
    await page.getByRole('button', { name: 'Complete reservation >>' }).click();
  }

  //verify cc declined error message
  await page.getByRole('heading', { name: 'Credit card number or card holder data is incorrect.' }).click();

  //close browser
  await page.close();
});