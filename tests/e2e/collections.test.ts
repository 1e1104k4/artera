import { test, expect } from '../fixtures';

// Minimal flow test for the new Collections wizard starting at /collections/new
// Uses an authenticated context to avoid guest redirect to '/'

test.describe('Collections wizard - Step 1', () => {
	test('loads step one and enables Next after required fields', async ({ adaContext }) => {
		const { page } = adaContext;

		await page.goto('/collections/new');

		// Left panel greeting from the chat shell
		await expect(page.getByText('Expand your NFT collections network.')).toBeVisible();
		await expect(page.getByText('what is the name of your collection?')).toBeVisible();

        page.getByPlaceholder('Send a message...').fill('EON MUN');
		page.getByTestId('send-button').click()
		await expect(page.getByText('https://opensea.io/collection/eon-mun')).toBeVisible();
		page.getByText("Next").click()



	});
}); 