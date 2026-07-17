import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: true, 
      headerStyle: { backgroundColor: '#0f172a' },
      headerTintColor: '#fff',
      tabBarStyle: { backgroundColor: '#0f172a', borderTopWidth: 0 },
      tabBarActiveTintColor: '#06b6d4'
    }}>
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="voice" options={{ title: 'Voice' }} />
      <Tabs.Screen name="os" options={{ title: 'OS Deep Scan' }} />
    </Tabs>
  );
}
