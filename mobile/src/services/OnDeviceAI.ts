import AicoreModule from '../../modules/expo-aicore';

class OnDeviceAIService {
  private isInitialized: boolean = false;

  /**
   * Initializes the MediaPipe model with the given file path.
   * @param modelPath The absolute path to the downloaded model file.
   */
  async initialize(modelPath: string): Promise<boolean> {
    try {
      console.log('Initializing On-Device AI with model:', modelPath);
      const result = await AicoreModule.initializeModel(modelPath);
      this.isInitialized = true;
      return result;
    } catch (error) {
      console.error('Failed to initialize On-Device AI:', error);
      throw error;
    }
  }

  /**
   * Generates a response using the locally loaded model.
   * @param prompt The prompt to send to the LLM.
   */
  async generateResponse(prompt: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('OnDeviceAIService is not initialized. Call initialize() first.');
    }

    try {
      const response = await AicoreModule.generateResponse(prompt);
      return response;
    } catch (error) {
      console.error('Failed to generate response:', error);
      throw error;
    }
  }

  /**
   * Returns whether the model has been successfully initialized.
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

export const OnDeviceAI = new OnDeviceAIService();
