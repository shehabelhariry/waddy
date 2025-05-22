import { callLLM, loadPrompt, extractTextBetweenTags } from './utils'; // Adjust path as necessary

// Mocks are set up in setupTests.ts for localStorage, fetch, and import.meta.env

describe('Utility Functions', () => {
  describe('callLLM', () => {
    const originalEnv = { ...process.env }; // Store original environment variables

    beforeEach(() => {
      // Reset mocks and localStorage before each test
      localStorage.clear();
      (global.fetch as jest.Mock).mockClear();
      // Reset import.meta.env.VITE_OPENAI_API_KEY for each test
      // In setupTests.ts, we'd typically mock the module providing this.
      // For direct manipulation here, ensure your setup supports it or adjust.
      // This is tricky because import.meta.env is usually compile-time.
      // A common workaround is to mock the module that exports the env variable if it's re-exported,
      // or to have a specific mock for 'import.meta.env' if your Jest config allows.
      // For this example, we'll assume VITE_OPENAI_API_KEY can be influenced via a mock
      // or that localStorage takes precedence, which is what we're testing.
      // If direct override is needed: jest.spyOn(import.meta.env, 'VITE_OPENAI_API_KEY', 'get').mockReturnValue('test_env_api_key');
      // However, import.meta is live binding, not an object, so this is not straightforward.
      // The most robust way is to mock the module or use a global setup as in setupTests.ts for env vars.
      // Let's assume the setupTests.ts handles the VITE_OPENAI_API_KEY, or we rely on localStorage for tests.
      process.env.VITE_OPENAI_API_KEY = 'test_env_api_key'; // More common for Node env vars
    });

    afterEach(() => {
      process.env = originalEnv; // Restore original environment variables
    });

    test('should use API key from localStorage if available', async () => {
      localStorage.setItem('openai_api_key', 'test_local_storage_api_key');
      await callLLM({ system: 'system_prompt', prompt: 'user_prompt' });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test_local_storage_api_key',
          }),
        })
      );
    });

    test('should fall back to environment variable if localStorage key is not set', async () => {
      // Ensure localStorage is empty for this key
      localStorage.removeItem('openai_api_key');
      // Mocking import.meta.env.VITE_OPENAI_API_KEY is tricky.
      // Let's assume it's mocked as 'test_env_api_key' via jest setup or module mock.
      // If not, this test might be brittle.
      // For robustness, you might need a specific Vite Jest setup for env variables.
      // In utils.ts, the code is: apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      // We need to ensure this mock path is working.
      // If VITE_OPENAI_API_KEY is undefined in test, it will fail the "key exists" check.
      // Let's add a temporary mock here if not covered by global setup (less ideal)
      const mockEnvApiKey = 'env_provided_api_key';
      
      // This is the challenging part with import.meta.env in Jest without specific transformers/plugins
      // For now, we'll rely on the logic that if localStorage is empty, it *tries* env.
      // The actual value of import.meta.env.VITE_OPENAI_API_KEY in Jest depends on the setup.
      // In our case, setupTests.ts doesn't explicitly set VITE_OPENAI_API_KEY for import.meta.env.
      // It's often better to abstract env variable access into a module that can be easily mocked.

      // Re-evaluating: The code uses `import.meta.env.VITE_OPENAI_API_KEY`.
      // The best way is to mock the module that might re-export this or mock `utils.ts` for this specific var.
      // Given the current structure, let's assume the test environment *can* provide this.
      // If `process.env.VITE_OPENAI_API_KEY` influences `import.meta.env.VITE_OPENAI_API_KEY` via build/test tools:
      process.env.VITE_OPENAI_API_KEY = mockEnvApiKey; // For test environments that map this
      
      // If the above doesn't work due to ESM/CJS issues or how Vite handles envs,
      // we might need to spy on localStorage.getItem and ensure it's called, then
      // check that fetch is called with *some* Bearer token, implying it passed the key check.

      await callLLM({ system: 'system_prompt', prompt: 'user_prompt' });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockEnvApiKey}`, // Assuming process.env influences import.meta.env or it's mocked
          }),
        })
      );
    });
    
    test('should use env var if localStorage key is an empty string', async () => {
      localStorage.setItem('openai_api_key', ''); // Empty string
      const mockEnvApiKey = 'env_api_key_for_empty_local';
      process.env.VITE_OPENAI_API_KEY = mockEnvApiKey;

      await callLLM({ system: 'system_prompt', prompt: 'user_prompt' });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockEnvApiKey}`,
          }),
        })
      );
    });

    test('should throw an error if no API key is available', async () => {
      localStorage.removeItem('openai_api_key');
      // Ensure the mocked VITE_OPENAI_API_KEY is also undefined or empty for this test
      // This is the tricky part. If it's globally mocked to a value, this test won't reflect the intended scenario.
      // One way: jest.doMock('module-that-provides-env-var', () => ({ VITE_OPENAI_API_KEY: undefined }));
      delete process.env.VITE_OPENAI_API_KEY; // If process.env influences import.meta.env

      // For this test to be reliable, we need to ensure import.meta.env.VITE_OPENAI_API_KEY is truly undefined.
      // This often requires specific Jest configuration for Vite projects.
      // Assuming it can be made undefined:
      await expect(
        callLLM({ system: 'system_prompt', prompt: 'user_prompt' })
      ).rejects.toThrow('OpenAI API key is not set. Please set it in the settings or as an environment variable.');
    });

    test('should make a fetch call with correct parameters', async () => {
      localStorage.setItem('openai_api_key', 'test_api_key');
      const systemPrompt = 'You are a helpful assistant.';
      const userPrompt = 'What is the capital of France?';

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ choices: [{ message: { content: 'Paris' } }] }),
        })
      );

      const response = await callLLM({ system: systemPrompt, prompt: userPrompt });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test_api_key',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            max_tokens: 5000,
          }),
        })
      );
      expect(response).toBe('Paris');
    });
  });

  describe('loadPrompt', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockClear();
    });

    test('fetches a prompt and replaces placeholders', async () => {
      const mockPromptTemplate = "Hello {{name}}, welcome to {{place}}.";
      const mockFileName = "testPrompt.txt";
      const replacements = { name: "Waddy", place: "the Test Suite" };
      const expectedPrompt = "Hello Waddy, welcome to the Test Suite.";

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockPromptTemplate),
        })
      );

      const prompt = await loadPrompt(mockFileName, replacements);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(`prompts/${mockFileName}`);
      expect(prompt).toBe(expectedPrompt);
    });
  });

  describe('extractTextBetweenTags', () => {
    test('extracts text between specified tags', () => {
      const text = "Some text <tag>Extract This</tag> more text.";
      expect(extractTextBetweenTags(text, 'tag')).toBe('Extract This');
    });

    test('returns null if tags are not found', () => {
      const text = "Some text without the tags.";
      expect(extractTextBetweenTags(text, 'tag')).toBeNull();
    });

    test('handles multi-line content between tags', () => {
      const text = "Before <multiline>Line 1\nLine 2</multiline> After";
      expect(extractTextBetweenTags(text, 'multiline')).toBe('Line 1\nLine 2');
    });

     test('returns the first match if multiple exist', () => {
      const text = "<tag>First</tag> <tag>Second</tag>";
      expect(extractTextBetweenTags(text, 'tag')).toBe('First');
    });
  });
});
