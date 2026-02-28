export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080/api',
    wsUrl: 'ws://localhost:8080/ws',
    stripeKey: 'pk_test_your_stripe_key',
    firebase: {
      apiKey: 'your-firebase-api-key',
      authDomain: 'your-auth-domain',
      projectId: 'your-project-id',
      storageBucket: 'your-storage-bucket',
      messagingSenderId: 'your-messaging-sender-id',
      appId: 'your-app-id'
    },
    appName: 'THE VAULT',
    appVersion: '1.0.0',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es', 'fr', 'de'],
    pagination: {
      defaultPageSize: 20,
      maxPageSize: 100
    },
    cacheTimeout: 300000, // 5 minutes
    gameSettings: {
      defaultGridSize: 5,
      maxPlayers: 8,
      minPlayers: 2,
      greedTimerDefault: 30
    }
  };