// Mock de winston para tests
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  http: jest.fn()
}

const mockFormat: any = {
  combine: jest.fn(() => mockFormat),
  timestamp: jest.fn(() => mockFormat),
  printf: jest.fn(() => mockFormat),
  colorize: jest.fn(() => mockFormat),
  errors: jest.fn(() => mockFormat),
  json: jest.fn(() => mockFormat),
  simple: jest.fn(() => mockFormat)
}

const winston = {
  createLogger: jest.fn(() => mockLogger),
  format: mockFormat,
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  }
}

export default winston
