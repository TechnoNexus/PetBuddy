// Re-export the native module. On web, it will be resolved to AicoreModule.web.ts
// and on native platforms to AicoreModule.ts
export { default } from './src/AicoreModule';
export * from './src/Aicore.types';
