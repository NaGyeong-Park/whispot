import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

export const LOCATION_TASK_NAME = "background-location-task";

TaskManager.defineTask<{ locations: Location.LocationObject[] }>(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(LOCATION_TASK_NAME, " error: ", error);
  }
  if (data) {
    const { locations } = data;
    console.log(LOCATION_TASK_NAME, ":", locations);
  }
});
