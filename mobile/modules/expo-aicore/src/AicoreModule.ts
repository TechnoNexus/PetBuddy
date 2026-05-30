import { NativeModule, requireNativeModule } from 'expo';

declare class AicoreModule extends NativeModule<{}> {
  initializeModel(modelPath: string): Promise<boolean>;
  generateResponse(prompt: string): Promise<string>;
}

export default requireNativeModule<AicoreModule>('Aicore');
