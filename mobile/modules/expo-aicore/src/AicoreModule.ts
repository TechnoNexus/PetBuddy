import { NativeModule, requireNativeModule } from 'expo';

declare class AicoreModule extends NativeModule<{}> {
  initializeModel(modelPath: string): Promise<boolean>;
  generateResponse(prompt: string): Promise<string>;
}

let Aicore: AicoreModule | null = null;
try {
  Aicore = requireNativeModule<AicoreModule>('Aicore');
} catch (e) {
  console.warn('Native module Aicore not found. On-device AI will not be available.');
}

export default Aicore as AicoreModule;
