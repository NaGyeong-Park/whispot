import { WebView } from "react-native-webview";
import { View } from "react-native";
import { WEB_URL } from "@/src/constant/url";

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <WebView source={{ uri: WEB_URL }} />
    </View>
  );
}
