const url = 'http://127.0.0.1:4175';

module.exports = {
  testDir: './tests',
  use: { baseURL: url, hasTouch: true },
  webServer: { command: 'npm run dev', url, reuseExistingServer: !process.env.CI },
};
