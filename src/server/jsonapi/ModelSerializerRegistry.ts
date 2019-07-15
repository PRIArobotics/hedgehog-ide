import registerSerializers from "../serializer";
import SerializerRegisty from "../serializer/SerializerRegistry";

let modelRegistry = new SerializerRegisty();
registerSerializers(modelRegistry);

export default modelRegistry;
