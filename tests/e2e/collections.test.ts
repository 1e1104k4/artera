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

		// wait for UUID
		await page.waitForURL(/\/collections\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:\?.*)?$/i);
		// get by h1
		await expect(page.getByRole('heading', { level: 1, name: 'EON MUN' })).toBeVisible();

		await expect(page.getByText('0xf5521d34bd29f942523a7c125ffe0e06b6d41836')).toBeVisible();


	});
}); 