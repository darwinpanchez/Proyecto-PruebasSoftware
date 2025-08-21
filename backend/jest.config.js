module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controller/**/*.js',
    'model/**/*.js',
    'middleware/**/*.js',
    'routes/**/*.js'
    // Excluimos config para evitar problemas con archivos de configuración
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};