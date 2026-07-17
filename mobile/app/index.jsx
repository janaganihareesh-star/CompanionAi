import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';

export default function Index() {
  const { user } = useSelector(state => state.auth);

  if (user) {
    return <Redirect href="/(tabs)/chat" />;
  }

  return <Redirect href="/(auth)/login" />;
}
