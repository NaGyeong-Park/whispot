import { WebView } from "react-native-webview";
import { WEB_URL } from "@/src/constant/url";
import { useEffect, useRef, useState } from "react";
import { View, Alert } from "react-native";
import * as Location from "expo-location";
import { LOCATION_TASK_NAME } from "@/utils/task/location-task";

const LOCATION_CONFIG = {
  DISTANCE_INTERVAL: 5,
  FOREGROUND_TIME_INTERVAL: 5000,
  FOREGROUND_DISTANCE_INTERVAL: 10,
  DEFERRED_UPDATES_INTERVAL: 1000,
  LOCATION_UPDATE_DELAY: 5000,
};

const LOCATION_MESSAGES = {
  NOTIFICATION_TITLE: "위치 수신",
  NOTIFICATION_BODY: `위치가 ${LOCATION_CONFIG.DISTANCE_INTERVAL}m 이상 이동할 때마다 업데이트합니다.`,
  PERMISSION_DENIED: "위치 수신을 거부하셨습니다.",
  BACKGROUND_PERMISSION_DENIED: "백그라운드 위치 수신을 거부하셨습니다.",
};

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const sendLocationToWebView = (latitude: number, longitude: number) => {
    if (webViewRef.current) {
      const locationData = { lat: latitude, lng: longitude };
      webViewRef.current.postMessage(JSON.stringify(locationData));
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const isGranted = status === "granted";
    setPermissionGranted(isGranted);
    return isGranted;
  };

  const requestBackgroundLocationPermission = async (): Promise<boolean> => {
    if (!permissionGranted) {
      const foregroundGranted = await requestLocationPermission();

      if (!foregroundGranted) {
        return false;
      }
    }

    const { status } = await Location.requestBackgroundPermissionsAsync();
    const isGranted = status === "granted";

    if (!isGranted) {
      Alert.alert(LOCATION_MESSAGES.BACKGROUND_PERMISSION_DENIED);
    }

    return isGranted;
  };

  const getCurrentLocation = async () => {
    if (!permissionGranted) return;

    try {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      sendLocationToWebView(coords.latitude, coords.longitude);
    } catch (error) {
      console.error("Error getting current location:", error);
    }
  };

  const setupLocationTracking = async () => {
    if (!(await requestLocationPermission())) {
      return null;
    }

    try {
      const subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: LOCATION_CONFIG.FOREGROUND_TIME_INTERVAL,
          distanceInterval: LOCATION_CONFIG.FOREGROUND_DISTANCE_INTERVAL,
        },
        newLocation => {
          sendLocationToWebView(newLocation.coords.latitude, newLocation.coords.longitude);
        },
      );

      if (await requestBackgroundLocationPermission()) {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
        if (!hasStarted) {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
            distanceInterval: LOCATION_CONFIG.DISTANCE_INTERVAL,
            showsBackgroundLocationIndicator: true,
            deferredUpdatesInterval: LOCATION_CONFIG.DEFERRED_UPDATES_INTERVAL,
            foregroundService: {
              notificationTitle: LOCATION_MESSAGES.NOTIFICATION_TITLE,
              notificationBody: LOCATION_MESSAGES.NOTIFICATION_BODY,
            },
          });
        }
      }

      return subscriber;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleWebViewLoaded = async () => {
    if (!(await requestLocationPermission())) {
      Alert.alert(LOCATION_MESSAGES.PERMISSION_DENIED);
      return;
    }

    setTimeout(getCurrentLocation, LOCATION_CONFIG.LOCATION_UPDATE_DELAY);
  };

  useEffect(() => {
    let locationSubscriber: Location.LocationSubscription | null = null;

    const initializeLocationTracking = async () => {
      locationSubscriber = await setupLocationTracking();
    };

    initializeLocationTracking();

    return () => {
      if (locationSubscriber) {
        locationSubscriber.remove();
      }
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <WebView ref={webViewRef} source={{ uri: WEB_URL }} onLoadEnd={handleWebViewLoaded} />
    </View>
  );
}
