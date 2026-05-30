import { registerWebModule, NativeModule } from 'expo';

// AicoreModule is not available on the web platform.
class AicoreModule extends NativeModule<{}> {}

export default registerWebModule(AicoreModule, 'AicoreModule');
