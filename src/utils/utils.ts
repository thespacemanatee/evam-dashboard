import { PermissionsAndroid } from 'react-native';

// eslint-disable-next-line import/prefer-default-export
export const requestLocationPermissions = async () => {
  try {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (!granted) {
      const request = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (request === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location services enabled');
        return true;
      }
      console.log('Location services denied');
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
  return true;
};
