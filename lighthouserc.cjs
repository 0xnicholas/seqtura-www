module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist/client',
      url: [
        'http://localhost/',
        'http://localhost/methodology',
        'http://localhost/architecture',
        'http://localhost/process',
        'http://localhost/contact',
        'http://localhost/products/oribos',
        'http://localhost/products/fdesforce',
        'http://localhost/products/heirloom',
        'http://localhost/legal/privacy',
        'http://localhost/legal/terms',
      ],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 1 }],
        'categories:seo': ['error', { minScore: 1 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
