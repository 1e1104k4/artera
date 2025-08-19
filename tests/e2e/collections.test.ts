import { test, expect } from '../fixtures';
import { CollectionsPage } from '../pages/collections';

// Minimal flow test for the new Collections wizard starting at /collections/new
// Uses an authenticated context to avoid guest redirect to '/'

test.describe('Collections wizard - Step 1', () => {
    let collectionsPage: CollectionsPage;

    test.beforeEach(async ({page}) => {
      collectionsPage = new CollectionsPage(page);
      await page.goto('/collections/new');
    });
	test('loads step one and enables Next after required fields', async ({ page }) => {


		await expect(page.getByText('Expand your collections network.')).toBeVisible();
		await expect(page.getByText('what is the name of your collection?')).toBeVisible();
        await expect(page.getByPlaceholder('Send a message...')).toBeVisible();

        await collectionsPage.sendUserMessage('My collection is called EON MUN');
        await collectionsPage.isGenerationComplete();
        
        const assistantMessage = page.getByTestId('message-assistant').last();

        await expect(assistantMessage.getByText('Contract Address')).toBeVisible();
        await expect(assistantMessage.getByText('0xf5521d34bd29f942523a7c125ffe0e06b6d41836')).toBeVisible();

        await expect(assistantMessage.getByText('OpenSea URL')).toBeVisible();
        await expect(assistantMessage.getByText('https://opensea.io/collection/eon-mun')).toBeVisible();


	});
}); 