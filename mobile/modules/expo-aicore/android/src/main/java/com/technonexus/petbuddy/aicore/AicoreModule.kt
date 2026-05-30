package com.technonexus.petbuddy.aicore

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class AicoreModule : Module() {
  private var llmInference: LlmInference? = null
  private val scope = CoroutineScope(Dispatchers.IO)

  override fun definition() = ModuleDefinition {
    Name("Aicore")

    AsyncFunction("initializeModel") { modelPath: String, promise: Promise ->
      scope.launch {
        try {
          if (llmInference != null) {
            llmInference?.close()
          }
          val options = LlmInference.LlmInferenceOptions.builder()
              .setModelPath(modelPath)
              .setMaxTokens(512)
              .build()
          
          llmInference = LlmInference.createFromOptions(appContext.reactContext, options)
          promise.resolve(true)
        } catch (e: Exception) {
          promise.reject("ERR_INIT_MODEL", "Failed to initialize MediaPipe model: " + e.message, e)
        }
      }
    }

    AsyncFunction("generateResponse") { prompt: String, promise: Promise ->
      scope.launch {
        try {
          val inference = llmInference
          if (inference == null) {
            promise.reject("ERR_NOT_INITIALIZED", "Model not initialized yet. Call initializeModel first.", null)
            return@launch
          }
          
          val response = inference.generateResponse(prompt)
          promise.resolve(response)
        } catch (e: Exception) {
          promise.reject("ERR_GENERATE", "Failed to generate response: " + e.message, e)
        }
      }
    }
  }
}
